/**
 * Product API client.
 *
 * Base URL: https://lerenconsulting.com/apptiendanube
 * Endpoint: GET /products/{uuid}
 *
 * The product currently displayed by the page is identified by the UUID below.
 * Keeping the base URL and the product id here means the UI never needs to know
 * where the data comes from.
 */
(function (window) {
    "use strict";

    var API_BASE_URL = "https://lerenconsulting.com/apptiendanube";
    var PRODUCT_UUID = "fc7ba3cd-9e62-409d-84df-7ccd64a17f59";

    /**
     * Fetch a single product from the API.
     *
     * @param {string} [productId] Product UUID. Defaults to PRODUCT_UUID.
     * @param {{ signal?: AbortSignal }} [options]
     * @returns {Promise<object>} The product payload returned by the API.
     */
    async function fetchProduct(productId, options) {
        var id = productId || PRODUCT_UUID;
        options = options || {};

        if (!id) {
            throw new Error("A product UUID is required.");
        }

        var response = await fetch(API_BASE_URL + "/products/" + encodeURIComponent(id), {
            method: "GET",
            headers: {
                Accept: "application/json"
            },
            cache: "no-store",
            signal: options.signal
        });

        if (!response.ok) {
            throw new Error("The product API responded with status " + response.status + ".");
        }

        var product;

        try {
            product = await response.json();
        } catch (error) {
            throw new Error("The product API returned an invalid JSON response.");
        }

        if (!product || typeof product !== "object" || Array.isArray(product)) {
            throw new Error("The product API returned an unexpected payload.");
        }

        return product;
    }

    window.ProductApi = {
        API_BASE_URL: API_BASE_URL,
        PRODUCT_UUID: PRODUCT_UUID,
        fetchProduct: fetchProduct
    };
})(window);
