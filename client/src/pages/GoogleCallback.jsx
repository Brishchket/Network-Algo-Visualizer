import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const checkAuth = useAuthStore((s) => s.checkAuth)

  useEffect(() => {
    const run = async () => {
      await checkAuth()
      const { isAuthenticated } = useAuthStore.getState()
      navigate(isAuthenticated ? '/dashboard' : '/users/login', { replace: true })
    }
    run()
  }, [])

  return (
    <div className="auth-page">
      <p className="text-muted">Signing you in...</p>
    </div>
  )
}