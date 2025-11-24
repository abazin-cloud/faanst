import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { vehicle, options, financing, customer, totalPrice } = data;

    // Calculate options subtotal
    const optionsSubtotal = options.reduce((sum: number, opt: any) => sum + Number(opt.price), 0);
    const basePrice = Number(vehicle.basePrice || 0);

    // Generate HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Configuration Véhicule - ${vehicle.model}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 30px;
      color: #1a1a1a;
      background: #ffffff;
      line-height: 1.6;
    }
    
    .header {
      text-align: center;
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 30px;
      border-radius: 12px 12px 0 0;
      margin-bottom: 0;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 8px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    
    .header .subtitle {
      font-size: 16px;
      opacity: 0.95;
      font-weight: 400;
    }
    
    .header .date {
      margin-top: 12px;
      font-size: 14px;
      opacity: 0.85;
      font-style: italic;
    }
    
    .document-number {
      background: white;
      text-align: center;
      padding: 12px;
      border-left: 4px solid #2563eb;
      border-right: 4px solid #2563eb;
      margin-bottom: 30px;
      font-size: 13px;
      color: #666;
      font-weight: 600;
    }
    
    .section {
      margin-bottom: 25px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #2563eb;
      background: #f8fafc;
      padding: 15px 20px;
      border-bottom: 2px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-title::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 20px;
      background: #2563eb;
      border-radius: 2px;
    }
    
    .section-content {
      padding: 20px;
    }
    
    .vehicle-showcase {
      background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
      padding: 0;
    }
    
    .vehicle-image-container {
      width: 100%;
      height: 350px;
      overflow: hidden;
      background: linear-gradient(135deg, #f0f4f8 0%, #e5e7eb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    .vehicle-image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .vehicle-image-container::after {
      content: '${vehicle.model}';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
      color: white;
      padding: 30px 20px 15px;
      font-size: 24px;
      font-weight: 700;
    }
    
    .vehicle-details {
      padding: 20px;
    }
    
    .vehicle-title {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    
    .vehicle-subtitle {
      font-size: 18px;
      color: #2563eb;
      margin-bottom: 15px;
      font-weight: 600;
    }
    
    .vehicle-description {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      padding: 15px;
      background: #f8fafc;
      border-left: 3px solid #2563eb;
      border-radius: 4px;
      margin-top: 15px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f1f3f5;
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-weight: 600;
      color: #64748b;
      font-size: 14px;
    }
    
    .info-value {
      color: #1a1a1a;
      font-size: 14px;
      font-weight: 500;
      text-align: right;
    }
    
    .option-item {
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #f1f3f5;
      transition: background 0.2s;
    }
    
    .option-item:last-child {
      border-bottom: none;
    }
    
    .option-item:hover {
      background: #f8fafc;
    }
    
    .option-details {
      flex: 1;
    }
    
    .option-name {
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
      font-size: 14px;
    }
    
    .option-description {
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
    
    .option-price {
      font-weight: 700;
      color: #2563eb;
      font-size: 15px;
      white-space: nowrap;
      margin-left: 15px;
    }
    
    .price-breakdown {
      background: #f8fafc;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 20px;
    }
    
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .price-row:last-child {
      border-bottom: none;
    }
    
    .price-row.subtotal {
      background: #f1f5f9;
      font-weight: 600;
    }
    
    .price-row.total {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 18px 20px;
      font-size: 18px;
      font-weight: 700;
    }
    
    .price-label {
      font-size: 14px;
    }
    
    .price-value {
      font-size: 16px;
      font-weight: 600;
    }
    
    .price-row.total .price-label {
      font-size: 16px;
    }
    
    .price-row.total .price-value {
      font-size: 24px;
    }
    
    .financing-highlight {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-left: 4px solid #2563eb;
      padding: 15px 20px;
      margin-top: 15px;
      border-radius: 4px;
    }
    
    .financing-monthly {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #bae6fd;
    }
    
    .financing-monthly-label {
      font-size: 14px;
      color: #0369a1;
      font-weight: 600;
    }
    
    .financing-monthly-value {
      font-size: 22px;
      color: #0369a1;
      font-weight: 700;
    }
    
    .note {
      font-size: 11px;
      color: #64748b;
      font-style: italic;
      margin-top: 10px;
    }
    
    .customer-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .customer-field {
      background: #f8fafc;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    
    .customer-field-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    
    .customer-field-value {
      font-size: 16px;
      color: #1a1a1a;
      font-weight: 600;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 25px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
    }
    
    .footer-important {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      padding: 15px;
      border-radius: 6px;
      color: #92400e;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 15px;
    }
    
    .footer-info {
      color: #64748b;
      font-size: 12px;
      line-height: 1.8;
    }
    
    .footer-info strong {
      color: #1a1a1a;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .section {
        page-break-inside: avoid;
      }
      
      @page {
        margin: 1.5cm;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>🚗 Configuration Véhicule</h1>
    <div class="subtitle">Devis Personnalisé</div>
    <div class="date">Généré le ${new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</div>
  </div>

  <div class="document-number">
    N° ${Date.now().toString(36).toUpperCase()} - ${new Date().toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
  </div>

  <!-- Customer Information -->
  <div class="section">
    <div class="section-title">👤 Informations Client</div>
    <div class="section-content">
      <div class="customer-info-grid">
        <div class="customer-field">
          <div class="customer-field-label">Nom complet</div>
          <div class="customer-field-value">${customer.name}</div>
        </div>
        <div class="customer-field">
          <div class="customer-field-label">Adresse email</div>
          <div class="customer-field-value">${customer.email}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Vehicle Information -->
  <div class="section vehicle-showcase">
    <div class="section-title">🚙 Véhicule Sélectionné</div>
    ${vehicle.imageUrl ? `
    <div class="vehicle-image-container">
      <img src="${vehicle.imageUrl}" alt="${vehicle.model} ${vehicle.finish}" 
           onerror="this.style.display='none'" />
    </div>
    ` : ''}
    <div class="vehicle-details">
      <div class="vehicle-title">${vehicle.model}</div>
      <div class="vehicle-subtitle">${vehicle.finish}</div>
      ${vehicle.description ? `
      <div class="vehicle-description">
        ${vehicle.description}
      </div>
      ` : ''}
      <div class="price-breakdown" style="margin-top: 20px;">
        <div class="price-row">
          <span class="price-label">Prix de base du véhicule</span>
          <span class="price-value">${basePrice.toLocaleString('fr-FR')} €</span>
        </div>
      </div>
    </div>
  </div>

  ${options && options.length > 0 ? `
  <!-- Options & Accessories -->
  <div class="section">
    <div class="section-title">⚙️ Options & Accessoires Sélectionnés (${options.length})</div>
    <div class="section-content" style="padding: 0;">
      ${options.map((option: any) => `
        <div class="option-item">
          <div class="option-details">
            <div class="option-name">✓ ${option.name}</div>
            ${option.description ? `<div class="option-description">${option.description}</div>` : ''}
          </div>
          <div class="option-price">+${Number(option.price).toLocaleString('fr-FR')} €</div>
        </div>
      `).join('')}
    </div>
    <div class="section-content">
      <div class="price-breakdown">
        <div class="price-row subtotal">
          <span class="price-label">Sous-total options</span>
          <span class="price-value">+${optionsSubtotal.toLocaleString('fr-FR')} €</span>
        </div>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- Financing -->
  <div class="section">
    <div class="section-title">💳 Mode de Financement</div>
    <div class="section-content">
      <div class="info-row">
        <span class="info-label">Type de financement</span>
        <span class="info-value">
          <strong>${financing.type === 'comptant' ? '💰 Paiement comptant' : 
            financing.type === 'credit' ? '🏦 Crédit automobile' : 
            '📋 Leasing / LLD'}</strong>
        </span>
      </div>
      ${financing.type !== 'comptant' ? `
        <div class="info-row">
          <span class="info-label">Durée du financement</span>
          <span class="info-value">${financing.duration} mois</span>
        </div>
        ${financing.downPayment > 0 ? `
          <div class="info-row">
            <span class="info-label">Apport initial</span>
            <span class="info-value">${financing.downPayment.toLocaleString('fr-FR')} €</span>
          </div>
          <div class="info-row">
            <span class="info-label">Montant financé</span>
            <span class="info-value">${(totalPrice - financing.downPayment).toLocaleString('fr-FR')} €</span>
          </div>
        ` : ''}
        
        <div class="financing-highlight">
          <div style="font-size: 13px; color: #0369a1; font-weight: 600;">
            ${financing.type === 'credit' ? '📊 Mensualité crédit estimée' : '📊 Loyer mensuel estimé'}
          </div>
          <div class="financing-monthly">
            <span class="financing-monthly-label">Paiement mensuel :</span>
            <span class="financing-monthly-value">
              ${financing.type === 'credit' 
                ? Math.round((totalPrice - (financing.downPayment || 0)) / financing.duration).toLocaleString('fr-FR')
                : Math.round(totalPrice / financing.duration * 0.85).toLocaleString('fr-FR')
              } €/mois
            </span>
          </div>
          <div class="note">
            * Estimation indicative, hors frais de dossier et intérêts. 
            ${financing.type === 'credit' ? 'Sous réserve d\'acceptation de votre dossier de crédit.' : 'Offre de LLD sous réserve d\'acceptation.'}
          </div>
        </div>
      ` : `
        <div class="financing-highlight">
          <div style="font-size: 13px; color: #0369a1; font-weight: 600; margin-bottom: 10px;">
            💰 Paiement en une seule fois
          </div>
          <div class="note">
            Le véhicule sera payé intégralement lors de la transaction.
          </div>
        </div>
      `}
    </div>
  </div>

  <!-- Price Summary -->
  <div class="section">
    <div class="section-title">💰 Récapitulatif des Prix</div>
    <div class="section-content" style="padding: 0;">
      <div class="price-breakdown" style="margin: 0;">
        <div class="price-row">
          <span class="price-label">Prix du véhicule (${vehicle.model})</span>
          <span class="price-value">${basePrice.toLocaleString('fr-FR')} €</span>
        </div>
        ${options && options.length > 0 ? `
        <div class="price-row">
          <span class="price-label">Options & Accessoires (${options.length})</span>
          <span class="price-value">+${optionsSubtotal.toLocaleString('fr-FR')} €</span>
        </div>
        ` : ''}
        <div class="price-row total">
          <span class="price-label">💎 PRIX TOTAL TTC</span>
          <span class="price-value">${totalPrice.toLocaleString('fr-FR')} €</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-important">
      ⚠️ Ce document est un devis indicatif et ne constitue pas un engagement contractuel.
    </div>
    <div class="footer-info">
      <p><strong>Validité du devis :</strong> 30 jours à compter de la date d'émission</p>
      <p><strong>TVA incluse</strong> - Prix susceptibles de modifications</p>
      <p style="margin-top: 15px;">Pour toute question ou pour finaliser votre commande, veuillez nous contacter.</p>
      <p style="margin-top: 10px; font-style: italic;">Document généré automatiquement le ${new Date().toLocaleString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Return HTML that will trigger browser print dialog
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
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

