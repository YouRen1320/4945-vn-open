import { describe, expect, it } from 'vitest'

import { storyById } from './index'

describe('事件二序章选择连续性', () => {
  it('签名与观望进入不同的即时回应和收束', () => {
    const choices = storyById['s2-prologue-goal']!.choices!
    expect(choices.find((choice) => choice.id === 's2-prologue-accept')?.next).toBe('s2-prologue-accept-reply')
    expect(choices.find((choice) => choice.id === 's2-prologue-hold')?.next).toBe('s2-prologue-hold-reply')
    expect(storyById['s2-prologue-accept-reply']!.text).toContain('签完名字')
    expect(storyById['s2-prologue-hold-reply']!.text).toContain('没有签')
    expect(storyById['s2-prologue-closing-held']!.text).toContain('仍然空着')
    expect(storyById['s2-prologue-closing-held']!.text).not.toContain('签下名字')
  })
})
