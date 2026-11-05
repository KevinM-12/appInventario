
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const Login = () => {
  const [credenciales, setCredenciales] = useState({
    email: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setCredenciales({
      ...credenciales,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', credenciales)

      localStorage.setItem('token', response.data.token)

      navigate('/productos')

    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Credenciales inválidas. Intente nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-screen">
      <div className="login-background">
        <div className="login-glow glow-one" />
        <div className="login-glow glow-two" />
      </div>

      <section className="login-container">

        <div className="login-brand">
          <div className="brand-mark login-mark">
            N<span>.</span>
          </div>

          <div>
            <strong>NEXUS</strong>
            <small>INVENTORY SYSTEM</small>
          </div>
        </div>

        <div className="login-card">

          <div className="login-icon">
            <span>⌑</span>
          </div>

          <div className="login-heading">
            <span className="eyebrow">ACCESO AL SISTEMA</span>
            <h1>Bienvenido de nuevo</h1>
            <p>Ingresa tus credenciales para continuar.</p>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <label className="login-field">
              Correo electrónico

              <div className="login-input-wrap">
                <span>✉</span>

                <input
                  type="email"
                  name="email"
                  value={credenciales.email}
                  onChange={handleChange}
                  placeholder="usuario@correo.com"
                  autoComplete="username"
                  required
                />
              </div>
            </label>

            <label className="login-field">
              Contraseña

              <div className="login-input-wrap">
                <span>◈</span>

                <input
                  type="password"
                  name="password"
                  value={credenciales.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Verificando acceso...' : 'Iniciar sesión'}
              <span>→</span>
            </button>

          </form>

          <div className="login-security">
            <span className="live-dot" />
            CONEXIÓN SEGURA
          </div>

        </div>

        <footer className="login-footer">
          NEXUS INVENTORY · PANEL ADMINISTRATIVO
          <span>© 2026</span>
        </footer>

      </section>
    </main>
  )
}

export default Login
