"use client"

import { useEffect, useRef } from "react"
import { Application, Container, Text, Graphics } from "pixi.js"

export default function Pathfinder({ round = 1 }) {
  const containerRef = useRef(null)
  const appRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (appRef.current) return // prevent double mount in StrictMode

    let destroyed = false

    const init = async () => {
      const app = new Application()

      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        background: "#121212",
        antialias: true,
      })

      if (destroyed) {
        app.destroy(true)
        return
      }

      containerRef.current.appendChild(app.canvas)
      appRef.current = app

      const gameContainer = new Container()
      app.stage.addChild(gameContainer)

      // -------------------------
      // ROUND DATA
      // -------------------------

      let expectedOrder = []
      let data = []

      if (round === 1) {
        expectedOrder = Array.from({ length: 20 }, (_, i) => i + 1)
        data = [...expectedOrder]
      }

      if (round === 2) {
        for (let i = 1; i <= 10; i++) {
          expectedOrder.push(i)
          expectedOrder.push(String.fromCharCode(64 + i))
        }
        data = [...expectedOrder]
      }

      shuffle(data)

      // -------------------------
      // GAME STATE
      // -------------------------

      let currentIndex = 0
      let mistakes = 0
      let userClicks = []
      const startTime = Date.now()

      const radius = 35
      const padding = radius + 10
      const placedPositions = []

      function isOverlapping(x, y) {
        for (let pos of placedPositions) {
          const dx = pos.x - x
          const dy = pos.y - y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < radius * 2 + 10) return true
        }
        return false
      }

      // -------------------------
      // CREATE CIRCLES
      // -------------------------

      data.forEach((value) => {
        const item = new Container()

        const bg = new Graphics()
        bg.circle(0, 0, radius)
        bg.fill(0x2c2c2c)
        bg.stroke({ width: 2, color: 0xffffff })

        const text = new Text({
          text: String(value),
          style: {
            fill: 0xffffff,
            fontSize: 24,
            fontWeight: "bold",
          },
        })

        text.anchor.set(0.5)

        item.addChild(bg)
        item.addChild(text)

        // Random position without overlap
        let x, y
        let placed = false
        let attempts = 0

        while (!placed && attempts < 200) {
          x = padding + Math.random() * (app.screen.width - padding * 2)
          y = padding + Math.random() * (app.screen.height - padding * 2)

          if (!isOverlapping(x, y)) {
            placed = true
            placedPositions.push({ x, y })
          }

          attempts++
        }

        item.x = x
        item.y = y

        item.eventMode = "static"
        item.cursor = "pointer"
        item.value = value

        item.on("pointerdown", () => {
          const clickData = {
            value: item.value,
            expected: expectedOrder[currentIndex],
            correct: item.value === expectedOrder[currentIndex],
            timestamp: Date.now(),
          }

          userClicks.push(clickData)

          if (item.value === expectedOrder[currentIndex]) {
            bg.tint = 0x00ff00
            item.eventMode = "none"

            setTimeout(() => {
              bg.tint = 0xffffff
              item.alpha = 0.5
            }, 200)

            currentIndex++

            if (currentIndex >= expectedOrder.length) {
              const endTime = Date.now()

              const result = {
                round,
                clicks: userClicks,
                mistakes,
                duration: endTime - startTime,
                finishedAt: new Date().toISOString(),
              }

              localStorage.setItem(
                "pathfinderResult",
                JSON.stringify(result)
              )

              window.location.href = "/results"
            }
          } else {
            mistakes++
            bg.tint = 0xff0000
            setTimeout(() => {
              bg.tint = 0xffffff
            }, 200)
          }
        })

        gameContainer.addChild(item)
      })
    }

    init()

    return () => {
      destroyed = true
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
    }
  }, [round])

  return (
    <div
      ref={containerRef}
      style={{ width: "100vw", height: "100vh" }}
    />
  )
}

// -------------------------
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5)
}