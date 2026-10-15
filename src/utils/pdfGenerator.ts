import { AccountingData } from '../types';
import { formatCurrency, formatNumber } from './storage';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function generateReportHtml(data: AccountingData): string {
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

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير النظام المحاسبي الشامل - محمد طالب</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Tajawal', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 16px;
      color: #0f172a;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.5;
    }
    .header-box {
      border: 2px solid #0284c7;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .header-title h1 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 900;
      color: #0369a1;
    }
    .header-title p {
      margin: 0;
      font-size: 11px;
      color: #475569;
      font-weight: 500;
    }
    .logo-badge {
      width: 48px;
      height: 48px;
      background: #0284c7;
      color: #ffffff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 18px;
      letter-spacing: 1px;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 16px;
      font-size: 11px;
      font-weight: bold;
      color: #334155;
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      margin: 16px 0 8px 0;
      padding-bottom: 4px;
      border-bottom: 2px solid #cbd5e1;
    }
    .section-title .badge {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 6px;
      color: #ffffff;
      font-weight: bold;
    }
    .badge-income { background: #059669; }
    .badge-veg { background: #d97706; }
    .badge-meat { background: #e11d48; }
    .badge-groc { background: #0284c7; }
    .badge-exp { background: #7c3aed; }
    .badge-summary { background: #0f172a; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 10.5px;
    }
    th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      padding: 6px 8px;
      text-align: right;
      border: 1px solid #cbd5e1;
    }
    td {
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      text-align: right;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .text-left {
      text-align: left;
    }
    .tabular-nums {
      font-variant-numeric: tabular-nums;
    }
    .total-row td {
      background: #f1f5f9 !important;
      font-weight: 800;
      border-top: 2px solid #94a3b8;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .kpi-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px;
      background: #ffffff;
      text-align: center;
    }
    .kpi-card.income { border-color: #10b981; background: #ecfdf5; }
    .kpi-card.purchases { border-color: #f43f5e; background: #fff1f2; }
    .kpi-card.balance { border-color: #0284c7; background: #f0f9ff; }
    .kpi-title {
      font-size: 10px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 3px;
    }
    .kpi-val {
      font-size: 15px;
      font-weight: 900;
      margin-bottom: 2px;
    }
    .kpi-card.income .kpi-val { color: #047857; }
    .kpi-card.purchases .kpi-val { color: #be123c; }
    .kpi-card.balance .kpi-val { color: #0369a1; }
    .footer-note {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #64748b;
    }
    .signature-box {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 14px;
      text-align: center;
      font-size: 10px;
      background: #f8fafc;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- Header Banner -->
  <div class="header-box">
    <div class="header-title">
      <h1>تقرير النظام المحاسبي وإدارة المصاريف</h1>
      <p>صاحب الحساب: <strong>محمد طالب</strong> · العملة: <strong>الدرهم المغربي (MAD)</strong></p>
    </div>
    <div class="logo-badge">م.ط</div>
  </div>

  <!-- Meta Info -->
  <div class="meta-bar">
    <div>تاريخ إصدار التقرير: <span>${todayStr}</span></div>
    <div>نوع التقرير: <span>كشف حساب محاسبي شامل (الدخل + المشتريات + الملخص)</span></div>
  </div>

  <!-- ==================== 1. بيان مصادر الدخل ==================== -->
  <div class="section-title">
    <span class="badge badge-income">1. الدخل</span>
    <span>بيان مصادر الدخل والرواتب الشهرية</span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 45%;">مصدر الدخل / الراتب</th>
        <th style="width: 25%;">التاريخ</th>
        <th style="width: 25%;" class="text-left">المبلغ (درهم)</th>
      </tr>
    </thead>
    <tbody>
      ${data.incomes.length > 0 ? data.incomes.map((inc, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${inc.name}</strong> ${inc.notes ? `<span style="color:#64748b;font-size:9.5px;">(${inc.notes})</span>` : ''}</td>
          <td>${inc.date || '-'}</td>
          <td class="text-left tabular-nums" style="color:#047857;font-weight:bold;">+${formatNumber(inc.amount)}</td>
        </tr>
      `).join('') : `
        <tr>
          <td colspan="4" style="text-align:center;color:#94a3b8;">لا توجد عناصر دخل مسجلة</td>
        </tr>
      `}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3">إجمالي الدخل المحصل:</td>
        <td class="text-left tabular-nums" style="color:#047857;font-size:12px;">${formatCurrency(totalIncome)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- ==================== 2. بيان المشتريات والمصروفات ==================== -->
  <div class="section-title">
    <span class="badge badge-veg">2. المشتريات</span>
    <span>أ. مشتريات الخضار والفواكه</span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 40%;">اسم الصنف</th>
        <th style="width: 15%;">السعر الفردي</th>
        <th style="width: 15%;">الكمية</th>
        <th style="width: 15%;" class="text-left">المجموع</th>
        <th style="width: 10%;">التاريخ</th>
      </tr>
    </thead>
    <tbody>
      ${data.vegetables.length > 0 ? data.vegetables.map((v, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${v.name}</td>
          <td class="tabular-nums">${v.price} درهم</td>
          <td class="tabular-nums">${v.qty} ${v.unit || 'كغ'}</td>
          <td class="text-left tabular-nums" style="font-weight:bold;">${(v.price * v.qty).toFixed(2)}</td>
          <td>${v.date || '-'}</td>
        </tr>
      `).join('') : `
        <tr><td colspan="6" style="text-align:center;color:#94a3b8;">لا توجد مشتريات خضار</td></tr>
      `}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="4">مجموع مشتريات الخضار والفواكه:</td>
        <td class="text-left tabular-nums" colspan="2" style="color:#b45309;">${formatCurrency(totalVeg)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- ب. مشتريات اللحوم والأسماك -->
  <div class="section-title">
    <span class="badge badge-meat">2. المشتريات</span>
    <span>ب. مشتريات اللحوم والدواجن والأسماك</span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 40%;">نوع اللحم / السمك</th>
        <th style="width: 15%;">السعر للكيلو</th>
        <th style="width: 15%;">الكمية</th>
        <th style="width: 15%;" class="text-left">المجموع</th>
        <th style="width: 10%;">التاريخ</th>
      </tr>
    </thead>
    <tbody>
      ${data.meats.length > 0 ? data.meats.map((m, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${m.name}</td>
          <td class="tabular-nums">${m.price} درهم</td>
          <td class="tabular-nums">${m.qty} ${m.unit || 'كغ'}</td>
          <td class="text-left tabular-nums" style="font-weight:bold;">${(m.price * m.qty).toFixed(2)}</td>
          <td>${m.date || '-'}</td>
        </tr>
      `).join('') : `
        <tr><td colspan="6" style="text-align:center;color:#94a3b8;">لا توجد مشتريات لحوم</td></tr>
      `}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="4">مجموع مشتريات اللحوم والأسماك:</td>
        <td class="text-left tabular-nums" colspan="2" style="color:#be123c;">${formatCurrency(totalMeat)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- ج. مواد الهري والتموين -->
  <div class="section-title">
    <span class="badge badge-groc">2. المشتريات</span>
    <span>ج. مواد الهري والمؤن والبقالة العامة</span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 40%;">المادة / الصنف</th>
        <th style="width: 15%;">السعر</th>
        <th style="width: 15%;">الكمية</th>
        <th style="width: 15%;" class="text-left">المجموع</th>
        <th style="width: 10%;">التاريخ</th>
      </tr>
    </thead>
    <tbody>
      ${data.groceries.length > 0 ? data.groceries.map((g, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${g.name}</td>
          <td class="tabular-nums">${g.price} درهم</td>
          <td class="tabular-nums">${g.qty} ${g.unit || 'وحدة'}</td>
          <td class="text-left tabular-nums" style="font-weight:bold;">${(g.price * g.qty).toFixed(2)}</td>
          <td>${g.date || '-'}</td>
        </tr>
      `).join('') : `
        <tr><td colspan="6" style="text-align:center;color:#94a3b8;">لا توجد مشتريات هري</td></tr>
      `}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="4">مجموع مواد الهري والمؤن:</td>
        <td class="text-left tabular-nums" colspan="2" style="color:#0369a1;">${formatCurrency(totalGroc)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- د. الفواتير والمصاريف العامة -->
  <div class="section-title">
    <span class="badge badge-exp">2. المشتريات</span>
    <span>د. الفواتير والاشتراكات والمصاريف الشهرية</span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 45%;">بيان المصروف / الفاتورة</th>
        <th style="width: 25%;">الفئة</th>
        <th style="width: 15%;" class="text-left">المبلغ</th>
        <th style="width: 10%;">التاريخ</th>
      </tr>
    </thead>
    <tbody>
      ${data.expenses.length > 0 ? data.expenses.map((e, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${e.name}</strong></td>
          <td>${e.category || 'عام'}</td>
          <td class="text-left tabular-nums" style="font-weight:bold;">${e.amount.toFixed(2)}</td>
          <td>${e.date || '-'}</td>
        </tr>
      `).join('') : `
        <tr><td colspan="5" style="text-align:center;color:#94a3b8;">لا توجد فواتير مسجلة</td></tr>
      `}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3">مجموع الفواتير والمصاريف:</td>
        <td class="text-left tabular-nums" colspan="2" style="color:#6d28d9;">${formatCurrency(totalExp)}</td>
      </tr>
      <tr style="background:#fee2e2;font-weight:900;border-top:2px solid #ef4444;">
        <td colspan="3" style="color:#991b1b;font-size:11.5px;">إجمالي المشتريات والمصروفات الكلي (خضار + لحوم + هري + فواتير):</td>
        <td class="text-left tabular-nums" colspan="2" style="color:#991b1b;font-size:12px;">${formatCurrency(totalPurchases)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- ==================== 3. الملخص والتحليل المالي النهائي ==================== -->
  <div class="section-title">
    <span class="badge badge-summary">3. الملخص</span>
    <span>الملخص والتحليل المالي النهائي</span>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card income">
      <div class="kpi-title">إجمالي الدخل الشهري</div>
      <div class="kpi-val tabular-nums">${formatCurrency(totalIncome)}</div>
      <div style="font-size:9.5px;color:#047857;">مجموع جميع المداخيل</div>
    </div>

    <div class="kpi-card purchases">
      <div class="kpi-title">إجمالي المصاريف والمشتريات</div>
      <div class="kpi-val tabular-nums">${formatCurrency(totalPurchases)}</div>
      <div style="font-size:9.5px;color:#be123c;">نسبة الاستهلاك: ${expenseRatio}%</div>
    </div>

    <div class="kpi-card balance" style="${netBalance < 0 ? 'background:#fef2f2;border-color:#f87171;' : ''}">
      <div class="kpi-title">صافي الرصيد المتبقي</div>
      <div class="kpi-val tabular-nums" style="${netBalance < 0 ? 'color:#b91c1c;' : 'color:#0369a1;'}">
        ${formatCurrency(netBalance)}
      </div>
      <div style="font-size:9.5px;color:${netBalance >= 0 ? '#047857' : '#b91c1c'};font-weight:bold;">
        ${netBalance >= 0 ? `فائض إيجابي (ادخار ${savingsRatio}%)` : 'عجز (المصاريف تجاوزت الدخل)'}
      </div>
    </div>
  </div>

  <!-- جدول التوزيع النسبي -->
  <table>
    <thead>
      <tr>
        <th>القسم المالي</th>
        <th>المجموع بالدرهم</th>
        <th>نسبة الاستهلاك من النفقات</th>
        <th>التقييم</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>قسم الخضار والفواكه</strong></td>
        <td class="tabular-nums">${formatCurrency(totalVeg)}</td>
        <td class="tabular-nums">${totalPurchases > 0 ? ((totalVeg / totalPurchases) * 100).toFixed(1) : 0}%</td>
        <td>استهلاك غذائي أساسي</td>
      </tr>
      <tr>
        <td><strong>قسم اللحوم والأسماك والدواجن</strong></td>
        <td class="tabular-nums">${formatCurrency(totalMeat)}</td>
        <td class="tabular-nums">${totalPurchases > 0 ? ((totalMeat / totalPurchases) * 100).toFixed(1) : 0}%</td>
        <td>بروتينات ومؤونة</td>
      </tr>
      <tr>
        <td><strong>مواد الهري والتموين والبقالة</strong></td>
        <td class="tabular-nums">${formatCurrency(totalGroc)}</td>
        <td class="tabular-nums">${totalPurchases > 0 ? ((totalGroc / totalPurchases) * 100).toFixed(1) : 0}%</td>
        <td>مواد تموينية شهرية</td>
      </tr>
      <tr>
        <td><strong>الفواتير والمصاريف الثابتة</strong></td>
        <td class="tabular-nums">${formatCurrency(totalExp)}</td>
        <td class="tabular-nums">${totalPurchases > 0 ? ((totalExp / totalPurchases) * 100).toFixed(1) : 0}%</td>
        <td>خدمات منزلية والتزامات</td>
      </tr>
    </tbody>
  </table>

  <!-- الختام والتوقيع -->
  <div class="footer-note">
    <div>
      نظام إدارة المصاريف العائلية والراتب الشهري · تقرير رسمي مستخرج محلياً
    </div>
    <div class="signature-box">
      <strong>اعتماد ومصادقة الحسابات</strong><br>
      <span style="color:#0284c7;font-weight:bold;">محمد طالب</span>
    </div>
  </div>

</body>
</html>`;
}

/**
 * Triggers native browser print dialog specifically targeting the PDF report,
 * allowing the user to click "Save as PDF" (حفظ بتنسيق PDF).
 */
export function printOrDownloadPdf(data: AccountingData): void {
  const html = generateReportHtml(data);

  // Create an isolated hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    console.error('Cannot access iframe document');
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  // Wait for Google Fonts & layout to finish rendering before printing
  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Printing error:', err);
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 3000);
      }
    }, 400);
  };
}

/**
 * Download as an offline standalone HTML report document
 */
export function downloadReportHtml(data: AccountingData): void {
  const html = generateReportHtml(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `تقرير_المحاسبة_محمد_طالب_${dateStr}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Renders any HTML element directly to a downloadable binary .pdf file using html2canvas & jsPDF.
 * Works seamlessly across all desktop & mobile browsers, including inside iframes!
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string = `تقرير_المحاسبة_محمد_طالب_${new Date().toISOString().split('T')[0]}.pdf`
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 1024
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let pageNum = 0;

  while (heightLeft > 0) {
    if (pageNum > 0) {
      pdf.addPage();
    }
    const position = -(pageNum * pageHeight);
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
    pageNum++;
  }

  pdf.save(filename);
}

