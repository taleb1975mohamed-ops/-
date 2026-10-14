import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Github, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Sparkles, 
  Monitor, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Share2,
  PlusSquare
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable?: boolean;
  onNativeInstall?: () => Promise<boolean>;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ 
  isOpen, 
  onClose,
  isInstallable = false,
  onNativeInstall
}) => {
  const [activeTab, setActiveTab] = useState<'instant' | 'github'>('instant');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  if (!isOpen) return null;

  // The actual live application URL for direct full-screen opening & installing
  const appUrl = window.location.href.split('?')[0];

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const workflowPath = '.github/workflows/build-apk.yml';

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(workflowPath);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  const handleDownloadWorkflowFile = () => {
    const yamlContent = `name: Build Android APK (استخراج تطبيق أندرويد)

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:
    inputs:
      release_version:
        description: 'رقم الإصدار'
        required: false
        default: '1.0.0'

permissions:
  contents: write

jobs:
  build-apk:
    name: بناء وتجهيز ملف الـ APK
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'
      - run: |
          mkdir -p $HOME/.android
          touch $HOME/.android/repositories.cfg
          if [ -d "$ANDROID_HOME/cmdline-tools/latest/bin" ]; then
            yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses || true
          fi
      - run: npm install --legacy-peer-deps
      - run: npm run build
        env:
          CI: false
      - run: |
          if [ ! -d "android" ]; then
            npx cap add android
          fi
          npx cap sync android
      - run: chmod +x android/gradlew
      - run: cd android && ./gradlew assembleDebug --no-daemon
      - run: |
          mkdir -p output-apk
          APK_PATH=$(find android/ -name "*.apk" | head -n 1)
          cp "$APK_PATH" output-apk/MohamedTaleb-Accounting.apk
      - uses: actions/upload-artifact@v4
        with:
          name: MohamedTaleb-Accounting-APK
          path: output-apk/MohamedTaleb-Accounting.apk
          retention-days: 30
`;
    const blob = new Blob([yamlContent], { type: 'text/yaml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'build-apk.yml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDirectInstallClick = async () => {
    if (onNativeInstall) {
      const installed = await onNativeInstall();
      if (installed) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 text-white p-5 sm:p-6 flex items-start justify-between relative overflow-hidden">
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30 shrink-0">
              <Download className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">تسطيب التطبيق على جهازك</h3>
                <span className="bg-white/20 text-xs px-2.5 py-0.5 rounded-full font-bold">تثبيت فوري</span>
              </div>
              <p className="text-xs text-emerald-100 mt-1">
                النظام المحاسبي - محمد طالب (يعمل كتطبيق هاتف أو كمبيوتر مستقل)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'instant'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>تسطيب مباشر الآن (هاتف أو كمبيوتر)</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'github'
                ? 'bg-white text-sky-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-sky-600" />
            <span>تحميل ملف APK عبر GitHub</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {activeTab === 'instant' ? (
            <div className="space-y-4">
              
              {/* Native Prompt Ready Trigger if available */}
              {isInstallable && (
                <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-md flex items-center justify-between gap-3 animate-bounce">
                  <div>
                    <h4 className="font-black text-sm">المتصفح جاهز للتسطيب المباشر!</h4>
                    <p className="text-xs text-emerald-100">اضغط الزر لتثبيت التطبيق على جهازك الآن</p>
                  </div>
                  <button
                    onClick={handleDirectInstallClick}
                    className="px-4 py-2 bg-white text-emerald-800 font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
                  >
                    تسطيب التطبيق الآن
                  </button>
                </div>
              )}

              {/* Notice why the browser icon didn't show in the preview */}
              <div className="p-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 leading-relaxed">
                  <p className="font-bold text-amber-900 mb-1">لماذا لم تظهر لك أيقونة التسطيب في المتصفح تلقائياً؟</p>
                  متصفحات الإنترنت (مثل Google Chrome) <strong>تحظر إظهار أيقونة التثبيت التلقائية داخل نوافذ المعاينة الداخلية (iFrames)</strong> لأسباب أمنية.
                  <br />
                  بمجرد <strong>فتح الرابط المباشر في نافذة مستقلة</strong> أو في متصفح هاتفك، ستظهر لك أيقونة التثبيت فوراً!
                </div>
              </div>

              {/* Direct Link Action Box */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-700">رابط التطبيق المباشر للتسطيب:</h4>
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 overflow-x-auto">
                  <span className="truncate flex-1 select-all">{appUrl}</span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>فتح التطبيق في نافذة مستقلة للتسطيب فوراً</span>
                  </a>

                  <button
                    onClick={handleCopyAppUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    <span>{copiedLink ? 'تم نسخ الرابط بنجاح!' : 'نسخ الرابط لفتحه في الهاتف'}</span>
                  </button>
                </div>
              </div>

              {/* Step by Step Visual Guide */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  أين تجد أيقونة التسطيب حسب جهازك:
                </h4>

                {/* Android Chrome */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-800 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900">على هاتف أندرويد (متصفح Chrome):</p>
                    <p className="text-slate-600 leading-normal">
                      1. افتح رابط التطبيق في متصفح Chrome على الهاتف.
                      <br />
                      2. اضغط على زر النقاط الثلاث <strong className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">⋮</strong> أعلى زاوية المتصفح.
                      <br />
                      3. اختر <strong className="text-emerald-700 font-bold">"تثبيت التطبيق" (Install app)</strong> أو <strong className="text-emerald-700 font-bold">"إضافة إلى الشاشة الرئيسية"</strong>.
                      <br />
                      4. سيظهر تطبيق <strong>النظام المحاسبي</strong> مباشرة كأيقونة تطبيق كاملة على شاشتك.
                    </p>
                  </div>
                </div>

                {/* PC Chrome / Edge */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-sky-100/80 text-sky-800 shrink-0">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900">على الكمبيوتر أو اللابتوب (متصفح Chrome أو Edge):</p>
                    <p className="text-slate-600 leading-normal">
                      1. افتح الرابط في نافذة جديدة.
                      <br />
                      2. في شريط العنوان أعلى المتصفح (جهة اليسار أو اليمين)، ستلاحظ ظهور أيقونة كمبيوتر صغيرة أو سهم تنزيل <strong className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">⊕</strong> مكتوب عليها <em>"تثبيت التطبيق"</em>.
                      <br />
                      3. اضغط عليها ثم اضغط <strong>"تثبيت" (Install)</strong>، وسيتم إنشاء اختصار له على سطح المكتب كبرنامج مستقل!
                    </p>
                  </div>
                </div>

                {/* iPhone / Safari */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-800 shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900">على آيفون أو آيباد (متصفح Safari):</p>
                    <p className="text-slate-600 leading-normal">
                      اضغط على زر المشاركة <strong className="text-sky-700 font-bold">[↑]</strong> أسفل المتصفح، ثم مرر واختر <strong className="font-bold text-slate-800">"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</strong>.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* GitHub APK Tab */
            <div className="space-y-4">
              <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs text-sky-900 leading-relaxed">
                  <p className="font-bold mb-1">استخراج ملف حزمة أندرويد (APK) عبر GitHub:</p>
                  تم إعداد وتصحيح ملف <code className="bg-sky-100/80 px-1.5 py-0.5 rounded font-mono text-sky-950">.github/workflows/build-apk.yml</code> بالكامل بدون أخطاء التبعيات.
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  خطوات استخراج ملف الـ APK:
                </h4>

                <div className="p-3.5 rounded-2xl border border-slate-100 bg-white flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">ادخل إلى مستودعك على GitHub</p>
                    <p className="text-slate-500 mt-0.5">افتح مستودع الكود بعد مزامنة التغييرات.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-100 bg-white flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">اضغط على تبويب Actions</p>
                    <p className="text-slate-500 mt-0.5">اختر خط العمل <strong className="text-sky-700">Build Android APK</strong> ثم اضغط الزر الأخضر <strong className="text-slate-700">Run workflow</strong>.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/40 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900">تنزيل ملف MohamedTaleb-Accounting-APK</p>
                    <p className="text-emerald-800 mt-0.5">
                      بعد انتهاء البناء بدقيقتين، ستجد الملف في أسفل الصفحة في قسم <strong className="font-bold">Artifacts</strong> جاهزاً للتحميل والتثبيت.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  onClick={handleCopyWorkflow}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  {copiedWorkflow ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  <span>{copiedWorkflow ? 'تم نسخ مسار الملف' : 'نسخ مسار الـ Workflow'}</span>
                </button>

                <button
                  onClick={handleDownloadWorkflowFile}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-sky-600" />
                  <span>تنزيل ملف build-apk.yml المحدث</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام محاسبي سريع ويحفظ بياناتك محلياً بشكل آمن</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
