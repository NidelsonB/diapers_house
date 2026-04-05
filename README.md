# La Casa del Pañal

Tienda web moderna, responsive y lista para presentación comercial, con **sitio público** y **panel administrador** dentro de la misma plataforma.

---

## ✨ Stack elegido

- **Next.js 16 + React 19 + TypeScript**
  - Excelente rendimiento, SEO básico y estructura escalable.
- **Tailwind CSS 4**
  - Permite una UI moderna, limpia y consistente.
- **Estado local + localStorage**
  - Ideal para este MVP funcional sin backend real todavía.

> Esta base quedó preparada para crecer luego a autenticación robusta, base de datos real y pagos en línea.

---

## ✅ Funcionalidades incluidas

### Sitio público
- Home visual con hero/banner principal
- Beneficios y mensajes de confianza
- Catálogo con búsqueda y filtros
- Fichas de producto
- Carrito de compras
- Checkout claro
- Página de contacto y sucursales
- Botón flotante de WhatsApp
- Diseño responsive para móvil, tablet y escritorio

### Panel administrador
- Login de administrador
- CRUD de productos
- CRUD de categorías
- Gestión de stock y precios
- Gestión de pedidos y estados
- Gestión de contenido general del home y sucursales
- Dashboard con métricas básicas
- Validaciones y confirmaciones de borrado

---

## 🔐 Acceso demo al panel

- **URL:** `/admin/login`
- **Correo:** `admin@lacasadelpanal.com`
- **Contraseña:** `Admin123*`

---

## 🚀 Ejecutar localmente

```bash
npm install
npm run dev
```

Abrir en el navegador:

```bash
http://localhost:3000
```

Para validar la versión de producción:

```bash
npm run build
npm start
```

---

## 📁 Estructura principal

```text
src/
  app/              # Rutas públicas y admin
  components/       # Componentes reutilizables
  data/             # Datos demo iniciales
  lib/              # Utilidades
  providers/        # Estado global del sitio
  types/            # Tipos TypeScript
public/
  brand/            # Branding visual
  products/         # Imágenes demo del catálogo
```

---

## 🧪 Datos demo y comportamiento

- Los productos, categorías, pedidos y contenido general se cargan con datos de ejemplo realistas.
- Los cambios hechos en el panel se guardan en `localStorage` para la demo.
- El botón **Reset demo** restaura el estado inicial.

---

## 🔮 Siguientes pasos recomendados para producción

1. Integrar base de datos real (`PostgreSQL` + `Prisma`)
2. Agregar autenticación segura (`NextAuth` o similar)
3. Integrar pagos (`Mercado Pago` o `Stripe`)
4. Subida real de imágenes a cloud storage
5. Gestión avanzada de clientes y pedidos

---

## 📌 Estado actual

Proyecto listo para mostrar a cliente como **MVP profesional**, con buena base técnica y visual para evolucionar a una tienda real.
