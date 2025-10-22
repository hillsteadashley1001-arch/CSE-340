// controllers/inventoryController.js
const invModel = require("../models/inventory-model");
const utils = require("../utilities");

async function buildVehicleDetail(req, res, next) {
  try {
    const invId = Number(req.params.inv_id);
    if (!Number.isInteger(invId) || invId < 1) {
      const err = new Error("Invalid vehicle id");
      err.status = 400;
      throw err;
    }

    const vehicle = await invModel.getVehicleById(invId);
    if (!vehicle) {
      const err = new Error("Vehicle not found");
      err.status = 404;
      throw err;
    }

    const pageTitle = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;
    const content = utils.buildVehicleDetailHTML(vehicle);

    res.render("inventory/detail", {
      title: pageTitle,
      nav: res.locals.nav,
      content,
      vehicle,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { buildVehicleDetail };