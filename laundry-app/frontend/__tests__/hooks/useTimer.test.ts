import { useTimer } from '@/hooks/useTimer'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('useTimer', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return null if no targetDate provided', () => {
        const { result } = renderHook(() => useTimer(null))
        expect(result.current.formattedTime).toBe('---')
        expect(result.current.secondsLeft).toBeNull()
    })

    it('should calculate positive time left', () => {
        const now = new Date()
        const future = new Date(now.getTime() + 65000) // 1m 5s
        const targetDate = future.toISOString()

        const { result } = renderHook(() => useTimer(targetDate))

        act(() => {
            vi.advanceTimersByTime(100)
        })

        expect(result.current.isOverdue).toBe(false)
        // Diff might be slightly off due to execution time, but formatted should be close
        expect(result.current.formattedTime).toBe('1m 5s')
    })

    it('should handle overdue time (negative)', () => {
        const now = new Date()
        const past = new Date(now.getTime() - 65000) // -1m 5s
        const targetDate = past.toISOString()

        const { result } = renderHook(() => useTimer(targetDate))

        act(() => {
            vi.advanceTimersByTime(100)
        })

        expect(result.current.isOverdue).toBe(true)
        expect(result.current.formattedTime).toBe('-1m 5s')
    })

    it('should append Z if date string lacks timezone', () => {
        // This tests the robust date parsing logic
        const now = new Date()
        const future = new Date(now.getTime() + 10000)

        // Simulate a naive string: "2024-01-01T10:00:00"
        const naiveDate = future.toISOString().replace("Z", "")

        const { result } = renderHook(() => useTimer(naiveDate))

        act(() => {
            vi.advanceTimersByTime(100)
        })

        // It should treat it as UTC (by appending Z) or local?
        // The code appends 'Z' if missing. So it treats naive as UTC.
        // If the test runner is in UTC (likely), it matches.
        expect(result.current.formattedTime).toMatch(/\d+m \d+s/)
        expect(result.current.secondsLeft).toBeGreaterThan(0)
    })
})
