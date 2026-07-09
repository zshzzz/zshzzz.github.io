import { useCallback, useEffect, useRef, useState } from 'react'
import { getActiveTheme, type Theme } from '../lib/theme'

// --- Convolution reverb ---
function createReverb(ctx: AudioContext, duration: number, decay: number): ConvolverNode {
  const rate = ctx.sampleRate
  const length = rate * duration
  const impulse = ctx.createBuffer(2, length, rate)
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  const convolver = ctx.createConvolver()
  convolver.buffer = impulse
  return convolver
}

function startDefaultTheme(ctx: AudioContext, master: GainNode) {
  const dryGain = ctx.createGain()
  dryGain.gain.value = 0.55
  dryGain.connect(master)

  const reverb = createReverb(ctx, 1.5, 3)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.15
  reverb.connect(reverbGain)
  reverbGain.connect(master)

  const melody = [
    [659.25, 0.12], [0, 0.06], [659.25, 0.12], [0, 0.06], [659.25, 0.12], [0, 0.06],
    [523.25, 0.12], [659.25, 0.18], [0, 0.06],
    [783.99, 0.24], [0, 0.18],
    [392.0, 0.24], [0, 0.18],
    [523.25, 0.18], [0, 0.06],
    [392.0, 0.18], [0, 0.06],
    [329.63, 0.18], [0, 0.06],
    [440.0, 0.12], [0, 0.06],
    [493.88, 0.12], [0, 0.06],
    [466.16, 0.1], [440.0, 0.18], [0, 0.06],
    [392.0, 0.12], [659.25, 0.12], [783.99, 0.12],
    [880.0, 0.18], [0, 0.06],
    [698.46, 0.12], [783.99, 0.18], [0, 0.06],
    [659.25, 0.18], [0, 0.06],
    [523.25, 0.12], [587.33, 0.12], [493.88, 0.18], [0, 0.12],
  ]

  const bass = [
    [130.81, 0.24], [0, 0.06], [130.81, 0.24], [0, 0.06],
    [130.81, 0.24], [0, 0.06], [130.81, 0.24], [0, 0.06],
    [98.0, 0.24], [0, 0.06], [98.0, 0.24], [0, 0.06],
    [130.81, 0.24], [0, 0.06], [130.81, 0.24], [0, 0.06],
    [110.0, 0.24], [0, 0.06], [110.0, 0.24], [0, 0.06],
    [98.0, 0.24], [0, 0.06], [130.81, 0.24], [0, 0.06],
    [130.81, 0.24], [0, 0.06], [110.0, 0.24], [0, 0.06],
    [98.0, 0.24], [0, 0.06], [98.0, 0.24], [0, 0.06],
  ]

  const melodyOsc = ctx.createOscillator()
  melodyOsc.type = 'square'
  const melodyGain = ctx.createGain()
  melodyGain.gain.value = 0.12
  melodyOsc.connect(melodyGain)
  melodyGain.connect(dryGain)
  melodyGain.connect(reverb)
  melodyOsc.start()

  const bassOsc = ctx.createOscillator()
  bassOsc.type = 'triangle'
  const bassGain = ctx.createGain()
  bassGain.gain.value = 0.15
  bassOsc.connect(bassGain)
  bassGain.connect(dryGain)
  bassOsc.start()

  function scheduleLoop(startAt: number) {
    let t = startAt
    for (const [freq, dur] of melody) {
      if (freq > 0) {
        melodyOsc.frequency.setValueAtTime(freq, t)
        melodyGain.gain.setValueAtTime(0.12, t)
        melodyGain.gain.exponentialRampToValueAtTime(0.04, t + dur * 0.8)
      } else {
        melodyGain.gain.setValueAtTime(0.001, t)
      }
      t += dur
    }
    t = startAt
    for (const [freq, dur] of bass) {
      if (freq > 0) {
        bassOsc.frequency.setValueAtTime(freq, t)
        bassGain.gain.setValueAtTime(0.15, t)
        bassGain.gain.exponentialRampToValueAtTime(0.05, t + dur * 0.8)
      } else {
        bassGain.gain.setValueAtTime(0.001, t)
      }
      t += dur
    }
  }

  const totalDuration = melody.reduce((sum, [, d]) => sum + d, 0)
  scheduleLoop(ctx.currentTime + 0.1)
  const loopInterval = setInterval(() => scheduleLoop(ctx.currentTime + 0.05), totalDuration * 1000)

  return () => {
    clearInterval(loopInterval)
    melodyOsc.stop()
    bassOsc.stop()
    melodyOsc.disconnect()
    melodyGain.disconnect()
    bassOsc.disconnect()
    bassGain.disconnect()
    reverb.disconnect()
    reverbGain.disconnect()
    dryGain.disconnect()
  }
}

