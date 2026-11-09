import test from 'node:test'
import assert from 'node:assert/strict'
import { defaults, availableFonts, minutes, timeLabel, resolveFontFamily } from './station'
import { effectList } from './effects'

test('availableFonts contains over 30 fonts and includes Neuropol X', () => {
  assert.ok(availableFonts.length >= 30, `Expected at least 30 fonts, got ${availableFonts.length}`)
  const neuropol = availableFonts.find((f) => f.name.includes('Neuropol'))
  assert.ok(neuropol, 'Neuropol X font should be registered in availableFonts')
  assert.equal(neuropol?.category, 'Futuristas')
})

test('station defaults include new customization fields', () => {
  assert.equal(typeof defaults.pageBackground, 'string')
  assert.ok(defaults.carouselFit === 'cover' || defaults.carouselFit === 'contain' || defaults.carouselFit === 'fill')
  assert.equal(typeof defaults.carouselHeight, 'number')
  assert.equal(typeof defaults.carouselZoom, 'number')
  assert.ok(defaults.cinema.title, 'Cinema mode should have default title')
  assert.ok(defaults.cinema.tickerText, 'Cinema mode should have default tickerText')
})

test('effectList is localized to Spanish and contains categorized effects with guides', () => {
  assert.ok(effectList.length >= 60, `Expected 60+ effects, got ${effectList.length}`)
  for (const eff of effectList) {
    assert.ok(eff.key, 'Effect should have key')
    assert.ok(eff.name, 'Effect should have Spanish name')
    assert.ok(eff.desc, 'Effect should have Spanish description')
    assert.ok(eff.guide && eff.guide.length > 10, `Effect ${eff.key} should have descriptive guide`)
    assert.ok(['Visuales', 'Interacción', 'Notificaciones', 'Distribución'].includes(eff.category))
  }
  const keys = new Set(effectList.map((e) => e.key))
  assert.ok(keys.has('equalizerGlow'), 'equalizerGlow effect should exist')
  assert.ok(keys.has('glassCards'), 'glassCards effect should exist')
  assert.ok(keys.has('cyberpunkGrid'), 'cyberpunkGrid effect should exist')
  assert.ok(keys.has('goldShimmer'), 'goldShimmer effect should exist')
})

test('time utilities calculate minutes and labels accurately', () => {
  assert.equal(minutes('09:30'), 570)
  assert.equal(timeLabel('14:00', '12h'), '2:00 PM')
  assert.equal(timeLabel('09:15', '24h'), '09:15')
})

test('resolveFontFamily resolves registered font families and fallbacks', () => {
  const neuropolFamily = resolveFontFamily('Neuropol X')
  assert.ok(neuropolFamily?.includes('Neuropol X'))
  assert.equal(resolveFontFamily(undefined), undefined)
  assert.ok(resolveFontFamily('Outfit')?.includes('Outfit'))
})
