
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'

import CrudProductos from './components/Productos/crudProductos'
import api from './services/api'
import Login from './components/Login/Login'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

import './App.css'

// ========================================
// NAVEGACIÓN Y CERRAR SESIÓN
// ========================================

function Navigation() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  if (!token) return null

  return (
    <nav className="navbar navbar-dark bg-dark shadow-sm">
      <div className="container">
        <span className="navbar-brand mb-0 h1">
          SENATI - Sistema de Inventario
        </span>

        <button
          className="btn btn-outline-light btn-sm"
          onClick={handleLogout}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  )
}

// ========================================
// NAVEGACIÓN DEL INVENTARIO
// ========================================

const navigation = [
  { id: 'dashboard', label: 'Resumen', icon: '▦' },
  { id: 'productos', label: 'Productos', icon: '▣' },
  { id: 'categorias', label: 'Categorías', icon: '◈' },
  { id: 'proveedores', label: 'Proveedores', icon: '⬡' },
  { id: 'kardex', label: 'Kardex', icon: '⇄' },
]

// ========================================
// OBTENER DATOS DEL INVENTARIO
// ========================================

function useInventoryData() {
  const [data, setData] = useState({
    productos: [],
    categorias: [],
    proveedores: [],
    movimientos: []
  })

  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState('')

  const refresh = async () => {
    setLoading(true)
    setConnectionError('')

    const endpoints = [
      ['productos', '/productos'],
      ['categorias', '/categorias'],
      ['proveedores', '/proveedores'],
      ['movimientos', '/movimientos'],
    ]

    const results = await Promise.all(
      endpoints.map(async ([key, url]) => {
        try {
          const response = await api.get(url)

          return [
            key,
            Array.isArray(response.data)
              ? response.data
              : response.data?.data || []
          ]

        } catch (error) {
          console.error(`Error en ${url}:`, error.response?.data || error.message)

          if (key === 'productos') {
            if (!error.response) {
              setConnectionError(
                'No se pudo contactar con el backend. Verifica el puerto y que el servidor esté encendido.'
              )
            } else if (error.response.status === 401 || error.response.status === 403) {
              setConnectionError(
                'No tienes autorización para consultar los productos. Verifica tu sesión y permisos.'
              )
            } else {
              setConnectionError(
                `Error al consultar productos: ${error.response.status}`
              )
            }
          }

          return [key, []]
        }
      })
    )

    setData(Object.fromEntries(results))
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  return { data, loading, refresh, connectionError }
}
// ========================================
// DASHBOARD
// ========================================

function Dashboard({ data, loading, onNavigate }) {
  const lowStock = data.productos.filter(
    p => Number(p.stock) <= 5
  ).length

  const stockTotal = data.productos.reduce(
    (sum, p) => sum + Number(p.stock || 0),
    0
  )

  const stats = [
    {
      label: 'Productos registrados',
      value: data.productos.length,
      icon: '▣',
      tone: 'blue',
      note: 'En el catálogo'
    },
    {
      label: 'Unidades en almacén',
      value: stockTotal,
      icon: '▤',
      tone: 'violet',
      note: 'Stock acumulado'
    },
    {
      label: 'Stock bajo',
      value: lowStock,
      icon: '⚠',
      tone: 'amber',
      note: '5 unidades o menos'
    },
    {
      label: 'Categorías',
      value: data.categorias.length,
      icon: '◈',
      tone: 'green',
      note: 'Clasificaciones'
    },
  ]

  return (
    <>
      <PageHeading
        eyebrow="CENTRO DE CONTROL"
        title="Resumen general"
        subtitle="Una vista rápida del estado de tu inventario."
      />

      <div className="stats-grid">
        {stats.map(s => (
          <article className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.tone}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">
              {loading ? '—' : s.value}
            </div>
            <div className="stat-note">{s.note}</div>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">ACTIVIDAD</span>
              <h3>Productos recientes</h3>
            </div>

            <button
              className="text-button"
              onClick={() => onNavigate('productos')}
            >
              Ver productos →
            </button>
          </div>

          {data.productos.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {data.productos.slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.nombre}</strong>
                        <small>#{p.id}</small>
                      </td>

                      <td>S/ {Number(p.precio || 0).toFixed(2)}</td>
                      <td>{p.stock ?? 0}</td>

                      <td>
                        <span className={`status ${Number(p.stock) <= 5 ? 'warning' : 'success'}`}>
                          {Number(p.stock) <= 5 ? 'Stock bajo' : 'Disponible'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              text={loading ? 'Cargando información…' : 'Todavía no hay productos registrados.'}
            />
          )}
        </section>

        <section className="panel quick-panel">
          <span className="eyebrow">ACCESOS DIRECTOS</span>
          <h3>¿Qué deseas gestionar?</h3>
          <p>Ingresa rápidamente a las secciones principales del sistema.</p>

          <div className="quick-links">
            {navigation.slice(1).map(n => (
              <button key={n.id} onClick={() => onNavigate(n.id)}>
                <span>{n.icon}</span>
                {n.label}
                <b>→</b>
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

// ========================================
// COMPONENTES GENERALES
// ========================================

function PageHeading({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {action}
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <span>⌁</span>
      <p>{text}</p>
    </div>
  )
}

// ========================================
// CRUD DE CATEGORÍAS Y PROVEEDORES
// ========================================

function CrudCatalog({
  type,
  title,
  subtitle,
  endpoint,
  fields,
  rows,
  onRefresh
}) {
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const reset = () => {
    setForm({})
    setEditing(null)
    setMessage('')
  }

  const change = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      if (editing) {
        await api.put(`${endpoint}/${editing}`, form)
      } else {
        await api.post(endpoint, form)
      }

      reset()
      await onRefresh()

    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'No se pudo guardar. Verifica la conexión y los datos.'
      )
    } finally {
      setSaving(false)
    }
  }

  const edit = row => {
    setEditing(row.id)

    setForm(
      Object.fromEntries(
        fields.map(f => [f.name, row[f.name] ?? ''])
      )
    )

    setMessage('')
  }

  const remove = async id => {
    if (!window.confirm('¿Seguro que deseas eliminar este registro?')) {
      return
    }

    try {
      await api.delete(`${endpoint}/${id}`)
      await onRefresh()

    } catch {
      setMessage('No se pudo eliminar el registro.')
    }
  }

  return (
    <>
      <PageHeading
        eyebrow={`GESTIÓN / ${type.toUpperCase()}`}
        title={title}
        subtitle={subtitle}
      />

      <div className="content-grid">
        <section className="panel form-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">FORMULARIO</span>
              <h3>{editing ? 'Editar registro' : 'Nuevo registro'}</h3>
            </div>

            <span className="form-symbol">＋</span>
          </div>

          <form onSubmit={submit}>
            {fields.map(f => (
              <label className="field" key={f.name}>
                {f.label}

                <input
                  name={f.name}
                  type={f.type || 'text'}
                  value={form[f.name] ?? ''}
                  onChange={change}
                  required={f.required !== false}
                  placeholder={f.placeholder || `Ingrese ${f.label.toLowerCase()}`}
                />
              </label>
            ))}

            {message && <div className="form-error">{message}</div>}

            <button className="primary-button" disabled={saving}>
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Registrar'}
              <span>→</span>
            </button>

            {editing && (
              <button
                type="button"
                className="secondary-button"
                onClick={reset}
              >
                Cancelar edición
              </button>
            )}
          </form>
        </section>

        <section className="panel list-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">REGISTROS</span>
              <h3>Listado de {type.toLowerCase()}</h3>
            </div>

            <span className="count-pill">
              {rows.length} registros
            </span>
          </div>

          {rows.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    {fields.map(f => (
                      <th key={f.name}>{f.label}</th>
                    ))}
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map(row => (
                    <tr key={row.id}>
                      <td>#{row.id}</td>

                      {fields.map(f => (
                        <td key={f.name}>{row[f.name] ?? '—'}</td>
                      ))}

                      <td className="actions">
                        <button
                          className="icon-button edit"
                          title="Editar"
                          onClick={() => edit(row)}
                        >
                          ✎
                        </button>

                        <button
                          className="icon-button delete"
                          title="Eliminar"
                          onClick={() => remove(row.id)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="No hay registros para mostrar." />
          )}
        </section>
      </div>
    </>
  )
}

// ========================================
// KARDEX Y MOVIMIENTOS
// ========================================

function Kardex({ productos, movimientos, onRefresh }) {
  const [form, setForm] = useState({
    producto_id: '',
    tipo_movimiento: 'Entrada',
    cantidad: '',
    observaciones: ''
  })

  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await api.post('/movimientos', {
        ...form,
        cantidad: Number(form.cantidad)
      })

      setForm({
        producto_id: '',
        tipo_movimiento: 'Entrada',
        cantidad: '',
        observaciones: ''
      })

      await onRefresh()

    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'No se pudo registrar el movimiento. Verifica el backend.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="CONTROL DE EXISTENCIAS"
        title="Kardex de movimientos"
        subtitle="Registra entradas, salidas y ajustes para mantener el historial del inventario."
      />

      <div className="content-grid kardex-grid">
        <section className="panel form-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">NUEVA TRANSACCIÓN</span>
              <h3>Registrar movimiento</h3>
            </div>

            <span className="form-symbol">⇄</span>
          </div>

          <form onSubmit={submit}>
            <label className="field">
              Producto

              <select
                required
                value={form.producto_id}
                onChange={e => setForm({
                  ...form,
                  producto_id: e.target.value
                })}
              >
                <option value="">Selecciona un producto</option>

                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Tipo de movimiento

              <select
                value={form.tipo_movimiento}
                onChange={e => setForm({
                  ...form,
                  tipo_movimiento: e.target.value
                })}
              >
                <option>Entrada</option>
                <option>Salida</option>
                <option>Ajuste</option>
              </select>
            </label>

            <label className="field">
              Cantidad

              <input
                required
                min="1"
                type="number"
                value={form.cantidad}
                onChange={e => setForm({
                  ...form,
                  cantidad: e.target.value
                })}
                placeholder="Ej. 10"
              />
            </label>

            <label className="field">
              Observaciones

              <textarea
                rows="3"
                value={form.observaciones}
                onChange={e => setForm({
                  ...form,
                  observaciones: e.target.value
                })}
                placeholder="Motivo del movimiento (opcional)"
              />
            </label>

            {message && <div className="form-error">{message}</div>}

            <button
              className="primary-button"
              disabled={saving || !productos.length}
            >
              {saving ? 'Registrando…' : 'Registrar movimiento'}
              <span>→</span>
            </button>
          </form>
        </section>

        <section className="panel list-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">HISTORIAL</span>
              <h3>Últimos movimientos</h3>
            </div>

            <span className="count-pill">
              {movimientos.length} movimientos
            </span>
          </div>

          {movimientos.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>

                <tbody>
                  {movimientos.map(m => (
                    <tr key={m.id}>
                      <td>
                        {m.fecha_hora
                          ? new Date(m.fecha_hora).toLocaleString('es-PE')
                          : '—'}
                      </td>

                      <td>
                        {m.producto?.nombre || m.producto_nombre || m.producto_id}
                      </td>

                      <td>
                        <span className={`status ${m.tipo_movimiento === 'Entrada' ? 'success' : 'warning'}`}>
                          {m.tipo_movimiento}
                        </span>
                      </td>

                      <td>{m.cantidad}</td>
                      <td>{m.observaciones || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="Aún no se han registrado movimientos." />
          )}
        </section>
      </div>
    </>
  )
}

// ========================================
// PANEL PRINCIPAL NEXUS
// ========================================

function InventoryPanel() {
  const { data, loading, refresh, connectionError } = useInventoryData()

  const [active, setActive] = useState(
    () => window.location.hash.replace('#', '') || 'dashboard'
  )

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigate = id => {
    setActive(id)
    window.location.hash = id
    setSidebarOpen(false)
  }

  useEffect(() => {
    const sync = () => {
      setActive(window.location.hash.replace('#', '') || 'dashboard')
    }

    window.addEventListener('hashchange', sync)

    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const current = navigation.find(n => n.id === active) || navigation[0]

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">N<span>.</span></div>

          <div>
            <strong>NEXUS</strong>
            <small>INVENTORY SYSTEM</small>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="side-nav">
          {navigation.map(n => (
            <button
              key={n.id}
              className={active === n.id ? 'active' : ''}
              onClick={() => navigate(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
              {active === n.id && <i />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="server-indicator">
            <span /> SISTEMA DE INVENTARIO
          </div>

          <div className="profile">
            <div className="avatar">AD</div>

            <div>
              <strong>Administrador</strong>
              <small>Panel de gestión</small>
            </div>

            <span className="profile-dots">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{current.label}</strong>
          </div>

          <div className="topbar-right">
            <span className="live-dot" />
            <span className="online-label">Panel operativo</span>

            <button
              className="refresh-button"
              onClick={refresh}
              title="Actualizar datos"
            >
              ↻
            </button>

            <div className="top-avatar">AD</div>
          </div>
        </header>

        <div className="page-content">
          {connectionError && (
            <div className="connection-alert">
              <strong>Conexión pendiente</strong>
              <span>{connectionError}</span>
            </div>
          )}

          {active === 'dashboard' && (
            <Dashboard
              data={data}
              loading={loading}
              onNavigate={navigate}
            />
          )}

          {active === 'productos' && (
            <>
              <PageHeading
                eyebrow="GESTIÓN DE CATÁLOGO"
                title="Productos"
                subtitle="Administra los artículos, precios y existencias de tu inventario."
              />

              <CrudProductos onRefresh={refresh} />
            </>
          )}

          {active === 'categorias' && (
            <CrudCatalog
              type="Categorías"
              title="Categorías"
              subtitle="Organiza tus productos en grupos para facilitar su administración."
              endpoint="/categorias"
              fields={[
                { name: 'nombre', label: 'Nombre' },
                { name: 'descripcion', label: 'Descripción', required: false }
              ]}
              rows={data.categorias}
              onRefresh={refresh}
            />
          )}

          {active === 'proveedores' && (
            <CrudCatalog
              type="Proveedores"
              title="Proveedores"
              subtitle="Mantén centralizada la información de tus proveedores."
              endpoint="/proveedores"
              fields={[
                { name: 'razon_social', label: 'Razón social' },
                { name: 'contacto', label: 'Contacto', required: false },
                { name: 'telefono', label: 'Teléfono', required: false },
                { name: 'email', label: 'Correo electrónico', type: 'email', required: false }
              ]}
              rows={data.proveedores}
              onRefresh={refresh}
            />
          )}

          {active === 'kardex' && (
            <Kardex
              productos={data.productos}
              movimientos={data.movimientos}
              onRefresh={refresh}
            />
          )}

          {!navigation.some(n => n.id === active) && (
            <Dashboard
              data={data}
              loading={loading}
              onNavigate={navigate}
            />
          )}

          <footer className="footer">
            <span>NEXUS INVENTORY <b>•</b> PANEL ADMINISTRATIVO</span>
            <span>Full Stack Developer Software · 2026</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

// ========================================
// APP Y RUTAS
// ========================================

function App() {
  return (
    <Router>
      <Navigation />

      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Panel protegido */}
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <InventoryPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <InventoryPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
