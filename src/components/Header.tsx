import React, { useRef } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Upload, 
  RotateCcw, 
  FileSpreadsheet,
  Save,
  Check,
  Smartphone,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../utils/storage';

interface HeaderProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  onSave: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onOpenPdfReport: () => void;
  onImportJSON: (data: string) => void;
  onResetMonth: () => void;
  onOpenApkModal: () => void;
  onInstallApp: () => void;
  savedIndicator: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  totalIncome,
  totalExpenses,
  netBalance,
  onSave,
  onExportCSV,
  onExportJSON,
  onOpenPdfReport,
  onImportJSON,
  onResetMonth,
  onOpenApkModal,
  onInstallApp,
  savedIndicator
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onImportJSON(content);
        }
      };
      reader.readAsText(file);
    }
    if (e.target) e.target.value = '';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Zone 1: Brand & User Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0 font-bold text-lg ring-2 ring-sky-100">
            م.ط
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                النظام المحاسبي الذكي
              </h1>
              <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-md">
                محمد طالب
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              إدارة المصاريف، المشتريات العائلية والميزانية بالدرهم
            </p>
          </div>
        </div>

        {/* Zone 2: Real-time Snapshot KPIs */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2 text-right">
            <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block leading-tight">إجمالي الدخل</span>
              <span className="text-xs font-bold text-emerald-700 tabular-nums">
                {formatCurrency(totalIncome)}
              </span>
            </div>
          </div>

          <div className="w-px h-7 bg-slate-200" />

          <div className="flex items-center gap-2 text-right">
            <div className="p-1.5 rounded-lg bg-rose-100/80 text-rose-700">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block leading-tight">المصروفات</span>
              <span className="text-xs font-bold text-rose-700 tabular-nums">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          </div>

          <div className="w-px h-7 bg-slate-200" />

          <div className="flex items-center gap-2 text-right">
            <div className={`p-1.5 rounded-lg ${netBalance >= 0 ? 'bg-sky-100/80 text-sky-700' : 'bg-red-100 text-red-700'}`}>
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block leading-tight">الرصيد الصافي</span>
              <span className={`text-xs font-black tabular-nums ${netBalance >= 0 ? 'text-sky-700' : 'text-red-600'}`}>
                {formatCurrency(netBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Zone 3: Global Action Tools */}
        <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
          <button
            onClick={onSave}
            title="حفظ كافة البيانات الآن"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              savedIndicator 
                ? 'bg-emerald-600 text-white' 
                : 'bg-sky-600 hover:bg-sky-700 text-white hover:shadow-sky-600/20 active:scale-95'
            }`}
          >
            {savedIndicator ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم الحفظ</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التغييرات</span>
              </>
            )}
          </button>

          <button
            onClick={onExportCSV}
            title="تصدير جدول البيانات لملف Excel"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">إكسل</span> CSV
          </button>

          <button
            onClick={onOpenPdfReport}
            title="تحميل كشف حساب شامل بتنسيق PDF"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors shadow-2xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>تحميل PDF</span>
          </button>

          <button
            onClick={onExportJSON}
            title="تحميل نسخة احتياطية من البيانات"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">نسخة</span> JSON
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="استيراد نسخة احتياطية سابقة"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">استيراد</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />

          <button
            onClick={onResetMonth}
            title="تصفير القوائم لبدء شهر محاسبي جديد"
            className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">شهر جديد</span>
          </button>

          <button
            onClick={onInstallApp}
            title="تسطيب التطبيق على هاتفك أو كمبيوترك فوراً"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm hover:shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer ring-2 ring-emerald-400/30"
          >
            <Download className="w-4 h-4 text-emerald-100 animate-pulse" />
            <span>تسطيب التطبيق</span>
          </button>

          <button
            onClick={onOpenApkModal}
            title="استخراج وتحميل تطبيق أندرويد (APK)"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">حزمة</span> APK
          </button>
        </div>

      </div>
    </header>
  );
};
