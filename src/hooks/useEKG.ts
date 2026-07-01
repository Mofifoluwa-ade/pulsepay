'use client'

import { useEffect, useRef } from 'react'

export function useEKG(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    let t = 0

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, W, H)
      ctx.beginPath()
      ctx.strokeStyle = '#C1121F'
      ctx.lineWidth = 1.5
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'

      for (let x = 0; x < W; x++) {
        const phase = ((x + t) % 80) / 80
        let y = H / 2

        if (phase < 0.3) {
          y = H / 2
        } else if (phase < 0.38) {
          y = H / 2 - ((phase - 0.3) / 0.08) * (H * 0.7)
        } else if (phase < 0.46) {
          y = H / 2 + ((phase - 0.38) / 0.08) * (H * 0.5)
        } else if (phase < 0.52) {
          y = H / 2 - ((phase - 0.46) / 0.06) * (H * 0.25)
        } else if (phase < 0.58) {
          y = H / 2 + ((phase - 0.52) / 0.06) * (H * 0.1)
        } else {
          y = H / 2
        }

        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }

      ctx.stroke()
      t += 0.8
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [active])

  return canvasRef
}
