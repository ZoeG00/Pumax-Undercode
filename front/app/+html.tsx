import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * HTML raíz de la versión web (PWA).
 * Solo se ejecuta al exportar la web; no afecta a la app nativa.
 */
const REGISTER_SERVICE_WORKER = `
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function (e) {
      console.warn('No se pudo registrar el service worker', e);
    });
  });
}`;

const BASE_STYLES = `
@font-face { font-family: 'Montserrat'; font-weight: 50; font-style: normal; font-display: swap; src: url('/fonts/Montserrat_400Regular.ttf') format('truetype'); }
@font-face { font-family: 'Montserrat'; font-weight: 100; font-style: normal; font-display: swap; src: url('/fonts/Montserrat_500Medium.ttf') format('truetype'); }
@font-face { font-family: 'Montserrat'; font-weight: 200; font-style: normal; font-display: swap; src: url('/fonts/Montserrat_600SemiBold.ttf') format('truetype'); }
@font-face { font-family: 'Montserrat'; font-weight: 300; font-style: normal; font-display: swap; src: url('/fonts/Montserrat_700Bold.ttf') format('truetype'); }
html, body { background-color: #0d1210; }
body { overscroll-behavior-y: none; }
/* Fuente de la app: React Native Web fija su propia fuente en cada texto, por eso el !important */
body, div[dir="auto"], span[dir="auto"], input, textarea, button, select {
  font-family: 'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif !important;
}
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <title>Pumax</title>
        <meta name="description" content="Sistema de gestión Pumax" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b6623" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Pumax" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: BASE_STYLES }} />
        <script dangerouslySetInnerHTML={{ __html: REGISTER_SERVICE_WORKER }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
