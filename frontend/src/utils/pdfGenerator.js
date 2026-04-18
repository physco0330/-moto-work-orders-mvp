export const generateWorkOrderPDF = (order, checklistItems, systemItems) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const pilotName = order.pilotName || order.bike?.client?.name || '-';
  const bikeHours = order.bike?.hours || 0;
  const brandYear = order.bike?.brand && order.bike?.year 
    ? `${order.bike.brand} - ${order.bike.year}` 
    : (order.bike?.brand || order.bike?.model || '-');
  const entryDate = formatDate(order.entryDate);
  const serviceType = order.serviceType || '-';
  const hoursReg = order.hoursRegistered || 0;
  const hoursUse = order.hoursUsed || 0;

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Informe de Servicio - Orden ${order.id}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { text-align: center; color: #1565c0; }
    h2 { border-bottom: 2px solid #1565c0; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background: #f5f5f5; }
    .check { color: green; }
    .no-check { color: red; }
    .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
    .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>INFORME DE SERVICIO</h1>
  <p style="text-align:center">TALLER SKM</p>
  <h2 style="text-align:center">ORDEN #${order.id}</h2>
  
  <h3>DETALLES TÉCNICOS</h3>
  <table>
    <tr><th>PILOTO</th><td>${pilotName} (${bikeHours} hrs)</td></tr>
    <tr><th>MOTOCICLETA</th><td>${brandYear}</td></tr>
    <tr><th>FECHA</th><td>${entryDate}</td></tr>
    <tr><th>SERVICIO</th><td>${serviceType}</td></tr>
    <tr><th>H. REGISTRADAS</th><td>${hoursReg}</td></tr>
    <tr><th>H. UTILIZADAS</th><td>${hoursUse}</td></tr>
  </table>
  
  <h3>TRABAJOS REALIZADOS</h3>
  <table>
    <tr><th>TRABAJO</th><th>ESTADO</th></tr>
    ${systemItems.map(item => {
      const checkedItem = checklistItems.find(c => c.checklistItemId === item.id);
      const isChecked = checkedItem?.checked === true || checkedItem?.checked === 1;
      return `<tr><td>${item.name}</td><td class="${isChecked ? 'check' : 'no-check'}">${isChecked ? '✓' : 'X'}</td></tr>`;
    }).join('')}
  </table>
  
  <p class="total">Total: $${Number(order.total || 0).toFixed(2)}</p>
  <p>Estado: ${order.status}</p>
  
  <p class="footer">Generado por Moto Work Orders</p>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};

export const downloadWorkOrderPDF = (order, checklistItems, systemItems) => {
  generateWorkOrderPDF(order, checklistItems, systemItems);
};