import { create } from 'zustand'

export const BP_PAD = 768
export const BP_PC = 1024

export type LayoutMode = 'mobile' | 'pad' | 'pc'

function readMode(width = typeof window !== 'undefined' ? window.innerWidth : BP_PC): LayoutMode {
  if (width >= BP_PC) return 'pc'
  if (width >= BP_PAD) return 'pad'
  return 'mobile'
}

function applyDataset(next: LayoutMode): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.layout = next
}

interface LayoutState {
  mode: LayoutMode
  setMode: (mode: LayoutMode) => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
  mode: readMode(),
  setMode: (mode) => {
    applyDataset(mode)
    set({ mode })
  },
}))

let started = false

export function initLayoutMode(): void {
  if (typeof window === 'undefined' || started) return
  started = true
  const next = readMode()
  useLayoutStore.getState().setMode(next)
  window.addEventListener(
    'resize',
    () => {
      useLayoutStore.getState().setMode(readMode())
    },
    { passive: true },
  )
}

export function useLayoutMode() {
  const mode = useLayoutStore((s) => s.mode)
  return {
    mode,
    isMobile: mode === 'mobile',
    isPad: mode === 'pad',
    isPc: mode === 'pc',
    isTouchLayout: mode !== 'pc',
  }
}