function startInkTheme(ctx: AudioContext, master: GainNode) {
  // Soft ambient pads + floating arpeggio
  const reverb = createReverb(ctx, 4, 2.2)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.35
  reverb.connect(reverbGain)
  reverbGain.connect(master)

  const dryGain = ctx.createGain()
  dryGain.gain.value = 0.45
  dryGain.connect(master)

  const padNotes = [130.81, 164.81, 196.0]
  const pads = padNotes.map((freq, i) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const gain = ctx.createGain()
    gain.gain.value = 0.04 + i * 0.01
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.08 + i * 0.03
    lfoGain.gain.value = 0.02
    lfo.connect(lfoGain)
    lfoGain.connect(gain.gain)
    osc.connect(gain)
    gain.connect(dryGain)
    gain.connect(reverb)
    osc.start()
    lfo.start()
    return { osc, gain, lfo, lfoGain }
  })

  const arp = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63]
  let arpIdx = 0
  const lead = ctx.createOscillator()
  lead.type = 'triangle'
  lead.frequency.value = arp[0]
  const leadGain = ctx.createGain()
  leadGain.gain.value = 0.05
  lead.connect(leadGain)
  leadGain.connect(dryGain)
  leadGain.connect(reverb)
  lead.start()

  const interval = setInterval(() => {
    arpIdx = (arpIdx + 1) % arp.length
    const t = ctx.currentTime
    lead.frequency.setValueAtTime(arp[arpIdx], t)
    leadGain.gain.setValueAtTime(0.05, t)
    leadGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35)
  }, 480)

  return () => {
    clearInterval(interval)
    lead.stop()
    lead.disconnect()
    leadGain.disconnect()
    pads.forEach(({ osc, gain, lfo, lfoGain }) => {
      osc.stop()
      lfo.stop()
      osc.disconnect()
      gain.disconnect()
      lfo.disconnect()
      lfoGain.disconnect()
    })
    reverb.disconnect()
    reverbGain.disconnect()
    dryGain.disconnect()
  }
}

const THEME_ENGINES: Record<Theme, (ctx: AudioContext, master: GainNode) => () => void> = {
  default: startDefaultTheme,
  ink: startInkTheme,
}

const BAR_COUNT = 12

export default function VinylPlayer() {
  const [playing, setPlaying] = useState(false)
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(0.15))
  const audioCtxRef = useRef<AudioContext | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const themeRef = useRef<Theme>(getActiveTheme())
  const rafRef = useRef(0)

  const stopVisualizer = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setLevels(Array(BAR_COUNT).fill(0.12))
  }, [])

  const runVisualizer = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return
    const data = new Uint8Array(analyser.frequencyBinCount)

    function tick() {
      analyser!.getByteFrequencyData(data)
      const step = Math.floor(data.length / BAR_COUNT)
      const next = Array.from({ length: BAR_COUNT }, (_, i) => {
        let sum = 0
        for (let j = 0; j < step; j++) sum += data[i * step + j] || 0
        return Math.max(0.12, Math.min(1, (sum / step / 255) * 1.6))
      })
      setLevels(next)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const stopAudio = useCallback(() => {
    stopVisualizer()
    cleanupRef.current?.()
    cleanupRef.current = null
    analyserRef.current = null
    audioCtxRef.current?.close()
    audioCtxRef.current = null
  }, [stopVisualizer])

  const startAudio = useCallback(() => {
    stopAudio()
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    themeRef.current = getActiveTheme()

    const master = ctx.createGain()
    master.gain.value = 0.7

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 64
    analyser.smoothingTimeConstant = 0.78
    analyserRef.current = analyser

    master.connect(analyser)
    analyser.connect(ctx.destination)

    cleanupRef.current = THEME_ENGINES[themeRef.current](ctx, master)
    runVisualizer()
  }, [stopAudio, runVisualizer])

  function toggle() {
    if (playing) {
      stopAudio()
      setPlaying(false)
    } else {
      startAudio()
      setPlaying(true)
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  useEffect(() => {
    function onThemeChange() {
      const newTheme = getActiveTheme()
      if (playing && newTheme !== themeRef.current) {
        themeRef.current = newTheme
        startAudio()
      }
    }
    window.addEventListener('themechange', onThemeChange)
    return () => window.removeEventListener('themechange', onThemeChange)
  }, [playing, startAudio])

  useEffect(() => () => stopAudio(), [stopAudio])

  return (
    <div className="vinyl-card">
      <div
        className="vinyl-player"
        onClick={toggle}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
        aria-label={playing ? '暂停背景音乐' : '播放背景音乐'}
        aria-pressed={playing}
      >
        <div className={`vinyl-disc ${playing ? 'spinning' : ''}`}>
          <div className="vinyl-groove" />
          <div className="vinyl-groove vinyl-groove-2" />
          <div className="vinyl-groove vinyl-groove-3" />
          <div className="vinyl-label">
            <div className="vinyl-label-inner">
              <span className="vinyl-label-icon">{playing ? 'Ⅱ' : '▶'}</span>
            </div>
          </div>
        </div>
        <div className={`vinyl-arm ${playing ? 'playing' : ''}`} />
      </div>

      <div className="vinyl-viz" aria-hidden="true">
        {levels.map((lv, i) => (
          <span
            key={i}
            className="vinyl-bar"
            style={{ transform: `scaleY(${lv})`, opacity: playing ? 0.35 + lv * 0.65 : 0.25 }}
          />
        ))}
      </div>
      <span className="vinyl-hint">{playing ? 'pause · accent changes the room' : 'play room tone'}</span>
    </div>
  )
}
