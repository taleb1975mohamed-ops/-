import React, { useRef, useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  Carrot, 
  Beef, 
  ShoppingBag, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Loader2, 
  Check, 
  ExternalLink,
  Share2,
  Smartphone
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AccountingData } from '../types';
import { formatCurrency, formatNumber } from '../utils/storage';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AccountingData;
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({ isOpen, onClose, data }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [canMobileShare, setCanMobileShare] = useState(false);

  // Check if Web Share API with files is supported (mobile browsers)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare) {
      try {
        const dummyFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
        if (navigator.canShare({ files: [dummyFile] })) {
          setCanMobileShare(true);
        }
      } catch {
        setCanMobileShare(false);
      }
    }
  }, []);

  // Cleanup object URL on unmount or when modal closes
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  if (!isOpen) return null;

  // Calculations
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

  const reportFileName = `تقرير_المحاسبة_محمد_طالب_${new Date().toISOString().split('T')[0]}.pdf`;

  /**
   * Generates genuine binary PDF file using html2canvas & jsPDF
   * with mobile-specific configuration to prevent rendering crashes and HTML fallbacks.
   */
  const renderPdfBlob = async (): Promise<{ blob: Blob; blobUrl: string }> => {
    if (!reportRef.current) {
      throw new Error('تعذر العثور على محتوى التقرير للتصيير');
    }

    // 1. Wait for custom web fonts (Tajawal / System) to be fully loaded
    if (typeof document !== 'undefined' && document.fonts) {
      try {
        await document.fonts.ready;
      } catch {
        // Fallback gracefully if fonts.ready unsupported
      }
    }

    // 2. Mobile Browser Optimized html2canvas configuration:
    // - scale: Cap at 2. High-DPI mobile devices (DPR 3 or 4) crash canvas memory limits.
    // - scrollX / scrollY: Explicitly 0 to prevent shifted, cropped, or blank canvases when scrolled on mobile.
    // - windowWidth: 1080 ensures standard full-width layout without mobile screen squishing.
    // - useCORS & allowTaint: Clean image & font asset handling.
    // - onclone: Enforces fixed 1000px width, removes shadows/animations, and sets explicit white background.
    const canvas = await html2canvas(reportRef.current, {
      scale: typeof window !== 'undefined' && window.devicePixelRatio ? Math.min(2, window.devicePixelRatio) : 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1080,
      onclone: (_clonedDoc, clonedElement) => {
        clonedElement.style.width = '1000px';
        clonedElement.style.maxWidth = '1000px';
        clonedElement.style.margin = '0 auto';
        clonedElement.style.padding = '32px';
        clonedElement.style.backgroundColor = '#ffffff';
        clonedElement.style.transform = 'none';
        clonedElement.style.boxShadow = 'none';

        // Strip CSS transitions and animations from cloned tree
        const elements = clonedElement.querySelectorAll('*');
        elements.forEach((node) => {
          if (node instanceof HTMLElement) {
            node.style.animation = 'none';
            node.style.transition = 'none';
          }
        });
      }
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('فشل تصيير اللوحة الرسومية للتقرير');
    }

    // 3. Construct Standard A4 PDF via jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 210; // A4 standard width in mm
    const pageHeight = 297; // A4 standard height in mm
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    let heightLeft = imgHeight;
    let pageNum = 0;

    // Multi-page pagination slicing
    while (heightLeft > 0) {
      if (pageNum > 0) {
        pdf.addPage();
      }
      const position = -(pageNum * pageHeight);
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
      pageNum++;
    }

    // 4. Generate explicit binary PDF Blob (MIME: application/pdf)
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    return { blob, blobUrl };
  };

  /**
   * Main PDF Download action: Generates and triggers native .pdf download
   */
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setErrorMessage(null);

    try {
      const result = await renderPdfBlob();
      setPdfBlob(result.blob);
      setPdfBlobUrl(result.blobUrl);

      // Trigger standard download link with explicit .pdf extension
      const link = document.createElement('a');
      link.href = result.blobUrl;
      link.download = reportFileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 2000);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err: unknown) {
      console.error('PDF Generation Error:', err);
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء تصيير ملف الـ PDF';
      setErrorMessage(`تعذر إنشاء ملف الـ PDF: ${msg}. يرجى استخدام خيار المشاركة أو فتح الـ PDF المباشر.`);
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Native Mobile Share (Web Share API) - Perfect for mobile Chrome, Safari, WhatsApp, Drive
   */
  const handleMobileShare = async () => {
    setIsDownloading(true);
    setErrorMessage(null);

    try {
      let targetBlob = pdfBlob;
      let targetUrl = pdfBlobUrl;

      if (!targetBlob || !targetUrl) {
        const result = await renderPdfBlob();
        targetBlob = result.blob;
        targetUrl = result.blobUrl;
        setPdfBlob(result.blob);
        setPdfBlobUrl(result.blobUrl);
      }

      const file = new File([targetBlob], reportFileName, { type: 'application/pdf' });

      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'تقرير المحاسبة - محمد طالب',
          text: `تقرير الحسابات والمصاريف المعتمد لشهر ${todayStr}`
        });
      } else if (targetUrl) {
        window.open(targetUrl, '_blank');
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Mobile share error:', err);
        setErrorMessage('تعذر إتمام المشاركة المباشرة. يمكنك الضغط على زر "فتح ملف الـ PDF" لحفظه.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Direct Paper Print
   */
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden text-right flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-pink-600 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0 border border-white/30">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">تحميل تقرير PDF الشامل</h3>
                <span className="bg-white/20 text-xs px-2.5 py-0.5 rounded-full font-bold">jsPDF + html2canvas</span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                الدخل الكامل ← المشتريات والمصروفات ← الملخص المالي والتحليل النهائي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer ${
                downloadSuccess 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white text-rose-700 hover:bg-rose-50'
              }`}
              title="تنزيل ملف PDF أصلي مباشرة لجهازك"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                  <span>جاري إنشاء الـ PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>تم التنزيل بنجاح!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-rose-600" />
                  <span>تحميل ملف PDF الآن</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tip & Mobile Tools Bar */}
        <div className="bg-rose-50/90 border-b border-rose-100 px-5 py-2.5 text-xs text-rose-950 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>توليد PDF مباشر:</strong> يتم تصيير المستند مباشرة بصيغة <code className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-mono font-bold">.pdf</code> أصلية ومتوافقة مع جميع متصفحات الهواتف والكمبيوتر.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canMobileShare && (
              <button
                onClick={handleMobileShare}
                disabled={isDownloading}
                className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                title="مشاركة الملف مباشرة عبر تطبيقات الهاتف (واتساب، درايف، الملفات)"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>مشاركة بالهاتف</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="text-[11px] text-slate-700 hover:text-slate-900 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 inline-flex items-center gap-1 cursor-pointer"
              title="إرسال للطابعة مباشرة"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>طباعة</span>
            </button>
          </div>
        </div>

        {/* Error Notice if any */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 px-5 py-2.5 text-xs text-red-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 font-bold text-xs"
            >
              تخطي
            </button>
          </div>
        )}

        {/* Mobile Ready Quick Access Link */}
        {pdfBlobUrl && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap shrink-0 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ملف الـ PDF تم إنشاؤه بنجاح وهو متاح للمعاينة أو الحفظ:</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={pdfBlobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح ملف الـ PDF</span>
              </a>
              <a
                href={pdfBlobUrl}
                download={reportFileName}
                className="px-3 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold text-xs inline-flex items-center gap-1 hover:bg-emerald-100 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>حفظ في التنزيلات</span>
              </a>
            </div>
          </div>
        )}

        {/* Scrollable Printable Sheet Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100 space-y-6">
          <div 
            ref={reportRef}
            dir="rtl"
            style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
            className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 text-slate-800 space-y-6 font-sans"
          >
            
            {/* Report Header */}
            <div 
              style={{ borderColor: '#0284c7', backgroundColor: '#f0f9ff' }}
              className="border-2 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
                  تقرير مالي رسمي ومصادق
                </span>
                <h1 className="text-lg sm:text-xl font-black text-slate-900">
                  تقرير النظام المحاسبي وإدارة المصاريف
                </h1>
                <p className="text-xs text-slate-600">
                  صاحب الحساب: <strong className="text-slate-900">محمد طالب</strong> · العملة المعتمدة: <strong>الدرهم المغربي (MAD)</strong>
                </p>
              </div>

              <div 
                style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-md shrink-0 border border-sky-300"
              >
                م.ط
              </div>
            </div>

            {/* Meta Bar */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 font-medium">
              <div>تاريخ استخراج التقرير: <strong className="text-slate-900">{todayStr}</strong></div>
              <div>نطاق التقرير: <strong className="text-slate-900">الدخل + المشتريات + الملخص الشامل</strong></div>
            </div>

            {/* ==================== 1. جميع مصادر الدخل ==================== */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b-2 border-emerald-500 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    بيان جميع مصادر الدخل والرواتب
                  </h2>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {data.incomes.length} مصدر دخل
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10">#</th>
                      <th className="py-2.5 px-3">مصدر الدخل / الراتب</th>
                      <th className="py-2.5 px-3">التاريخ</th>
                      <th className="py-2.5 px-3 text-left">المبلغ بالدرهم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.incomes.length > 0 ? (
                      data.incomes.map((inc, idx) => (
                        <tr key={inc.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {inc.name}
                            {inc.notes && (
                              <span className="text-slate-400 font-normal mr-1.5 text-[11px]">
                                ({inc.notes})
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-500">{inc.date || '-'}</td>
                          <td className="py-2 px-3 text-left font-black text-emerald-700 tabular-nums">
                            +{formatNumber(inc.amount)} درهم
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-3 text-center text-slate-400">
                          لا توجد مصادر دخل مسجلة
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-emerald-50/80 font-black border-t-2 border-emerald-200 text-emerald-900">
                      <td colSpan={3} className="py-2.5 px-3">إجمالي الدخل المحصل:</td>
                      <td className="py-2.5 px-3 text-left text-sm tabular-nums">
                        {formatCurrency(totalIncome)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* ==================== 2. المشتريات والمصروفات ==================== */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-amber-500 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    بيان المشتريات والمصروفات الشهرية
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  المجموع الكلي: {formatCurrency(totalPurchases)}
                </span>
              </div>

              {/* أ. الخضار */}
              <div className="border border-slate-200 rounded-xl overflow-hidden space-y-0">
                <div className="bg-amber-50/80 px-3.5 py-2 border-b border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900">
                  <div className="flex items-center gap-1.5">
                    <Carrot className="w-4 h-4 text-amber-600" />
                    <span>أ. مشتريات الخضار والفواكه</span>
                  </div>
                  <span className="tabular-nums">المجموع: {formatCurrency(totalVeg)}</span>
                </div>
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2 px-3 w-10">#</th>
                      <th className="py-2 px-3">الصنف</th>
                      <th className="py-2 px-3">السعر الفردي</th>
                      <th className="py-2 px-3">الكمية</th>
                      <th className="py-2 px-3 text-left">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.vegetables.length > 0 ? (
                      data.vegetables.map((v, idx) => (
                        <tr key={v.id}>
                          <td className="py-1.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-semibold text-slate-900">{v.name}</td>
                          <td className="py-1.5 px-3 tabular-nums text-slate-600">{v.price} درهم</td>
                          <td className="py-1.5 px-3 tabular-nums text-slate-600">{v.qty} {v.unit || 'كغ'}</td>
                          <td className="py-1.5 px-3 text-left font-bold text-slate-900 tabular-nums">
                            {(v.price * v.qty).toFixed(2)} درهم
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="py-2.5 text-center text-slate-400">لا توجد مشتريات خضار</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ب. اللحوم */}
              <div className="border border-slate-200 rounded-xl overflow-hidden space-y-0">
                <div className="bg-rose-50/80 px-3.5 py-2 border-b border-rose-200 flex items-center justify-between text-xs font-bold text-rose-900">
                  <div className="flex items-center gap-1.5">
                    <Beef className="w-4 h-4 text-rose-600" />
                    <span>ب. مشتريات اللحوم والأسماك والدواجن</span>
                  </div>
                  <span className="tabular-nums">المجموع: {formatCurrency(totalMeat)}</span>
                </div>
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2 px-3 w-10">#</th>
                      <th className="py-2 px-3">نوع اللحم / السمك</th>
                      <th className="py-2 px-3">السعر للكيلو</th>
                      <th className="py-2 px-3">الكمية</th>
                      <th className="py-2 px-3 text-left">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.meats.length > 0 ? (
                      data.meats.map((m, idx) => (
                        <tr key={m.id}>
                          <td className="py-1.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-semibold text-slate-900">{m.name}</td>
                          <td className="py-1.5 px-3 tabular-nums text-slate-600">{m.price} درهم</td>
                          <td className="py-1.5 px-3 tabular-nums text-slate-600">{m.qty} {m.unit || 'كغ'}</td>
                          <td className="py-1.5 px-3 text-left font-bold text-slate-900 tabular-nums">
                            {(m.price * m.qty).toFixed(2)} درهم
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="py-2.5 text-center text-slate-400">لا توجد مشتريات لحوم</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ج. الهري */}
              <div className="border border-slate-200 rounded-xl overflow-hidden space-y-0">
                <div className="bg-sky-50/80 px-3.5 py-2 border-b border-sky-200 flex items-center justify-between text-xs font-bold text-sky-900">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-sky-600" />
                    <span>ج. مواد الهري والتموين والبقالة</span>
                  </div>
                  <span className="tabular-nums">المجموع: {formatCurrency(totalGroc)}</span>
                </div>
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2 px-3 w-10">#</th>
                      <th className="py-2 px-3">المادة / الصنف</th>
                      <th className="py-2 px-3">السعر الفردي</th>
                      <th className="py-2 px-3">الكمية</th>
                      <th className="py-2 px-3 text-left">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.groceries.length > 0 ? (
                      data.groceries.map((g, idx) => (
                        <tr key={g.id}>
                          <td className="py-1.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-semibold text-slate-900">{g.name}</td>
                          <td className="py-1.5 px-3 tabular-nums text-slate-600">{g.price} درهم</td>
                          <td className="py-1.5 px-3 tabular-nums text-slate-600">{g.qty} {g.unit || 'وحدة'}</td>
                          <td className="py-1.5 px-3 text-left font-bold text-slate-900 tabular-nums">
                            {(g.price * g.qty).toFixed(2)} درهم
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="py-2.5 text-center text-slate-400">لا توجد مشتريات هري</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* د. الفواتير */}
              <div className="border border-slate-200 rounded-xl overflow-hidden space-y-0">
                <div className="bg-purple-50/80 px-3.5 py-2 border-b border-purple-200 flex items-center justify-between text-xs font-bold text-purple-900">
                  <div className="flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-purple-600" />
                    <span>د. الفواتير والاشتراكات والمصاريف الشهرية</span>
                  </div>
                  <span className="tabular-nums">المجموع: {formatCurrency(totalExp)}</span>
                </div>
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2 px-3 w-10">#</th>
                      <th className="py-2 px-3">بيان المصروف</th>
                      <th className="py-2 px-3">الفئة</th>
                      <th className="py-2 px-3 text-left">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.expenses.length > 0 ? (
                      data.expenses.map((e, idx) => (
                        <tr key={e.id}>
                          <td className="py-1.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-semibold text-slate-900">{e.name}</td>
                          <td className="py-1.5 px-3 text-slate-600">{e.category || 'عام'}</td>
                          <td className="py-1.5 px-3 text-left font-bold text-slate-900 tabular-nums">
                            {formatNumber(e.amount)} درهم
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="py-2.5 text-center text-slate-400">لا توجد مصاريف مسجلة</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Purchases Summary Card */}
              <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-3 flex items-center justify-between text-rose-900 font-bold">
                <div className="text-xs">
                  إجمالي المشتريات والمصروفات الكلي (خضار + لحوم + هري + فواتير):
                </div>
                <div className="text-sm font-black tabular-nums">
                  {formatCurrency(totalPurchases)}
                </div>
              </div>
            </div>

            {/* ==================== 3. الملخص والتحليل النهائي ==================== */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b-2 border-sky-600 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-700 text-white font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    الملخص والتحليل المالي النهائي
                  </h2>
                </div>
                <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                  خلاصة الحسابات
                </span>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 block">إجمالي الدخل المحصل</span>
                  <span className="text-base font-black text-emerald-700 tabular-nums block">
                    {formatCurrency(totalIncome)}
                  </span>
                  <span className="text-[10px] text-emerald-600">مجموع الرواتب والمداخيل</span>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-1">
                  <span className="text-[11px] font-bold text-rose-800 block">إجمالي المصروفات</span>
                  <span className="text-base font-black text-rose-700 tabular-nums block">
                    {formatCurrency(totalPurchases)}
                  </span>
                  <span className="text-[10px] text-rose-600">نسبة الاستهلاك: {expenseRatio}%</span>
                </div>

                <div className={`p-3 rounded-xl border text-center space-y-1 ${
                  netBalance >= 0 ? 'bg-sky-50 border-sky-200 text-sky-900' : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  <span className="text-[11px] font-bold block">صافي الرصيد المتبقي</span>
                  <span className="text-base font-black tabular-nums block">
                    {formatCurrency(netBalance)}
                  </span>
                  <span className="text-[10px] font-semibold">
                    {netBalance >= 0 ? `فائض مدخر (${savingsRatio}%)` : 'عجز في الميزانية'}
                  </span>
                </div>
              </div>

              {/* Distribution Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">تصنيف المشتريات</th>
                      <th className="py-2 px-3">المبلغ المستهلك</th>
                      <th className="py-2 px-3">النسبة المئوية</th>
                      <th className="py-2 px-3">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2 px-3 font-semibold text-amber-700">الخضار والفواكه</td>
                      <td className="py-2 px-3 tabular-nums font-bold">{formatCurrency(totalVeg)}</td>
                      <td className="py-2 px-3 tabular-nums">{totalPurchases > 0 ? ((totalVeg / totalPurchases) * 100).toFixed(1) : 0}%</td>
                      <td className="py-2 px-3 text-slate-500">مشتريات السوق الأسبوعي واليومي</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-rose-700">اللحوم والأسماك والدواجن</td>
                      <td className="py-2 px-3 tabular-nums font-bold">{formatCurrency(totalMeat)}</td>
                      <td className="py-2 px-3 tabular-nums">{totalPurchases > 0 ? ((totalMeat / totalPurchases) * 100).toFixed(1) : 0}%</td>
                      <td className="py-2 px-3 text-slate-500">بروتينات ومؤونة</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-sky-700">مواد الهري والتموين</td>
                      <td className="py-2 px-3 tabular-nums font-bold">{formatCurrency(totalGroc)}</td>
                      <td className="py-2 px-3 tabular-nums">{totalPurchases > 0 ? ((totalGroc / totalPurchases) * 100).toFixed(1) : 0}%</td>
                      <td className="py-2 px-3 text-slate-500">تموين البقالة الشهري</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-purple-700">الفواتير والمصاريف</td>
                      <td className="py-2 px-3 tabular-nums font-bold">{formatCurrency(totalExp)}</td>
                      <td className="py-2 px-3 tabular-nums">{totalPurchases > 0 ? ((totalExp / totalPurchases) * 100).toFixed(1) : 0}%</td>
                      <td className="py-2 px-3 text-slate-500">التزامات وخدمات منزلية</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Report Signature & Certification */}
            <div className="pt-6 border-t border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>تم استخراج واعتماد هذا الكشف بواسطة النظام المحاسبي الذكي</span>
              </div>
              <div className="border border-slate-300 rounded-xl px-4 py-2 text-center bg-slate-50">
                <span className="text-[10px] text-slate-400 block">مصادقة وتوقيع الحساب</span>
                <strong className="text-sky-700 font-bold">محمد طالب</strong>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>مهيأ خصيصاً لمتصفحات الهواتف والكمبيوتر بدون أي أخطاء تصيير</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {canMobileShare && (
              <button
                onClick={handleMobileShare}
                disabled={isDownloading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs active:scale-95 inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة / حفظ في الهاتف</span>
              </button>
            )}

            {pdfBlobUrl && (
              <a
                href={pdfBlobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs active:scale-95 inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>معاينة الـ PDF</span>
              </a>
            )}

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5 ${
                downloadSuccess 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-rose-600 hover:bg-rose-700 text-white hover:shadow-rose-600/30'
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جاري إنشاء وتنزيل ملف PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>تم تنزيل الـ PDF بنجاح!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>تحميل ملف PDF إلى جهازك الآن</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
