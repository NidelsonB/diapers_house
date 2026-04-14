# La Casa del Panal

Tienda web con frontend en Next.js 16 y backend integrado sobre App Router, Prisma y MySQL.

## Stack de produccion

- Next.js 16 + React 19 + TypeScript
- Prisma ORM
- MySQL 8
- Autenticacion admin con sesion segura por cookie HTTP-only
- Docker + Nginx como reverse proxy

## Backend incluido

- CRUD de productos
- CRUD de categorias
- Checkout con creacion real de pedidos
- Actualizacion de estados de pedido
- Configuracion general del negocio
- Seed inicial de datos y usuario administrador
- Persistencia real en MySQL

## Variables de entorno

Crea `.env` a partir de `.env.example`.

Variables clave:

- `DATABASE_URL`
- `SESSION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

## Desarrollo local

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Produccion con Docker

```bash
cp .env.example .env
# edita credenciales seguras

docker compose -f docker-compose.prod.yml up --build -d
```

Servicios:

- `mysql`: base de datos MySQL 8
- `app`: servidor Next.js
- `nginx`: reverse proxy publico

## Despliegue en Easypanel

Esta rama `qa` queda pensada para un VPS con Easypanel usando Docker Compose.

Recomendado en Easypanel:

1. Crear una app desde repositorio Git y seleccionar la rama `qa`.
2. Usar `docker-compose.prod.yml` como archivo de despliegue.
3. Configurar estas variables en Easypanel:

```env
NEXT_PUBLIC_SITE_URL=https://qa.tudominio.com
SESSION_SECRET=una-clave-larga-y-segura
ADMIN_EMAIL=admin@lacasadelpanal.com
ADMIN_PASSWORD=una-clave-segura
ADMIN_NAME=Administrador
MYSQL_PASSWORD=una-clave-mysql
MYSQL_ROOT_PASSWORD=otra-clave-root
SEED_DATABASE=true
```

Notas:

- `NEXT_PUBLIC_SITE_URL` debe apuntar al dominio QA real para metadata, sitemap y SEO.
- En el primer arranque puedes dejar `SEED_DATABASE=true` para cargar datos base.
- Despues de validar el entorno QA, puedes cambiar `SEED_DATABASE=false` para evitar resembrados innecesarios.
- El servicio `app` incluye `healthcheck`, y `nginx` espera a que la aplicacion este saludable antes de exponer trafico.

## Acceso administrador inicial

- URL: `/admin/login`
- Correo: valor de `ADMIN_EMAIL`
- Clave: valor de `ADMIN_PASSWORD`

## Scripts utiles

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run db:reset
npm run build
npm run start
```

## Notas de despliegue

- La app ya no usa `output: export`; ahora corre como servidor Node para habilitar API y MySQL.
- El Dockerfile ejecuta `prisma db push` al iniciar el contenedor.
- Si `SEED_DATABASE=true`, el arranque inserta el seed base y asegura el usuario administrador.
