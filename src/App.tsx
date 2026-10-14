/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Carrot, 
  Beef, 
  ShoppingBag 
} from 'lucide-react';
import { 
  AccountingData, 
  SectionType, 
  IncomeItem, 
  PurchaseItem, 
  ExpenseItem 
} from './types';
import { 
  loadAccountingData, 
  saveAccountingData, 
  exportDataAsCSV, 
  exportDataAsJSON,
  formatCurrency
} from './utils/storage';

import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { IncomeSection } from './components/IncomeSection';
import { PurchaseSection } from './components/PurchaseSection';
import { ExpenseSection } from './components/ExpenseSection';
import { SummarySection } from './components/SummarySection';
import { ConfirmModal } from './components/ConfirmModal';
import { AddItemModal } from './components/AddItemModal';
import { Toast } from './components/Toast';

const SECTIONS_ORDER: SectionType[] = [
  'income',
  'vegetables',
  'meats',
  'groceries',
  'expenses',
  'summary'
];

export default function App() {
  const [data, setData] = useState<AccountingData>(() => loadAccountingData());
  const [currentSection, setCurrentSection] = useState<SectionType>('income');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedIndicator, setSavedIndicator] = useState(false);

  // Modal states
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [addCatalogModalState, setAddCatalogModalState] = useState<{
    isOpen: boolean;
    categoryTitle: string;
    targetCategory: 'vegList' | 'meatTypes' | 'grocList';
  }>({
    isOpen: false,
    categoryTitle: '',
    targetCategory: 'vegList'
  });

  // Persist whenever data updates
  useEffect(() => {
    saveAccountingData(data);
  }, [data]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleManualSave = () => {
    saveAccountingData(data);
    setSavedIndicator(true);
    showToast('تم حفظ كافة البيانات بنجاح في ذاكرة المتصفح!');
    setTimeout(() => setSavedIndicator(false), 2500);
  };

  // Calculations
  const totalIncome = data.incomes.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalVeg = data.vegetables.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalMeat = data.meats.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalGroc = data.groceries.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalExp = data.expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

  const totalPurchases = totalVeg + totalMeat + totalGroc + totalExp;
  const netBalance = totalIncome - totalPurchases;

  // Touch Swipe navigation support for mobile
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;

    // Minimum swipe threshold
    if (Math.abs(diff) > 75) {
      const curIdx = SECTIONS_ORDER.indexOf(currentSection);
      // In RTL: swipe left (diff < 0) means going to the next item
      if (diff < 0 && curIdx < SECTIONS_ORDER.length - 1) {
        setCurrentSection(SECTIONS_ORDER[curIdx + 1]);
      } else if (diff > 0 && curIdx > 0) {
        setCurrentSection(SECTIONS_ORDER[curIdx - 1]);
      }
    }
  };

  // Generic confirmation helper
  const openConfirmModal = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModalState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // --- Handlers for Income ---
  const handleAddIncome = (item: IncomeItem) => {
    setData(prev => ({ ...prev, incomes: [item, ...prev.incomes] }));
    showToast('تمت إضافة مصدر الدخل بنجاح');
  };

  const handleUpdateIncome = (item: IncomeItem) => {
    setData(prev => ({
      ...prev,
      incomes: prev.incomes.map(i => i.id === item.id ? item : i)
    }));
    showToast('تم تحديث بيانات الدخل');
  };

  const handleDeleteIncome = (id: string) => {
    setData(prev => ({ ...prev, incomes: prev.incomes.filter(i => i.id !== id) }));
    showToast('تم حذف عنصر الدخل');
  };

  const handleDeleteAllIncome = () => {
    setData(prev => ({ ...prev, incomes: [] }));
    showToast('تم حذف كافة عناصر الدخل');
  };

  // --- Handlers for Purchases (Vegetables, Meats, Groceries) ---
  const handleAddPurchase = (type: 'vegetables' | 'meats' | 'groceries', item: PurchaseItem) => {
    setData(prev => ({ ...prev, [type]: [item, ...prev[type]] }));
    showToast('تمت إضافة المشتريات بنجاح');
  };

  const handleUpdatePurchase = (type: 'vegetables' | 'meats' | 'groceries', item: PurchaseItem) => {
    setData(prev => ({
      ...prev,
      [type]: prev[type].map(i => i.id === item.id ? item : i)
    }));
    showToast('تم تحديث عنصر المشتريات');
  };

  const handleDeletePurchase = (type: 'vegetables' | 'meats' | 'groceries', id: string) => {
    setData(prev => ({ ...prev, [type]: prev[type].filter(i => i.id !== id) }));
    showToast('تم حذف العنصر بنجاح');
  };

  const handleDeleteAllPurchase = (type: 'vegetables' | 'meats' | 'groceries') => {
    setData(prev => ({ ...prev, [type]: [] }));
    showToast('تم تفريغ القائمة بالكامل');
  };

  // --- Handlers for Expenses ---
  const handleAddExpense = (item: ExpenseItem) => {
    setData(prev => ({ ...prev, expenses: [item, ...prev.expenses] }));
    showToast('تمت إضافة الفاتورة بنجاح');
  };

  const handleUpdateExpense = (item: ExpenseItem) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === item.id ? item : e)
    }));
    showToast('تم تحديث الفاتورة');
  };

  const handleDeleteExpense = (id: string) => {
    setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
    showToast('تم حذف الفاتورة');
  };

  const handleDeleteAllExpenses = () => {
    setData(prev => ({ ...prev, expenses: [] }));
    showToast('تم حذف كافة الفواتير والمصاريف');
  };

  // --- Catalog items handling ---
  const handleAddCatalogItem = (name: string) => {
    const target = addCatalogModalState.targetCategory;
    if (!data[target].includes(name)) {
      setData(prev => ({
        ...prev,
        [target]: [...prev[target], name]
      }));
      showToast(`تمت إضافة "${name}" إلى القائمة بنجاح`);
    } else {
      showToast(`الصنف "${name}" موجود مسبقاً في القائمة`);
    }
  };

  // --- Export and Import ---
  const handleImportJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && (parsed.incomes || parsed.vegetables || parsed.groceries)) {
        openConfirmModal(
          'استيراد البيانات واستبدال الحالية',
          'سيؤدي استيراد الملف إلى استبدال البيانات الحالية بالبيانات الموجودة في الملف، هل تود المتابعة؟',
          () => {
            localStorage.setItem('data', jsonStr);
            const loaded = loadAccountingData();
            setData(loaded);
            showToast('تم استيراد واسترجاع البيانات بنجاح!');
          }
        );
      } else {
        alert('ملف البيانات غير صالح');
      }
    } catch {
      alert('حدث خطأ في قراءة ملف JSON');
    }
  };

  // --- New Month Reset ---
  const handleResetMonth = () => {
    openConfirmModal(
      'بدء شهر محاسبي جديد',
      'هل ترغب في تفريغ مشتريات الخضار، اللحوم، الهري، والمصاريف للشهر الجديد؟ (سيتم الاحتفاظ بالراتب وقوائم الأصناف). ننصحك بتصدير نسخة احتياطية أولاً.',
      () => {
        setData(prev => ({
          ...prev,
          vegetables: [],
          meats: [],
          groceries: [],
          expenses: []
        }));
        showToast('تم تصفير المشتريات بنجاح لبدء الشهر الجديد!');
      }
    );
  };

  return (
    <div 
      className="min-h-screen bg-slate-50 flex flex-col font-sans"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Top Header */}
      <Header
        totalIncome={totalIncome}
        totalExpenses={totalPurchases}
        netBalance={netBalance}
        onSave={handleManualSave}
        onExportCSV={() => {
          exportDataAsCSV(data);
          showToast('تم تصدير ملف Excel بنجاح');
        }}
        onExportJSON={() => {
          exportDataAsJSON(data);
          showToast('تم تحميل نسخة JSON الاحتياطية بنجاح');
        }}
        onImportJSON={handleImportJSON}
        onResetMonth={handleResetMonth}
        savedIndicator={savedIndicator}
      />

      {/* Desktop / Tablet Section Navigation */}
      <Navigation
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        counts={{
          income: data.incomes.length,
          vegetables: data.vegetables.length,
          meats: data.meats.length,
          groceries: data.groceries.length,
          expenses: data.expenses.length
        }}
        totals={{
          income: totalIncome,
          vegetables: totalVeg,
          meats: totalMeat,
          groceries: totalGroc,
          expenses: totalExp
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-12">
        {currentSection === 'income' && (
          <IncomeSection
            incomes={data.incomes}
            onAdd={handleAddIncome}
            onUpdate={handleUpdateIncome}
            onDelete={handleDeleteIncome}
            onDeleteAll={handleDeleteAllIncome}
            onConfirmModal={openConfirmModal}
          />
        )}

        {currentSection === 'vegetables' && (
          <PurchaseSection
            title="قسم الخضار والفواكه"
            subtitle="تسجيل مشتريات سوق الخضار، الفواكه، والورقيات"
            icon={Carrot}
            accentColor="amber"
            catalog={data.vegList}
            items={data.vegetables}
            defaultUnit="كغ"
            onAddItem={(item) => handleAddPurchase('vegetables', item)}
            onUpdateItem={(item) => handleUpdatePurchase('vegetables', item)}
            onDeleteItem={(id) => handleDeletePurchase('vegetables', id)}
            onDeleteAll={() => handleDeleteAllPurchase('vegetables')}
            onOpenAddCatalogItem={() => {
              setAddCatalogModalState({
                isOpen: true,
                categoryTitle: 'قائمة الخضار',
                targetCategory: 'vegList'
              });
            }}
            onConfirmModal={openConfirmModal}
          />
        )}

        {currentSection === 'meats' && (
          <PurchaseSection
            title="قسم اللحوم، الأسماك والدواجن"
            subtitle="تسجيل مشتريات الجزارة والسمك والدواجن بالكيلو"
            icon={Beef}
            accentColor="rose"
            catalog={data.meatTypes}
            items={data.meats}
            defaultUnit="كغ"
            onAddItem={(item) => handleAddPurchase('meats', item)}
            onUpdateItem={(item) => handleUpdatePurchase('meats', item)}
            onDeleteItem={(id) => handleDeletePurchase('meats', id)}
            onDeleteAll={() => handleDeleteAllPurchase('meats')}
            onOpenAddCatalogItem={() => {
              setAddCatalogModalState({
                isOpen: true,
                categoryTitle: 'قائمة اللحوم والأسماك',
                targetCategory: 'meatTypes'
              });
            }}
            onConfirmModal={openConfirmModal}
          />
        )}

        {currentSection === 'groceries' && (
          <PurchaseSection
            title="قسم الهري (المواد التموينية والغذائية)"
            subtitle="تسجيل المؤن المنزلية، الزيوت، السكر، الدقيق، ومواد النظافة"
            icon={ShoppingBag}
            accentColor="sky"
            catalog={data.grocList}
            items={data.groceries}
            defaultUnit="وحدة"
            onAddItem={(item) => handleAddPurchase('groceries', item)}
            onUpdateItem={(item) => handleUpdatePurchase('groceries', item)}
            onDeleteItem={(id) => handleDeletePurchase('groceries', id)}
            onDeleteAll={() => handleDeleteAllPurchase('groceries')}
            onOpenAddCatalogItem={() => {
              setAddCatalogModalState({
                isOpen: true,
                categoryTitle: 'قائمة مواد الهري',
                targetCategory: 'grocList'
              });
            }}
            onConfirmModal={openConfirmModal}
          />
        )}

        {currentSection === 'expenses' && (
          <ExpenseSection
            expenses={data.expenses}
            onAdd={handleAddExpense}
            onUpdate={handleUpdateExpense}
            onDelete={handleDeleteExpense}
            onDeleteAll={handleDeleteAllExpenses}
            onConfirmModal={openConfirmModal}
          />
        )}

        {currentSection === 'summary' && (
          <SummarySection
            data={data}
            onUpdateBudgetLimit={(limit) => {
              setData(prev => ({ ...prev, monthlyBudgetLimit: limit }));
              showToast('تم تحديث سقف الميزانية');
            }}
            onExportCSV={() => {
              exportDataAsCSV(data);
              showToast('تم تصدير ملف Excel بنجاح');
            }}
            onExportJSON={() => {
              exportDataAsJSON(data);
              showToast('تم تحميل نسخة JSON الاحتياطية بنجاح');
            }}
          />
        )}
      </main>

      {/* Footer Branding & Copyright */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <p>© {new Date().getFullYear()} النظام المحاسبي وإدارة المصاريف - محمد طالب</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>العملة: درهم مغربي (MAD)</span>
            <span>·</span>
            <span>حفظ محلي آمن في المتصفح</span>
          </div>
        </div>
      </footer>

      {/* Confirmation Dialog Modal */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Add New Catalog Item Modal */}
      <AddItemModal
        isOpen={addCatalogModalState.isOpen}
        categoryTitle={addCatalogModalState.categoryTitle}
        onAdd={handleAddCatalogItem}
        onClose={() => setAddCatalogModalState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
