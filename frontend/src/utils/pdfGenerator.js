import { jsPDF } from 'jspdf';

export const generateWorkOrderPDF = (order, checklistItems, systemItems) => {
  const doc = new jsPDF();
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME DE SERVICIO', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('TALLER SKM', 105, 28, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`ORDEN #${order.id}`, 105, 38, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLES TÉCNICOS', 20, 55);
  
  doc.setFont('helvetica', 'normal');
  const pilotName = order.pilotName || order.bike?.client?.name || '-';
  const bikeHours = order.bike?.hours || 0;
  doc.text(`PILOTO ${pilotName} HORAS ${bikeHours} hrs`, 20, 63);
  
  const brandYear = order.bike?.brand && order.bike?.year 
    ? `${order.bike.brand} - ${order.bike.year}` 
    : (order.bike?.brand || order.bike?.model || '-');
  const entryDate = formatDate(order.entryDate);
  doc.text(`MOTOCICLETA ${brandYear} FECHA ${entryDate}`, 20, 70);
  
  const serviceType = order.serviceType || '-';
  doc.text(`SERVICIO ${serviceType}`, 20, 77);

  doc.line(20, 82, 190, 82);
  
  doc.setFont('helvetica', 'bold');
  doc.text('TRABAJOS REALIZADOS', 20, 90);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('DESCRIPCIÓN DEL TRABAJO', 20, 100);
  doc.text('OBSERVACIONES', 110, 100);
  doc.text('ESTADO', 175, 100);

  doc.line(20, 104, 190, 104);

  let y = 110;
  systemItems.forEach((item) => {
    const checkedItem = checklistItems.find(c => c.checklistItemId === item.id);
    const isChecked = checkedItem?.checked === true || checkedItem?.checked === 1;
    
    doc.text(item.name.substring(0, 50), 20, y);
    doc.text(isChecked ? 'SI' : 'NO', 110, y);
    doc.text(isChecked ? '✓' : '-', 175, y);
    y += 7;
    
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.line(20, y, 190, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN', 20, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y += 8;
  doc.text(`Total: $${Number(order.total || 0).toFixed(2)}`, 20, y);
  y += 6;
  doc.text(`Items: ${order.items?.length || 0}`, 20, y);
  
  const statusText = order.status === 'LISTA' ? 'TERMINADA' : order.status;
  y += 6;
  doc.text(`Estado: ${statusText}`, 20, y);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.text('Generado por Moto Work Orders', pageWidth / 2, pageHeight - 10, { align: 'center' });

  return doc;
};

export const downloadWorkOrderPDF = (order, checklistItems, systemItems) => {
  const doc = generateWorkOrderPDF(order, checklistItems, systemItems);
  doc.save(`Orden_${order.id}_${order.bike?.plate || 'servicio'}.pdf`);
};