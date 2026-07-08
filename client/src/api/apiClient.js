let _token = null
let _onRefreshFailed = null

export function setToken(token) {
  _token = token
}

export function setOnRefreshFailed(handler) {
  _onRefreshFailed = handler
}

async function silentRefresh() {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Refresh failed')
  const { accessToken } = await res.json()
  setToken(accessToken)
  return accessToken
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
    ...options.headers,
  }

  let res = await fetch(path, { ...options, headers, credentials: 'include' })

  if (res.status === 401) {
    try {
      const newToken = await silentRefresh()
      res = await fetch(path, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
        credentials: 'include',
      })
    } catch {
      _onRefreshFailed?.()
      throw new Error('Session expired. Please sign in again.')
    }
  }

  return res
}

export async function apiGet(path) {
  const res = await request(path)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
  return res.json()
}

export async function apiPost(path, body) {
  const res = await request(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
  return res.status === 204 ? null : res.json()
}

export async function apiPatch(path, body) {
  const res = await request(path, { method: 'PATCH', body: JSON.stringify(body) })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
  return res.json()
}

export async function apiDelete(path) {
  const res = await request(path, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
  return res.status === 204 ? null : res.json()
}