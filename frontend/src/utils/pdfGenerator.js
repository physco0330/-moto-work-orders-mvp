import jsPDF from 'jspdf';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
};

const addSectionTitle = (doc, text, y) => {
  doc.setFontSize(13);
  doc.setTextColor(21, 101, 192);
  doc.setFont('helvetica', 'bold');
  doc.text(text, 20, y);
  doc.setDrawColor(21, 101, 192);
  doc.setLineWidth(0.5);
  doc.line(20, y + 2, 190, y + 2);
  return y + 8;
};

const addTableRow = (doc, label, value, y, pageWidth) => {
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'bold');
  doc.text(label, 22, y);
  doc.setTextColor(30);
  doc.setFont('helvetica', 'normal');
  doc.text(String(value), 70, y);
  return y + 7;
};

export const downloadWorkOrderPDF = (order, checklistItems, systemItems) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(21, 101, 192);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME DE SERVICIO', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('TALLER SKM', pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Orden #${order.id}`, pageWidth / 2, 37, { align: 'center' });

  let y = 52;

  y = addSectionTitle(doc, 'DETALLES DEL SERVICIO', y);
  y += 2;

  const pilotName = order.pilotName || order.bike?.client?.name || '-';
  const bikeHours = order.bike?.hours || 0;
  const brandYear = order.bike?.brand && order.bike?.year
    ? `${order.bike.brand} - ${order.bike.year}`
    : (order.bike?.brand || order.bike?.model || '-');
  const entryDate = formatDate(order.entryDate);
  const serviceType = order.serviceType || '-';
  const hoursReg = order.hoursRegistered || 0;
  const hoursUse = order.hoursUsed || 0;

  y = addTableRow(doc, 'Piloto:', `${pilotName}`, y, pageWidth);
  y = addTableRow(doc, 'Horas Moto:', `${bikeHours}h`, y, pageWidth);
  y = addTableRow(doc, 'Motocicleta:', brandYear, y, pageWidth);
  y = addTableRow(doc, 'Fecha:', entryDate, y, pageWidth);
  y = addTableRow(doc, 'Tipo Servicio:', serviceType, y, pageWidth);
  y = addTableRow(doc, 'H. Registradas:', `${hoursReg}h`, y, pageWidth);
  y = addTableRow(doc, 'H. Utilizadas:', `${hoursUse}h`, y, pageWidth);

  y += 5;

  y = addSectionTitle(doc, 'TRABAJOS REALIZADOS', y);
  y += 2;

  doc.setFillColor(248, 250, 252);
  doc.rect(18, y - 5, 174, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100);
  doc.text('TRABAJO', 22, y);
  doc.text('ESTADO', 170, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50);

  systemItems.forEach((item, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const checkedItem = checklistItems.find(c => Number(c.checklistItemId) === Number(item.id) || Number(c.id) === Number(item.id));
    const isChecked = checkedItem?.checked === true || checkedItem?.checked === 1;

    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 252);
      doc.rect(18, y - 4, 174, 7, 'F');
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    doc.text(item.name, 22, y);

    if (isChecked) {
      doc.setTextColor(22, 163, 74);
      doc.setFont('helvetica', 'bold');
      doc.text('Completado', 170, y);
    } else {
      doc.setTextColor(239, 68, 68);
      doc.setFont('helvetica', 'bold');
      doc.text('Pendiente', 170, y);
    }
    y += 7;
  });

  y += 10;

  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(243, 244, 246);
  doc.roundedRect(18, y - 6, 174, 22, 3, 3, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 101, 192);
  doc.text('Total:', 22, y + 5);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Number(order.total || 0).toFixed(2)}`, 170, y + 5, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');

  const statusLabels = {
    RECIBIDA: 'Pendiente',
    DIAGNOSTICO: 'Diagnóstico',
    EN_PROCESO: 'En Proceso',
    LISTA: 'Terminada',
    ENTREGADA: 'Entregada',
    CANCELADA: 'Cancelada'
  };
  doc.text(`Estado: ${statusLabels[order.status] || order.status}`, 22, y + 15);

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generado por SKM Work Orders - Página ${i} de ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
  }

  doc.save(`Orden-${order.id}-Servicio.pdf`);
};