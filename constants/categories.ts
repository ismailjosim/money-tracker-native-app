export const CATEGORIES = {
  // ── EXPENSE (15) ──────────────────────────────────────────
  food: {
    label: 'Food & Dining',
    icon: '🍔',
    color: '#FF5C5C',
    type: 'EXPENSE',
  },
  groceries: {
    label: 'Groceries',
    icon: '🛒',
    color: '#FFA116',
    type: 'EXPENSE',
  },
  transport: {
    label: 'Transport',
    icon: '🚗',
    color: '#00D2D3',
    type: 'EXPENSE',
  },
  shopping: {
    label: 'Shopping',
    icon: '🛍️',
    color: '#38BDF8',
    type: 'EXPENSE',
  },
  entertainment: {
    label: 'Entertainment',
    icon: '🎬',
    color: '#A855F7',
    type: 'EXPENSE',
  },
  health: {
    label: 'Health',
    icon: '💊',
    color: '#FB7185',
    type: 'EXPENSE',
  },
  utilities: {
    label: 'Utilities',
    icon: '💡',
    color: '#FBBF24',
    type: 'EXPENSE',
  },
  rent: {
    label: 'Rent',
    icon: '🏠',
    color: '#C084FC',
    type: 'EXPENSE',
  },
  education: {
    label: 'Education',
    icon: '📚',
    color: '#34D399',
    type: 'EXPENSE',
  },
  travel: {
    label: 'Travel',
    icon: '✈️',
    color: '#F59E0B',
    type: 'EXPENSE',
  },
  insurance: {
    label: 'Insurance',
    icon: '🛡️',
    color: '#60A5FA',
    type: 'EXPENSE',
  },
  subscriptions: {
    label: 'Subscriptions',
    icon: '📱',
    color: '#F472B6',
    type: 'EXPENSE',
  },
  emi: {
    label: 'EMI / Loan',
    icon: '🏦',
    color: '#F43F5E',
    type: 'EXPENSE',
  },
  personal_care: {
    label: 'Personal Care',
    icon: '💇',
    color: '#FB923C',
    type: 'EXPENSE',
  },
  other: {
    label: 'Other',
    icon: '📦',
    color: '#94A3B8',
    type: 'EXPENSE',
  },

  // ── INCOME (6) ────────────────────────────────────────────
  salary: {
    label: 'Salary',
    icon: '💼',
    color: '#00E599',
    type: 'INCOME',
  },
  freelance: {
    label: 'Freelance',
    icon: '💻',
    color: '#10B981',
    type: 'INCOME',
  },
  business: {
    label: 'Business',
    icon: '🏢',
    color: '#00D2B4',
    type: 'INCOME',
  },
  investment: {
    label: 'Investment',
    icon: '📈',
    color: '#22C55E',
    type: 'INCOME',
  },
  gift: {
    label: 'Gift',
    icon: '🎁',
    color: '#6366F1',
    type: 'INCOME',
  },
  other_income: {
    label: 'Other Income',
    icon: '💰',
    color: '#8B5CF6',
    type: 'INCOME',
  },
} as const

// ── DERIVED HELPERS ───────────────────────────────────────────

export type CategoryKey = keyof typeof CATEGORIES

export const EXPENSE_CATEGORIES = Object.entries(CATEGORIES)
  .filter(([, v]) => v.type === 'EXPENSE')
  .map(([k, v]) => ({ key: k as CategoryKey, ...v }))

export const INCOME_CATEGORIES = Object.entries(CATEGORIES)
  .filter(([, v]) => v.type === 'INCOME')
  .map(([k, v]) => ({ key: k as CategoryKey, ...v }))

// single lookup by key - use this everywhere instead of CATEGORIES[key]
export const getCategoryConfig = (key: CategoryKey) => CATEGORIES[key] ?? CATEGORIES.other

// used in Gemini prompts - gives the model the full list of valid keys
export const CATEGORY_KEYS_EXPENSE = EXPENSE_CATEGORIES.map(c => c.key)
export const CATEGORY_KEYS_INCOME = INCOME_CATEGORIES.map(c => c.key)
