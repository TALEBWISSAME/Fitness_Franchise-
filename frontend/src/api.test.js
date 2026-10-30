import test from 'node:test'
import assert from 'node:assert/strict'
import { getApi, writeApi } from './api.js'
import { requestApi } from './api.js'

test('login and service failures return understandable messages without server details', async () => {
  const original = globalThis.fetch
  try {
    globalThis.fetch = async () => ({ ok: false, status: 401 })
    await assert.rejects(requestApi('/auth/login'), /Email ou mot de passe incorrect/)
    globalThis.fetch = async () => ({ ok: false, status: 403 })
    await assert.rejects(requestApi('/auth/register'), /Actualisez la page/)
    globalThis.fetch = async () => ({ ok: false, status: 503 })
    await assert.rejects(getApi('/activities'), /momentanément indisponible/)
  } finally { globalThis.fetch = original }
})

test('session cookie and cancellation signal accompany personal reads', async () => {
  const original = globalThis.fetch
  const controller = new AbortController()
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://localhost:8080/api/activities')
    assert.equal(options.credentials, 'include')
    assert.equal(options.signal, controller.signal)
    return { ok: true, status: 200, json: async () => [] }
  }
  try { assert.deepEqual(await getApi('/activities', controller.signal), []) }
  finally { globalThis.fetch = original }
})
test('each write obtains a fresh CSRF token and login sends email form field', async () => {
  const original = globalThis.fetch
  const requests = []
  let token = 0
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options })
    if (url.endsWith('/auth/csrf')) return { ok: true, status: 200, json: async () => ({ headerName: 'X-CSRF-TOKEN', token: `token-${++token}` }) }
    return { ok: true, status: url.endsWith('/logout') ? 204 : 200, json: async () => ({}) }
  }
  try {
    await writeApi('/auth/login', { email: 'a@example.test', password: 'test-password' }, 'POST', true)
    assert.equal(new URLSearchParams(requests[1].options.body).get('email'), 'a@example.test')
    assert.equal(requests[1].options.headers['X-CSRF-TOKEN'], 'token-1')
    assert.equal(await writeApi('/auth/logout', {}), null)
    assert.equal(requests[3].options.headers['X-CSRF-TOKEN'], 'token-2')
    assert.ok(requests.every(request => request.options.credentials === 'include'))
  } finally { globalThis.fetch = original }
})
test('expired private reads signal session clearing and retain HTTP status', async () => {
  const originalFetch = globalThis.fetch
  const originalWindow = globalThis.window
  let expired = false
  globalThis.window = { dispatchEvent: event => { expired = event.type === 'session-expired' } }
  globalThis.fetch = async () => ({ ok: false, status: 401 })
  try { await assert.rejects(getApi('/activities'), error => error.status === 401); assert.equal(expired, true) }
  finally { globalThis.fetch = originalFetch; globalThis.window = originalWindow }
})
