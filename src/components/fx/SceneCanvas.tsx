import { useEffect, useRef } from 'react'
import './SceneCanvas.css'

type SceneCanvasProps = {
  mode?: 'full' | 'soft'
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hue: number
  kind: 0 | 1 | 2
  spin: number
  a: number
}

function drawBag(ctx: CanvasRenderingContext2D, p: Particle, t: number): void {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.spin + t * 0.001)
  ctx.globalAlpha = p.a

  if (p.kind === 0) {
    ctx.fillStyle = `hsla(${p.hue}, 90%, 62%, 0.9)`
    ctx.fillRect(-p.r * 0.7, -p.r * 0.2, p.r * 1.4, p.r * 1.2)
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, -p.r * 0.2, p.r * 0.45, Math.PI, 0)
    ctx.stroke()
  } else if (p.kind === 1) {
    ctx.fillStyle = `hsla(${p.hue}, 95%, 60%, 0.95)`
    ctx.beginPath()
    ctx.moveTo(-p.r * 0.35, -p.r * 0.55)
    ctx.lineTo(p.r * 0.65, 0)
    ctx.lineTo(-p.r * 0.35, p.r * 0.55)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.beginPath()
    ctx.arc(0, 0, p.r, 0, Math.PI * 2)
    ctx.stroke()
  } else {
    ctx.strokeStyle = `hsla(${p.hue}, 95%, 58%, 0.85)`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, p.r * 0.35, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, p.r * 0.7, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = `hsla(${p.hue}, 95%, 58%, 0.95)`
    ctx.beginPath()
    ctx.arc(0, 0, p.r * 0.18, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

export default function SceneCanvas({ mode = 'full' }: SceneCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    const particles: Particle[] = []
    const soft = mode === 'soft'

    const resize = (): void => {
      const parent = canvas.parentElement
      const w = parent?.clientWidth || window.innerWidth
      const h = parent?.clientHeight || window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = soft ? Math.floor(Math.min(28, w / 40)) : Math.floor(Math.min(42, w / 28))
      particles.length = 0
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * (soft ? 0.25 : 0.45),
          vy: -0.15 - Math.random() * (soft ? 0.35 : 0.55),
          r: 8 + Math.random() * (soft ? 10 : 16),
          hue: [24, 338, 262][i % 3],
          kind: (i % 3) as 0 | 1 | 2,
          spin: Math.random() * Math.PI,
          a: soft ? 0.28 + Math.random() * 0.25 : 0.35 + Math.random() * 0.4,
        })
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const loop = (t: number): void => {
      if (!running) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)

      const g1 = ctx.createRadialGradient(w * 0.2, h * 0.25, 0, w * 0.2, h * 0.25, w * 0.45)
      g1.addColorStop(0, soft ? 'rgba(255,45,122,0.18)' : 'rgba(255,45,122,0.28)')
      g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, w, h)

      const g2 = ctx.createRadialGradient(w * 0.85, h * 0.7, 0, w * 0.85, h * 0.7, w * 0.4)
      g2.addColorStop(0, soft ? 'rgba(123,62,255,0.14)' : 'rgba(123,62,255,0.22)')
      g2.addColorStop(1, 'transparent')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -40) {
          p.y = h + 40
          p.x = Math.random() * w
        }
        if (p.x < -40) p.x = w + 40
        if (p.x > w + 40) p.x = -40
        drawBag(ctx, p, t)
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [mode])

  return <canvas ref={canvasRef} className="scene-canvas" aria-hidden="true" />
}
