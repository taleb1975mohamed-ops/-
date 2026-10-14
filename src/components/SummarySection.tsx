import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  Carrot, 
  Beef, 
  ShoppingBag, 
  Receipt,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Printer,
  Sliders,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/storage';
import { AccountingData } from '../types';

interface SummarySectionProps {
  data: AccountingData;
  onUpdateBudgetLimit: (limit: number | undefined) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  data,
  onUpdateBudgetLimit,
  onExportCSV,
  onExportJSON
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(data.monthlyBudgetLimit ? data.monthlyBudgetLimit.toString() : '');

  // Calculations
  const totalIncome = data.incomes.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalVeg = data.vegetables.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalMeat = data.meats.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalGroc = data.groceries.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalExp = data.expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

  const totalPurchases = totalVeg + totalMeat + totalGroc + totalExp;
  const netBalance = totalIncome - totalPurchases;

  const savingsRate = totalIncome > 0 ? Math.max(0, (netBalance / totalIncome) * 100) : 0;
  const expenseRatio = totalIncome > 0 ? Math.min(100, (totalPurchases / totalIncome) * 100) : 0;

  // Breakdown items
  const breakdown = [
    {
      name: 'قسم الخضار',
      amount: totalVeg,
      count: data.vegetables.length,
      icon: Carrot,
      color: '#f59e0b', // amber-500
      bgClass: 'bg-amber-500',
      textClass: 'text-amber-700',
      percentage: totalPurchases > 0 ? (totalVeg / totalPurchases) * 100 : 0
    },
    {
      name: 'اللحوم والأسماك',
      amount: totalMeat,
      count: data.meats.length,
      icon: Beef,
      color: '#f43f5e', // rose-500
      bgClass: 'bg-rose-500',
      textClass: 'text-rose-700',
      percentage: totalPurchases > 0 ? (totalMeat / totalPurchases) * 100 : 0
    },
    {
      name: 'الهري والمؤن',
      amount: totalGroc,
      count: data.groceries.length,
      icon: ShoppingBag,
      color: '#0284c7', // sky-600
      bgClass: 'bg-sky-600',
      textClass: 'text-sky-700',
      percentage: totalPurchases > 0 ? (totalGroc / totalPurchases) * 100 : 0
    },
    {
      name: 'الفواتير والمصاريف',
      amount: totalExp,
      count: data.expenses.length,
      icon: Receipt,
      color: '#9333ea', // purple-600
      bgClass: 'bg-purple-600',
      textClass: 'text-purple-700',
      percentage: totalPurchases > 0 ? (totalExp / totalPurchases) * 100 : 0
    }
  ];

