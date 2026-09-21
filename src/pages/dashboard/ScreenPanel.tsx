import type { ReactNode } from 'react'
import './ScreenPanel.css'

type ScreenPanelProps = {
  title: string
  extra?: ReactNode
  children: ReactNode
}

export function ScreenPanel({ title, extra, children }: ScreenPanelProps) {
  return (
    <article className="frame">
      <span className="frame__corner frame__corner--tl" />
      <span className="frame__corner frame__corner--tr" />
      <span className="frame__corner frame__corner--bl" />
      <span className="frame__corner frame__corner--br" />
      <header className="frame__head">
        <h3 className="frame__title">{title}</h3>
        {extra}
      </header>
      <div className="frame__body">{children}</div>
    </article>
  )
}
