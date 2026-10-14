import { AccountingData, IncomeItem, PurchaseItem, ExpenseItem } from '../types';

export const DEFAULT_VEG_LIST: string[] = [
  "طماطم", "بطاطس", "بصل", "جزر", "خيار", "فلفل أخضر", "فلفل حار", 
  "لفت", "باربا (شمندر)", "زعلوك (باذنجان)", "شيفلور (قرنبيط)", 
  "سفرجل", "بطاطا حلوة", "خس", "شيبة", "نعناع", "حامض (ليمون)", 
  "تفاح", "موز (بنان)", "أفوكادو", "عنب", "برتقال"
];

export const DEFAULT_MEAT_TYPES: string[] = [
  "لحم بقري", "لحم غنمي", "لحم مفروم (كفتة)", "دجاج رومي", 
  "دجاج بلدي", "ديك رومي (بيبي)", "سمك سردين", "سمك ميرلان", 
  "سمك صول", "سمك جمبري (كروفيت)", "تونة طازجة", "كبدة"
];

export const DEFAULT_GROC_LIST: string[] = [
  "زيت الزيتون", "زيت المائدة", "دقيق ممتاز (فورص)", "دقيق القمح (فينو)", 
  "سكر سنيدة", "سكر قوالب", "شاي أخضر", "قهوة", "أرز أبيض", 
  "معكرونة (سباغيتي / شعرية)", "حليب معقم", "بيض", "جبن مثلثات", 
  "مربى", "زبدة", "طماطم مصبرة", "صابون غسيل", "مسحوق الغسيل", 
  "ماء جافيل", "ورق صحي"
];

const STORAGE_KEY = 'data';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export function loadAccountingData(): AccountingData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      
      const sanitizePurchases = (list: any[]): PurchaseItem[] => {
        if (!Array.isArray(list)) return [];
        return list.map((item, idx) => ({
          id: item.id || `p-${idx}-${generateId()}`,
          name: String(item.name || '').trim() || 'صنف بدون اسم',
          price: Number(item.price) || 0,
          qty: Number(item.qty) || 1,
          unit: item.unit || 'كغ',
          date: item.date || new Date().toISOString().split('T')[0]
        }));
      };

      const sanitizeIncomes = (list: any[]): IncomeItem[] => {
        if (!Array.isArray(list)) return [];
        return list.map((item, idx) => ({
          id: item.id || `inc-${idx}-${generateId()}`,
          name: String(item.name || '').trim() || 'دخل غير محدد',
          amount: Number(item.amount) || 0,
          date: item.date || new Date().toISOString().split('T')[0],
          notes: item.notes || ''
        }));
      };

      const sanitizeExpenses = (list: any[]): ExpenseItem[] => {
        if (!Array.isArray(list)) return [];
        return list.map((item, idx) => ({
          id: item.id || `exp-${idx}-${generateId()}`,
          name: String(item.name || '').trim() || 'مصروف عام',
          amount: Number(item.amount) || 0,
          category: item.category || 'عام',
          date: item.date || new Date().toISOString().split('T')[0]
        }));
      };

      return {
        incomes: sanitizeIncomes(parsed.incomes),
        vegetables: sanitizePurchases(parsed.vegetables),
        meats: sanitizePurchases(parsed.meats),
        groceries: sanitizePurchases(parsed.groceries),
        expenses: sanitizeExpenses(parsed.expenses),
        vegList: Array.isArray(parsed.vegList) && parsed.vegList.length > 0 ? parsed.vegList : DEFAULT_VEG_LIST,
        meatTypes: Array.isArray(parsed.meatTypes) && parsed.meatTypes.length > 0 ? parsed.meatTypes : DEFAULT_MEAT_TYPES,
        grocList: Array.isArray(parsed.grocList) && parsed.grocList.length > 0 ? parsed.grocList : DEFAULT_GROC_LIST,
        monthlyBudgetLimit: parsed.monthlyBudgetLimit ? Number(parsed.monthlyBudgetLimit) : undefined
      };
    }
  } catch (err) {
    console.error('فشل تحميل البيانات من الذاكرة المحلية:', err);
  }

  // Sample starter data if completely fresh
  return {
    incomes: [
      { id: generateId(), name: 'الراتب الشهري الأساسي', amount: 7500, date: new Date().toISOString().split('T')[0] }
    ],
    vegetables: [
      { id: generateId(), name: 'طماطم', price: 6, qty: 3, unit: 'كغ' },
      { id: generateId(), name: 'بطاطس', price: 5, qty: 5, unit: 'كغ' },
      { id: generateId(), name: 'بصل', price: 4.5, qty: 4, unit: 'كغ' },
      { id: generateId(), name: 'خيار', price: 7, qty: 2, unit: 'كغ' }
    ],
    meats: [
      { id: generateId(), name: 'لحم بقري', price: 95, qty: 2.5, unit: 'كغ' },
      { id: generateId(), name: 'دجاج بلدي', price: 45, qty: 2, unit: 'كغ' },
      { id: generateId(), name: 'سمك ميرلان', price: 60, qty: 1.5, unit: 'كغ' }
    ],
    groceries: [
      { id: generateId(), name: 'زيت الزيتون (5 لتر)', price: 420, qty: 1, unit: 'وحدة' },
      { id: generateId(), name: 'دقيق ممتاز (25 كغ)', price: 135, qty: 1, unit: 'وحدة' },
      { id: generateId(), name: 'سكر سنيدة', price: 12, qty: 4, unit: 'كغ' },
      { id: generateId(), name: 'شاي أخضر ممتاز', price: 28, qty: 2, unit: 'علبة' }
    ],
    expenses: [
      { id: generateId(), name: 'فاتورة الماء والكهرباء', amount: 380, category: 'خدمات منزلية' },
      { id: generateId(), name: 'اشتراك الإنترنت المنزلي', amount: 250, category: 'اتصالات' },
      { id: generateId(), name: 'قنينة غاز البوتان', amount: 90, category: 'وقود وطاقة' }
    ],
    vegList: DEFAULT_VEG_LIST,
    meatTypes: DEFAULT_MEAT_TYPES,
    grocList: DEFAULT_GROC_LIST,
    monthlyBudgetLimit: 6000
  };
}

