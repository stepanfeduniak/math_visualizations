import { useRef, useEffect } from 'react'
import styles from './SpringMassDamperCanvas.module.css'

const COLORS = {
  bg: '#faf8f5',
  wall: '#78716c',
  spring: '#0d9488',
  damper: '#d97706',
  mass: '#1c1917',
  massFill: '#f5f5f4',
  text: '#78716c',
  ground: '#e7e5e4',
}

export default function SpringMassDamperCanvas({ snapshot }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !snapshot) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const W = rect.width
    const H = rect.height

    ctx.fillStyle = COLORS.bg
    ctx.fillRect(0, 0, W, H)

    const wallX = 40
    const massW = 60
    const massH = 50
    const centerY = H / 2
    const restX = W * 0.5 // rest position of mass center

    // Scale position for visualization (1 unit = 80px)
    const pos = snapshot.position * 80
    const massX = restX + pos

    // Draw ground line
    ctx.strokeStyle = COLORS.ground
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(wallX, centerY + massH / 2 + 10)
    ctx.lineTo(W - 20, centerY + massH / 2 + 10)
    ctx.stroke()

    // Ground hatching
    for (let x = wallX; x < W - 20; x += 12) {
      ctx.beginPath()
      ctx.moveTo(x, centerY + massH / 2 + 10)
      ctx.lineTo(x - 6, centerY + massH / 2 + 18)
      ctx.stroke()
    }

    // Draw wall
    ctx.fillStyle = COLORS.wall
    ctx.fillRect(wallX - 8, centerY - 60, 8, 120)
    ctx.strokeStyle = COLORS.wall
    ctx.lineWidth = 1
    // Wall hatching
    for (let y = centerY - 60; y < centerY + 60; y += 8) {
      ctx.beginPath()
      ctx.moveTo(wallX - 8, y)
      ctx.lineTo(wallX, y + 8)
      ctx.stroke()
    }

    // Spring (top connection: zigzag from wall to mass)
    const springY = centerY - 12
    const springStartX = wallX
    const springEndX = massX - massW / 2
    drawSpring(ctx, springStartX, springY, springEndX, springY)

    // Damper (bottom connection: piston from wall to mass)
    const damperY = centerY + 12
    const damperStartX = wallX
    const damperEndX = massX - massW / 2
    drawDamper(ctx, damperStartX, damperY, damperEndX, damperY)

    // Draw mass block
    ctx.fillStyle = COLORS.massFill
    ctx.strokeStyle = COLORS.mass
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.rect(massX - massW / 2, centerY - massH / 2, massW, massH)
    ctx.fill()
    ctx.stroke()

    // Mass label
    ctx.fillStyle = COLORS.mass
    ctx.font = '600 13px IBM Plex Sans'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('m', massX, centerY)

    // Force arrow (if nonzero position or applied force)
    if (Math.abs(snapshot.velocity) > 0.01 || Math.abs(snapshot.position) > 0.01) {
      const arrowLen = Math.min(Math.abs(snapshot.velocity) * 25, 50)
      const arrowDir = snapshot.velocity >= 0 ? 1 : -1
      const arrowStartX = massX + massW / 2 + 5
      const arrowEndX = arrowStartX + arrowLen * arrowDir

      ctx.strokeStyle = '#e11d48'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(arrowStartX, centerY)
      ctx.lineTo(arrowEndX, centerY)
      ctx.stroke()

      // Arrowhead
      ctx.fillStyle = '#e11d48'
      ctx.beginPath()
      ctx.moveTo(arrowEndX, centerY)
      ctx.lineTo(arrowEndX - 6 * arrowDir, centerY - 4)
      ctx.lineTo(arrowEndX - 6 * arrowDir, centerY + 4)
      ctx.closePath()
      ctx.fill()
    }

    // Labels
    ctx.fillStyle = COLORS.text
    ctx.font = '11px IBM Plex Sans'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`x = ${snapshot.position.toFixed(3)}`, 10, H - 10)

    ctx.textAlign = 'center'
    ctx.fillText('Spring', (wallX + massX - massW / 2) / 2, springY - 8)

    ctx.fillStyle = COLORS.damper
    ctx.fillText('Damper', (wallX + massX - massW / 2) / 2, damperY + 20)

  }, [snapshot])

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}

function drawSpring(ctx, x1, y1, x2, y2) {
  const segments = 12
  const len = x2 - x1
  const leadIn = 15
  const amplitude = 8

  ctx.strokeStyle = COLORS.spring
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x1 + leadIn, y1)

  const zigLen = len - 2 * leadIn
  const segLen = zigLen / segments

  for (let i = 0; i < segments; i++) {
    const sx = x1 + leadIn + (i + 0.5) * segLen
    const sy = y1 + (i % 2 === 0 ? -amplitude : amplitude)
    ctx.lineTo(sx, sy)
  }

  ctx.lineTo(x2 - leadIn, y2)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function drawDamper(ctx, x1, y1, x2, y2) {
  const len = x2 - x1
  const bodyW = 24
  const bodyH = 12
  const midX = x1 + len * 0.4

  ctx.strokeStyle = COLORS.damper
  ctx.lineWidth = 1.5

  // Rod from wall to cylinder
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(midX - bodyW / 2, y1)
  ctx.stroke()

  // Cylinder body
  ctx.beginPath()
  ctx.rect(midX - bodyW / 2, y1 - bodyH / 2, bodyW, bodyH)
  ctx.stroke()

  // Piston rod from cylinder to mass
  ctx.beginPath()
  ctx.moveTo(midX + bodyW / 2, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()

  // Piston inside cylinder
  const pistonX = midX
  ctx.beginPath()
  ctx.moveTo(pistonX, y1 - bodyH / 2 + 2)
  ctx.lineTo(pistonX, y1 + bodyH / 2 - 2)
  ctx.stroke()
}
