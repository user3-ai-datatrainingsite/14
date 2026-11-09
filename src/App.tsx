import { useState, useEffect, useRef, useCallback } from 'react'

interface CelestialBody {
  x: number
  y: number
  radius: number
  color: string
  name: string
}

interface TrailPoint {
  x: number
  y: number
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef<number>(0)
  const earthTrailRef = useRef<TrailPoint[]>([])
  const moonTrailRef = useRef<TrailPoint[]>([])

  const [speed, setSpeed] = useState(1)
  const [paused, setPaused] = useState(false)
  const [showTrails, setShowTrails] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [showInfo, setShowInfo] = useState(true)
  const [earthAngle, setEarthAngle] = useState(0)
  const [moonAngle, setMoonAngle] = useState(0)
  const [trailLength, setTrailLength] = useState(200)

  const pausedRef = useRef(paused)
  const speedRef = useRef(speed)
  const showTrailsRef = useRef(showTrails)
  const showLabelsRef = useRef(showLabels)
  const zoomRef = useRef(zoom)
  const trailLengthRef = useRef(trailLength)

  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { showTrailsRef.current = showTrails }, [showTrails])
  useEffect(() => { showLabelsRef.current = showLabels }, [showLabels])
  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { trailLengthRef.current = trailLength }, [trailLength])

  const drawStar = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`
    ctx.fill()
  }, [])

  const drawSun = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    // Sun glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3)
    gradient.addColorStop(0, 'rgba(255, 200, 50, 0.8)')
    gradient.addColorStop(0.3, 'rgba(255, 150, 0, 0.4)')
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)')
    ctx.beginPath()
    ctx.arc(x, y, radius * 3, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    // Sun body
    const sunGradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    sunGradient.addColorStop(0, '#fff7e0')
    sunGradient.addColorStop(0.3, '#ffdd44')
    sunGradient.addColorStop(0.7, '#ffaa00')
    sunGradient.addColorStop(1, '#ff6600')
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = sunGradient
    ctx.fill()
  }, [])

  const drawEarth = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    // Earth glow
    const glowGradient = ctx.createRadialGradient(x, y, radius, x, y, radius * 1.5)
    glowGradient.addColorStop(0, 'rgba(100, 180, 255, 0.3)')
    glowGradient.addColorStop(1, 'rgba(100, 180, 255, 0)')
    ctx.beginPath()
    ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2)
    ctx.fillStyle = glowGradient
    ctx.fill()

    // Earth body
    const earthGradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius)
    earthGradient.addColorStop(0, '#4da6ff')
    earthGradient.addColorStop(0.4, '#2277cc')
    earthGradient.addColorStop(0.7, '#1155aa')
    earthGradient.addColorStop(1, '#0a3366')
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = earthGradient
    ctx.fill()

    // Continents (simplified)
    ctx.beginPath()
    ctx.arc(x + radius * 0.2, y - radius * 0.1, radius * 0.35, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(50, 150, 50, 0.6)'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x - radius * 0.3, y + radius * 0.2, radius * 0.25, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(50, 150, 50, 0.5)'
    ctx.fill()
  }, [])

  const drawMoon = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    // Moon glow
    const glowGradient = ctx.createRadialGradient(x, y, radius, x, y, radius * 1.4)
    glowGradient.addColorStop(0, 'rgba(200, 200, 220, 0.2)')
    glowGradient.addColorStop(1, 'rgba(200, 200, 220, 0)')
    ctx.beginPath()
    ctx.arc(x, y, radius * 1.4, 0, Math.PI * 2)
    ctx.fillStyle = glowGradient
    ctx.fill()

    // Moon body
    const moonGradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius)
    moonGradient.addColorStop(0, '#f0f0f0')
    moonGradient.addColorStop(0.5, '#cccccc')
    moonGradient.addColorStop(1, '#888888')
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = moonGradient
    ctx.fill()

    // Craters
    ctx.beginPath()
    ctx.arc(x + radius * 0.2, y - radius * 0.2, radius * 0.15, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(100, 100, 100, 0.4)'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x - radius * 0.3, y + radius * 0.1, radius * 0.1, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(100, 100, 100, 0.3)'
    ctx.fill()
  }, [])

  const drawTrail = useCallback((ctx: CanvasRenderingContext2D, trail: TrailPoint[], color: string) => {
    if (trail.length < 2) return
    for (let i = 1; i < trail.length; i++) {
      const alpha = i / trail.length
      ctx.beginPath()
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y)
      ctx.lineTo(trail[i].x, trail[i].y)
      ctx.strokeStyle = color.replace('ALPHA', (alpha * 0.8).toFixed(2))
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Generate stars
    const stars: { x: number; y: number; size: number }[] = []
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5
      })
    }

    const animate = () => {
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2

      // Clear
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, width, height)

      // Draw stars
      stars.forEach(star => {
        drawStar(ctx, star.x, star.y, star.size)
      })

      const currentZoom = zoomRef.current

      // Orbital parameters
      const earthOrbitRadius = Math.min(width, height) * 0.3 * currentZoom
      const moonOrbitRadius = earthOrbitRadius * 0.22
      const sunRadius = 25 * currentZoom
      const earthRadius = 12 * currentZoom
      const moonRadius = 5 * currentZoom

      // Calculate positions
      const earthAngularSpeed = 0.002 * speedRef.current
      const moonAngularSpeed = 0.025 * speedRef.current

      if (!pausedRef.current) {
        timeRef.current += 1
      }

      const currentEarthAngle = timeRef.current * earthAngularSpeed
      const currentMoonAngle = timeRef.current * moonAngularSpeed

      const earthX = centerX + Math.cos(currentEarthAngle) * earthOrbitRadius
      const earthY = centerY + Math.sin(currentEarthAngle) * earthOrbitRadius

      const moonX = earthX + Math.cos(currentMoonAngle) * moonOrbitRadius
      const moonY = earthY + Math.sin(currentMoonAngle) * moonOrbitRadius

      // Update trail
      if (!pausedRef.current) {
        earthTrailRef.current.push({ x: earthX, y: earthY })
        moonTrailRef.current.push({ x: moonX, y: moonY })

        if (earthTrailRef.current.length > trailLengthRef.current) {
          earthTrailRef.current.shift()
        }
        if (moonTrailRef.current.length > trailLengthRef.current) {
          moonTrailRef.current.shift()
        }
      }

      // Draw orbit paths (dotted)
      ctx.setLineDash([4, 6])
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(centerX, centerY, earthOrbitRadius, 0, Math.PI * 2)
      ctx.stroke()

      ctx.strokeStyle = 'rgba(200, 200, 220, 0.15)'
      ctx.beginPath()
      ctx.arc(earthX, earthY, moonOrbitRadius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw trails
      if (showTrailsRef.current) {
        drawTrail(ctx, earthTrailRef.current, 'rgba(100, 180, 255, ALPHA)')
        drawTrail(ctx, moonTrailRef.current, 'rgba(200, 200, 220, ALPHA)')
      }

      // Draw connection line (Earth-Moon)
      ctx.beginPath()
      ctx.moveTo(earthX, earthY)
      ctx.lineTo(moonX, moonY)
      ctx.strokeStyle = 'rgba(200, 200, 220, 0.15)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Draw Sun
      drawSun(ctx, centerX, centerY, sunRadius)

      // Draw Earth
      drawEarth(ctx, earthX, earthY, earthRadius)

      // Draw Moon
      drawMoon(ctx, moonX, moonY, moonRadius)

      // Draw labels
      if (showLabelsRef.current) {
        ctx.font = `${12 * currentZoom}px sans-serif`
        ctx.textAlign = 'center'

        ctx.fillStyle = '#ffdd44'
        ctx.fillText('太阳', centerX, centerY + sunRadius + 18 * currentZoom)

        ctx.fillStyle = '#4da6ff'
        ctx.fillText('地球', earthX, earthY + earthRadius + 15 * currentZoom)

        ctx.fillStyle = '#cccccc'
        ctx.fillText('月球', moonX, moonY + moonRadius + 12 * currentZoom)
      }

      // Update state for info panel
      setEarthAngle(((currentEarthAngle * 180 / Math.PI) % 360 + 360) % 360)
      setMoonAngle(((currentMoonAngle * 180 / Math.PI) % 360 + 360) % 360)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [drawStar, drawSun, drawEarth, drawMoon, drawTrail])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  const resetSimulation = () => {
    timeRef.current = 0
    earthTrailRef.current = []
    moonTrailRef.current = []
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a1a]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white/90 tracking-wide">
          🌍 地球-月球轨迹模拟器 🌙
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Earth-Moon Orbit Simulator
        </p>
      </div>

      {/* Control Panel */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 w-[90%] max-w-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Speed Control */}
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs text-white/60 block mb-1">速度: {speed.toFixed(1)}x</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
          </div>

          {/* Zoom Control */}
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs text-white/60 block mb-1">缩放: {zoom.toFixed(1)}x</label>
            <input
              type="range"
              min="0.3"
              max="2"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-green-400"
            />
          </div>

          {/* Trail Length */}
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs text-white/60 block mb-1">轨迹长度: {trailLength}</label>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={trailLength}
              onChange={(e) => setTrailLength(parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Buttons */}
          <div className="col-span-2 md:col-span-1 flex flex-wrap gap-2 items-center justify-center">
            <button
              onClick={() => setPaused(!paused)}
              className="px-3 py-1.5 rounded-lg bg-blue-500/30 hover:bg-blue-500/50 text-white text-sm border border-blue-400/30 transition-all"
            >
              {paused ? '▶ 播放' : '⏸ 暂停'}
            </button>
            <button
              onClick={resetSimulation}
              className="px-3 py-1.5 rounded-lg bg-orange-500/30 hover:bg-orange-500/50 text-white text-sm border border-orange-400/30 transition-all"
            >
              🔄 重置
            </button>
          </div>
        </div>

        {/* Toggle buttons */}
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              showTrails
                ? 'bg-blue-500/40 text-blue-200 border border-blue-400/50'
                : 'bg-white/10 text-white/50 border border-white/10'
            }`}
          >
            轨迹线
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              showLabels
                ? 'bg-green-500/40 text-green-200 border border-green-400/50'
                : 'bg-white/10 text-white/50 border border-white/10'
            }`}
          >
            标签
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              showInfo
                ? 'bg-purple-500/40 text-purple-200 border border-purple-400/50'
                : 'bg-white/10 text-white/50 border border-white/10'
            }`}
          >
            信息面板
          </button>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-20 right-4 z-10 bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/10 w-64">
          <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
            <span>📊</span> 轨道数据
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-blue-300">🌍 地球公转角度</span>
              <span className="text-white/80 font-mono">{earthAngle.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">🌙 月球公转角度</span>
              <span className="text-white/80 font-mono">{moonAngle.toFixed(1)}°</span>
            </div>
            <hr className="border-white/10" />
            <div className="flex justify-between items-center">
              <span className="text-white/60">地球公转周期</span>
              <span className="text-white/80 font-mono">365.25 天</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">月球公转周期</span>
              <span className="text-white/80 font-mono">27.3 天</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">地月距离</span>
              <span className="text-white/80 font-mono">384,400 km</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">日地距离</span>
              <span className="text-white/80 font-mono">149,600,000 km</span>
            </div>
            <hr className="border-white/10" />
            <div className="flex justify-between items-center">
              <span className="text-white/60">运行状态</span>
              <span className={`font-mono ${paused ? 'text-yellow-400' : 'text-green-400'}`}>
                {paused ? '⏸ 已暂停' : '▶ 运行中'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">模拟速度</span>
              <span className="text-white/80 font-mono">{speed.toFixed(1)}x</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-20 left-4 z-10 bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/10">
        <h3 className="text-sm font-bold text-white/80 mb-2">图例</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(255,200,50,0.8)]"></div>
            <span className="text-white/70">太阳</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(100,180,255,0.6)]"></div>
            <span className="text-white/70">地球</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300 shadow-[0_0_4px_rgba(200,200,220,0.4)]"></div>
            <span className="text-white/70">月球</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-gradient-to-r from-transparent to-blue-400"></div>
            <span className="text-white/70">地球轨迹</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-white/70">月球轨迹</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
