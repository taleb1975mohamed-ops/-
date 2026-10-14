import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  categoryTitle: string;
  onAdd: (name: string) => void;
  onClose: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  categoryTitle,
  onAdd,
  onClose
}) => {
  const [itemName, setItemName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = itemName.trim();
    if (!trimmed) {
      setError('يرجى كتابة اسم الصنف أولاً');
      return;
    }
    onAdd(trimmed);
    setItemName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sky-700">
            <PlusCircle className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">إضافة صنف جديد إلى {categoryTitle}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              اسم الصنف أو المادة:
            </label>
            <input
              type="text"
              autoFocus
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                if (error) setError('');
              }}
              placeholder="مثال: فاصوليا خضراء، كفتة لحم، صابون سائل..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm bg-slate-50 focus:bg-white"
            />
            {error && <p className="text-rose-500 text-xs mt-1 font-medium">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-sm shadow-sky-600/30 active:scale-95 transition-all"
            >
              إضافة للقائمة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
