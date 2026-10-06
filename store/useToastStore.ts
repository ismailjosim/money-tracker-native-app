import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastState {
  visible: boolean
  message: string
  type: ToastType
  showToast: (message: string, type?: ToastType, duration?: number) => void
  hideToast: () => void
}

let timeoutId: any = null

export const useToastStore = create<ToastState>(set => ({
  visible: false,
  message: '',
  type: 'success',
  showToast: (message, type = 'success', duration = 3000) => {
    if (timeoutId) clearTimeout(timeoutId)
    set({ visible: true, message, type })
    timeoutId = setTimeout(() => {
      set({ visible: false })
    }, duration)
  },
  hideToast: () => {
    if (timeoutId) clearTimeout(timeoutId)
    set({ visible: false })
  },
}))

export const toast = {
  success: (msg: string, duration?: number) =>
    useToastStore.getState().showToast(msg, 'success', duration),
  error: (msg: string, duration?: number) =>
    useToastStore.getState().showToast(msg, 'error', duration),
  info: (msg: string, duration?: number) =>
    useToastStore.getState().showToast(msg, 'info', duration),
}
