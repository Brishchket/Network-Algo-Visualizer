import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const checkAuth = useAuthStore((s) => s.checkAuth)

  useEffect(() => {
    const run = async () => {
      await checkAuth()
      const { isAuthenticated, user } = useAuthStore.getState()
      if (isAuthenticated) {
          if (user?.needsProfileSetup) {
              navigate('/complete-profile', { replace: true })
          } else {
              navigate('/dashboard', { replace: true })
          }
      } else {
          navigate('/users/login', { replace: true })
      }
    }
    run()
  }, [])

  return (
    <div className="auth-page">
      <p className="text-muted">Signing you in...</p>
    </div>
  )
}