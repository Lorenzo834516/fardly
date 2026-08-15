# Plataforma de Fidelización — MVP

## 1. Correr en tu computadora

```bash
npm install
cp .env.local.example .env.local
```

Abre `.env.local` y pon la URL y la `anon key` de tu proyecto Supabase
(Supabase → Settings → API).

```bash
npm run dev
```

Abre http://localhost:3000

## 2. Subirlo a internet gratis (Vercel)

1. Crea un repositorio en GitHub y sube esta carpeta.
2. Entra a vercel.com → "Add New Project" → importa el repo.
3. En "Environment Variables" agrega `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (los mismos valores de tu `.env.local`).
4. Deploy. Vercel te da una URL pública tipo `tu-proyecto.vercel.app`.

## 3. Qué hace este MVP por ahora

- `/` — página de aterrizaje (landing) explicando el producto.
- `/registro` — formulario donde un negocio se registra: crea su cuenta
  (Supabase Auth) y su fila en la tabla `businesses`.

## 4. Siguientes pasos sugeridos

- Panel del negocio (`/panel`) para ver clientes y otorgar puntos.
- Pantalla pública de la tarjeta del cliente (`/n/[slug]`).
- Conectar WhatsApp Cloud API para las notificaciones automáticas.
