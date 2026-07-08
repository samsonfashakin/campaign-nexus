import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { setToken, setOnRefreshFailed } from '../api/apiClient'

const AuthContext = createContext(null)

// Status starts as 'loading' — not 'unauthenticated'. This prevents a 
// logged-in user from seeing the login page flash while the silent refresh runs.
const initialState = {
  user: null,
  status: 'loading',
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':  return { user: action.payload, status: 'authenticated' }
    case 'LOGOUT': return { user: null, status: 'unauthenticated' }
    default:       return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const login = useCallback((user, accessToken) => {
    setToken(accessToken)
    dispatch({ type: 'LOGIN', payload: user })
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    dispatch({ type: 'LOGOUT' })
  }, [])

  // Tell the API client what to do if a refresh fails mid-session
  useEffect(() => {
    setOnRefreshFailed(logout)
  }, [logout])

  // On every page load, silently re-authenticate using the refresh cookie.
  // This is how a logged-in user stays logged in after pressing F5.
  useEffect(() => {
    async function attemptSilentRefresh() {
      try {
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })
        if (!refreshRes.ok) throw new Error('No valid session')
        const { accessToken } = await refreshRes.json()

        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!meRes.ok) throw new Error('Could not load user')
        const { user } = await meRes.json()

        login(user, accessToken)
      } catch {
        dispatch({ type: 'LOGOUT' })
      }
    }

    attemptSilentRefresh()
  }, [login])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider')
  return ctx
}