  // SVG Donut calculations
  let accumulatedAngle = 0;
  const radius = 64;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = breakdown.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * (circumference / 100);
    accumulatedAngle += item.percentage;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset
    };
  });

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      onUpdateBudgetLimit(val);
    } else {
      onUpdateBudgetLimit(undefined);
    }
    setIsEditingBudget(false);
  };

  const budgetLimit = data.monthlyBudgetLimit;
  const budgetProgress = budgetLimit && budgetLimit > 0 ? (totalPurchases / budgetLimit) * 100 : null;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">لوحة الملخص والتحليل المالي</h2>
            <p className="text-xs text-slate-500">نظرة شاملة ودقيقة على التوازن المالي ومسار الصرف الشهري</p>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>طباعة التقرير</span>
          </button>
          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير إكسل</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Income */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">إجمالي الدخل والرواتب</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 tabular-nums block">
              {formatCurrency(totalIncome)}
            </span>
            <span className="text-[11px] text-slate-400">
              {data.incomes.length} مصدر دخل مسجل
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">إجمالي المشتريات والمصاريف</span>
            <span className="text-xl sm:text-2xl font-black text-rose-700 tabular-nums block">
              {formatCurrency(totalPurchases)}
            </span>
            <span className="text-[11px] text-slate-400">
              {data.vegetables.length + data.meats.length + data.groceries.length + data.expenses.length} عملية شراء ومصروف
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Net Remaining Balance */}
        <div className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between ${
          netBalance >= 0 
            ? 'bg-sky-50/70 border-sky-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-700 block">صافي الرصيد المتبقي</span>
              {netBalance >= 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 inline" />
              )}
            </div>
            <span className={`text-xl sm:text-2xl font-black tabular-nums block ${
              netBalance >= 0 ? 'text-sky-900' : 'text-red-700'
            }`}>
              {formatCurrency(netBalance)}
            </span>
            <span className="text-[11px] text-slate-600">
              {netBalance >= 0 
                ? `نسبة الادخار: ${savingsRate.toFixed(1)}% من الدخل` 
                : 'تجاوزت المصاريف مجموع الراتب!'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            netBalance >= 0 ? 'bg-sky-100 text-sky-700' : 'bg-red-100 text-red-700'
          }`}>
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Budget Limit Tracker (Optional Target) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">مراقبة سقف الميزانية الشهرية</h3>
          </div>

          <button
            onClick={() => setIsEditingBudget(!isEditingBudget)}
            className="text-xs text-sky-600 hover:text-sky-800 font-semibold cursor-pointer"
          >
            {isEditingBudget ? 'إلغاء' : budgetLimit ? 'تعديل سقف الميزانية' : '+ تحديد سقف إنفاق شهري'}
          </button>
        </div>

        {isEditingBudget ? (
          <form onSubmit={handleSaveBudget} className="flex items-center gap-3 py-2">
            <input
              type="number"
              step="100"
              placeholder="مثال: 5000 درهم"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs w-48 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              حفظ السقف
            </button>
          </form>
        ) : budgetLimit ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">
                المصروف الحالي: <b className="text-slate-900">{formatCurrency(totalPurchases)}</b> من سقف <b className="text-slate-900">{formatCurrency(budgetLimit)}</b>
              </span>
              <span className={`tabular-nums font-bold ${
                budgetProgress! > 100 ? 'text-red-600' : budgetProgress! > 80 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {budgetProgress!.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetProgress! > 100 ? 'bg-red-500' : budgetProgress! > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetProgress!)}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            لم يتم تحديد سقف ميزانية شهري بعد. اضغط على الزر أعلاه لتحديد حد أقصى للإنفاق ومراقبة استهلاكك.
          </p>
        )}
      </div>

      {/* Visual Analytics Split Grid: Donut Chart + Breakdown Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Chart Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-slate-800 mb-4 self-start">
            مخطط توزيع النفقات والمشتريات
          </h3>

          {totalPurchases > 0 ? (
            <div className="relative flex items-center justify-center my-3">
              <svg width="200" height="200" viewBox="0 0 160 160" className="transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth={strokeWidth}
                />
                {donutSegments.map((segment) => (
                  <circle
                    key={segment.name}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={segment.strokeDasharray}
                    strokeDashoffset={segment.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 hover:opacity-90"
                  />
                ))}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[11px] font-medium text-slate-400">الإجمالي</span>
                <span className="text-sm font-black text-slate-800 tabular-nums">
                  {formatNumber(totalPurchases)}
                </span>
                <span className="text-[10px] text-slate-400">درهم</span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              لا توجد مصاريف مسجلة لعرض المخطط
            </div>
          )}

          {/* Legend Items */}
          <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
            {breakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: item.color }} 
                />
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-bold tabular-nums text-slate-800 mr-auto">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Breakdown List */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            تفصيل المبالغ حسب الأقسام
          </h3>

          <div className="space-y-4">
            {breakdown.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ItemIcon className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="text-slate-400 text-[11px]">({item.count} عناصر)</span>
                    </div>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="font-black text-slate-900">{formatCurrency(item.amount)}</span>
                      <span className="text-slate-400 text-[11px]">({item.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.bgClass}`}
                      style={{ width: `${Math.max(item.percentage, item.amount > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Summary Insights */}
          <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>ملاحظات وإرشادات الاستهلاك المالي:</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>
                المصروفات تمثل <b>{expenseRatio.toFixed(1)}%</b> من مجموع الدخل الشهري الإجمالي.
              </li>
              {netBalance >= 0 ? (
                <li className="text-emerald-700">
                  لديك فائض مالي إيجابي قدره <b>{formatCurrency(netBalance)}</b>، يمكنك تخصيصه للادخار أو الطوارئ.
                </li>
              ) : (
                <li className="text-red-600 font-semibold">
                  تحذير: نفقاتك الحالية تتجاوز الدخل المحصل بمقدار <b>{formatCurrency(Math.abs(netBalance))}</b>.
                </li>
              )}
            </ul>
          </div>
        </div>

      </div>

      {/* Itemized All-In-One Table (Great for Review & Print) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">
            جدول كشف الحساب التلخيصي الشامل
          </h3>
          <span className="text-xs text-slate-400">
            مرتب حسب الأقسام
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                <th className="py-2.5 px-3">القسم</th>
                <th className="py-2.5 px-3">اسم العنصر</th>
                <th className="py-2.5 px-3">السعر الفردي</th>
                <th className="py-2.5 px-3">الكمية</th>
                <th className="py-2.5 px-3 text-left">المجموع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.incomes.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-semibold text-emerald-700">الدخل</td>
                  <td className="py-2 px-3">{i.name}</td>
                  <td className="py-2 px-3 text-slate-400">-</td>
                  <td className="py-2 px-3 text-slate-400">-</td>
                  <td className="py-2 px-3 text-left font-bold text-emerald-700 tabular-nums">
                    +{formatNumber(i.amount)} درهم
                  </td>
                </tr>
              ))}

              {data.vegetables.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-semibold text-amber-700">الخضار</td>
                  <td className="py-2 px-3">{v.name}</td>
                  <td className="py-2 px-3 tabular-nums">{v.price} درهم</td>
                  <td className="py-2 px-3 tabular-nums">{v.qty} {v.unit || 'كغ'}</td>
                  <td className="py-2 px-3 text-left font-bold text-slate-900 tabular-nums">
                    {(v.price * v.qty).toFixed(2)} درهم
                  </td>
                </tr>
              ))}

              {data.meats.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-semibold text-rose-700">اللحوم والأسماك</td>
                  <td className="py-2 px-3">{m.name}</td>
                  <td className="py-2 px-3 tabular-nums">{m.price} درهم</td>
                  <td className="py-2 px-3 tabular-nums">{m.qty} {m.unit || 'كغ'}</td>
                  <td className="py-2 px-3 text-left font-bold text-slate-900 tabular-nums">
                    {(m.price * m.qty).toFixed(2)} درهم
                  </td>
                </tr>
              ))}

              {data.groceries.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-semibold text-sky-700">الهري والمؤن</td>
                  <td className="py-2 px-3">{g.name}</td>
                  <td className="py-2 px-3 tabular-nums">{g.price} درهم</td>
                  <td className="py-2 px-3 tabular-nums">{g.qty} {g.unit || 'وحدة'}</td>
                  <td className="py-2 px-3 text-left font-bold text-slate-900 tabular-nums">
                    {(g.price * g.qty).toFixed(2)} درهم
                  </td>
                </tr>
              ))}

              {data.expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-semibold text-purple-700">الفواتير والمصاريف</td>
                  <td className="py-2 px-3">{e.name}</td>
                  <td className="py-2 px-3 text-slate-400">-</td>
                  <td className="py-2 px-3 text-slate-400">-</td>
                  <td className="py-2 px-3 text-left font-bold text-slate-900 tabular-nums">
                    {e.amount.toFixed(2)} درهم
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 font-bold bg-slate-50">
                <td colSpan={4} className="py-3 px-3 text-slate-800">
                  صافي الرصيد المتبقي (الدخل - المصاريف):
                </td>
                <td className={`py-3 px-3 text-left text-sm font-black tabular-nums ${
                  netBalance >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {formatCurrency(netBalance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
