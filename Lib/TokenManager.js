'use strict';
const { APP_CONSTANTS } = require('../Config');
const { findModel } = require('../Utils/UniversalFunction');
const Jwt = require('jsonwebtoken');
const Service = require('../Services').queries;

const verifyFromDB = async (userData) => {
  const { userId, userType } = userData;
  const criteria = { _id: userId };
  const model = findModel(userType);

  if (model) {
    const data = await Service.findOne(
      model,
      criteria,
      {},
      { lean: true }
    );

    if (data) {
      data.userType = userType;
      return data;
    }
    else return null;
  }
  else throw new Error(APP_CONSTANTS.STATUS_MSG.ERROR.NOT_AUTHORISED);
};

const setTokenInDB = async (userData, jwtToken) => {
  const { userId, deviceId, userType, deviceToken } = userData;

  const criteria = { _id: userId };
  const update = {
    lastLoginAt: new Date(),
  };

  if (deviceToken) {
    update.$addToSet = {
      tokens: {
        deviceId,
        token: deviceToken,
      }
    }
  }

  await Service.findAndUpdate(findModel(userType), criteria, update);

  userData.accessToken = jwtToken;
  return userData;
};

const verifyToken = async (token, type) => {
  try {
    const decodedData = Jwt.verify(token, APP_CONSTANTS.SERVER.JWT_SECRET_KEY);
    
    if (decodedData && decodedData.userType === type) {
      return await verifyFromDB(decodedData);
    }
    else {
      return APP_CONSTANTS.STATUS_MSG.ERROR.NOT_AUTHORISED;
    }
  } catch (error) {
    return APP_CONSTANTS.STATUS_MSG.ERROR.NOT_AUTHORISED;
  }
};

const setToken = async (tokenData) => {
  const jwtToken = Jwt.sign(tokenData, APP_CONSTANTS.SERVER.JWT_SECRET_KEY);
  return await setTokenInDB(tokenData, jwtToken)
};

module.exports = {
  setToken,
  verifyToken
};
