import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useColdLaunch } from './useColdLaunch'

describe('useColdLaunch', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns true once per session', () => {
    const first = renderHook(() => useColdLaunch())
    const second = renderHook(() => useColdLaunch())

    expect(first.result.current).toBe(true)
    expect(second.result.current).toBe(false)
  })
})
