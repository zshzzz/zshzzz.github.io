import { useCallback, useEffect, useRef, useState } from 'react'

type Theme = 'default' | 'cyberpunk' | 'retro'

function getActiveTheme(): Theme {
  const t = document.documentElement.getAttribute('data-theme')
  if (t === 'cyberpunk' || t === 'retro') return t
  return 'default'
}

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

// --- Per-theme music engines ---

function startDefaultTheme(ctx: AudioContext, master: GainNode) {
  // Bouncy 8-bit platformer melody (Super Mario style)
  const dryGain = ctx.createGain()
  dryGain.gain.value = 0.55
  dryGain.connect(master)

  const reverb = createReverb(ctx, 1.5, 3)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.15
  reverb.connect(reverbGain)
  reverbGain.connect(master)

  // Main melody (square wave)
  // Mario-like bouncy melody in C major: E5 E5 R E5 R C5 E5 R G5 R R R G4 R R R
  const melody = [
    // Phrase 1
    [659.25, 0.12], [0, 0.06], [659.25, 0.12], [0, 0.06], [659.25, 0.12], [0, 0.06],
    [523.25, 0.12], [659.25, 0.18], [0, 0.06],
    [783.99, 0.24], [0, 0.18],
    [392.0, 0.24], [0, 0.18],
    // Phrase 2
    [523.25, 0.18], [0, 0.06],
    [392.0, 0.18], [0, 0.06],
    [329.63, 0.18], [0, 0.06],
    [440.0, 0.12], [0, 0.06],
    [493.88, 0.12], [0, 0.06],
    [466.16, 0.10], [440.0, 0.18], [0, 0.06],
    // Phrase 3
    [392.0, 0.12], [659.25, 0.12], [783.99, 0.12],
    [880.0, 0.18], [0, 0.06],
    [698.46, 0.12], [783.99, 0.18], [0, 0.06],
    [659.25, 0.18], [0, 0.06],
    [523.25, 0.12], [587.33, 0.12], [493.88, 0.18], [0, 0.12],
  ]

  // Bass line (triangle wave)
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

  // Melody voice
  const melodyOsc = ctx.createOscillator()
  melodyOsc.type = 'square'
  const melodyGain = ctx.createGain()
  melodyGain.gain.value = 0.12
  melodyOsc.connect(melodyGain)
  melodyGain.connect(dryGain)
  melodyGain.connect(reverb)
  melodyOsc.start()

  // Bass voice
  const bassOsc = ctx.createOscillator()
  bassOsc.type = 'triangle'
  const bassGain = ctx.createGain()
  bassGain.gain.value = 0.15
  bassOsc.connect(bassGain)
  bassGain.connect(dryGain)
  bassOsc.start()

  // Schedule melody
  let melodyTime = ctx.currentTime + 0.1
  for (const [freq, dur] of melody) {
    if (freq > 0) {
      melodyOsc.frequency.setValueAtTime(freq, melodyTime)
      melodyGain.gain.setValueAtTime(0.12, melodyTime)
      melodyGain.gain.exponentialRampToValueAtTime(0.04, melodyTime + dur * 0.8)
    } else {
      melodyGain.gain.setValueAtTime(0.001, melodyTime)
    }
    melodyTime += dur
  }

  // Schedule bass
  let bassTime = ctx.currentTime + 0.1
  for (const [freq, dur] of bass) {
    if (freq > 0) {
      bassOsc.frequency.setValueAtTime(freq, bassTime)
      bassGain.gain.setValueAtTime(0.15, bassTime)
      bassGain.gain.exponentialRampToValueAtTime(0.05, bassTime + dur * 0.8)
    } else {
      bassGain.gain.setValueAtTime(0.001, bassTime)
    }
    bassTime += dur
  }

  // Loop: restart after melody ends
  const totalDuration = melody.reduce((sum, [, d]) => sum + d, 0)
  const loopInterval = setInterval(() => {
    const now = ctx.currentTime
    let t = now + 0.05
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
    t = now + 0.05
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
  }, totalDuration * 1000)

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

function startCyberpunkTheme(ctx: AudioContext, master: GainNode) {
  // Pulsing bass + arpeggiated lead + reverb
  const reverb = createReverb(ctx, 3, 2)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.25
  reverb.connect(reverbGain)
  reverbGain.connect(master)

  const dryGain = ctx.createGain()
  dryGain.gain.value = 0.6
  dryGain.connect(master)

  // Sub bass with pulse
  const bass = ctx.createOscillator()
  bass.type = 'sawtooth'
  bass.frequency.value = 55
  const bassFilter = ctx.createBiquadFilter()
  bassFilter.type = 'lowpass'
  bassFilter.frequency.value = 250
  bassFilter.Q.value = 8
  bass.connect(bassFilter)

  const bassGain = ctx.createGain()
  bassGain.gain.value = 0.2
  bassFilter.connect(bassGain)
  bassGain.connect(dryGain)
  bassGain.connect(reverb)

  // LFO on bass gain for pulse
  const bassLfo = ctx.createOscillator()
  const bassLfoGain = ctx.createGain()
  bassLfo.frequency.value = 3
  bassLfoGain.gain.value = 0.12
  bassLfo.connect(bassLfoGain)
  bassLfoGain.connect(bassGain.gain)
  bassLfo.start()
  bass.start()

  // Arp lead: minor scale pattern
  const notes = [220, 261.63, 329.63, 440, 329.63, 261.63, 220, 164.81]
  let noteIdx = 0
  const lead = ctx.createOscillator()
  lead.type = 'square'
  lead.frequency.value = notes[0]
  const leadFilter = ctx.createBiquadFilter()
  leadFilter.type = 'lowpass'
  leadFilter.frequency.value = 1200
  lead.connect(leadFilter)
  const leadGain = ctx.createGain()
  leadGain.gain.value = 0.06
  leadFilter.connect(leadGain)
  leadGain.connect(dryGain)
  leadGain.connect(reverb)
  lead.start()

  const interval = setInterval(() => {
    noteIdx = (noteIdx + 1) % notes.length
    const t = ctx.currentTime
    lead.frequency.setValueAtTime(notes[noteIdx], t)
    leadGain.gain.setValueAtTime(0.06, t)
    leadGain.gain.exponentialRampToValueAtTime(0.015, t + 0.15)
  }, 220)

  // Noise texture
  const bufferSize = ctx.sampleRate * 2
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const noiseData = noiseBuffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) noiseData[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuffer
  noise.loop = true
  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.value = 800
  noiseFilter.Q.value = 3
  const noiseGain = ctx.createGain()
  noiseGain.gain.value = 0.02
  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(dryGain)
  noise.start()

  return () => {
    clearInterval(interval)
    bass.stop()
    bassLfo.stop()
    lead.stop()
    noise.stop()
    reverb.disconnect()
    reverbGain.disconnect()
    dryGain.disconnect()
    bass.disconnect()
    bassFilter.disconnect()
    bassGain.disconnect()
    bassLfo.disconnect()
    bassLfoGain.disconnect()
    lead.disconnect()
    leadFilter.disconnect()
    leadGain.disconnect()
    noise.disconnect()
    noiseFilter.disconnect()
    noiseGain.disconnect()
  }
}

function startRetroTheme(ctx: AudioContext, master: GainNode) {
  // Chiptune melody + triangle bass
  const reverb = createReverb(ctx, 2, 3)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.2
  reverb.connect(reverbGain)
  reverbGain.connect(master)

  const dryGain = ctx.createGain()
  dryGain.gain.value = 0.5
  dryGain.connect(master)

  // Melody: pentatonic scale
  const melody = [523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 523.25, 440.0, 523.25]
  let melodyIdx = 0
  const melodyOsc = ctx.createOscillator()
  melodyOsc.type = 'square'
  melodyOsc.frequency.value = melody[0]
  const melodyGain = ctx.createGain()
  melodyGain.gain.value = 0.07
  melodyOsc.connect(melodyGain)
  melodyGain.connect(dryGain)
  melodyGain.connect(reverb)
  melodyOsc.start()

  // Triangle bass
  const bassNotes = [130.81, 130.81, 164.81, 164.81, 196.0, 196.0, 164.81, 164.81]
  let bassIdx = 0
  const bassOsc = ctx.createOscillator()
  bassOsc.type = 'triangle'
  bassOsc.frequency.value = bassNotes[0]
  const bassGain = ctx.createGain()
  bassGain.gain.value = 0.14
  bassOsc.connect(bassGain)
  bassGain.connect(dryGain)
  bassOsc.start()

  const interval = setInterval(() => {
    melodyIdx = (melodyIdx + 1) % melody.length
    bassIdx = (bassIdx + 1) % bassNotes.length
    const t = ctx.currentTime
    melodyOsc.frequency.setValueAtTime(melody[melodyIdx], t)
    melodyGain.gain.setValueAtTime(0.07, t)
    melodyGain.gain.exponentialRampToValueAtTime(0.02, t + 0.12)
    bassOsc.frequency.setValueAtTime(bassNotes[bassIdx], t)
  }, 200)

  return () => {
    clearInterval(interval)
    melodyOsc.stop()
    bassOsc.stop()
    reverb.disconnect()
    reverbGain.disconnect()
    dryGain.disconnect()
    melodyOsc.disconnect()
    melodyGain.disconnect()
    bassOsc.disconnect()
    bassGain.disconnect()
  }
}

const THEME_ENGINES: Record<Theme, (ctx: AudioContext, master: GainNode) => () => void> = {
  default: startDefaultTheme,
  cyberpunk: startCyberpunkTheme,
  retro: startRetroTheme,
}

export default function VinylPlayer() {
  const [playing, setPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const themeRef = useRef<Theme>(getActiveTheme())

  const stopAudio = useCallback(() => {
    cleanupRef.current?.()
    cleanupRef.current = null
    audioCtxRef.current?.close()
    audioCtxRef.current = null
  }, [])

  const startAudio = useCallback(() => {
    stopAudio()
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    themeRef.current = getActiveTheme()

    const master = ctx.createGain()
    master.gain.value = 0.7
    master.connect(ctx.destination)

    cleanupRef.current = THEME_ENGINES[themeRef.current](ctx, master)
  }, [stopAudio])

  function toggle() {
    if (playing) {
      stopAudio()
      setPlaying(false)
    } else {
      startAudio()
      setPlaying(true)
    }
  }

  // Restart audio when theme changes (if playing)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = getActiveTheme()
      if (playing && newTheme !== themeRef.current) {
        themeRef.current = newTheme
        startAudio()
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [playing, startAudio])

  useEffect(() => {
    return () => stopAudio()
  }, [stopAudio])

  return (
    <div className="vinyl-player" onClick={toggle} role="button" tabIndex={0} aria-label={playing ? '暂停' : '播放'}>
      <div className={`vinyl-disc ${playing ? 'spinning' : ''}`}>
        <div className="vinyl-groove" />
        <div className="vinyl-groove vinyl-groove-2" />
        <div className="vinyl-groove vinyl-groove-3" />
        <div className="vinyl-label">
          <div className="vinyl-label-inner">
            <span className="vinyl-label-icon">{playing ? '⏸' : '▶'}</span>
          </div>
        </div>
      </div>
      <div className={`vinyl-arm ${playing ? 'playing' : ''}`} />
      <span className="vinyl-hint">{playing ? '点击暂停' : '点击播放 BGM'}</span>
    </div>
  )
}
