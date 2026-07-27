# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Padres/madres locales (El Salvador) que reponen pañales y articulos de bebe con frecuencia. Compran por catalogo web o via WhatsApp para atencion personalizada; retiran o reciben en una de las sucursales fisicas listadas en el sitio.

## Product Purpose

Tienda web ("La Casa del Pañal") para catalogo y compra de pañales y productos de bebe, con checkout que genera pedidos reales (nombre, telefono, sucursal, direccion, notas) y panel admin para gestionar productos, categorias, pedidos y configuracion del negocio.

## Positioning

Combina catalogo online con atencion cercana: WhatsApp para dudas de talla/etapa del bebe + red de sucursales fisicas para retiro/entrega. No es solo un ecommerce generico de pañales — la diferenciacion es la cercania humana (orientacion por WhatsApp) sumada a presencia fisica local, frente a super/farmacia o un ecommerce sin ese acompañamiento.

## Operating Context

- Checkout captura: nombre, telefono, sucursal (de una lista real de sucursales), direccion, notas — sin pago en linea (pedido se coordina despues).
- WhatsApp como canal paralelo de atencion (numeros configurables en SiteSettings).
- Productos: talla, marca, presentacion (pack), stock, tags, precio con posible originalPrice (oferta/onSale), destacados (featured/isNew).
- Admin: login por sesion (cookie), CRUD productos/categorias, gestion de pedidos (cambio de estado), configuracion general (whatsapp, redes, sucursales, mensajes de confianza, hero banner).
- Rama `qa`: entorno efimero (MySQL en tmpfs, se reseedea en cada recreacion) para pruebas en Easypanel, no toca datos reales.

## Capabilities and Constraints

- CRUD productos/categorias, checkout con creacion real de pedidos, actualizacion de estado de pedidos, configuracion general del negocio, seed inicial (datos demo + admin).
- Sin pasarela de pago integrada (confirmar si es decision definitiva o pendiente).
- Sin catalogo multi-idioma (solo español, es-SV) — confirmar si aplica soporte i18n futuro.

## Brand Commitments

- Nombre: "La Casa del Pañal".
- Mascota oficial: **Pañalín** (imagen `brand/panalin-transparent.png`), ya definida y en uso — preservar, no reemplazar.
- Colores de marca ya fijos: gradiente morado/azul-morado + amarillo (`#442e75`, `#29326d`, `#fdf90f`) usado en hero; tokens `brand-primary`, `brand-secondary`, `brand-accent`, `brand-soft` ya en Tailwind config — trabajar dentro de esta identidad.
- Voz: cercana, en español informal-cordial ("¿Puedes pedir por WhatsApp además de la web? Sí...").

## Evidence on Hand

- Seed real de sucursales (branches) en `SiteSettings.branches` vía `prisma/seed.ts` / `site-repository`.
- FAQ real embebido en home-page.tsx (WhatsApp, tallas, ayuda para elegir).
- Imagen de mascota en `public/brand/panalin-transparent.png` (confirmar ruta exacta si difiere).
- No hay testimonios/casos de estudio/prensa documentados — no inventar.

## Product Principles

1. Cercania humana ante todo: cada flujo (catalogo, checkout, contacto) debe dejar visible la opcion de WhatsApp/atencion personalizada, no solo el checkout automatizado.
2. Claridad de talla/etapa: el producto debe ayudar a elegir (talla, presentacion, marca) sin friccion, reflejando el FAQ real ya escrito.
3. Confianza operativa: sucursales, contacto y estado de pedido deben sentirse reales y verificables, no genericos de plantilla ecommerce.
4. Identidad de marca (Pañalín + paleta morado/amarillo) es un compromiso fijo — iterar dentro de ella, no sustituirla por un sistema generico.
5. Admin como herramienta interna: prioriza velocidad y claridad operativa sobre pulido de marca (registro `product`, no `brand`, para esa superficie).

## Accessibility & Inclusion

Sin requisito de accesibilidad especifico confirmado aun mas alla de buenas practicas estandar (contraste, foco, labels) — aplicar el minimo AA por defecto.
