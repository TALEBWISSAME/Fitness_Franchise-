import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { projectEquipment } from './projectEquipment.js'

const photos = JSON.parse(readFileSync(new URL('./equipmentPhotos.json', import.meta.url), 'utf8'))

test('every reference model has its own local, explicitly identified illustration', () => {
  const types = new Set(projectEquipment.map(machine => machine.type))
  assert.equal(Object.keys(photos).length, types.size)
  assert.equal(new Set(Object.values(photos).map(photo => photo.src)).size, types.size)
  for (const [type, photo] of Object.entries(photos)) {
    assert.ok(types.has(type))
    assert.match(photo.src, /^\/images\/equipment\/premium\/[a-z0-9-]+\.png$/)
    assert.ok(existsSync(new URL(`../../../public${photo.src}`, import.meta.url)), photo.src)
    assert.equal(photo.kind, 'generated')
    assert.ok(photo.title)
    assert.equal(photo.source, undefined)
    assert.equal(photo.license, undefined)
  }
})

test('unknown inventory types still have no misleading substitute', () => {
  for (const type of ['STRENGTH', 'UNKNOWN']) {
    assert.equal(photos[type], undefined)
  }
})
