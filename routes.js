const routes = require("express").Router();
const { addProducts } = require("./services/storeProducts");
const { getProducts } = require("./services/getProducts");
const { updateProducts } = require("./services/updateProducts");
routes.post("/redis/products", addProducts);
routes.get("/redis/products", getProducts);
routes.put("/redis/products", updateProducts);
module.exports = routes;
