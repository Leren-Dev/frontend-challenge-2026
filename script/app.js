/**
 * Product popup behavior.
 *
 * - Opens/closes with the trigger, the close button, the backdrop and Escape.
 * - Loads the product from api/api.js; no product data is hardcoded here.
 * - Keeps keyboard focus inside the dialog while it is open.
 */
(function () {
    "use strict";

    var popup = document.getElementById("productPopup");
    var card = document.getElementById("productCard");
    var pageContent = document.getElementById("pageContent");
    var openButton = document.getElementById("popupOpen");
    var closeButton = popup.querySelector("button[data-popup-close]");
    var categoryEl = document.getElementById("productCategory");
    var titleEl = document.getElementById("productTitle");
    var descriptionEl = document.getElementById("productDescription");
    var priceRow = document.getElementById("productPriceRow");
    var priceEl = document.getElementById("productPrice");
    var comparePriceEl = document.getElementById("productComparePrice");
    var addToCartButton = document.getElementById("addToCart");
    var addToCartLabel = document.getElementById("addToCartLabel");
    var retryButton = document.getElementById("retryButton");
    var imageEl = document.getElementById("productImage");
    var fallbackImage = imageEl.getAttribute("src");

    var requestId = 0;
    var requestController = null;
    var requestTimeout = null;
    var isOpen = false;

    /* ---------------------------------------------------------------------
       Dialog open/close
       --------------------------------------------------------------------- */

    function getFocusableElements() {
        var selector = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

        return Array.prototype.slice.call(popup.querySelectorAll(selector)).filter(function (element) {
            return !element.disabled && !element.hidden && element.getClientRects().length > 0;
        });
    }

    function openPopup(options) {
        options = options || {};
        isOpen = true;

        popup.hidden = false;
        popup.setAttribute("aria-hidden", "false");
        openButton.setAttribute("aria-expanded", "true");
        pageContent.setAttribute("inert", "");
        document.body.classList.add("has-popup");

        if (options.focus !== false) {
            closeButton.focus({ preventScroll: true });
        }
    }

    function closePopup() {
        if (!isOpen) {
            return;
        }

        isOpen = false;
        popup.hidden = true;
        popup.setAttribute("aria-hidden", "true");
        openButton.setAttribute("aria-expanded", "false");
        pageContent.removeAttribute("inert");
        document.body.classList.remove("has-popup");
        openButton.focus({ preventScroll: true });
    }

    openButton.addEventListener("click", function () {
        openPopup();
    });

    popup.addEventListener("click", function (event) {
        if (event.target.closest("[data-popup-close]")) {
            closePopup();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (!isOpen) {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closePopup();
            return;
        }

        if (event.key !== "Tab") {
            return;
        }

        var focusable = getFocusableElements();

        if (!focusable.length) {
            event.preventDefault();
            return;
        }

        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        var active = document.activeElement;

        if (event.shiftKey) {
            if (active === first || !popup.contains(active)) {
                event.preventDefault();
                last.focus();
            }
        } else if (active === last || !popup.contains(active)) {
            event.preventDefault();
            first.focus();
        }
    });

    /* ---------------------------------------------------------------------
       Data helpers
       --------------------------------------------------------------------- */

    function localized(value) {
        if (!value) {
            return "";
        }

        if (typeof value === "string") {
            return value.trim();
        }

        var preferred = ["en", "es", "pt"];
        var index;
        var key;

        for (index = 0; index < preferred.length; index += 1) {
            key = preferred[index];

            if (typeof value[key] === "string" && value[key].trim()) {
                return value[key].trim();
            }
        }

        return Object.keys(value).reduce(function (found, candidate) {
            if (found) {
                return found;
            }

            if (typeof value[candidate] === "string" && value[candidate].trim()) {
                return value[candidate].trim();
            }

            return "";
        }, "");
    }

    function withFinalPeriod(text) {
        if (!text) {
            return "";
        }

        return /[.!?…]$/.test(text) ? text : text + ".";
    }

    function setLoadingState() {
        card.setAttribute("aria-busy", "true");
        card.classList.remove("is-ready");
        categoryEl.textContent = "Product";
        titleEl.textContent = "Loading product…";
        descriptionEl.textContent = "Fetching the latest product details…";
        priceEl.textContent = "—";
        comparePriceEl.textContent = "";
        comparePriceEl.hidden = true;
        addToCartButton.disabled = true;
        addToCartLabel.textContent = "Add to Cart";
        retryButton.hidden = true;
    }

    function setErrorState(error) {
        console.error("[Product popup] Could not load the product.", error);
        card.setAttribute("aria-busy", "false");
        card.classList.remove("is-ready");
        categoryEl.textContent = "Product";
        titleEl.textContent = "Product unavailable";
        descriptionEl.textContent = "We couldn’t load the product details. Please check your connection and try again.";
        priceEl.textContent = "—";
        comparePriceEl.textContent = "";
        comparePriceEl.hidden = true;
        addToCartButton.disabled = true;
        addToCartLabel.textContent = "Unavailable";
        retryButton.hidden = false;
    }

    function renderProduct(product) {
        var name = localized(product.name) || "Product";
        var description = withFinalPeriod(localized(product.description)) || "No description available.";
        var category = "Product";
        var currentPrice = product.promotional_price || product.price || "";
        var comparePrice = "";
        var imageSrc = "";

        if (Array.isArray(product.categories) && product.categories.length) {
            category = localized(product.categories[0].name) || category;
        }

        if (Array.isArray(product.images)) {
            product.images.some(function (image) {
                if (image && typeof image.src === "string" && image.src.trim()) {
                    imageSrc = image.src.trim();
                    return true;
                }

                return false;
            });
        }

        if (
            currentPrice &&
            product.price &&
            product.promotional_price &&
            product.promotional_price !== product.price
        ) {
            comparePrice = product.price;
        }

        categoryEl.textContent = category;
        titleEl.textContent = name;
        descriptionEl.textContent = description;
        priceEl.textContent = currentPrice || "—";
        comparePriceEl.textContent = comparePrice;
        comparePriceEl.hidden = !comparePrice;
        addToCartButton.disabled = false;
        addToCartLabel.textContent = "Add to Cart";
        retryButton.hidden = true;

        if (imageSrc) {
            imageEl.src = imageSrc;
        }

        imageEl.alt = name + " bottle";
        document.title = name;
        card.setAttribute("aria-busy", "false");
        card.classList.add("is-ready");
    }

    /* ---------------------------------------------------------------------
       API loading
       --------------------------------------------------------------------- */

    function loadProduct() {
        if (!window.ProductApi || typeof window.ProductApi.fetchProduct !== "function") {
            setErrorState(new Error("The product API module could not be loaded."));
            return;
        }

        if (requestController) {
            requestController.abort();
        }

        var currentRequestId = requestId + 1;
        var controller = new AbortController();
        var timeoutId = null;
        var timedOut = false;

        requestId = currentRequestId;
        requestController = controller;

        setLoadingState();

        timeoutId = window.setTimeout(function () {
            timedOut = true;
            controller.abort();
        }, 15000);

        requestTimeout = timeoutId;

        window.ProductApi.fetchProduct(window.ProductApi.PRODUCT_UUID, {
            signal: controller.signal
        })
            .then(function (product) {
                if (currentRequestId !== requestId) {
                    return;
                }

                renderProduct(product);
            })
            .catch(function (error) {
                if (currentRequestId !== requestId) {
                    return;
                }

                if (error && error.name === "AbortError") {
                    if (timedOut) {
                        setErrorState(new Error("The product request timed out."));
                    }

                    return;
                }

                setErrorState(error);
            })
            .finally(function () {
                if (currentRequestId !== requestId) {
                    return;
                }

                window.clearTimeout(timeoutId);

                if (requestTimeout === timeoutId) {
                    requestTimeout = null;
                }

                if (requestController === controller) {
                    requestController = null;
                }

                card.setAttribute("aria-busy", "false");
            });
    }

    retryButton.addEventListener("click", loadProduct);

    imageEl.addEventListener("error", function () {
        if (imageEl.getAttribute("src") !== fallbackImage) {
            imageEl.src = fallbackImage;
        }
    });

    /* ---------------------------------------------------------------------
       Initial state — the popup starts open to match the mockup, while the
       trigger remains available after closing it.
       --------------------------------------------------------------------- */

    openPopup({ focus: false });
    loadProduct();
})();
