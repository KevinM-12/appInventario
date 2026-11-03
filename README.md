# Nexus Inventory — Panel administrativo

Interfaz React + Vite para el Laboratorio #9. Conserva la configuración de Axios que ya tenía el proyecto (`http://localhost:3000`) y las rutas originales de productos.

## Ejecutar el frontend

```bash
npm install
npm run dev
```

## Conexión con el backend

El frontend consume la API configurada en `src/services/api.js`:

- `GET /productos`, `POST /productos`, `PUT /productos/:id`, `DELETE /productos/:id`
- `GET /categorias`, `POST /categorias`, `PUT /categorias/:id`, `DELETE /categorias/:id`
- `GET /proveedores`, `POST /proveedores`, `PUT /proveedores/:id`, `DELETE /proveedores/:id`
- `GET /movimientos`, `POST /movimientos`

**Importante:** el ZIP recibido contiene el frontend `appInventario`, pero no incluye el código del servidor Express ni el esquema MySQL. Por eso se conserva la URL existente y se prepara la interfaz para esos endpoints, sin inventar credenciales, tablas ni implementar una lógica de backend que no estaba en los archivos entregados. Las pantallas de categorías, proveedores y Kardex requieren que el backend exponga las rutas indicadas.

## Secciones

- Resumen: indicadores de productos, unidades, stock bajo y categorías.
- Productos: alta, edición, eliminación y listado.
- Categorías: alta, edición, eliminación y listado.
- Proveedores: alta, edición, eliminación y listado.
- Kardex: registro e historial de entradas, salidas y ajustes.

La navegación se realiza mediante rutas hash (`#dashboard`, `#productos`, etc.) para no introducir dependencias nuevas en el proyecto recibido.
