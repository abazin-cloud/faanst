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

type VehicleEntry = {
  model: string;
  finish: string;
  basePrice?: number | null;
  description?: string | null;
  imageUrl?: string | null;
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
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return {
      success: false,
      message: `Import impossible : ${errorMessage}. Vérifiez que le fichier contient deux colonnes (Modèle et Finition).`
    };
  }
}

async function parseVehicleFile(buffer: Buffer, filename: string) {
  if (filename.toLowerCase().endsWith('.csv')) {
    return parseCsv(buffer.toString('utf-8'));
  }

  return parseXlsx(buffer);
}

function parseCsv(content: string): VehicleEntry[] {
  // Remove BOM if present
  content = content.replace(/^\uFEFF/, '');
  
  const lines = content
    .split(/\r?\n/)
    .filter((line) => line.trim()); // Remove empty lines

  if (lines.length === 0) return [];

  // Detect separator from first line
  const firstLine = lines[0];
  const separator = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';
  
  // Parse all lines
  const allRows = lines.map((line) => {
    return line.split(separator).map(cell => cell.trim().replace(/^["']|["']$/g, ''));
  });

  // First row is header
  const headers = allRows[0].map(h => h.toLowerCase().trim());
  const dataRows = allRows.slice(1);

  // Map headers to field names
  const columnMap: Record<string, string> = {};
  headers.forEach((header, index) => {
    if (header.includes('modèle') || header.includes('modele') || header === 'model') {
      columnMap.model = index.toString();
    } else if (header.includes('finition') || header === 'finish') {
      columnMap.finish = index.toString();
    } else if (header.includes('prix') || header.includes('price')) {
      columnMap.basePrice = index.toString();
    } else if (header.includes('description')) {
      columnMap.description = index.toString();
    } else if (header.includes('image') || header.includes('photo') || header.includes('url')) {
      columnMap.imageUrl = index.toString();
    }
  });

  // If no header mapping found, assume first 2 columns are model and finish
  if (!columnMap.model && !columnMap.finish) {
    columnMap.model = '0';
    columnMap.finish = '1';
    if (headers.length > 2) columnMap.basePrice = '2';
    if (headers.length > 3) columnMap.description = '3';
    if (headers.length > 4) columnMap.imageUrl = '4';
  }

  // Parse data rows
  const vehicles: VehicleEntry[] = dataRows
    .filter(row => row.length >= 2)
    .map(row => {
      const vehicle: VehicleEntry = {
        model: row[parseInt(columnMap.model || '0')] || '',
        finish: row[parseInt(columnMap.finish || '1')] || '',
      };

      if (columnMap.basePrice && row[parseInt(columnMap.basePrice)]) {
        const price = parseFloat(row[parseInt(columnMap.basePrice)].replace(/[^\d.-]/g, ''));
        if (!isNaN(price)) vehicle.basePrice = price;
      }

      if (columnMap.description && row[parseInt(columnMap.description)]) {
        vehicle.description = row[parseInt(columnMap.description)];
      }

      if (columnMap.imageUrl && row[parseInt(columnMap.imageUrl)]) {
        vehicle.imageUrl = row[parseInt(columnMap.imageUrl)];
      }

      return vehicle;
    })
    .filter((vehicle) => vehicle.model && vehicle.finish);

  return vehicles;
}

async function parseXlsx(buffer: Buffer): Promise<VehicleEntry[]> {
  const tempDir = await mkdtemp(join(tmpdir(), 'vehicle-import-'));
  const tempFile = join(tempDir, `${randomUUID()}.xlsx`);
  await fs.writeFile(tempFile, buffer);

  try {
    // Find the first available worksheet
    const worksheetPath = await findFirstWorksheet(tempFile);
    if (!worksheetPath) {
      throw new Error('Aucune feuille de calcul trouvée dans le fichier Excel');
    }

    const sheetXml = await extractZipEntry(tempFile, worksheetPath);
    const sharedStringsXml = await extractZipEntry(tempFile, 'xl/sharedStrings.xml').catch(() => '');
    const sharedStrings = parseSharedStrings(sharedStringsXml);
    const allRows = parseSheetRows(sheetXml, sharedStrings);
    
    if (allRows.length === 0) return [];

    // First row is header
    const headers = allRows[0];
    const dataRows = allRows.slice(1);

    // Map headers to column indices
    const columnMap: Record<string, number> = {};
    Object.keys(headers).forEach(col => {
      const header = headers[col].toLowerCase().trim();
      if (header.includes('modèle') || header.includes('modele') || header === 'model') {
        columnMap.model = parseInt(col.charCodeAt(0)) - 65; // A=0, B=1, etc
      } else if (header.includes('finition') || header === 'finish') {
        columnMap.finish = parseInt(col.charCodeAt(0)) - 65;
      } else if (header.includes('prix') || header.includes('price')) {
        columnMap.basePrice = parseInt(col.charCodeAt(0)) - 65;
      } else if (header.includes('description')) {
        columnMap.description = parseInt(col.charCodeAt(0)) - 65;
      } else if (header.includes('image') || header.includes('photo') || header.includes('url')) {
        columnMap.imageUrl = parseInt(col.charCodeAt(0)) - 65;
      }
    });

    // If no header mapping, assume A=model, B=finish
    if (columnMap.model === undefined) columnMap.model = 0;
    if (columnMap.finish === undefined) columnMap.finish = 1;

    // Parse data rows
    const vehicles: VehicleEntry[] = dataRows
      .map(row => {
        const cols = Object.keys(row).sort();
        const vehicle: VehicleEntry = {
          model: row[String.fromCharCode(65 + columnMap.model)] || '',
          finish: row[String.fromCharCode(65 + columnMap.finish)] || '',
        };

        if (columnMap.basePrice !== undefined) {
          const priceStr = row[String.fromCharCode(65 + columnMap.basePrice)];
          if (priceStr) {
            const price = parseFloat(priceStr.replace(/[^\d.-]/g, ''));
            if (!isNaN(price)) vehicle.basePrice = price;
          }
        }

        if (columnMap.description !== undefined) {
          const desc = row[String.fromCharCode(65 + columnMap.description)];
          if (desc) vehicle.description = desc;
        }

        if (columnMap.imageUrl !== undefined) {
          const url = row[String.fromCharCode(65 + columnMap.imageUrl)];
          if (url) vehicle.imageUrl = url;
        }

        return vehicle;
      })
      .filter(vehicle => vehicle.model && vehicle.finish);

    return vehicles;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function findFirstWorksheet(filePath: string): Promise<string | null> {
  try {
    // List all files in the Excel archive
    const { stdout } = await execFileAsync('unzip', ['-l', filePath]);
    
    // Find worksheet files (xl/worksheets/sheet*.xml)
    const lines = stdout.split('\n');
    for (const line of lines) {
      if (line.includes('xl/worksheets/sheet') && line.endsWith('.xml')) {
        // Extract the path from the listing
        const match = line.match(/xl\/worksheets\/sheet\d+\.xml/);
        if (match) {
          return match[0];
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding worksheet:', error);
    return null;
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

function parseSheetRows(xml: string, sharedStrings: string[]): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
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

    if (Object.keys(cells).length > 0) {
      rows.push(cells);
    }
  }

  return rows;
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
