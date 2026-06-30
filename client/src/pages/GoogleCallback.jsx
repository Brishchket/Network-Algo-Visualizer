// src/pages/GoogleCallback.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore' // adjust import to your actual store

export default function GoogleCallback() {
  const navigate = useNavigate()
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser)

  useEffect(() => {
    fetchCurrentUser().then((user) => {
      navigate(user ? '/dashboard' : '/users/login', { replace: true })
    })
  }, [])

  return (
    <div className="auth-page">
      <p className="text-muted">Signing you in...</p>
    </div>
  )
}