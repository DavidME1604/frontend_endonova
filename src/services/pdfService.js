import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TEAL_COLOR = [0, 131, 143]; // #00838F
const GRAY_COLOR = [100, 100, 100];

/**
 * Obtiene un valor de forma segura, devolviendo un valor por defecto si es null/undefined
 */
const safeGet = (obj, path, defaultValue = 'N/A') => {
  if (!obj) return defaultValue;
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result === null || result === undefined) return defaultValue;
    result = result[key];
  }
  return result !== null && result !== undefined ? result : defaultValue;
};

/**
 * Formatea una fecha de forma segura
 */
const safeFormatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('es-EC');
  } catch {
    return 'N/A';
  }
};

/**
 * Formatea un valor como moneda
 */
const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
};

/**
 * Genera un PDF de la ficha endodóntica
 * @param {Object} ficha - Datos de la ficha endodóntica
 * @param {Object} presupuesto - Datos del presupuesto (opcional)
 * @param {Array} actos - Lista de actos/procedimientos (opcional)
 * @param {Array} pagos - Lista de pagos (opcional)
 */
export const generarFichaEndodonticaPDF = (ficha, presupuesto = null, actos = [], pagos = []) => {
  // Validación inicial
  if (!ficha) {
    throw new Error('No se proporcionaron datos de la ficha');
  }

  console.log('Generando PDF con ficha:', ficha);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 15;

  // Asegurar que actos y pagos sean arrays
  const actosArray = Array.isArray(actos) ? actos : [];
  const pagosArray = Array.isArray(pagos) ? pagos : [];

  // ==================== HEADER ====================
  doc.setFillColor(...TEAL_COLOR);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ENDONOVA', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Dra. Magda Zulay Bastidas C.', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 6;
  doc.setFontSize(9);
  doc.text('Odontologa - SENESCYT 102905646076', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 5;
  doc.text('Edificio Plaza Medica 139 y Paucarbamba Of.503', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 5;
  doc.text('Celular: 0967734846 / 4103285 ext 39', pageWidth / 2, yPosition, { align: 'center' });

  // ==================== TÍTULO ====================
  yPosition = 55;
  doc.setTextColor(...TEAL_COLOR);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FICHA DE DIAGNOSTICO Y TRATAMIENTO ENDODONTICO', pageWidth / 2, yPosition, { align: 'center' });

  // ==================== DATOS DEL PACIENTE ====================
  yPosition += 10;

  const historiaClinica = safeGet(ficha, 'historia_clinica', 'N/A');
  const fecha = safeFormatDate(ficha.fecha);
  const nombres = safeGet(ficha, 'nombres', '');
  const apellidos = safeGet(ficha, 'apellidos', '');
  const nombreCompleto = `${nombres} ${apellidos}`.trim() || 'N/A';
  const edad = safeGet(ficha, 'edad', 'N/A');
  const domicilio = safeGet(ficha, 'domicilio', 'N/A');
  const telefono = safeGet(ficha, 'telefono', 'N/A');
  const piezaDental = safeGet(ficha, 'pieza_dental', 'N/A');

  autoTable(doc, {
    startY: yPosition,
    head: [['DATOS DEL PACIENTE', '', '', '']],
    body: [
      [
        { content: 'N Historia Clinica:', styles: { fontStyle: 'bold' } },
        String(historiaClinica),
        { content: 'Fecha:', styles: { fontStyle: 'bold' } },
        String(fecha)
      ],
      [
        { content: 'Nombres y Apellidos:', styles: { fontStyle: 'bold' } },
        { content: String(nombreCompleto), colSpan: 3 }
      ],
      [
        { content: 'Edad:', styles: { fontStyle: 'bold' } },
        String(edad),
        { content: 'Domicilio:', styles: { fontStyle: 'bold' } },
        String(domicilio)
      ],
      [
        { content: 'Telefono:', styles: { fontStyle: 'bold' } },
        String(telefono),
        { content: 'Pieza Dental:', styles: { fontStyle: 'bold' } },
        String(piezaDental)
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: TEAL_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      2: { cellWidth: 35 }
    }
  });

  yPosition = doc.lastAutoTable.finalY + 8;

  // ==================== MOTIVO DE CONSULTA ====================
  addSectionTitle(doc, 'MOTIVO DE CONSULTA', yPosition);
  yPosition += 6;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const motivoConsulta = safeGet(ficha, 'motivo_consulta', 'No especificado');
  const motivoLines = doc.splitTextToSize(String(motivoConsulta), pageWidth - 30);
  doc.text(motivoLines, 15, yPosition);
  yPosition += motivoLines.length * 4 + 5;

  // ==================== ANTECEDENTES ====================
  const antecedentes = ficha.antecedentes;
  if (antecedentes) {
    addSectionTitle(doc, 'ANTECEDENTES', yPosition);
    yPosition += 6;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const antecedentesLines = doc.splitTextToSize(String(antecedentes), pageWidth - 30);
    doc.text(antecedentesLines, 15, yPosition);
    yPosition += antecedentesLines.length * 4 + 5;
  }

  // ==================== CAUSAS ====================
  const causas = [];
  if (ficha.causa_caries) causas.push('Caries');
  if (ficha.causa_traumatismo) causas.push('Traumatismo');
  if (ficha.causa_reabsorciones) causas.push('Reabsorciones');
  if (ficha.causa_tratamiento_anterior) causas.push('Tratamiento Anterior');
  if (ficha.causa_finalidad_protetica) causas.push('Finalidad Protetica');
  if (ficha.causa_endoperiodontal) causas.push('Endoperiodontal');
  if (ficha.causa_otras) causas.push(`Otras: ${ficha.causa_otras}`);

  if (causas.length > 0) {
    addSectionTitle(doc, 'CAUSAS', yPosition);
    yPosition += 6;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(causas.join(' | '), 15, yPosition);
    yPosition += 8;
  }

  // ==================== DOLOR ====================
  yPosition = checkPageBreak(doc, yPosition, 40);
  addSectionTitle(doc, 'DOLOR', yPosition);
  yPosition += 6;

  const dolorData = [];
  if (ficha.dolor_naturaleza) dolorData.push(['Naturaleza:', String(ficha.dolor_naturaleza)]);
  if (ficha.dolor_calidad) dolorData.push(['Calidad:', String(ficha.dolor_calidad)]);
  if (ficha.dolor_localizacion) dolorData.push(['Localizacion:', String(ficha.dolor_localizacion)]);
  if (ficha.dolor_duracion) dolorData.push(['Duracion:', String(ficha.dolor_duracion)]);
  if (ficha.dolor_iniciado_por) dolorData.push(['Iniciado por:', String(ficha.dolor_iniciado_por)]);

  if (dolorData.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      body: dolorData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35 }
      }
    });
    yPosition = doc.lastAutoTable.finalY + 5;
  } else {
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('No especificado', 15, yPosition);
    yPosition += 8;
  }

  // ==================== ZONA PERIAPICAL ====================
  yPosition = checkPageBreak(doc, yPosition, 25);
  addSectionTitle(doc, 'ZONA PERIAPICAL', yPosition);
  yPosition += 6;

  const zonas = [];
  if (ficha.zona_normal) zonas.push('Normal');
  if (ficha.zona_tumefaccion) zonas.push('Tumefaccion');
  if (ficha.zona_adenopatias) zonas.push('Adenopatias');
  if (ficha.zona_dolor_palpacion) zonas.push('Dolor a la palpacion');
  if (ficha.zona_fistula) zonas.push('Fistula');
  if (ficha.zona_flemon) zonas.push('Flemon');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(zonas.length > 0 ? zonas.join(' | ') : 'No especificado', 15, yPosition);
  yPosition += 8;

  // ==================== EXAMEN PERIODONTAL ====================
  yPosition = checkPageBreak(doc, yPosition, 30);
  addSectionTitle(doc, 'EXAMEN PERIODONTAL', yPosition);
  yPosition += 6;

  const profundidadBolsa = safeGet(ficha, 'profundidad_bolsa', 'N/A');
  const movilidad = safeGet(ficha, 'movilidad', '0');
  const supuracion = ficha.supuracion ? 'Si' : 'No';

  autoTable(doc, {
    startY: yPosition,
    body: [
      ['Profundidad de Bolsa:', `${profundidadBolsa} mm`],
      ['Movilidad:', `Grado ${movilidad}`],
      ['Supuracion:', supuracion],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 }
    }
  });
  yPosition = doc.lastAutoTable.finalY + 5;

  // ==================== EVALUACIÓN RADIOGRÁFICA ====================
  yPosition = checkPageBreak(doc, yPosition, 40);
  addSectionTitle(doc, 'EVALUACION RADIOGRAFICA', yPosition);
  yPosition += 6;

  // Cámara
  const camaraOpciones = [];
  if (ficha.camara_normal) camaraOpciones.push('Normal');
  if (ficha.camara_estrecha) camaraOpciones.push('Estrecha');
  if (ficha.camara_calcificada) camaraOpciones.push('Calcificada');
  if (ficha.camara_amplia) camaraOpciones.push('Amplia');
  if (ficha.camara_nodulos) camaraOpciones.push('Nodulos');
  if (ficha.camara_reabsorcion_interna) camaraOpciones.push('Reabsorcion Interna');
  if (ficha.camara_reabsorcion_externa) camaraOpciones.push('Reabsorcion Externa');

  // Conductos
  const conductosOpciones = [];
  if (ficha.conductos_normal) conductosOpciones.push('Normal');
  if (ficha.conductos_estrechos) conductosOpciones.push('Estrechos');
  if (ficha.conductos_calcificados) conductosOpciones.push('Calcificados');
  if (ficha.conductos_curvos) conductosOpciones.push('Curvos');
  if (ficha.conductos_reabsorcion_interna) conductosOpciones.push('Reabsorcion Interna');

  // Ápice
  const apiceOpciones = [];
  if (ficha.apice_normal) apiceOpciones.push('Normal');
  if (ficha.apice_incompleto) apiceOpciones.push('Incompleto');
  if (ficha.apice_reabsorcion) apiceOpciones.push('Reabsorcion');

  const lesionPeriapical = safeGet(ficha, 'lesion_periapical', 'No');

  autoTable(doc, {
    startY: yPosition,
    body: [
      ['Camara:', camaraOpciones.length > 0 ? camaraOpciones.join(', ') : 'N/A'],
      ['Conductos:', conductosOpciones.length > 0 ? conductosOpciones.join(', ') : 'N/A'],
      ['Apice:', apiceOpciones.length > 0 ? apiceOpciones.join(', ') : 'N/A'],
      ['Lesion Periapical:', String(lesionPeriapical)],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 }
    }
  });
  yPosition = doc.lastAutoTable.finalY + 8;

  // ==================== PRESUPUESTO ====================
  if (presupuesto && actosArray.length > 0) {
    yPosition = checkPageBreak(doc, yPosition, 50);
    addSectionTitle(doc, 'PRESUPUESTO', yPosition);
    yPosition += 6;

    const actosTableData = actosArray.map((acto, index) => [
      index + 1,
      String(acto.actividad || 'N/A'),
      formatCurrency(acto.costo_unitario),
      String(acto.cantidad || 1),
      formatCurrency(acto.total)
    ]);

    // Agregar fila de total
    actosTableData.push([
      { content: '', colSpan: 3 },
      { content: 'TOTAL:', styles: { fontStyle: 'bold', halign: 'right' } },
      { content: formatCurrency(presupuesto.total), styles: { fontStyle: 'bold' } }
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['N', 'Actividad', 'Costo Unit.', 'Cant.', 'Total']],
      body: actosTableData,
      theme: 'grid',
      headStyles: {
        fillColor: TEAL_COLOR,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'right', cellWidth: 30 }
      }
    });
    yPosition = doc.lastAutoTable.finalY + 8;
  }

  // ==================== PAGOS ====================
  if (pagosArray.length > 0) {
    yPosition = checkPageBreak(doc, yPosition, 40);
    addSectionTitle(doc, 'HISTORIAL DE PAGOS', yPosition);
    yPosition += 6;

    const pagosTableData = pagosArray.map(pago => [
      safeFormatDate(pago.fecha),
      String(pago.actividad || '-'),
      formatCurrency(pago.valor),
      formatCurrency(pago.saldo_actual)
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Fecha', 'Actividad', 'Valor', 'Saldo']],
      body: pagosTableData,
      theme: 'grid',
      headStyles: {
        fillColor: TEAL_COLOR,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });
    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // ==================== FOOTER - FIRMAS ====================
  yPosition = checkPageBreak(doc, yPosition, 60);
  yPosition += 15;

  const leftX = 30;
  const rightX = pageWidth - 70;
  const lineWidth = 60;

  doc.setDrawColor(...GRAY_COLOR);
  doc.setLineWidth(0.5);

  // Firma Doctora
  doc.line(leftX, yPosition, leftX + lineWidth, yPosition);
  doc.setFontSize(9);
  doc.setTextColor(...GRAY_COLOR);
  doc.text('Dra. Magda Zulay Bastidas C.', leftX + lineWidth / 2, yPosition + 5, { align: 'center' });
  doc.setFontSize(8);
  doc.text('ODONTOLOGA', leftX + lineWidth / 2, yPosition + 9, { align: 'center' });

  // Firma Paciente
  doc.line(rightX, yPosition, rightX + lineWidth, yPosition);
  doc.setFontSize(9);
  doc.text('Paciente', rightX + lineWidth / 2, yPosition + 5, { align: 'center' });
  doc.setFontSize(8);
  const cedula = safeGet(ficha, 'cedula', '_________________');
  doc.text(`C.I.: ${cedula}`, rightX + lineWidth / 2, yPosition + 9, { align: 'center' });

  // Fecha de impresión
  yPosition += 25;
  doc.setFontSize(8);
  doc.setTextColor(...GRAY_COLOR);
  const fechaImpresion = new Date().toLocaleString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Documento generado el ${fechaImpresion}`, pageWidth / 2, yPosition, { align: 'center' });

  // ==================== GUARDAR PDF ====================
  const fechaArchivo = new Date().toISOString().split('T')[0];
  const hcSafe = String(historiaClinica).replace(/[^a-zA-Z0-9]/g, '_');
  const nombreArchivo = `Ficha_Endodontica_${hcSafe}_${fechaArchivo}.pdf`;

  console.log('Guardando PDF:', nombreArchivo);
  doc.save(nombreArchivo);

  return nombreArchivo;
};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Agrega un título de sección con estilo
 */
const addSectionTitle = (doc, title, y) => {
  doc.setTextColor(...TEAL_COLOR);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, y);
  doc.setFont('helvetica', 'normal');
};

/**
 * Verifica si necesita salto de página y lo hace si es necesario
 */
const checkPageBreak = (doc, currentY, requiredSpace) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + requiredSpace > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return currentY;
};

const pdfService = {
  generarFichaEndodonticaPDF
};

export default pdfService;
