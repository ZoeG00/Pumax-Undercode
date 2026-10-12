# Pumax

Sistema de gestión (productos, stock, clientes, ventas y facturación).

- `back/`  → API en Node + Express + Sequelize (MySQL)
- `front/` → App en React Native (Expo) con versión web instalable (PWA)

## Back
```bash
cd back
cp .env.example .env     # completá tus datos de MySQL
npm install
npm run dev              # http://localhost:3000/api
```

## Front
```bash
cd front
npm install
npm run web              # versión web en desarrollo
npx expo start           # celular / emulador (usá EXPO_PUBLIC_API_URL con la IP de tu PC)
```

## PWA
```bash
npm run build:web        # genera front/dist
npm run serve:web        # prueba local de lo exportado
```
El service worker solo se registra en `https://`, así que la instalación se prueba ya publicada
(Railway, Vercel, Netlify...). Si cambiás la app y querés forzar la actualización en todos los
dispositivos, subí `VERSION` en `front/public/sw.js`.

## Estructura del front
```
front/
├── app/          pantallas (rutas de Expo Router)
├── components/   Menu y modales reutilizables
├── hooks/  services/  types/  context/  constants/
├── public/       manifest, service worker e íconos de la PWA
└── assets/       logo e íconos
```
Colores de marca: verde `#0b6623` y bordó `#ae2151` (tokens `brand-*` y `wine-*` en `tailwind.config.js`).
