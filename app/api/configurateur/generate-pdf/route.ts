import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { vehicle, options, financing, customer, totalPrice } = data;

    // Generate HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Configuration Véhicule - ${vehicle.model}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0 0 10px 0;
    }
    .header p {
      color: #666;
      margin: 0;
    }
    .section {
      margin-bottom: 30px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
      margin: 0 0 15px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .info-value {
      color: #333;
    }
    .option-item {
      padding: 8px 0;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e5e7eb;
    }
    .option-item:last-child {
      border-bottom: none;
    }
    .total {
      background: #2563eb;
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin-top: 30px;
    }
    .total-label {
      font-size: 16px;
      margin: 0 0 10px 0;
    }
    .total-amount {
      font-size: 36px;
      font-weight: bold;
      margin: 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Configuration Véhicule</h1>
    <p>Devis généré le ${new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</p>
  </div>

  <!-- Customer Information -->
  <div class="section">
    <h2 class="section-title">Informations Client</h2>
    <div class="info-row">
      <span class="info-label">Nom:</span>
      <span class="info-value">${customer.name}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Email:</span>
      <span class="info-value">${customer.email}</span>
    </div>
  </div>

  <!-- Vehicle Information -->
  <div class="section">
    <h2 class="section-title">Véhicule Sélectionné</h2>
    ${vehicle.imageUrl ? `
    <div style="margin-bottom: 20px; border-radius: 8px; overflow: hidden; max-height: 300px;">
      <img src="${vehicle.imageUrl}" alt="${vehicle.model} ${vehicle.finish}" 
           style="width: 100%; height: auto; max-height: 300px; object-fit: cover;" 
           onerror="this.style.display='none'" />
    </div>
    ` : ''}
    <div class="info-row">
      <span class="info-label">Modèle:</span>
      <span class="info-value"><strong>${vehicle.model}</strong></span>
    </div>
    <div class="info-row">
      <span class="info-label">Finition:</span>
      <span class="info-value">${vehicle.finish}</span>
    </div>
    ${vehicle.description ? `
    <div class="info-row">
      <span class="info-label">Description:</span>
      <span class="info-value">${vehicle.description}</span>
    </div>
    ` : ''}
    <div class="info-row">
      <span class="info-label">Prix de base:</span>
      <span class="info-value"><strong>${Number(vehicle.basePrice || 0).toLocaleString('fr-FR')} €</strong></span>
    </div>
  </div>

  ${options && options.length > 0 ? `
  <!-- Options & Accessories -->
  <div class="section">
    <h2 class="section-title">Options & Accessoires</h2>
    ${options.map((option: any) => `
      <div class="option-item">
        <div>
          <div style="font-weight: 600;">${option.name}</div>
          ${option.description ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">${option.description}</div>` : ''}
        </div>
        <div style="font-weight: 600;">+${Number(option.price).toLocaleString('fr-FR')} €</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Financing -->
  <div class="section">
    <h2 class="section-title">Financement</h2>
    <div class="info-row">
      <span class="info-label">Type de financement:</span>
      <span class="info-value">
        ${financing.type === 'comptant' ? 'Paiement comptant' : 
          financing.type === 'credit' ? 'Crédit automobile' : 
          'Leasing / LLD'}
      </span>
    </div>
    ${financing.type !== 'comptant' ? `
      <div class="info-row">
        <span class="info-label">Durée:</span>
        <span class="info-value">${financing.duration} mois</span>
      </div>
      ${financing.downPayment > 0 ? `
        <div class="info-row">
          <span class="info-label">Apport initial:</span>
          <span class="info-value">${financing.downPayment.toLocaleString('fr-FR')} €</span>
        </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">Mensualité estimée:</span>
        <span class="info-value"><strong>
          ${financing.type === 'credit' 
            ? Math.round((totalPrice - (financing.downPayment || 0)) / financing.duration).toLocaleString('fr-FR')
            : Math.round(totalPrice / financing.duration * 0.85).toLocaleString('fr-FR')
          } €/mois
        </strong></span>
      </div>
      <div style="font-size: 12px; color: #666; margin-top: 10px;">
        * Mensualités indicatives, hors frais et intérêts
      </div>
    ` : ''}
  </div>

  <!-- Total -->
  <div class="total">
    <p class="total-label">Prix Total TTC</p>
    <p class="total-amount">${totalPrice.toLocaleString('fr-FR')} €</p>
  </div>

  <div class="footer">
    <p><strong>Ce document est un devis indicatif et ne constitue pas un engagement contractuel.</strong></p>
    <p>Pour toute question, veuillez nous contacter.</p>
    <p style="margin-top: 10px;">Document généré le ${new Date().toLocaleString('fr-FR')}</p>
  </div>
</body>
</html>
    `;

    // Return HTML that will trigger browser print dialog
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="configuration-${vehicle.model}-${Date.now()}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

