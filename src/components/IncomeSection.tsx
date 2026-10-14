import React, { useState } from 'react';
import { 
  Banknote, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  RotateCcw,
  Check
} from 'lucide-react';
import { IncomeItem } from '../types';
import { formatCurrency, generateId } from '../utils/storage';

interface IncomeSectionProps {
  incomes: IncomeItem[];
  onAdd: (item: IncomeItem) => void;
  onUpdate: (item: IncomeItem) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
}

export const IncomeSection: React.FC<IncomeSectionProps> = ({
  incomes,
  onAdd,
  onUpdate,
  onDelete,
  onDeleteAll,
  onConfirmModal
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const totalIncome = incomes.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const numAmount = parseFloat(amount);

    if (!cleanName) {
      alert('يرجى كتابة اسم مصدر الدخل أو الراتب');
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
        notes: notes.trim(),
        date: new Date().toISOString().split('T')[0]
      });
      setEditingId(null);
    } else {
      onAdd({
        id: generateId(),
        name: cleanName,
        amount: numAmount,
        notes: notes.trim(),
        date: new Date().toISOString().split('T')[0]
      });
    }

    setName('');
    setAmount('');
    setNotes('');
  };

  const handleEdit = (item: IncomeItem) => {
    setEditingId(item.id);
    setName(item.name);
    setAmount(item.amount.toString());
    setNotes(item.notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setAmount('');
    setNotes('');
  };

  const filteredIncomes = incomes.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.notes && i.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">سجل الدخل الشهري والرواتب</h2>
            <p className="text-xs text-slate-500">إدارة الرواتب، الدخل الإضافي، والأرباح بالدرهم</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200/60 self-start md:self-auto">
          <span className="text-xs font-semibold text-emerald-800">إجمالي الدخل المحصل:</span>
          <span className="text-base font-black text-emerald-700 tabular-nums">
            {formatCurrency(totalIncome)}
          </span>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          {editingId ? (
            <>
              <Edit3 className="w-4 h-4 text-amber-500" />
              <span>تعديل بيانات الدخل:</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 text-emerald-500" />
              <span>إضافة مصدر دخل أو راتب جديد:</span>
            </>
          )}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم المصدر / الراتب:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: الراتب الشهري، عمل حر، مكافأة..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                المبلغ (بالدرهم):
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white tabular-nums"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ملاحظات (اختياري):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="تاريخ القبض، المصدر..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5 ${
                  editingId 
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 active:scale-95'
                }`}
              >
                {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingId ? 'حفظ التعديل' : 'إضافة إلى الدخل'}</span>
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

            {incomes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onConfirmModal(
                    'حذف كافة مصادر الدخل',
                    'هل أنت متأكد من رغبتك في حذف جميع عناصر الدخل المسجلة؟ لا يمكن التراجع عن هذا الإجراء.',
                    onDeleteAll
                  );
                }}
                className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors font-semibold flex items-center gap-1"
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
            <h3 className="text-sm font-bold text-slate-800">قائمة المداخيل المسجلة</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {incomes.length}
            </span>
          </div>

          {incomes.length > 2 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في المداخيل..."
                className="w-full pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {incomes.length === 0 ? (
          <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-xl">
            <Banknote className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm font-bold mb-1">لا توجد مصادر دخل مسجلة حتى الآن</p>
            <p className="text-slate-400 text-xs">أدخل الراتب الشهري أو أي مبالغ محصلة في النموذج أعلاه</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredIncomes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all bg-white"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                    {item.notes && (
                      <span className="text-[11px] text-slate-400 font-medium">({item.notes})</span>
                    )}
                  </div>
                  {item.date && (
                    <span className="text-[11px] text-slate-400 block tabular-nums">{item.date}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-emerald-700 tabular-nums">
                    {formatCurrency(item.amount)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      title="تعديل هذا العنصر"
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        onConfirmModal(
                          'حذف عنصر الدخل',
                          `هل أنت متأكد من حذف "${item.name}" بقيمة ${item.amount} درهم؟`,
                          () => onDelete(item.id)
                        );
                      }}
                      title="حذف هذا العنصر"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
          <span className="font-bold text-slate-700">مجموع المداخيل المسجلة:</span>
          <span className="font-black text-emerald-700 text-base tabular-nums">
            {formatCurrency(totalIncome)}
          </span>
        </div>
      </div>
    </div>
  );
};
