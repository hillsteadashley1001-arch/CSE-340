// utilities/index.js

/**
 * Format a number as US currency (e.g., $12,345.00)
 */
function formatUSD(value) {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(num ?? 0);
}

/**
 * Format mileage with commas (e.g., 123,456)
 */
function formatMiles(value) {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    num ?? 0
  );
}

/**
 * Build the vehicle detail HTML fragment.
 * Expects a vehicle row with:
 * inv_year, inv_make, inv_model, inv_price, inv_miles,
 * inv_color, inv_description, inv_image
 */
function buildVehicleDetailHTML(v) {
  if (!v) {
    return `<section class="vehicle-detail"><p>Vehicle not found.</p></section>`;
  }

  const title = `${v.inv_year} ${v.inv_make} ${v.inv_model}`;
  const price = formatUSD(v.inv_price);
  const miles = formatMiles(v.inv_miles);

  // Responsive, accessible markup. Image + content side-by-side on large screens.
  return /* html */ `
  <section class="vehicle-detail" aria-labelledby="vehicle-title">
    <div class="vehicle-detail__media">
      <img
        src="${v.inv_image}"
        alt="${title}"
        loading="eager"
        decoding="async"
      >
    </div>

    <div class="vehicle-detail__content">
      <h1 id="vehicle-title">${title}</h1>

      <p class="vehicle-detail__price">
        <strong>Price:</strong> ${price}
      </p>

      <ul class="vehicle-detail__meta">
        <li><strong>Make:</strong> ${v.inv_make}</li>
        <li><strong>Model:</strong> ${v.inv_model}</li>
        <li><strong>Year:</strong> ${v.inv_year}</li>
        <li><strong>Mileage:</strong> ${miles} miles</li>
        <li><strong>Color:</strong> ${v.inv_color}</li>
      </ul>

      <p class="vehicle-detail__desc">${v.inv_description}</p>
    </div>
  </section>
  `;
}

/**
 * Wrap an async controller to forward errors to Express error middleware.
 * Usage: router.get("/path", asyncHandler(controllerFn))
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  formatUSD,
  formatMiles,
  buildVehicleDetailHTML,
  asyncHandler,
};

