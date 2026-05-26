# 🚜 Control de Mantenimiento — Tractores v2

Sistema de mantenimiento preventivo para equipos frontales con:
- **Login de administrador** (Supabase Auth)
- **Dashboard admin** con estadísticas, filtros y tabla completa
- **Generador de QR por equipo** — imprime y pega en el tractor
- **Formulario público** — accesible sin login, vía QR o URL directa
- **Formulario por equipo** — el QR pre-selecciona el equipo automáticamente

---

## 🗂 Rutas del sistema

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Público | Login del administrador |
| `/admin` | 🔒 Admin | Dashboard: stats + tabla de registros |
| `/admin/equipos` | 🔒 Admin | Generador de QR por equipo |
| `/registro` | Público | Formulario general (elige equipo) |
| `/registro/930K-1` | Público (QR) | Formulario con equipo pre-cargado |

---

## ⚙️ Setup paso a paso

### 1. Crear proyecto Supabase

1. Ve a [supabase.com](https://supabase.com) → New project
2. Espera que inicialice (~1 min)

### 2. Ejecutar SQL

Ve a **SQL Editor** → pega y ejecuta `supabase-setup.sql`

### 3. Crear usuario admin

Ve a **Authentication → Users → Add user**
- Email: `admin@tuempresa.com`
- Password: `tu_password_segura`

> ⚠️ Guarda estas credenciales, son las que usas en `/login`

### 4. Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Credenciales en: **Supabase → Settings → API**

### 5. Instalar y correr

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) → redirige a `/admin` → pide login

---

## 📱 Flujo de QR

```
Admin genera QR para "930K-1"
        ↓
QR contiene: https://tu-app.com/registro/930K-1
        ↓
Operador escanea QR con su celular
        ↓
Abre formulario con "930K-1" pre-cargado y bloqueado
        ↓
Llena: turno, operador, tareas, foto
        ↓
Guarda → aparece en dashboard del admin
```

---

## 🚀 Deploy en Vercel

```bash
npx vercel
```

Variables de entorno en Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` → `https://tu-dominio.vercel.app`

> **Importante:** Actualiza `NEXT_PUBLIC_APP_URL` con tu dominio real para que los QR apunten a la URL correcta.

---

## 📊 Estructura de BD

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | Auto |
| `fecha` | date | Fecha del mantenimiento |
| `turno` | text | 6-14, 6-18, 18-6, 14-10, 10-6 |
| `operador` | text | Nombre del operador |
| `equipo` | text | Código del tractor |
| `engrase` | boolean | |
| `sopleteo` | boolean | |
| `foto_url` | text | URL pública en Supabase Storage |
| `observaciones` | text | Nullable |
| `created_at` | timestamptz | Auto |
