require("dotenv").config();
const { dynamoDb } = require("../dbConfig/dynamoDb");
const { v4: uuidv4 } = require("uuid");
const redisClient = require("redis").createClient(
  6379,
  process.env.REDIS_ENDPOINT
);
const addProducts = async (req, res) => {
  const { products } = req.body;
  for (const product of products) {
    const productId = await addProductToDb(product);
    product["productId"] = productId;
    await addProductToDb(product);
    await addProductToRedis(product);
  }
};

const addProductToDb = async productDetails => {
  const productId = uuidv4();
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      ...productDetails,
      productId
    }
  };
  await dynamoDb.create(params);
  return productId;
};
const addProductToRedis = async productDetails => {
  const { productId } = productDetails;
  redisClient.set(productId, { ...productDetails });
  console.log("Item cached in Redis for the product Id... ", productId);
  return;
};

module.exports = { addProducts };

//name
//price
//model
//units
