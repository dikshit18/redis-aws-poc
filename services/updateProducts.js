require("dotenv").config();
const { dynamoDb } = require("../dbConfig/dynamoDb");
const { v4: uuidv4 } = require("uuid");
const redisClient = require("redis").createClient(
  6379,
  process.env.REDIS_ENDPOINT
);
const updateProducts = async (req, res) => {
  const { productId, price } = req.body;
  const updatedProduct = await updateProductInDb(productId, price);
  await updateProductInRedis(updatedProduct);
};

const updateProductInDb = async (productId, price) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: { productId },
    UpdateExpression: "SET #price = :price",
    ExpressionAttributeNames: { "#price": "price" },
    ReturnValues: "ALL_NEW",
    ExpressionAttributeValues: {
      ":price": price
    }
  };
  const updatedRecord = await dynamoDb.update(params);
  return updatedRecord.Attributes;
};
//Write Through
const updateProductInRedis = async updatedProduct => {
  const { productId } = updatedProduct;
  redisClient.set(productId, { ...updatedProduct });
  console.log("Item cached in Redis for the product Id... ", productId);
  return;
};

module.exports = { updateProducts };
