import { useRef, useEffect } from 'react'
import styles from './SimulationCanvas.module.css'

const COLORS = {
  bg: '#faf8f5',
  queue: '#0d9488',
  server: '#d97706',
  serverIdle: '#e7e5e4',
  entity: '#0d9488',
  entityServing: '#d97706',
  text: '#78716c',
  border: '#e7e5e4',
}

export default function SimulationCanvas({ snapshot, numServers = 1, capacity }) {
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

    // Clear
    ctx.fillStyle = COLORS.bg
    ctx.fillRect(0, 0, W, H)

    const entitySize = 14
    const gap = 4
    const serverW = 50
    const serverH = 40
    const serverGap = 8

    // Layout: queue on left, servers on right
    const serversX = W - 80
    const queueStartX = serversX - 30
    const totalServerH = numServers * serverH + (numServers - 1) * serverGap
    const serversY = (H - totalServerH) / 2

    // Draw servers
    for (let i = 0; i < numServers; i++) {
      const sy = serversY + i * (serverH + serverGap)
      const isBusy = snapshot.servers[i]?.busy

      ctx.fillStyle = isBusy ? COLORS.server : COLORS.serverIdle
      ctx.strokeStyle = COLORS.border
      ctx.lineWidth = 1
      roundRect(ctx, serversX - serverW / 2, sy, serverW, serverH, 6)
      ctx.fill()
      ctx.stroke()

      // Server label
      ctx.fillStyle = isBusy ? '#fff' : COLORS.text
      ctx.font = '11px IBM Plex Sans'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(isBusy ? 'Busy' : 'Idle', serversX, sy + serverH / 2)

      // Entity being served
      if (isBusy) {
        const ex = serversX - serverW / 2 - entitySize - 6
        const ey = sy + (serverH - entitySize) / 2
        ctx.fillStyle = COLORS.entityServing
        roundRect(ctx, ex, ey, entitySize, entitySize, 3)
        ctx.fill()
      }
    }

    // Draw queue
    const queueLen = snapshot.queueLength
    const maxDisplay = Math.min(queueLen, Math.floor((queueStartX - 40) / (entitySize + gap)))
    const queueY = H / 2 - entitySize / 2

    for (let i = 0; i < maxDisplay; i++) {
      const x = queueStartX - (i + 1) * (entitySize + gap)
      ctx.fillStyle = COLORS.entity
      roundRect(ctx, x, queueY, entitySize, entitySize, 3)
      ctx.fill()
    }

    // Queue count label
    ctx.fillStyle = COLORS.text
    ctx.font = '11px IBM Plex Sans'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`Queue: ${queueLen}`, 10, H - 10)

    // Capacity indicator
    if (capacity && capacity !== Infinity) {
      const systemLen = snapshot.systemLength
      ctx.fillStyle = COLORS.text
      ctx.textAlign = 'right'
      ctx.fillText(`System: ${systemLen}/${capacity}`, W - 10, H - 10)
    }

    // Arrow from queue to servers
    ctx.strokeStyle = COLORS.border
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(queueStartX - 5, H / 2)
    ctx.lineTo(serversX - serverW / 2 - entitySize - 12, H / 2)
    ctx.stroke()
    ctx.setLineDash([])

  }, [snapshot, numServers, capacity])

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
