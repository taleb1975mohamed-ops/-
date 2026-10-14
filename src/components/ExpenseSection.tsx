import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Check,
  Zap,
  Home,
  Wifi,
  Flame,
  Car,
  HeartPulse
} from 'lucide-react';
import { ExpenseItem } from '../types';
import { formatCurrency, generateId } from '../utils/storage';

interface ExpenseSectionProps {
  expenses: ExpenseItem[];
  onAdd: (item: ExpenseItem) => void;
  onUpdate: (item: ExpenseItem) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
}

const COMMON_EXPENSE_PRESETS = [
  { name: 'فاتورة الكهرباء والماء', icon: Zap },
  { name: 'اشتراك الإنترنت المنزلي', icon: Wifi },
  { name: 'قنينة غاز البوتان', icon: Flame },
  { name: 'كراء المنزل (الإيجار)', icon: Home },
  { name: 'مصاريف النقل / البنزين', icon: Car },
  { name: 'صيدلية وأدوية', icon: HeartPulse }
];

export const ExpenseSection: React.FC<ExpenseSectionProps> = ({
  expenses,
  onAdd,
  onUpdate,
  onDelete,
  onDeleteAll,
  onConfirmModal
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('فواتير');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const numAmount = parseFloat(amount);

    if (!cleanName) {
      alert('يرجى كتابة اسم الفاتورة أو المصروف');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }

    if (editingId) {
      onUpdate({
        id: editingId,
        name: cleanName,
        amount: numAmount,
        category,
        date: new Date().toISOString().split('T')[0]
      });
      setEditingId(null);
    } else {
      onAdd({
        id: generateId(),
        name: cleanName,
        amount: numAmount,
        category,
        date: new Date().toISOString().split('T')[0]
      });
    }

    setName('');
    setAmount('');
  };

  const handleEdit = (item: ExpenseItem) => {
    setEditingId(item.id);
    setName(item.name);
    setAmount(item.amount.toString());
    setCategory(item.category || 'فواتير');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setAmount('');
  };

  const handleSelectPreset = (presetName: string) => {
    setName(presetName);
  };

  const filteredExpenses = expenses.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">قسم الفواتير والمصاريف العامة</h2>
            <p className="text-xs text-slate-500">إدارة التزامات المعيشة، فواتير الخدمات، والمصاريف الثابتة والطارئة</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-purple-50 px-4 py-2.5 rounded-xl border border-purple-200/60 self-start md:self-auto">
          <span className="text-xs font-semibold text-purple-800">مجموع الفواتير والمصاريف:</span>
          <span className="text-base font-black text-purple-700 tabular-nums">
            {formatCurrency(totalExpenses)}
          </span>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          {editingId ? (
            <>
              <Edit3 className="w-4 h-4 text-amber-500" />
              <span>تعديل بيانات المصروف:</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 text-purple-500" />
              <span>إضافة فاتورة أو مصروف جديد:</span>
            </>
          )}
        </h3>

        {/* Quick Presets */}
        <div className="mb-4">
          <span className="text-xs text-slate-500 font-medium block mb-2">أمثلة سريعة شائعة:</span>
          <div className="flex flex-wrap gap-2">
            {COMMON_EXPENSE_PRESETS.map((preset) => {
              const PresetIcon = preset.icon;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset.name)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 text-xs text-slate-700 hover:text-purple-700 transition-colors cursor-pointer"
                >
                  <PresetIcon className="w-3.5 h-3.5 text-purple-500" />
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم الفاتورة / المصروف:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: فاتورة الكهرباء، بنزين، كراء، صيدلية..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                المبلغ (بالدرهم):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50 focus:bg-white tabular-nums"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                التصنيف:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50 focus:bg-white"
              >
                <option value="فواتير">فواتير وخدمات</option>
                <option value="إيجار">سكن وكراء</option>
                <option value="طاقة">غاز ووقود</option>
                <option value="اتصالات">إنترنت وهاتف</option>
                <option value="صحة">صحة وأدوية</option>
                <option value="نقل">نقل ومواصلات</option>
                <option value="متنوع">مصاريف أخرى</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5 ${
                  editingId 
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' 
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20 active:scale-95'
                }`}
              >
                {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingId ? 'حفظ التعديل' : 'إضافة المصروف'}</span>
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>

            {expenses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onConfirmModal(
                    'حذف كافة الفواتير والمصاريف',
                    'هل أنت متأكد من حذف جميع عناصر الفواتير والمصاريف المسجلة؟',
                    onDeleteAll
                  );
                }}
                className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الكل</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Items List Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">قائمة الفواتير والمصاريف</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {expenses.length}
            </span>
          </div>

          {expenses.length > 2 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في المصاريف..."
                className="w-full pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-xl">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm font-bold mb-1">لا توجد مصاريف أو فواتير مسجلة</p>
            <p className="text-slate-400 text-xs">سجل فواتيرك ومصاريفك اليومية والشهرية لحساب الإجمالي</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredExpenses.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-purple-200 hover:bg-purple-50/20 transition-all bg-white"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                    {item.category && (
                      <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-semibold">
                        {item.category}
                      </span>
                    )}
                  </div>
                  {item.date && (
                    <span className="text-[11px] text-slate-400 block tabular-nums">{item.date}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-purple-700 tabular-nums">
                    {formatCurrency(item.amount)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      title="تعديل هذا العنصر"
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        onConfirmModal(
                          'حذف الفاتورة أو المصروف',
                          `هل أنت متأكد من حذف "${item.name}" بقيمة ${item.amount} درهم؟`,
                          () => onDelete(item.id)
                        );
                      }}
                      title="حذف هذا العنصر"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Subtotal */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-sm">
          <span className="font-bold text-slate-700">مجموع الفواتير والمصاريف:</span>
          <span className="font-black text-purple-700 text-base tabular-nums">
            {formatCurrency(totalExpenses)}
          </span>
        </div>
      </div>
    </div>
  );
};
