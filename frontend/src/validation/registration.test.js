import assert from 'node:assert/strict'
import test from 'node:test'
import { validateRegistration } from './registration.js'
const valid = { displayName: 'Compte A', email: 'a@example.test', password: 'example-password', passwordConfirmation: 'example-password' }
test('minimal registration matches backend without physiological fields', () => {
  assert.deepEqual(validateRegistration(valid), {})
})
test('rejects short passwords, UTF-8 overflow and confirmation mismatch', () => {
  assert.ok(validateRegistration({ ...valid, password: 'short', passwordConfirmation: 'short' }).password)
  assert.ok(validateRegistration({ ...valid, password: '\u00e9'.repeat(40), passwordConfirmation: '\u00e9'.repeat(40) }).password)
  assert.ok(validateRegistration({ ...valid, passwordConfirmation: 'different' }).passwordConfirmation)
})
test('validates required profile fields and server length limits', () => {
  assert.ok(validateRegistration({ ...valid, displayName: 'x'.repeat(101) }).displayName)
  assert.ok(validateRegistration({ ...valid, email: 'invalid' }).email)
  assert.ok(validateRegistration({ ...valid, displayName: ' ' }).displayName)
})
