require("dotenv").config();
const { dynamoDb } = require("../dbConfig/dynamoDb");
const redisClient = require("redis").createClient(
  6379,
  process.env.REDIS_ENDPOINT
);
const getProducts = async (req, res) => {
  const { productId } = req.body;
  const checkDetailsFromRedis = await fetchProductFromRedis(productId);
  if (checkDetailsFromRedis) {
    //Cache Hit
    return res.status(200).send({
      statusCode: 200,
      details: checkDetailsFromRedis
    });
  } else {
    //Cache Miss
    const productDetailsFromDb = await fetchProductDetailsFromDb(productId);
    redisClient.set(productId, { ...productDetailsFromDb.Item }); //Lazy Loading
    return res.status(200).send({
      statusCode: 200,
      details: productDetailsFromDb.Item
    });
  }
};

const fetchProductDetailsFromDb = async productId => {
  const params = {
    TableName: process.env.ADMIN_TABLE,
    Key: {
      productId
    }
  };
  const details = await dynamoDb.get(params);
  return details;
};
const fetchProductFromRedis = async productId => {
  return new Promise((res, rej) => {
    redisClient.get(productId, err => {
      if (err) {
        console.log("Failed to write to redis ", err);
        res();
      } else {
        console.log("Fetched the cached... ", data);
        res(data);
      }
    });
  });
};

module.exports = { getProducts };

//name
//price
//model
//units
