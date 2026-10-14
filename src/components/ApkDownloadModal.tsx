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
  Layers, 
  ArrowRight,
  ShieldCheck,
  FileCode,
  HelpCircle
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'github' | 'instant'>('github');
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const workflowPath = '.github/workflows/build-apk.yml';

  const handleCopyPath = () => {
    navigator.clipboard.writeText(workflowPath);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
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
          node-version: 20
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - uses: android-actions/setup-android@v3
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-500 text-white p-5 sm:p-6 flex items-start justify-between relative overflow-hidden">
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30 shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">تحميل التطبيق لهاتفك الأندرويد</h3>
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-bold">APK & PWA</span>
              </div>
              <p className="text-xs text-sky-100 mt-1">
                تطبيق النظام المحاسبي - محمد طالب (جاهز ومعد للاستخراج المباشر)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'github'
                ? 'bg-white text-sky-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Github className="w-4 h-4 text-slate-800" />
            <span>استخراج ملف APK عبر GitHub Actions</span>
          </button>

          <button
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'instant'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>تثبيت فوري بدون تحميل APK (PWA)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {activeTab === 'github' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs text-sky-900 leading-relaxed">
                  <p className="font-bold mb-1">تم إعداد كل شيء بنجاح في مشروعك!</p>
                  قمت بإنشاء ملف <code className="bg-sky-100/80 px-1.5 py-0.5 rounded font-mono text-sky-950">.github/workflows/build-apk.yml</code> وتهيئة محرك <strong className="font-bold">Capacitor Android</strong> ليقوم خادم GitHub السحابي ببناء ملف الـ <strong className="font-bold">APK</strong> تلقائياً دون الحاجة لتثبيت برامج ثقيلة مثل Android Studio على جهازك.
                </div>
              </div>

              {/* Step by Step Guide */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  خطوات تحميل ملف الـ APK من مستودعك على GitHub:
                </h4>

                {/* Step 1 */}
                <div className="p-3.5 rounded-2xl border border-slate-100 bg-white hover:border-sky-200 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-800">ادخل إلى مستودع المشروع على موقع GitHub</p>
                    <p className="text-slate-500 leading-normal">
                      تأكد من رفع التغييرات إلى المستودع (Commit & Push)، أو قم بفتح صفحة الـ Repository الخاصة بك.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-2xl border border-slate-100 bg-white hover:border-sky-200 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-800">اضغط على تبويب Actions في الأعلى</p>
                    <p className="text-slate-500 leading-normal">
                      في الشريط العلوي للمستودع، انقر على <strong className="text-slate-700">Actions</strong>، وستجد خط العمل باسم <strong className="text-sky-700">Build Android APK (استخراج تطبيق أندرويد)</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-2xl border border-slate-100 bg-white hover:border-sky-200 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-800">اضغط زر تشغيل البناء (Run workflow)</p>
                    <p className="text-slate-500 leading-normal">
                      اضغط على زر <strong className="text-slate-700">Run workflow</strong> الأخضر على يمين الشاشة، وسيقوم GitHub فوراً بتشغيل بيئة أندرويد وتجميع التطبيق خلال دقيقتين تقريباً.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/40 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-emerald-900">تحميل ملف MohamedTaleb-Accounting-APK</p>
                    <p className="text-emerald-800 leading-normal">
                      بعد انتهاء البناء (علامة صح خضراء ✓)، اضغط على التشغيل، وانزل لقسم <strong className="font-bold">Artifacts</strong> في الأسفل واضغط على <strong className="font-bold">MohamedTaleb-Accounting-APK</strong> لتحميل الملف وتثبيته على هاتفك فوراً!
                    </p>
                  </div>
                </div>
              </div>

              {/* Helper Tools */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  onClick={handleCopyPath}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  <span>{copiedText ? 'تم نسخ مسار الملف' : 'نسخ مسار الـ Workflow'}</span>
                </button>

                <button
                  onClick={handleDownloadWorkflowFile}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors"
                >
                  <Download className="w-4 h-4 text-sky-600" />
                  <span>تنزيل ملف build-apk.yml المباشر</span>
                </button>
              </div>
            </div>
          ) : (
            /* Instant PWA Guide */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed">
                  <p className="font-bold mb-1">طريقة فورية ومريحة جداً (بدون انتظار البناء)!</p>
                  التطبيق مجهز بتقنية <strong className="font-bold">Progressive Web App (PWA)</strong>، مما يعني أنه يمكنك تثبيته على شاشة هاتفك الرئيسية الآن مباشرة من متصفح جوجل كروم بنقرة واحدة، وسيعمل كتطبيق هاتف مستقل دون الحاجة لملف APK!
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  طريقة التثبيت المباشر على هاتف أندرويد:
                </h4>

                <div className="p-3.5 rounded-2xl border border-slate-100 bg-white flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">افتح هذا الموقع في متصفح Google Chrome على هاتفك</p>
                    <p className="text-slate-500 mt-0.5">افتح رابط التطبيق الحالي مباشرة من متصفح الهاتف.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-100 bg-white flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">اضغط على زر النقاط الثلاث (⋮) أعلى يمين المتصفح</p>
                    <p className="text-slate-500 mt-0.5">ستفتح لك قائمة خيارات المتصفح.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/40 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900">اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</p>
                    <p className="text-emerald-800 mt-0.5">
                      سيظهر لك خيار باسم <strong className="font-bold">"تثبيت التطبيق" (Install App)</strong> أو <strong className="font-bold">"إضافة إلى الشاشة الرئيسية"</strong>. اضغط عليه، وسيظهر تطبيق النظام المحاسبي فوراً بأيقونته الرسمية على شاشة هاتفك مع سائر التطبيقات!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام محاسبي آمن 100% ويحفظ بياناتك محلياً</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          >
            حسناً، فهمت
          </button>
        </div>
      </div>
    </div>
  );
};
