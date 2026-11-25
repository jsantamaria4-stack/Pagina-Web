# JOTHA Photography – Sitio web (versión lista para abrir)

Abre `index.html` con doble clic o con Live Server: no necesita instalar nada.

Sitio One Page (HTML + CSS + JS puro, sin instalar nada).

## Ejecutar en Visual Studio Code
1. Abre la carpeta `jotha-photography` en VS Code.
2. Instala la extensión **Live Server**.
3. Clic derecho en `index.html` → **Open with Live Server**.

## Publicar gratis (enlace público)
- **Netlify:** entra a app.netlify.com/drop y arrastra la carpeta completa.
- **Vercel:** `npm i -g vercel` y luego `vercel` dentro de la carpeta (framework: Other).
- **GitHub Pages:** sube la carpeta a un repositorio → Settings → Pages → Branch `main` / root.

> Las texturas del paisaje van incrustadas (`js/hero-data.js`), por eso la animación funciona incluso con doble clic en `index.html`. Si cambias `hero.jpg`, regenera ese archivo.

## Datos que puedes editar
- Teléfono / WhatsApp y correo: sección `#contacto` en `index.html` (busca `573160561257` y `jotaph218@gmail.com`).
- Redes sociales: no venían con enlace en el PDF; agrega tu Instagram dentro de `.ct-links`.
- Galería: arreglo `items` en `js/main.js` + imágenes en `assets/img/` (formato `g-nombre.webp`).
