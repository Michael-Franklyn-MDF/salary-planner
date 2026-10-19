import { useState } from 'react'

const COLD_LAUNCH_KEY = 'salary-planner-cold-launch'

export function useColdLaunch(): boolean {
  return useState(() => {
    try {
      if (sessionStorage.getItem(COLD_LAUNCH_KEY) !== null) return false
      sessionStorage.setItem(COLD_LAUNCH_KEY, '1')
      return true
    } catch {
      return false
    }
  })[0]
}

export function useReducedMotion(): boolean {
  return useState(() => {
    try {
      return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    } catch {
      return false
    }
  })[0]
}
