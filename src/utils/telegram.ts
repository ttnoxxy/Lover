// Safely interact with Telegram WebApp SDK if available

interface TelegramWebApp {
  initData?: string
  initDataUnsafe?: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      photo_url?: string
    }
  }
  expand?: () => void
  close?: () => void
  ready?: () => void
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  themeParams?: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export const getTelegramWebApp = (): TelegramWebApp | undefined => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp
  }
  return undefined
}

export const initTelegramApp = () => {
  const tg = getTelegramWebApp()
  if (tg) {
    tg.ready?.()
    tg.expand?.()
  }
}

export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
  const tg = getTelegramWebApp()
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style)
  } else if ('vibrate' in navigator) {
    navigator.vibrate(style === 'heavy' ? 40 : style === 'medium' ? 25 : 15)
  }
}

export const triggerNotificationHaptic = (type: 'error' | 'success' | 'warning') => {
  const tg = getTelegramWebApp()
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.notificationOccurred(type)
  }
}
