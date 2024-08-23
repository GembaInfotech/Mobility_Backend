'use strict';

const saveData = async (model, data) => {
  try {
    return await model.create(data);
  } catch (error) {
    throw error;
  }
};

const getData = async (model, query, projection, options) => {
  try {
    return await model.find(query, projection, options);
  } catch (err) {
    throw err;
  }
};

const getUniqueData = async (model, query, projection, options, keyName) => {
  try {
    return await model.distinct(keyName, query, options);
  } catch (err) {
    throw err;
  }
};

const findOne = async (model, query, projection, options) => {
  try {
    return await model.findOne(query, projection, options);
  } catch (err) {
    throw err;
  }
};

const findOneAndPopulate = async (model, query, projection, options, collectionOptions) => {
  try {
    return await model.findOne(query, projection, options).populate(collectionOptions);
  } catch (error) {
    throw error;
  }
};

const findAndUpdate = async (model, conditions, update, options) => {
  try {
    return await model.findOneAndUpdate(conditions, update, options);
  } catch (error) {
    throw error;
  }
};

const findAndUpdateWithPopulate = async (model, conditions, update, options, collectionOptions) => {
  try {
    return await model.findOneAndUpdate(conditions, update, options).populate(collectionOptions);
  } catch (error) {
    throw error;
  }
};

const updateMany = async (model, conditions, update, options) => {
  try {
    return await model.updateMany(conditions, update, options);
  } catch (err) {
    throw err;
  }
};

const remove = async (model, condition) => {
  try {
    return await model.deleteMany(condition);
  } catch (err) {
    throw err;
  }
};

const populateData = async (model, query, projection, options, collectionOptions) => {
  try {
    return await model.find(query, projection, options).populate(collectionOptions);
  } catch (err) {
    throw err;
  }
};

const findOnePopulateData = async (model, query, projection, options, collectionOptions) => {
  try {
    return await model.findOne(query, projection, options).populate(collectionOptions);
  } catch (err) {
    throw err;
  }
};

const count = async (model, condition) => {
  try {
    return await model.countDocuments(condition);
  } catch (err) {
    throw err;
  }
};

const aggregateData = async (model, group) => {
  try {
    return await model.aggregate(group);
  } catch (err) {
    throw err;
  }
};

const aggregateDataWithPopulate = async (model, group, collectionOptions) => {
  try {
    const data  =  await model.aggregate(group)
    return await model.populate(data,collectionOptions);
  } catch (err) {
    throw err;
  }
};

const insertMany = async (model, data, options) => {
  try {
    return await model.collection.insertMany(data, options);
  } catch (err) {
    throw err;
  }
};

const bulkFindAndUpdate = function (bulk, query, update, options) {
  bulk.updateOne(query, update, options);
};


module.exports = {
  saveData,
  getData,
  getUniqueData,
  updateMany,
  remove,
  insertMany,
  count,
  findOne,
  findOneAndPopulate,
  findAndUpdate,
  populateData,
  findOnePopulateData,
  aggregateData,
  aggregateDataWithPopulate,
  bulkFindAndUpdate,
  findAndUpdateWithPopulate,
};
