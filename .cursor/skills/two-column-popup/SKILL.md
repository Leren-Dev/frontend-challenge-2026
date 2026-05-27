---
name: two-column-popup
description: >-
  Crea un popup/modal de dos columnas con texto a la izquierda e imagen a la
  derecha. Bootstrap solo para CSS (grid, modal, utilidades). Comportamiento
  open/close con JavaScript vanilla, sin jQuery ni bootstrap.js. Respeta la
  versión de Bootstrap CSS ya cargada en el proyecto. Usar cuando el usuario
  pida popup, modal, diálogo, overlay o layout de dos columnas.
---

# Popup dos columnas (texto izquierda, imagen derecha)

## Objetivo

Modal de **dos columnas** con clases Bootstrap para el aspecto:

| Columna | Contenido | Desktop |
|---------|-----------|---------|
| Izquierda | Título, texto, CTA, cerrar | `col-md-6` primero |
| Derecha | `<img>` | `col-md-6` segundo |

Móvil: texto arriba, imagen abajo.

## Prioridad: versión de Bootstrap CSS del proyecto

1. Leer `index.html` / `package.json` y detectar la versión del **CSS** de Bootstrap (`bootstrap@4.x`, `bootstrap@5.x`).
2. Usar **solo ese CSS** para markup y utilidades (`row`, `col-*`, `modal`, `btn`, etc.).
3. **No añadir** `bootstrap.js`, `bootstrap.bundle.js`, jQuery, Popper ni otras librerías para el popup.
4. **No mezclar** BS4 y BS5 en la misma página.

| Versión CSS | Grid sin gutters | Botón cerrar |
|-------------|------------------|--------------|
| **BS5** | `row g-0` | `btn-close` |
| **BS4** | `row no-gutters` | `button.close` + `&times;` |

## Restricciones (obligatorio)

- **Bootstrap = solo CSS** (el que ya tenga el proyecto).
- **Popup = solo JS vanilla** para abrir, cerrar, backdrop y Escape. Sin `data-toggle`, `data-bs-toggle`, `bootstrap.Modal`, jQuery ni CDN de scripts.
- **Sin CSS custom** para layout del modal: clases Bootstrap. El script solo alterna clases/estados que Bootstrap ya define (`show`, `modal-open`, `modal-backdrop`).
- Botón abrir: `id` fijo o `data-popup-open` (sin `data-toggle` de Bootstrap).
- Botón cerrar: `data-popup-close` dentro del modal.

## Estructura HTML

Sustituir `BS_VERSION` por `4` o `5` según el proyecto. Ejemplo con **BS4** (el de este repo):

```html
<button type="button" class="btn btn-primary" id="twoColumnPopupOpen">
  Abrir
</button>

<div class="modal fade" id="twoColumnPopup" tabindex="-1" role="dialog" aria-labelledby="twoColumnPopupTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
    <div class="modal-content border-0 overflow-hidden">
      <div class="modal-body p-0">
        <div class="row no-gutters align-items-stretch">
          <div class="col-12 col-md-6 d-flex flex-column justify-content-center p-4 p-md-5">
            <button type="button" class="close align-self-end mb-2" data-popup-close aria-label="Cerrar">
              <span aria-hidden="true">&times;</span>
            </button>
            <h2 class="h4 mb-3" id="twoColumnPopupTitle">Título</h2>
            <p class="text-muted mb-4">Texto descriptivo.</p>
            <a href="#" class="btn btn-primary align-self-start">Acción</a>
          </div>
          <div class="col-12 col-md-6">
            <img src="ruta/a/imagen.jpg" alt="Descripción" class="w-100" style="object-fit: cover; min-height: 200px;">
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="popup.js"></script><!-- o el mismo script inline al final del body -->
```

**BS5**: `g-0`, `btn-close` con `data-popup-close`, sin `role="document"` si no hace falta.

El modal debe empezar **oculto** (`aria-hidden="true"`, sin clase `show`, sin `display: block` inline).

## Script vanilla (`popup.js` o `<script>` al final del body)

Adaptar los tres `id`. **Sin librerías.** Una sola función `setOpen(on)`:

```javascript
var modal = document.getElementById('twoColumnPopup');
var backdrop;

function setOpen(on) {
  modal.style.display = on ? 'block' : 'none';
  modal.classList.toggle('show', on);
  document.body.classList.toggle('modal-open', on);
  if (on) {
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop show';
    backdrop.onclick = function () { setOpen(false); };
    document.body.appendChild(backdrop);
  } else if (backdrop) {
    backdrop.remove();
    backdrop = null;
  }
}

document.getElementById('twoColumnPopupOpen').onclick = function () { setOpen(true); };
modal.querySelector('[data-popup-close]').onclick = function () { setOpen(false); };
```

Opcional — Escape:

```javascript
document.onkeydown = function (e) { if (e.key === 'Escape') setOpen(false); };
```

### Abrir al cargar (solo si el usuario lo pide)

Al final del script: `setOpen(true);`

## Reglas de layout

1. Texto antes que imagen en el DOM.
2. `no-gutters` (BS4) o `g-0` (BS5).
3. `alt` en cada `<img>`.
4. Script al final del `<body>` (`popup.js` o `<script>` inline con `setOpen`).

## Checklist

- [ ] CSS Bootstrap del proyecto, **sin** JS de Bootstrap/jQuery para el modal
- [ ] `popup.js` solo vanilla
- [ ] Abrir con `setOpen(true)` / `#twoColumnPopupOpen` (no `data-toggle` / `data-bs-*`)
- [ ] Texto izquierda, imagen derecha en `md+`
- [ ] Cerrar: botón, backdrop y Escape
- [ ] Versión BS4/BS5 coherente con el `<link>` existente

## Variantes

| Petición | Solución |
|----------|----------|
| Sin CTA | Quitar el `btn` |
| Varios modales | Un `popup.js` parametrizado o un IIFE por modal con distinto `modalId` |
| Modal más ancho | `modal-lg` / `modal-xl` (clase CSS Bootstrap) |

Ver [examples.md](examples.md).
