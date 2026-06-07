# Galería Mariscal — Joyería de Autor, Plata 925, Zacatecas México

Plataforma web para la gestión y presentación de joyería de autor en plata 925, con sistema de publicación automática para redes sociales (Instagram y Facebook), carga múltiple de archivos, soporte de video y herramientas de IA para generación de contenido.

## Características

- **Galería Elegante** — Presentación curada de piezas de plata 925 con filtros por categoría, búsqueda y diseño responsivo
- **Publicación Automática (Autopost)** — Programa publicaciones múltiples diarias para Instagram y Facebook con soporte de recurrencia
- **Carga Múltiple de Archivos** — Sube varias imágenes y videos simultáneamente con vista previa y drag & drop
- **Soporte de Video** — Integración completa de contenido de video en la galería y publicaciones
- **Estudio de IA** — Generación de descripciones, captions y contenido para redes sociales usando inteligencia artificial
- **Calendario Visual** — Vista de calendario para planificar y visualizar publicaciones programadas
- **Analíticas** — Seguimiento de métricas de engagement (likes, comentarios, shares, alcance)
- **Gestión de Hashtags** — Conjuntos de hashtags organizados por categoría para optimizar alcance
- **Panel de Administración** — Configuración de cuenta, credenciales de API y gestión del sistema
- **Modo Oscuro/Claro** — Tema dual con paleta inspirada en oro rosa y plata
- **Diseño Responsivo** — Optimizado para móvil, tablet y escritorio

## Tecnologías

- **Framework**: Next.js 16 con App Router
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4 + shadcn/ui
- **Estado**: Zustand (cliente) + TanStack Query (servidor)
- **Base de Datos**: Prisma ORM con SQLite
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

## Inicio Rápido

```bash
# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env

# Inicializar base de datos
bun run db:push

# Iniciar servidor de desarrollo
bun run dev
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/            # Rutas de API (productos, publicaciones, IA, hashtags)
│   ├── globals.css     # Estilos globales y tema
│   ├── layout.tsx      # Layout raíz con metadatos SEO
│   └── page.tsx        # Página principal con navegación por secciones
├── components/
│   ├── ui/             # Componentes shadcn/ui
│   ├── gallery.tsx     # Galería de joyería con filtros y búsqueda
│   ├── upload.tsx      # Carga múltiple de archivos con preview
│   ├── schedule.tsx    # Programación de publicaciones
│   ├── calendar-view.tsx # Vista de calendario
│   ├── analytics.tsx   # Dashboard de analíticas
│   ├── hashtags.tsx    # Gestión de conjuntos de hashtags
│   ├── ai-studio.tsx   # Estudio de generación con IA
│   ├── admin.tsx       # Panel de administración
│   └── sidebar.tsx     # Navegación lateral responsiva
├── hooks/              # Hooks personalizados
└── lib/
    ├── store.ts        # Estado global con Zustand
    ├── demo-data.ts    # Datos de demostración
    ├── db.ts           # Cliente de base de datos
    └── utils.ts        # Utilidades
```

## Variables de Entorno

Crear un archivo `.env` con las siguientes variables:

```env
DATABASE_URL=file:./dev.db

# Credenciales de API de Meta (Instagram/Facebook)
META_APP_ID=
META_APP_SECRET=
META_ACCESS_TOKEN=
META_BUSINESS_ACCOUNT_ID=

# Configuración de IA
AI_API_KEY=
```

## Credenciales de Administrador

Las credenciales por defecto del panel de administración se configuran en `src/lib/store.ts`.

## Licencia

Todos los derechos reservados — Galería Mariscal, Zacatecas, México.
