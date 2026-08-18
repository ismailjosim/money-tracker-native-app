import { TransactionFilters } from '@/types'

export const queryKeys = {
  accounts: (userId?: string) => ['accounts', userId] as const,
  transactions: (userId?: string, filters: TransactionFilters = {}) =>
    ['transactions', userId, filters] as const,
  budget: (userId?: string) => ['budget', userId] as const,
}
