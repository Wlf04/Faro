# Faro Security+ — Proyecto organizado (SY0-701)

Aplicación de estudio **bilingüe (español / inglés)** para la certificación CompTIA Security+ SY0-701. Contiene 500 preguntas de práctica, la ruta guiada por 28 objetivos, tarjetas, simulacros, PBQ, notas y progreso local.

## Cómo abrirla

1. Descomprime el archivo ZIP **conservando todas las carpetas**.
2. Abre `index.html` en un navegador moderno (Chrome, Edge o Firefox).
3. Para desarrollo local, se recomienda iniciar un servidor en la carpeta del proyecto:

   ```bash
   python -m http.server 8000
   ```

   Después abre http://localhost:8000

**Importante:** `index.html` depende de las carpetas `assets/css` y `assets/js`: no muevas solamente el HTML fuera del proyecto.

## Organización

```text
Faro_SecurityPlus_Proyecto/
├── index.html                         # Estructura HTML
├── assets/
│   ├── css/
│   │   ├── base.css                   # Variables, diseño y componentes generales
│   │   ├── security.css               # Apariencia Security+
│   │   ├── simple-ui.css              # Vistas principales simplificadas
│   │   ├── languages.css              # Selector y ajustes de idioma
│   │   ├── study-path.css             # Lecciones, tarjetas y exámenes por objetivo
│   │   └── questions.css              # Banco de preguntas y resultados
│   └── js/
│       ├── core/
│       │   └── app-core.js            # Estado, almacenamiento, eventos y utilidades
│       ├── data/
│       │   ├── security-content.js    # 5 dominios, 28 objetivos, 57 preguntas base
│       │   ├── translations.js        # Traducción del contenido base
│       │   ├── study-lessons.js        # 28 lecciones de la ruta guiada
│       │   ├── questions-extra.js     # 443 preguntas nuevas
│       │   └── questions-extra-translations.js # Traducciones de las 443 preguntas
│       ├── features/
│       │   ├── security.js            # Seguridad, PBQ y exámenes base
│       │   ├── simple-ui.js           # Pantallas simplificadas
│       │   ├── languages.js           # Lógica ES/EN
│       │   ├── study-path.js          # Estudiar → tarjetas → mini examen
│       │   └── questions.js           # Simulacros de hasta 90 preguntas
│       └── main.js                    # Arranque de la aplicación
└── README.md
```

## Cómo editar

- **Colores y diseño:** `assets/css/base.css` y los CSS específicos.
- **Preguntas originales:** `assets/js/data/security-content.js` contiene la colección `SEC_QUESTIONS`. Las adicionales están en `assets/js/data/questions-extra.js`.
- **Traducciones:** `assets/js/data/translations.js` y `assets/js/data/questions-extra-translations.js`.
- **Lecciones de estudio:** `assets/js/data/study-lessons.js`.
- **Ruta guiada y mini exámenes:** `assets/js/features/study-path.js`.
- **Selección de preguntas y resultados:** `assets/js/features/questions.js`.
- **Menús principales y almacenamiento:** `assets/js/core/app-core.js` y `assets/js/features/simple-ui.js`.

Los scripts están en orden de dependencias dentro de `index.html`. **No cambies ese orden** sin revisar sus dependencias. Se mantienen como scripts clásicos para permitir ejecución directa desde carpetas, sin compilador, npm ni servidor obligatorio.

## Datos de usuario y copias de seguridad

El progreso se guarda en `localStorage` del navegador. Separar el código en múltiples archivos **no modifica la estructura del progreso**: las claves existentes se mantienen. Aun así, haz una copia desde Ajustes antes de actualizar o cambiar de origen, navegador, carpeta o URL.

> El almacenamiento al abrir el HTML como `file://` puede variar según el navegador. Para mayor fiabilidad usa un servidor local y siempre exporta backups periódicos. El origen `file://` y `http://localhost:8000` no comparten necesariamente el mismo almacenamiento.

## Notas

- Las 500 preguntas son material educativo original; no son preguntas oficiales de CompTIA.
- El contenido de estudio sigue siendo el de la versión anterior, solamente dividido en archivos.
- Algunas funciones de importación de PDF/Word pueden necesitar Internet para cargar bibliotecas externas.
