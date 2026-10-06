import { getCategoryConfig } from '@/constants/categories'
import type { Budget } from '@/lib/services/budgets'
import type { Transaction } from '@/lib/services/transactions'

import { format, isSameMonth, subDays } from 'date-fns'
import { formatPrice } from '../utils/utils'

// gemini-3.8-flash is the only model available to new API keys (Oct 2026)
// Other models (2.0-flash, 1.5-flash) return 404 for new keys
const GEMINI_MODEL = 'gemini-3.8-flash'
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

// Transient HTTP status codes worth retrying
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

const REQUEST_TIMEOUT_MS = 15_000 // 15s per attempt

/** Delay helper */
function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

/** Fetch with a timeout — rejects with AbortError if the server doesn't respond */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

function buildContext(transactions: Transaction[], budget: Budget | null, currency: string) {
  const now = new Date()
  const cutoff = subDays(now, 30)
  const recent = transactions.filter(tx => new Date(tx.date) >= cutoff)
  const thisMonthExpense = transactions
    .filter(tx => tx.type === 'EXPENSE' && isSameMonth(new Date(tx.date), now))
    .reduce((sum, tx) => sum + tx.amount, 0)

  const spentByCategory: Record<string, number> = {}
  let income = 0
  let expense = 0

  recent.forEach(tx => {
    if (tx.type === 'EXPENSE') {
      expense += tx.amount
      spentByCategory[tx.category] = (spentByCategory[tx.category] ?? 0) + tx.amount
    } else {
      income += tx.amount
    }
  })

  const categoryLines = Object.entries(spentByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([category, amount]) =>
        `- ${getCategoryConfig(category as any)?.label ?? category}: ${formatPrice(amount, currency)}`
    )
    .join('\n')

  const totalBudget =
    budget && typeof budget.amount === 'number' ? formatPrice(budget.amount, currency) : null
  const budgetLine = totalBudget
    ? `${formatPrice(thisMonthExpense, currency)} spent of ${totalBudget} monthly budget`
    : 'No monthly budget set.'

  const txLines = recent
    .slice(0, 40)
    .map(tx => {
      const categoryLabel = getCategoryConfig(tx.category as any)?.label ?? 'Other'
      const desc = tx.description ? ` | ${tx.description}` : ''
      const dateStr = format(new Date(tx.date), 'd MMM yyyy')
      const priceStr = formatPrice(tx.amount, currency)
      return `- ${dateStr} | ${tx.type} | ${categoryLabel} | ${priceStr}${desc}`
    })
    .join('\n')

  return `Last 30 days summary:
Total income: ${formatPrice(income, currency)}
Total expense: ${formatPrice(expense, currency)}

Spending by category:
${categoryLines || 'No expenses recorded.'}

Monthly budget:
${budgetLine}

Recent transactions:
${txLines || 'No transactions recorded.'}`
}

/**
 * Calls the Gemini API with exponential backoff retry for transient
 * errors (503 high demand, 429 rate limit, etc.).
 * Up to 5 attempts: delays are 1s, 2s, 4s, 8s between retries.
 */
async function callGemini(prompt: string, apiKey: string, maxRetries = 5): Promise<string> {
  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent`
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Exponential backoff: 0ms, 1s, 2s, 4s, 8s
    if (attempt > 0) await delay(Math.min(1000 * 2 ** (attempt - 1), 8000))

    let res: Response
    try {
      res = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          }),
        },
        REQUEST_TIMEOUT_MS
      )
    } catch (networkErr: unknown) {
      const isTimeout = networkErr instanceof Error && networkErr.name === 'AbortError'
      lastError = isTimeout
        ? new Error('Request timed out — please try again.')
        : networkErr instanceof Error
          ? networkErr
          : new Error(String(networkErr))
      continue // retry on network / timeout failure
    }

    if (res.ok) {
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) throw new Error('No response from Gemini')
      return text as string
    }

    const errText = await res.text()

    if (res.status === 401) {
      throw new Error(
        'Gemini API authentication failed. Please check EXPO_PUBLIC_GEMINI_API_KEY in your .env.'
      )
    }

    if (RETRYABLE_STATUSES.has(res.status)) {
      // 503 "high demand" is always transient — keep retrying
      lastError = new Error(`Gemini temporarily unavailable (${res.status}). Retrying…`)
      continue
    }

    // Permanent failure (404, 400, etc.) — stop immediately
    throw new Error(`Gemini request failed (${res.status}): ${errText}`)
  }

  throw lastError ?? new Error('Gemini is currently overloaded. Please try again in a moment.')
}

export const askAssistant = async (
  question: string,
  transactions: Transaction[],
  budget: Budget | null,
  currency: string
) => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY')

  const context = buildContext(transactions, budget, currency)

  const prompt = `You are a helpful personal finance assistant inside the Wallex app. Answer the user's question using only the financial data below. Be concise and specific with numbers. If the data doesn't answer the question, say so. 
  ${context} 
  User question: ${question}`

  return callGemini(prompt, apiKey)
}
