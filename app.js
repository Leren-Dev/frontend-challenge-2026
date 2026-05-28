(function () {
    // README: base https://lerenconsulting.com/apptiendanube
    // En localhost usamos el proxy de dev-server.mjs (misma ruta /apptiendanube) por CORS de la API.
    var API_BASE = 'https://lerenconsulting.com/apptiendanube';
    var host = window.location.hostname;

    if (host === 'localhost' || host === '127.0.0.1') {
        API_BASE = window.location.origin + '/apptiendanube';
    }

    var PRODUCT_UUID = 'fc7ba3cd-9e62-409d-84df-7ccd64a17f59';

    var popup = document.getElementById('productPopup');
    var backdrop = document.getElementById('productPopupBackdrop');
    var openBtn = document.getElementById('openProductPopup');
    var closeBtn = document.getElementById('closeProductPopup');
    var loadStatus = document.getElementById('loadStatus');

    var productReady = false;

    function pickText(i18n) {
        if (!i18n) return '';
        return i18n.en || i18n.es || i18n.pt || '';
    }

    function getPrimaryImage(images) {
        if (!images || !images.length) return null;
        var sorted = images.slice().sort(function (a, b) {
            return (a.position || 0) - (b.position || 0);
        });
        return sorted[0];
    }

    function renderProduct(product) {
        var categoryEl = document.getElementById('productCategory');
        var nameEl = document.getElementById('productName');
        var descriptionEl = document.getElementById('productDescription');
        var promoEl = document.getElementById('productPromoPrice');
        var priceEl = document.getElementById('productPrice');
        var imageEl = document.getElementById('productImage');

        var category = product.categories && product.categories[0]
            ? pickText(product.categories[0].name)
            : '';
        var name = pickText(product.name);
        var description = pickText(product.description);
        var image = getPrimaryImage(product.images);

        categoryEl.textContent = category.toUpperCase();
        nameEl.textContent = name;
        descriptionEl.textContent = description;
        promoEl.textContent = product.promotional_price || '';
        priceEl.textContent = product.price || '';

        if (image && image.src) {
            imageEl.src = image.src;
            imageEl.alt = name;
        } else {
            imageEl.removeAttribute('src');
            imageEl.alt = '';
        }

        productReady = true;
        openBtn.disabled = false;
        loadStatus.textContent = '';
    }

    function setPopupOpen(isOpen) {
        if (isOpen && !productReady) return;

        popup.classList.toggle('is-open', isOpen);
        popup.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function loadProduct() {
        openBtn.disabled = true;
        loadStatus.textContent = 'Cargando producto…';

        fetch(API_BASE + '/products/' + PRODUCT_UUID)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Error ' + response.status);
                }
                return response.json();
            })
            .then(function (product) {
                renderProduct(product);
            })
            .catch(function (error) {
                loadStatus.textContent = 'No se pudo cargar el producto. ' + error.message;
                openBtn.disabled = true;
            });
    }

    openBtn.addEventListener('click', function () {
        setPopupOpen(true);
    });

    closeBtn.addEventListener('click', function () {
        setPopupOpen(false);
    });

    backdrop.addEventListener('click', function () {
        setPopupOpen(false);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && popup.classList.contains('is-open')) {
            setPopupOpen(false);
        }
    });

    loadProduct();
})();
