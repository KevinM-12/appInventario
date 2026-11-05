import { useState, useEffect } from 'react'
import api from '../../services/api'

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <span>⌁</span>
      <p>{text}</p>
    </div>
  )
}

const formularioInicial = {
  id: null,
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  categoria_id: '',
  proveedor_id: ''
}

const CrudProductos = ({ onRefresh }) => {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])

  const [form, setForm] = useState(formularioInicial)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const getHeaders = () => {
    const token = localStorage.getItem('token')

    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }

  // ========================================
  // OBTENER PRODUCTOS
  // ========================================

  const obtenerProductos = async () => {
    try {
      setLoading(true)

      const response = await api.get(
        '/productos',
        getHeaders()
      )

      setProductos(
        Array.isArray(response.data)
          ? response.data
          : response.data?.data || []
      )

    } catch (error) {
      console.error('Error al obtener productos:', error)
      setMessage('No se pudieron cargar los productos.')
    } finally {
      setLoading(false)
    }
  }

  // ========================================
  // OBTENER CATEGORÍAS
  // ========================================

  const obtenerCategorias = async () => {
    try {
      const response = await api.get(
        '/categorias',
        getHeaders()
      )

      setCategorias(
        Array.isArray(response.data)
          ? response.data
          : response.data?.data || []
      )

    } catch (error) {
      console.error('Error al obtener categorías:', error)
      setMessage('No se pudieron cargar las categorías.')
    }
  }

  // ========================================
  // OBTENER PROVEEDORES
  // ========================================

  const obtenerProveedores = async () => {
    try {
      const response = await api.get(
        '/proveedores',
        getHeaders()
      )

      setProveedores(
        Array.isArray(response.data)
          ? response.data
          : response.data?.data || []
      )

    } catch (error) {
      console.error('Error al obtener proveedores:', error)
      setMessage('No se pudieron cargar los proveedores.')
    }
  }

  useEffect(() => {
    obtenerProductos()
    obtenerCategorias()
    obtenerProveedores()
  }, [])

  // ========================================
  // LIMPIAR FORMULARIO
  // ========================================

  const resetForm = () => {
    setForm(formularioInicial)
    setMessage('')
  }

  // ========================================
  // CONTROLAR CAMPOS
  // ========================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // ========================================
  // REGISTRAR / ACTUALIZAR PRODUCTO
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSaving(true)
    setMessage('')

    try {
      const datos = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        stock: Number(form.stock),
        categoria_id: Number(form.categoria_id),
        proveedor_id: Number(form.proveedor_id)
      }

      if (form.id) {
        await api.put(
          `/productos/${form.id}`,
          datos,
          getHeaders()
        )
      } else {
        await api.post(
          '/productos',
          datos,
          getHeaders()
        )
      }

      resetForm()

      await obtenerProductos()

      if (onRefresh) {
        await onRefresh()
      }

    } catch (error) {
      console.error('Error al guardar producto:', error)

      setMessage(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'No se pudo guardar el producto.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ========================================
  // EDITAR PRODUCTO
  // ========================================

  const handleEdit = (producto) => {
    setForm({
      id: producto.id,
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio ?? '',
      stock: producto.stock ?? '',
      categoria_id: producto.categoria_id ?? producto.categoria?.id ?? '',
      proveedor_id: producto.proveedor_id ?? producto.proveedor?.id ?? ''
    })

    setMessage('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // ========================================
  // ELIMINAR PRODUCTO
  // ========================================

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) {
      return
    }

    try {
      await api.delete(
        `/productos/${id}`,
        getHeaders()
      )

      if (form.id === id) {
        resetForm()
      }

      await obtenerProductos()

      if (onRefresh) {
        await onRefresh()
      }

    } catch (error) {
      console.error('Error al eliminar producto:', error)

      setMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'No se pudo eliminar el producto.'
      )
    }
  }

  // ========================================
  // INDICADORES
  // ========================================

  const stockTotal = productos.reduce(
    (sum, p) => sum + Number(p.stock || 0),
    0
  )

  const lowStock = productos.filter(
    p => Number(p.stock) <= 5
  ).length

  // ========================================
  // INTERFAZ
  // ========================================

  return (
    <div className="products-layout">

      {/* FORMULARIO */}

      <section className="panel form-panel">

        <div className="panel-heading">
          <div>
            <span className="eyebrow">FORMULARIO</span>

            <h3>
              {form.id ? 'Editar producto' : 'Nuevo producto'}
            </h3>
          </div>

          <span className="form-symbol">＋</span>
        </div>

        <form onSubmit={handleSubmit}>

          <label className="field">
            Nombre del producto

            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Teclado mecánico"
              required
            />
          </label>

          <label className="field">
            Descripción

            <textarea
              name="descripcion"
              rows="3"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción del producto..."
            />
          </label>

          {/* CATEGORÍA */}

          <label className="field">
            Categoría

            <select
              name="categoria_id"
              value={form.categoria_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar categoría</option>

              {categorias.map(categoria => (
                <option
                  key={categoria.id}
                  value={categoria.id}
                >
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </label>

          {/* PROVEEDOR */}

          <label className="field">
            Proveedor

            <select
              name="proveedor_id"
              value={form.proveedor_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar proveedor</option>

              {proveedores.map(proveedor => (
                <option
                  key={proveedor.id}
                  value={proveedor.id}
                >
                  {proveedor.razon_social}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            Precio (S/)

            <input
              type="number"
              step="0.01"
              min="0"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </label>

          <label className="field">
            Stock disponible

            <input
              type="number"
              min="0"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Ej. 25"
              required
            />
          </label>

          {message && (
            <div className="form-error">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? 'Guardando...'
              : form.id
                ? 'Guardar cambios'
                : 'Registrar producto'
            }

            <span>→</span>
          </button>

          {form.id && (
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancelar edición
            </button>
          )}

        </form>
      </section>

      {/* LISTADO */}

      <section className="panel list-panel">

        <div className="panel-heading">
          <div>
            <span className="eyebrow">INVENTARIO</span>
            <h3>Listado de productos</h3>
          </div>

          <span className="count-pill">
            {productos.length} registros
          </span>
        </div>

        {/* INDICADORES */}

        <div className="product-summary">

          <div className="product-summary-item">
            <span>PRODUCTOS</span>
            <strong>{productos.length}</strong>
          </div>

          <div className="product-summary-item">
            <span>STOCK TOTAL</span>
            <strong>{stockTotal}</strong>
          </div>

          <div className="product-summary-item">
            <span>STOCK BAJO</span>
            <strong className={lowStock ? 'low-stock-value' : ''}>
              {lowStock}
            </strong>
          </div>

        </div>

        {loading ? (
          <EmptyState text="Cargando productos..." />

        ) : productos.length ? (

          <div className="table-wrap">

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Proveedor</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {productos.map(prod => (

                  <tr key={prod.id}>

                    <td>
                      <span className="product-id">
                        #{prod.id}
                      </span>
                    </td>

                    <td>
                      <div className="product-name">
                        <strong>{prod.nombre}</strong>

                        <small>
                          {prod.descripcion || 'Sin descripción'}
                        </small>
                      </div>
                    </td>

                    <td>
                      {prod.categoria?.nombre || 'Sin categoría'}
                    </td>

                    <td>
                      {prod.proveedor?.razon_social || 'Sin proveedor'}
                    </td>

                    <td>
                      <strong>
                        S/ {Number(prod.precio || 0).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      {prod.stock ?? 0} unidades
                    </td>

                    <td>
                      <span className={`status ${
                        Number(prod.stock) <= 5
                          ? 'warning'
                          : 'success'
                      }`}>
                        {Number(prod.stock) <= 5
                          ? 'Stock bajo'
                          : 'Disponible'
                        }
                      </span>
                    </td>

                    <td>
                      <div className="actions">

                        <button
                          type="button"
                          className="icon-button edit"
                          title="Editar producto"
                          onClick={() => handleEdit(prod)}
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          className="icon-button delete"
                          title="Eliminar producto"
                          onClick={() => handleDelete(prod.id)}
                        >
                          ×
                        </button>

                      </div>
                    </td>

                  </tr>

                ))}
              </tbody>
            </table>

          </div>

        ) : (

          <EmptyState text="Todavía no hay productos registrados." />

        )}

      </section>

    </div>
  )
}

export default CrudProductos