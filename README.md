# 🧉 TataWeb

Página web del **Tata**, el bot de Discord de mitología latinoamericana (el bot vive en `../TataBot`).
Es una página estática (HTML, CSS y JS, sin servidor) pensada para **GitHub Pages**, en español e inglés.

| Página | Qué tiene |
|---|---|
| `index.html` | Portada: qué es el Tata, cómo empezar, moderación, votar e invitar |
| `comandos.html` | Todos los comandos por categoría, con buscador (sale de `data/*/commands.json`) |
| `guia.html` | Dones, criaturas, zonas, nahuales, reliquias y rangos (sale de `data/*/guide.json`) |
| `premium.html` | Padrino, servidor premium y links de pago |
| `terminos.html` · `privacidad.html` | Legales (los piden top.gg y la verificación de Discord) |

## Actualizar los comandos y la guía

Los datos se generan desde el código del bot, así que cuando cambien los comandos o el contenido del juego:

```
node scripts/build-data.js
```

(busca el bot en `../TataBot`; si está en otro lado: `node scripts/build-data.js C:/ruta/al/TataBot`).
No arranca el bot ni toca su carpeta. Después hacé commit de `data/` y push.

## Links (invitación, votos, pagos, soporte)

Están todos juntos arriba de todo en `assets/site.js` (`CONFIG`). Lo que quede vacío no se muestra:
- `support`: el link de invitación al **servidor de soporte** (todavía no hay).
- `votes`: agregar **Top.gg** cuando lo aprueben (ya está la línea comentada).

## Idiomas

Cada texto está escrito en los dos idiomas: `<span data-only="es">…</span><span data-only="en">…</span>`.
El botón ES/EN cambia `<html data-lang>` y se recuerda en el navegador. Para compartir un link en un idioma: `?lang=en`.

## Probar en tu compu

Abrí una terminal en esta carpeta, corré `node scripts/serve.js` y entrá a http://localhost:8765.
Abrir el HTML con doble clic no alcanza: el navegador bloquea la carga de `data/*.json`.

## Publicar en GitHub Pages

1. Subí esta carpeta a un repositorio de GitHub (por ejemplo `NachoCro/TataWeb`).
2. En el repo: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
3. Queda en `https://nachocro.github.io/TataWeb/`. Para un dominio propio, agregá un archivo `CNAME` con el dominio.
4. Poné esa dirección en el Developer Portal (Terms of Service URL y Privacy Policy URL) y en las páginas de bots.
