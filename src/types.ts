export interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  date?: string;
  notes?: string;
}

export interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit?: string; // 'كغ' | 'وحدة' | 'لتر'
  date?: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category?: string;
  date?: string;
}

export interface AccountingData {
  incomes: IncomeItem[];
  vegetables: PurchaseItem[];
  meats: PurchaseItem[];
  groceries: PurchaseItem[];
  expenses: ExpenseItem[];
  vegList: string[];
  meatTypes: string[];
  grocList: string[];
  monthlyBudgetLimit?: number;
}

export type SectionType = 'income' | 'vegetables' | 'meats' | 'groceries' | 'expenses' | 'summary';
