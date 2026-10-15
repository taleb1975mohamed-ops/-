import { AccountingData } from '../types';
import { formatCurrency, formatNumber } from './storage';
import jsPDF from 'jspdf';

/**
 * Generates an authentic, multi-page A4 PDF file directly using HTML5 Canvas 2D & jsPDF.
 * 100% immune to CSS / Tailwind oklch incompatibilities.
 * Always triggers an instant, genuine .pdf file download.
 */
export async function generateAndDownloadPdf(
  data: AccountingData,
  filename: string = `تقرير_المحاسبة_محمد_طالب_${new Date().toISOString().split('T')[0]}.pdf`
): Promise<{ blob: Blob; blobUrl: string }> {
  // Ensure custom font Tajawal is loaded
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore if document.fonts is not supported
    }
  }

  const totalIncome = data.incomes.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalVeg = data.vegetables.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalMeat = data.meats.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalGroc = data.groceries.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalExp = data.expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

  const totalPurchases = totalVeg + totalMeat + totalGroc + totalExp;
  const netBalance = totalIncome - totalPurchases;
  const expenseRatio = totalIncome > 0 ? ((totalPurchases / totalIncome) * 100).toFixed(1) : '0';
  const savingsRatio = totalIncome > 0 ? (Math.max(0, netBalance / totalIncome) * 100).toFixed(1) : '0';

  const todayStr = new Date().toLocaleDateString('ar-MA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const width = 1200;
  // Estimate height dynamically based on number of items
  const totalRows = data.incomes.length + data.vegetables.length + data.meats.length + data.groceries.length + data.expenses.length;
  // Base height ~ 1300px + 36px per row + section headers
  const totalHeight = Math.max(1700, 1150 + totalRows * 36);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2d context');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalHeight);

  // Setup RTL
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  const margin = 45;
  const contentWidth = width - margin * 2;
  let y = margin;

  // Helper rounded rect
  const drawRoundedRect = (rx: number, ry: number, rw: number, rh: number, radius: number, fill: string, stroke?: string, strokeW = 1) => {
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(rx, ry, rw, rh, radius) : ctx.rect(rx, ry, rw, rh);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeW;
      ctx.stroke();
    }
  };

  // 1. Header Box
  drawRoundedRect(margin, y, contentWidth, 100, 16, '#f0f9ff', '#0284c7', 2);
  
  // Header Logo Box
  drawRoundedRect(margin + contentWidth - 85, y + 18, 64, 64, 14, '#0284c7');
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "Tajawal", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('م.ط', margin + contentWidth - 53, y + 50);

  // Header Title & Subtitle
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0369a1';
  ctx.font = '900 26px "Tajawal", system-ui, sans-serif';
  ctx.fillText('تقرير النظام المحاسبي وإدارة المصاريف', margin + contentWidth - 105, y + 40);

  ctx.fillStyle = '#475569';
  ctx.font = '500 15px "Tajawal", system-ui, sans-serif';
  ctx.fillText('صاحب الحساب: محمد طالب · العملة المعتمدة: الدرهم المغربي (MAD)', margin + contentWidth - 105, y + 72);

  y += 115;

  // 2. Meta Bar
  drawRoundedRect(margin, y, contentWidth, 42, 10, '#f8fafc', '#e2e8f0', 1);
  ctx.fillStyle = '#334155';
  ctx.font = '700 14px "Tajawal", system-ui, sans-serif';
  ctx.fillText(`تاريخ إصدار التقرير: ${todayStr}`, margin + contentWidth - 18, y + 21);
  
  ctx.textAlign = 'left';
  ctx.fillText('كشف حساب شامل: (الدخل + المشتريات + الملخص والتحليل)', margin + 18, y + 21);
  ctx.textAlign = 'right';

  y += 55;

  // Function to draw a Section Title
  const drawSectionHeader = (numberStr: string, title: string, badgeBg: string) => {
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 18px "Tajawal", system-ui, sans-serif';
    
    // Badge
    drawRoundedRect(margin + contentWidth - 36, y - 10, 36, 26, 6, badgeBg);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 13px "Tajawal", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(numberStr, margin + contentWidth - 18, y + 3);
    ctx.textAlign = 'right';

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 17px "Tajawal", system-ui, sans-serif';
    ctx.fillText(title, margin + contentWidth - 48, y + 3);

    // Line below
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin, y + 20);
    ctx.lineTo(margin + contentWidth, y + 20);
    ctx.stroke();

    y += 32;
  };

  // Helper to draw a standard table
  const drawTable = (
    headers: { label: string; widthRatio: number; alignLeft?: boolean }[],
    rows: { cols: string[]; highlightColor?: string }[],
    totalLabel?: string,
    totalVal?: string,
    totalColor = '#047857'
  ) => {
    const rowH = 30;
    
    // Table Header
    drawRoundedRect(margin, y, contentWidth, 32, 6, '#f1f5f9', '#cbd5e1', 1);
    let curX = margin + contentWidth;

    headers.forEach(h => {
      const colW = contentWidth * h.widthRatio;
      ctx.fillStyle = '#1e293b';
      ctx.font = '800 13px "Tajawal", system-ui, sans-serif';
      if (h.alignLeft) {
        ctx.textAlign = 'left';
        ctx.fillText(h.label, curX - colW + 12, y + 16);
      } else {
        ctx.textAlign = 'right';
        ctx.fillText(h.label, curX - 12, y + 16);
      }
      curX -= colW;
    });

    y += 34;

    // Rows
    if (rows.length === 0) {
      drawRoundedRect(margin, y, contentWidth, rowH, 0, '#ffffff', '#e2e8f0', 0.5);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 13px "Tajawal", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('لا توجد عناصر مسجلة في هذا القسم', margin + contentWidth / 2, y + 15);
      y += rowH;
    } else {
      rows.forEach((r, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        drawRoundedRect(margin, y, contentWidth, rowH, 0, bg, '#e2e8f0', 0.5);

        let cellX = margin + contentWidth;
        headers.forEach((h, cIdx) => {
          const colW = contentWidth * h.widthRatio;
          const text = r.cols[cIdx] || '';
          
          if (cIdx === headers.length - 1 && r.highlightColor) {
            ctx.fillStyle = r.highlightColor;
            ctx.font = '800 13px "Tajawal", system-ui, sans-serif';
          } else {
            ctx.fillStyle = '#334155';
            ctx.font = '500 13px "Tajawal", system-ui, sans-serif';
          }

          if (h.alignLeft) {
            ctx.textAlign = 'left';
            ctx.fillText(text, cellX - colW + 12, y + 15);
          } else {
            ctx.textAlign = 'right';
            ctx.fillText(text, cellX - 12, y + 15);
          }
          cellX -= colW;
        });

        y += rowH;
      });
    }

    // Optional Total Row
    if (totalLabel && totalVal) {
      drawRoundedRect(margin, y, contentWidth, 34, 6, '#f1f5f9', '#94a3b8', 1.5);
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 14px "Tajawal", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(totalLabel, margin + contentWidth - 14, y + 17);

      ctx.fillStyle = totalColor;
      ctx.font = '900 15px "Tajawal", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(totalVal, margin + 14, y + 17);
      ctx.textAlign = 'right';
      y += 40;
    } else {
      y += 12;
    }
  };

  // ==================== 1. الدخل ====================
  drawSectionHeader('1', 'بيان مصادر الدخل والرواتب الشهرية', '#059669');
  drawTable(
    [
      { label: '#', widthRatio: 0.08 },
      { label: 'مصدر الدخل / الراتب', widthRatio: 0.47 },
      { label: 'التاريخ', widthRatio: 0.22 },
      { label: 'المبلغ (درهم)', widthRatio: 0.23, alignLeft: true }
    ],
    data.incomes.map((inc, i) => ({
      cols: [String(i + 1), inc.name + (inc.notes ? ` (${inc.notes})` : ''), inc.date || '-', `+${formatNumber(inc.amount)} درهم`],
      highlightColor: '#047857'
    })),
    'إجمالي الدخل المحصل:',
    formatCurrency(totalIncome),
    '#047857'
  );

  y += 10;

  // ==================== 2. المشتريات ====================
  drawSectionHeader('2', 'بيان المشتريات والمصروفات الشهرية', '#ea580c');

  // أ. الخضار
  ctx.fillStyle = '#b45309';
  ctx.font = '800 14px "Tajawal", system-ui, sans-serif';
  ctx.fillText('أ. مشتريات الخضار والفواكه', margin + contentWidth - 10, y + 5);
  y += 18;

  drawTable(
    [
      { label: '#', widthRatio: 0.08 },
      { label: 'الصنف', widthRatio: 0.38 },
      { label: 'السعر الفردي', widthRatio: 0.18 },
      { label: 'الكمية', widthRatio: 0.16 },
      { label: 'المجموع', widthRatio: 0.20, alignLeft: true }
    ],
    data.vegetables.map((v, i) => ({
      cols: [String(i + 1), v.name, `${v.price} درهم`, `${v.qty} ${v.unit || 'كغ'}`, `${(v.price * v.qty).toFixed(2)} درهم`],
      highlightColor: '#1e293b'
    })),
    'مجموع مشتريات الخضار:',
    formatCurrency(totalVeg),
    '#b45309'
  );

  // ب. اللحوم
  ctx.fillStyle = '#be123c';
  ctx.font = '800 14px "Tajawal", system-ui, sans-serif';
  ctx.fillText('ب. مشتريات اللحوم والأسماك والدواجن', margin + contentWidth - 10, y + 5);
  y += 18;

  drawTable(
    [
      { label: '#', widthRatio: 0.08 },
      { label: 'نوع اللحم / السمك', widthRatio: 0.38 },
      { label: 'السعر للكيلو', widthRatio: 0.18 },
      { label: 'الكمية', widthRatio: 0.16 },
      { label: 'المجموع', widthRatio: 0.20, alignLeft: true }
    ],
    data.meats.map((m, i) => ({
      cols: [String(i + 1), m.name, `${m.price} درهم`, `${m.qty} ${m.unit || 'كغ'}`, `${(m.price * m.qty).toFixed(2)} درهم`],
      highlightColor: '#1e293b'
    })),
    'مجموع مشتريات اللحوم والأسماك:',
    formatCurrency(totalMeat),
    '#be123c'
  );

  // ج. الهري
  ctx.fillStyle = '#0369a1';
  ctx.font = '800 14px "Tajawal", system-ui, sans-serif';
  ctx.fillText('ج. مواد الهري والتموين والبقالة', margin + contentWidth - 10, y + 5);
  y += 18;

  drawTable(
    [
      { label: '#', widthRatio: 0.08 },
      { label: 'المادة / الصنف', widthRatio: 0.38 },
      { label: 'السعر الفردي', widthRatio: 0.18 },
      { label: 'الكمية', widthRatio: 0.16 },
      { label: 'المجموع', widthRatio: 0.20, alignLeft: true }
    ],
    data.groceries.map((g, i) => ({
      cols: [String(i + 1), g.name, `${g.price} درهم`, `${g.qty} ${g.unit || 'وحدة'}`, `${(g.price * g.qty).toFixed(2)} درهم`],
      highlightColor: '#1e293b'
    })),
    'مجموع مواد الهري والمؤن:',
    formatCurrency(totalGroc),
    '#0369a1'
  );

  // د. الفواتير
  ctx.fillStyle = '#6d28d9';
  ctx.font = '800 14px "Tajawal", system-ui, sans-serif';
  ctx.fillText('د. الفواتير والاشتراكات والمصاريف العامة', margin + contentWidth - 10, y + 5);
  y += 18;

  drawTable(
    [
      { label: '#', widthRatio: 0.08 },
      { label: 'بيان المصروف / الفاتورة', widthRatio: 0.44 },
      { label: 'الفئة', widthRatio: 0.26 },
      { label: 'المبلغ', widthRatio: 0.22, alignLeft: true }
    ],
    data.expenses.map((e, i) => ({
      cols: [String(i + 1), e.name, e.category || 'عام', `${formatNumber(e.amount)} درهم`],
      highlightColor: '#1e293b'
    })),
    'مجموع الفواتير والمصاريف:',
    formatCurrency(totalExp),
    '#6d28d9'
  );

  // Grand Purchases Total Banner
  drawRoundedRect(margin, y, contentWidth, 42, 10, '#fee2e2', '#ef4444', 2);
  ctx.fillStyle = '#991b1b';
  ctx.font = '900 15px "Tajawal", system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('إجمالي المشتريات والمصروفات الكلي (خضار + لحوم + هري + فواتير):', margin + contentWidth - 16, y + 21);

  ctx.textAlign = 'left';
  ctx.font = '900 17px "Tajawal", system-ui, sans-serif';
  ctx.fillText(formatCurrency(totalPurchases), margin + 16, y + 21);
  ctx.textAlign = 'right';

  y += 60;

  // ==================== 3. الملخص النهائي ====================
  drawSectionHeader('3', 'الملخص والتحليل المالي النهائي', '#0284c7');

  // KPI 3 Cards in a row
  const cardW = (contentWidth - 20) / 3;
  const cardH = 80;

  // Card 1: Income
  drawRoundedRect(margin + cardW * 2 + 20, y, cardW, cardH, 12, '#ecfdf5', '#10b981', 1.5);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#047857';
  ctx.font = '700 13px "Tajawal", system-ui, sans-serif';
  ctx.fillText('إجمالي الدخل المحصل', margin + cardW * 2 + 20 + cardW / 2, y + 24);
  ctx.font = '900 20px "Tajawal", system-ui, sans-serif';
  ctx.fillText(formatCurrency(totalIncome), margin + cardW * 2 + 20 + cardW / 2, y + 54);

  // Card 2: Purchases
  drawRoundedRect(margin + cardW + 10, y, cardW, cardH, 12, '#fff1f2', '#f43f5e', 1.5);
  ctx.fillStyle = '#be123c';
  ctx.font = '700 13px "Tajawal", system-ui, sans-serif';
  ctx.fillText('إجمالي المصروفات', margin + cardW + 10 + cardW / 2, y + 24);
  ctx.font = '900 20px "Tajawal", system-ui, sans-serif';
  ctx.fillText(formatCurrency(totalPurchases), margin + cardW + 10 + cardW / 2, y + 54);

  // Card 3: Balance
  const balBg = netBalance >= 0 ? '#f0f9ff' : '#fef2f2';
  const balBorder = netBalance >= 0 ? '#0284c7' : '#ef4444';
  const balColor = netBalance >= 0 ? '#0369a1' : '#b91c1c';
  drawRoundedRect(margin, y, cardW, cardH, 12, balBg, balBorder, 1.5);
  ctx.fillStyle = balColor;
  ctx.font = '700 13px "Tajawal", system-ui, sans-serif';
  ctx.fillText('صافي الرصيد المتبقي', margin + cardW / 2, y + 24);
  ctx.font = '900 20px "Tajawal", system-ui, sans-serif';
  ctx.fillText(formatCurrency(netBalance), margin + cardW / 2, y + 54);

  y += cardH + 20;

  // Distribution Table
  drawTable(
    [
      { label: 'القسم المالي', widthRatio: 0.35 },
      { label: 'المجموع بالدرهم', widthRatio: 0.25 },
      { label: 'النسبة من النفقات', widthRatio: 0.20 },
      { label: 'التقييم', widthRatio: 0.20, alignLeft: true }
    ],
    [
      { cols: ['قسم الخضار والفواكه', formatCurrency(totalVeg), `${totalPurchases > 0 ? ((totalVeg / totalPurchases) * 100).toFixed(1) : 0}%`, 'استهلاك غذائي أساسي'], highlightColor: '#b45309' },
      { cols: ['قسم اللحوم والأسماك', formatCurrency(totalMeat), `${totalPurchases > 0 ? ((totalMeat / totalPurchases) * 100).toFixed(1) : 0}%`, 'بروتينات ومؤونة'], highlightColor: '#be123c' },
      { cols: ['مواد الهري والتموين', formatCurrency(totalGroc), `${totalPurchases > 0 ? ((totalGroc / totalPurchases) * 100).toFixed(1) : 0}%`, 'تموين شهري'], highlightColor: '#0369a1' },
      { cols: ['الفواتير والمصاريف', formatCurrency(totalExp), `${totalPurchases > 0 ? ((totalExp / totalPurchases) * 100).toFixed(1) : 0}%`, 'خدمات والتزامات'], highlightColor: '#6d28d9' }
    ]
  );

  y += 10;

  // Footer & Official Signature
  drawRoundedRect(margin, y, contentWidth, 54, 10, '#f8fafc', '#cbd5e1', 1);
  ctx.fillStyle = '#64748b';
  ctx.font = '600 13px "Tajawal", system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('نظام إدارة المصاريف العائلية والراتب الشهري · اعتماد ومصادقة الحسابات:', margin + contentWidth - 18, y + 27);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0284c7';
  ctx.font = '900 16px "Tajawal", system-ui, sans-serif';
  ctx.fillText('محمد طالب', margin + 18, y + 27);

  // ==================== Export to jsPDF with Mobile Blob Support ====================
  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true
  });
  const pageWidth = 210;
  const pageHeight = 297;

  const totalHeightMm = (totalHeight * pageWidth) / width;
  let heightLeft = totalHeightMm;
  let pageNum = 0;

  while (heightLeft > 0) {
    if (pageNum > 0) {
      pdf.addPage();
    }
    const position = -(pageNum * pageHeight);
    pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, totalHeightMm, undefined, 'FAST');
    heightLeft -= pageHeight;
    pageNum++;
  }

  // Generate binary Blob (Mobile compatible, avoids data: URI block on mobile Chrome)
  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  // Safe filename that Android and iOS file managers accept without .bin renaming
  const safeFilename = filename.toLowerCase().endsWith('.pdf') 
    ? filename 
    : `${filename}.pdf`;

  // Trigger download via link element
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = safeFilename;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
  }, 2000);

  return { blob, blobUrl };
}