export function saveAccountingData(data: AccountingData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('فشل حفظ البيانات:', err);
  }
}

export function formatCurrency(amount: number): string {
  return (Math.round((amount || 0) * 100) / 100).toLocaleString('ar-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' درهم';
}

export function formatNumber(amount: number): string {
  return (Math.round((amount || 0) * 100) / 100).toFixed(2);
}

export function exportDataAsJSON(data: AccountingData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `بيانات_المحاسبة_محمد_طالب_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportDataAsCSV(data: AccountingData): void {
  // UTF-8 BOM so Excel opens Arabic correctly
  let csvContent = '\uFEFF';
  csvContent += 'القسم,العنصر,السعر الفردي (درهم),الكمية,المجموع (درهم),التاريخ\r\n';

  data.incomes.forEach(i => {
    csvContent += `الدخل,"${i.name}",-, -,"${i.amount}",${i.date || '-'}\r\n`;
  });
  data.vegetables.forEach(v => {
    csvContent += `الخضار,"${v.name}",${v.price},${v.qty},${(v.price * v.qty).toFixed(2)},${v.date || '-'}\r\n`;
  });
  data.meats.forEach(m => {
    csvContent += `اللحوم والأسماك,"${m.name}",${m.price},${m.qty},${(m.price * m.qty).toFixed(2)},${m.date || '-'}\r\n`;
  });
  data.groceries.forEach(g => {
    csvContent += `الهري (التموين),"${g.name}",${g.price},${g.qty},${(g.price * g.qty).toFixed(2)},${g.date || '-'}\r\n`;
  });
  data.expenses.forEach(e => {
    csvContent += `المصاريف والفواتير,"${e.name}",-, -,"${e.amount}",${e.date || '-'}\r\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `تقرير_المصاريف_محمد_طالب_${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
