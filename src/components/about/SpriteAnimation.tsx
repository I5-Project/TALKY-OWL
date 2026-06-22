'use client'

import { useEffect, useRef } from 'react'
import styles from './SpriteAnimation.module.scss'

interface SpriteAnimationProps {
  src: string
  frameCount: number
  columns: number
  frameWidth: number
  frameHeight: number
  fps?: number
  className?: string
}

export default function SpriteAnimation({
  src,
  frameCount,
  columns,
  frameWidth,
  frameHeight,
  fps = 12,
  className,
}: SpriteAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = src

    let currentFrame = 0
    let animationId: number | null = null
    let disposed = false | null = null
    let disposed = false
    let lastTime = 0
    const interval = 1000 / fps

    const draw = (timestamp: number) => {
      if (disposed) return

      if (disposed) return

      if (timestamp - lastTime >= interval) {
        lastTime = timestamp

        const col = currentFrame % columns
        const row = Math.floor(currentFrame / columns)

        ctx.clearRect(0, 0, frameWidth, frameHeight)
        ctx.drawImage(
          img,
          col * frameWidth,
          row * frameHeight,
          frameWidth,
          frameHeight,
          0,
          0,
          frameWidth,
          frameHeight
        )

        currentFrame = (currentFrame + 1) % frameCount
      }

      animationId = requestAnimationFrame(draw)
    }

    img.onload = () => {
      if (disposed) return
      if (disposed) return
      animationId = requestAnimationFrame(draw)
    }

    return () => {
      disposed = true
      img.onload = null
      if (animationId !== null) cancelAnimationFrame(animationId)
    }
  }, [src, frameCount, columns, frameWidth, frameHeight, fps])

  return (
    <canvas
      ref={canvasRef}
      width={frameWidth}
      height={frameHeight}
      className={`${styles.sprite} ${className ?? ''}`}
    />
  )
}
