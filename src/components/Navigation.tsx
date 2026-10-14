import React from 'react';
import { 
  Banknote, 
  Carrot, 
  Beef, 
  ShoppingBag, 
  Receipt, 
  PieChart 
} from 'lucide-react';
import { SectionType } from '../types';

interface NavigationProps {
  currentSection: SectionType;
  onSelectSection: (section: SectionType) => void;
  counts: {
    income: number;
    vegetables: number;
    meats: number;
    groceries: number;
    expenses: number;
  };
  totals: {
    income: number;
    vegetables: number;
    meats: number;
    groceries: number;
    expenses: number;
  };
}

export const Navigation: React.FC<NavigationProps> = ({
  currentSection,
  onSelectSection,
  counts,
  totals
}) => {
  const navItems = [
    {
      id: 'income' as SectionType,
      label: 'الراتب والدخل',
      shortLabel: 'الدخل',
      icon: Banknote,
      count: counts.income,
      total: totals.income,
      color: 'emerald'
    },
    {
      id: 'vegetables' as SectionType,
      label: 'قسم الخضار',
      shortLabel: 'الخضار',
      icon: Carrot,
      count: counts.vegetables,
      total: totals.vegetables,
      color: 'amber'
    },
    {
      id: 'meats' as SectionType,
      label: 'اللحوم والأسماك',
      shortLabel: 'اللحوم',
      icon: Beef,
      count: counts.meats,
      total: totals.meats,
      color: 'rose'
    },
    {
      id: 'groceries' as SectionType,
      label: 'الهري والمؤن',
      shortLabel: 'الهري',
      icon: ShoppingBag,
      count: counts.groceries,
      total: totals.groceries,
      color: 'sky'
    },
    {
      id: 'expenses' as SectionType,
      label: 'الفواتير والمصاريف',
      shortLabel: 'الفواتير',
      icon: Receipt,
      count: counts.expenses,
      total: totals.expenses,
      color: 'purple'
    },
    {
      id: 'summary' as SectionType,
      label: 'الملخص والتحليلات',
      shortLabel: 'الملخص',
      icon: PieChart,
      count: 0,
      total: 0,
      color: 'blue'
    }
  ];

  return (
    <>
      {/* Desktop / Tablet Navigation Bar */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-[73px] z-20 shadow-xs hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 space-x-reverse overflow-x-auto py-2 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30 ring-1 ring-sky-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.id !== 'summary' && item.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Fixed Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40 px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-sky-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">{item.shortLabel}</span>
              {item.id !== 'summary' && item.count > 0 && (
                <span className="absolute -top-1 right-1 w-4 h-4 bg-sky-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
