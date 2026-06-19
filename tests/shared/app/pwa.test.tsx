import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOnlineStatus } from '@/shared/app/pwa'

describe('useOnlineStatus', () => {
  it('reflects navigator.onLine and updates on events', () => {
    const { result } = renderHook(() => useOnlineStatus())
    expect(typeof result.current).toBe('boolean')
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current).toBe(false)
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current).toBe(true)
  })
})
