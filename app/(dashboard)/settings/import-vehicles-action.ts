'use server';

import { replaceVehicles } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { promises as fs } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

type ImportResult = {
  success: boolean;
  message: string;
  count?: number;
};

export async function importVehiclesAction(formData: FormData): Promise<ImportResult> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return {
      success: false,
      message: 'Veuillez sélectionner un fichier Excel (.xlsx) ou CSV avec deux colonnes (modèle, finition).'
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const entries = await parseVehicleFile(buffer, file.name || '');

    if (entries.length === 0) {
      return {
        success: false,
        message: 'Aucune ligne valide trouvée. Vérifiez que les colonnes A et B contiennent bien le modèle et la finition.'
      };
    }

    await replaceVehicles(entries);
    revalidatePath('/configurateur');
    revalidatePath('/settings');

    return {
      success: true,
      message: `Import réussi (${entries.length} combinaisons).`,
      count: entries.length
    };
  } catch (error) {
    console.error('Vehicle import failed', error);
    return {
      success: false,
      message: 'Import impossible. Assurez-vous que le fichier Excel est lisible et contient bien une feuille « sheet1 ».'
    };
  }
}

async function parseVehicleFile(buffer: Buffer, filename: string) {
  if (filename.toLowerCase().endsWith('.csv')) {
    return parseCsv(buffer.toString('utf-8'));
  }

  return parseXlsx(buffer);
}

function parseCsv(content: string) {
  const rows = content
    .split(/\r?\n/)
    .map((line) => line.split(/;|,|\t/))
    .filter((columns) => columns.length >= 2)
    .map(([model, finish]) => ({
      model: (model || '').trim(),
      finish: (finish || '').trim()
    }))
    .filter((row) => row.model && row.finish);

  return removeHeaderRow(rows);
}

async function parseXlsx(buffer: Buffer) {
  const tempDir = await mkdtemp(join(tmpdir(), 'vehicle-import-'));
  const tempFile = join(tempDir, `${randomUUID()}.xlsx`);
  await fs.writeFile(tempFile, buffer);

  try {
    const sheetXml = await extractZipEntry(tempFile, 'xl/worksheets/sheet1.xml');
    const sharedStringsXml = await extractZipEntry(tempFile, 'xl/sharedStrings.xml').catch(() => '');
    const sharedStrings = parseSharedStrings(sharedStringsXml);
    const rows = parseSheetRows(sheetXml, sharedStrings);
    return removeHeaderRow(rows);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function extractZipEntry(filePath: string, entry: string) {
  const { stdout } = await execFileAsync('unzip', ['-p', filePath, entry]);
  return stdout;
}

function parseSharedStrings(xml: string) {
  if (!xml) return [];
  const matches = xml.match(/<si[\s\S]*?<\/si>/g) || [];
  return matches.map((match) => decodeXml(match.replace(/<[^>]+>/g, '')));
}

function parseSheetRows(xml: string, sharedStrings: string[]) {
  const rows: { model: string; finish: string }[] = [];
  const rowRegex = /<row[\s\S]*?<\/row>/g;
  const cellRegex = /<c([^>]*)>([\s\S]*?)<\/c>/g;

  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(xml)) !== null) {
    const cells: Record<string, string> = {};
    let cellMatch: RegExpExecArray | null;

    cellRegex.lastIndex = 0;
    while ((cellMatch = cellRegex.exec(rowMatch[0])) !== null) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const refMatch = attrs.match(/r="([A-Z]+)\d+"/);
      if (!refMatch) continue;
      const column = refMatch[1];
      const typeMatch = attrs.match(/t="(\w+)"/);
      const type = typeMatch ? typeMatch[1] : undefined;
      const valueMatch = body.match(/<v>([\s\S]*?)<\/v>/);
      if (!valueMatch) continue;

      let value = valueMatch[1];
      if (type === 's') {
        const idx = Number(value);
        value = sharedStrings[idx] ?? '';
      }

      cells[column] = decodeXml(value);
    }

    const model = (cells['A'] || '').trim();
    const finish = (cells['B'] || '').trim();
    if (model || finish) {
      rows.push({ model, finish });
    }
  }

  return rows;
}

function removeHeaderRow(rows: { model: string; finish: string }[]) {
  const sanitized = rows.filter((row) => row.model && row.finish);
  if (sanitized.length) {
    const firstModel = sanitized[0].model.toLowerCase();
    const firstFinish = sanitized[0].finish.toLowerCase();
    if (firstModel.includes('mode') && firstFinish.includes('fini')) {
      sanitized.shift();
    }
  }
  return sanitized;
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
