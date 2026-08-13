import type { GameSettings, MusicId, SoundId } from './types'

const themeNotes: Record<MusicId, number[]> = {
  duskLogin: [57, 60, 64, 67, 64, 60],
  groupChat: [62, 65, 69, 67, 65, 72],
  worldEnemy: [50, 51, 57, 56, 50, 63],
  fortressNight: [45, 52, 55, 57, 52, 60, 55, 64],
  afterOnline: [55, 59, 62, 66, 62, 59],
}

const midiToHz = (note: number) => 440 * 2 ** ((note - 69) / 12)
const safeVolume = (value: number) => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0

class AudioDirector {
  private context: AudioContext | null = null
  private musicGain: GainNode | null = null
  private soundGain: GainNode | null = null
  private timer: number | null = null
  private step = 0
  private currentMusic: MusicId | null = null

  // 音频只在首次用户手势后创建，符合移动浏览器的自动播放限制。
  unlock(settings: GameSettings) {
    if (!this.context) {
      this.context = new AudioContext()
      this.musicGain = this.context.createGain()
      this.soundGain = this.context.createGain()
      this.musicGain.connect(this.context.destination)
      this.soundGain.connect(this.context.destination)
    }
    void this.context.resume()
    this.syncVolumes(settings)
    if (this.currentMusic && this.timer === null) this.startSequence()
  }

  syncVolumes(settings: GameSettings) {
    const now = this.context?.currentTime ?? 0
    // 音频边界再做一次有限值保护，避免任何非存档调用把 Web Audio 带入异常状态。
    this.musicGain?.gain.setTargetAtTime(settings.muted ? 0 : safeVolume(settings.musicVolume) * 0.2, now, 0.04)
    this.soundGain?.gain.setTargetAtTime(settings.muted ? 0 : safeVolume(settings.soundVolume) * 0.18, now, 0.02)
  }

  setMusic(music: MusicId | undefined, settings: GameSettings) {
    this.syncVolumes(settings)
    if (!music) return
    if (this.currentMusic === music) return
    this.currentMusic = music
    this.step = 0
    if (this.timer !== null) window.clearInterval(this.timer)
    this.timer = null
    if (this.context) this.startSequence()
  }

  private startSequence() {
    if (!this.context || !this.currentMusic || this.timer !== null) return
    this.playMusicStep()
    this.timer = window.setInterval(() => this.playMusicStep(), this.currentMusic === 'fortressNight' ? 520 : 760)
  }

  private playMusicStep() {
    if (!this.context || !this.musicGain || !this.currentMusic || this.context.state !== 'running') return
    const notes = themeNotes[this.currentMusic]
    const note = notes[this.step % notes.length] ?? notes[0] ?? 60
    const now = this.context.currentTime
    const osc = this.context.createOscillator()
    const envelope = this.context.createGain()
    osc.type = this.currentMusic === 'worldEnemy' ? 'sawtooth' : this.currentMusic === 'fortressNight' ? 'triangle' : 'sine'
    osc.frequency.value = midiToHz(note)
    envelope.gain.setValueAtTime(0.0001, now)
    envelope.gain.exponentialRampToValueAtTime(0.22, now + 0.05)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 1.45)
    osc.connect(envelope).connect(this.musicGain)
    osc.start(now)
    osc.stop(now + 1.5)

    if (this.step % 2 === 0) {
      const bass = this.context.createOscillator()
      const bassEnvelope = this.context.createGain()
      bass.type = 'sine'
      bass.frequency.value = midiToHz(note - 24)
      bassEnvelope.gain.setValueAtTime(0.0001, now)
      bassEnvelope.gain.exponentialRampToValueAtTime(0.14, now + 0.08)
      bassEnvelope.gain.exponentialRampToValueAtTime(0.0001, now + 1.8)
      bass.connect(bassEnvelope).connect(this.musicGain)
      bass.start(now)
      bass.stop(now + 1.9)
    }
    this.step += 1
  }

  playSound(sound: SoundId | undefined, settings: GameSettings) {
    if (!sound || !this.context || !this.soundGain || settings.muted) return
    const now = this.context.currentTime
    const osc = this.context.createOscillator()
    const envelope = this.context.createGain()
    const frequencies: Record<SoundId, number> = {
      tap: 420, message: 720, notice: 560, choice: 860, warning: 180, save: 980,
    }
    osc.type = sound === 'warning' ? 'sawtooth' : 'sine'
    osc.frequency.setValueAtTime(frequencies[sound], now)
    if (sound === 'choice' || sound === 'save') osc.frequency.exponentialRampToValueAtTime(frequencies[sound] * 1.35, now + 0.12)
    envelope.gain.setValueAtTime(0.18, now)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + (sound === 'warning' ? 0.28 : 0.16))
    osc.connect(envelope).connect(this.soundGain)
    osc.start(now)
    osc.stop(now + 0.3)
  }
}

export const audioDirector = new AudioDirector()
