import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  PlusCircle, 
  Check, 
  Minus,
  Sparkles
} from 'lucide-react';
import { PurchaseItem } from '../types';
import { formatCurrency, generateId } from '../utils/storage';

interface PurchaseSectionProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: 'emerald' | 'amber' | 'rose' | 'sky';
  catalog: string[];
  items: PurchaseItem[];
  defaultUnit?: string;
  onAddItem: (item: PurchaseItem) => void;
  onUpdateItem: (item: PurchaseItem) => void;
  onDeleteItem: (id: string) => void;
  onDeleteAll: () => void;
  onOpenAddCatalogItem: () => void;
  onConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
}

export const PurchaseSection: React.FC<PurchaseSectionProps> = ({
  title,
  subtitle,
  icon: Icon,
  accentColor,
  catalog,
  items,
  defaultUnit = 'كغ',
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onDeleteAll,
  onOpenAddCatalogItem,
  onConfirmModal
}) => {
  const [selectedName, setSelectedName] = useState(catalog[0] || '');
  const [customName, setCustomName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState(defaultUnit);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const totalSum = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const activeColorClasses = {
    emerald: {
      bgIcon: 'bg-emerald-50 text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
      primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
      textAccent: 'text-emerald-700',
      ringFocus: 'focus:ring-emerald-500',
      borderHover: 'hover:border-emerald-300'
    },
    amber: {
      bgIcon: 'bg-amber-50 text-amber-600',
      badge: 'bg-amber-50 text-amber-800 border-amber-200/60',
      primaryBtn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
      textAccent: 'text-amber-700',
      ringFocus: 'focus:ring-amber-500',
      borderHover: 'hover:border-amber-300'
    },
    rose: {
      bgIcon: 'bg-rose-50 text-rose-600',
      badge: 'bg-rose-50 text-rose-800 border-rose-200/60',
      primaryBtn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
      textAccent: 'text-rose-700',
      ringFocus: 'focus:ring-rose-500',
      borderHover: 'hover:border-rose-300'
    },
    sky: {
      bgIcon: 'bg-sky-50 text-sky-600',
      badge: 'bg-sky-50 text-sky-800 border-sky-200/60',
      primaryBtn: 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20',
      textAccent: 'text-sky-700',
      ringFocus: 'focus:ring-sky-500',
      borderHover: 'hover:border-sky-300'
    }
  }[accentColor];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = isCustomMode ? customName.trim() : selectedName;
    const numPrice = parseFloat(price);
    const numQty = parseFloat(qty);

    if (!finalName) {
      alert('يرجى اختيار أو كتابة اسم الصنف');
      return;
    }
    if (isNaN(numPrice) || numPrice < 0) {
      alert('يرجى إدخال سعر صحيح (0 أو أكثر)');
      return;
    }
    if (isNaN(numQty) || numQty <= 0) {
      alert('يرجى إدخال كمية صحيحة أكبر من الصفر');
      return;
    }

    if (editingId) {
      onUpdateItem({
        id: editingId,
        name: finalName,
        price: numPrice,
        qty: numQty,
        unit: unit,
        date: new Date().toISOString().split('T')[0]
      });
      setEditingId(null);
    } else {
      onAddItem({
        id: generateId(),
        name: finalName,
        price: numPrice,
        qty: numQty,
        unit: unit,
        date: new Date().toISOString().split('T')[0]
      });
    }

    setPrice('');
    setQty('1');
    setCustomName('');
    setIsCustomMode(false);
  };

  const handleEdit = (item: PurchaseItem) => {
    setEditingId(item.id);
    if (catalog.includes(item.name)) {
      setSelectedName(item.name);
      setIsCustomMode(false);
    } else {
      setCustomName(item.name);
      setIsCustomMode(true);
    }
    setPrice(item.price.toString());
    setQty(item.qty.toString());
    setUnit(item.unit || defaultUnit);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setPrice('');
    setQty('1');
    setCustomName('');
    setIsCustomMode(false);
  };

  const adjustQty = (delta: number) => {
    const current = parseFloat(qty) || 0;
    const updated = Math.max(0.25, current + delta);
    setQty((Math.round(updated * 100) / 100).toString());
  };

  const currentPreviewSubtotal = (parseFloat(price) || 0) * (parseFloat(qty) || 0);

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${activeColorClasses.bgIcon}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border self-start md:self-auto ${activeColorClasses.badge}`}>
          <span className="text-xs font-semibold">مجموع المشتريات:</span>
          <span className={`text-base font-black tabular-nums ${activeColorClasses.textAccent}`}>
            {formatCurrency(totalSum)}
          </span>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            {editingId ? (
              <>
                <Edit3 className="w-4 h-4 text-amber-500" />
                <span>تعديل المشتريات:</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-sky-500" />
                <span>إضافة مشتريات جديدة:</span>
              </>
            )}
          </h3>

          <button
            type="button"
            onClick={onOpenAddCatalogItem}
            className="text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200/70 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ إضافة صنف للقائمة</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Item Name / Select */}
            <div className="sm:col-span-5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  نوع الصنف:
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className="text-[11px] text-sky-600 hover:underline font-medium"
                >
                  {isCustomMode ? 'اختيار من القائمة' : 'كتابة اسم مخصص'}
                </button>
              </div>

              {isCustomMode ? (
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="اكتب اسم الصنف هنا..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none bg-slate-50 focus:bg-white ${activeColorClasses.ringFocus}`}
                />
              ) : (
                <select
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none bg-slate-50 focus:bg-white ${activeColorClasses.ringFocus}`}
                >
                  {catalog.map((catItem) => (
                    <option key={catItem} value={catItem}>
                      {catItem}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Price input */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                السعر (درهم / {unit}):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none bg-slate-50 focus:bg-white tabular-nums ${activeColorClasses.ringFocus}`}
              />
            </div>

            {/* Quantity input with Quick Adjusters */}
            <div className="sm:col-span-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  الكمية ({unit}):
                </label>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setUnit('كغ')}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${unit === 'كغ' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    كغ
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('وحدة')}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${unit === 'وحدة' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    وحدة
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('علبة')}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${unit === 'علبة' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    علبة
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => adjustQty(-0.5)}
                  title="إنقاص نصف وحدة"
                  className="p-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="number"
                  step="0.25"
                  min="0.1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="1"
                  className={`w-full px-2 py-2.5 text-center rounded-xl border border-slate-300 text-sm focus:outline-none bg-slate-50 focus:bg-white tabular-nums font-bold ${activeColorClasses.ringFocus}`}
                />

                <button
                  type="button"
                  onClick={() => adjustQty(0.5)}
                  title="زيادة نصف وحدة"
                  className="p-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustQty(1)}
                  title="زيادة وحدة كاملة"
                  className="px-2 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-600 transition-colors"
                >
                  +1
                </button>
              </div>
            </div>
          </div>

          {/* Subtotal Preview & Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>المجموع التقديري للعملية:</span>
              <span className="font-black text-slate-900 text-sm tabular-nums">
                {formatCurrency(currentPreviewSubtotal)}
              </span>
              {parseFloat(price) > 0 && parseFloat(qty) > 0 && (
                <span className="text-[11px] text-slate-400">
                  ({price} × {qty} {unit})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5 ${
                  editingId 
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' 
                    : `${activeColorClasses.primaryBtn} active:scale-95`
                }`}
              >
                {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingId ? 'حفظ التعديل' : 'إضافة المشتريات'}</span>
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
          </div>
        </form>
      </div>

      {/* Items List Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">قائمة المشتريات المضافة</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {items.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 2 && (
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في المشتريات..."
                  className="w-full pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            )}

            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onConfirmModal(
                    `حذف كافة مشتريات ${title}`,
                    `هل ترغب في حذف جميع العناصر المسجلة في ${title}؟ سيتم تفريغ القائمة بالكامل.`,
                    onDeleteAll
                  );
                }}
                className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors font-semibold flex items-center gap-1 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">حذف الكل</span>
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-xl">
            <Icon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm font-bold mb-1">لا توجد مشتريات مسجلة في هذا القسم</p>
            <p className="text-slate-400 text-xs">حدد الصنف والسعر والكمية واضغط على إضافة</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item) => {
              const subtotal = item.price * item.qty;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border border-slate-200 ${activeColorClasses.borderHover} hover:bg-slate-50/50 transition-all bg-white`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 tabular-nums">
                      <span>{item.qty} {item.unit || defaultUnit}</span>
                      <span aria-hidden="true" className="text-slate-300">×</span>
                      <span>{item.price.toFixed(2)} درهم</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <span className="text-sm sm:text-base font-black text-slate-900 tabular-nums block">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

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
                            'حذف عنصر مشتريات',
                            `هل ترغب في حذف "${item.name}" بقيمة ${subtotal.toFixed(2)} درهم؟`,
                            () => onDeleteItem(item.id)
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
              );
            })}
          </div>
        )}

        {/* Footer Subtotal */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-sm">
          <span className="font-bold text-slate-700">مجموع {title}:</span>
          <span className={`font-black text-base tabular-nums ${activeColorClasses.textAccent}`}>
            {formatCurrency(totalSum)}
          </span>
        </div>
      </div>
    </div>
  );
};
