# Ejemplos — Popup dos columnas (Bootstrap CSS + vanilla JS)

Detectar versión del CSS en el `<link>`. **No** cargar `bootstrap.js`, jQuery ni Popper.

## HTML + script mínimo (Bootstrap 4)

```html
<button type="button" class="btn btn-primary" id="promoPopupOpen">Ver oferta</button>

<div class="modal fade" id="promoPopup" tabindex="-1" role="dialog" aria-labelledby="promoTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
    <div class="modal-content border-0 overflow-hidden">
      <div class="modal-body p-0">
        <div class="row no-gutters">
          <div class="col-12 col-md-6 d-flex flex-column justify-content-center p-4 p-md-5">
            <button type="button" class="close align-self-end mb-2" data-popup-close aria-label="Cerrar">
              <span aria-hidden="true">&times;</span>
            </button>
            <h2 class="h4 mb-3" id="promoTitle">Oferta especial</h2>
            <p class="text-muted mb-4">Descripción breve.</p>
            <a href="#" class="btn btn-primary align-self-start">Saber más</a>
          </div>
          <div class="col-12 col-md-6">
            <img src="https://picsum.photos/600/800" alt="Ilustración" class="w-100" style="object-fit: cover; min-height: 220px;">
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
var modal = document.getElementById('promoPopup');
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

document.getElementById('promoPopupOpen').onclick = function () { setOpen(true); };
modal.querySelector('[data-popup-close]').onclick = function () { setOpen(false); };
</script>
```

## Bootstrap 5

Mismo script. Markup: `row g-0`, `btn-close` con `data-popup-close`.

## Abrir al cargar

Añadir al final del `<script>`: `setOpen(true);`

## Lo que no usar

- `data-toggle` / `data-bs-toggle`, `bootstrap.Modal`, jQuery, Popper, `bootstrap.bundle.min.js`
