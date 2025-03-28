"use strict";

const Service = require('../Services').queries;
const { APP_CONSTANTS } = require('../Config');
const { generateResponseMessage, checkDuplicate, cryptData,
    uploadImage, comparePassword,
    generatePassword, findListingModel,
    generateUniqueNo,
    uploadFileStorage } = require('../Utils/UniversalFunction');
const moment = require('moment');
const mongoXlsx = require('mongo-xlsx');
const Modal = require('../Models');
const { setToken } = require('../Lib/TokenManager');
const { html_to_pdf } = require('../Lib/HtmlPdf');
const { generateDelivery, generateMedical } = require('./PdfController');
const { sendEmail } = require('../Lib/EmailManager');


async function adminLogin(payloadData) {
    try {

        const criteria = {}

        criteria.email = payloadData.email

        const data = await Service.findOne(Modal.Admins, criteria, {}, { lean: true });

        if (!data || (data && data.status === APP_CONSTANTS.DATABASE.STATUS.DELETED))
            throw generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL, payloadData.language);
        else if (data.status === APP_CONSTANTS.DATABASE.STATUS.INACTIVE)
            throw generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED, payloadData.language);
        else if (payloadData.password && !await comparePassword(payloadData.password, data.password)) {
            throw generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PASSWORD, payloadData.language);
        }
        else {
            let tokenData = {
                userType: APP_CONSTANTS.DATABASE.USER_TYPE.SUPER_ADMIN,
                userId: data._id
            }

            tokenData = await setToken(tokenData);

            delete data.password;
            return {
                ...data,
                accessToken: tokenData.accessToken,
            }
        }
    } catch (error) {
        throw error;
    }
}

async function updateProfile(payloadData, userData) {
    if (payloadData.email) {
        let criteria = {
            email: payloadData.email,
            isDeleted: false,
            _id: { $ne: userData._id }
        };

        await checkDuplicate(criteria, Modal.Admins, 'email');
    }

    if (payloadData.image) {
        payloadData.imageUrl = await uploadImage(payloadData.image);
    }

    let data = await Service.findAndUpdate(Modal.Admins, { _id: userData._id }, payloadData, { new: true, lean: true });
    delete data.password;
    data.accessToken = userData.accessToken;

    return data
}

async function profile(userData) {
    delete userData.password;
    return userData
}

async function blockDeleteData(payloadData, userData) {
    try {
        const criteria = { _id: payloadData.id };
        const dataToSet = {
            status: payloadData.status,
            lastUpdateBy: userData._id,
        };

        await Service.findAndUpdate(findListingModel(payloadData.type), criteria, dataToSet, {});
        return {};
    }
    catch (e) {
        return Promise.reject(e)
    }
}

async function listData(payloadData, userData) {
    try {
        const criteria = { status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED } };

        if (payloadData.search && payloadData.search !== '') {
            criteria.$or = [
                { name: { $regex: payloadData.search, $options: 'i' } },
                { firstName: { $regex: payloadData.search, $options: 'i' } },
                { lastName: { $regex: payloadData.search, $options: 'i' } },
                { phoneNumber: { $regex: payloadData.search, $options: 'i' } },
                { code: { $regex: payloadData.search, $options: 'i' } },
            ]
        }

        if (payloadData.id) criteria._id = payloadData.id
        if (payloadData.status) criteria.status = payloadData.status
        if (payloadData.codeType) criteria.type = payloadData.codeType

        const options = {
            sort: { _id: -1 },
            lean: true,
            limit: 10,
            skip: 0,
        }
        if (payloadData.limit) {
            options.limit = payloadData.limit
            options.skip = payloadData.skip
        }

        let populate = []

        if (payloadData.type === 6) {
            populate = [
                { path: "primaryInsurance", select: "name" },
                { path: "secondaryInsurance", select: "name" }
            ];
        }

        if (payloadData.type === 7 && !payloadData.id) {
            criteria._id = { $ne: userData._id }
        }

        const [data, count] = await Promise.all([
            Service.populateData(findListingModel(payloadData.type), criteria, {}, options, populate),
            Service.count(findListingModel(payloadData.type), criteria)
        ])

        return { data: payloadData.id ? data[0] : data, count };
    }
    catch (e) {
        return Promise.reject(e)
    }
}

async function addEditSubAdmin(payloadData, userData) {
    try {
        let model = Modal.Admins;

        if (payloadData.phoneNumber) {
            const criteria = {
                status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED },
                phoneNumber: payloadData.phoneNumber
            };
            if (payloadData.adminId) {
                criteria._id = { $ne: payloadData.adminId }
            }
            await checkDuplicate(criteria, model, 'phone');
        }

        if (payloadData.email) {
            const criteria = {
                status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED },
                email: payloadData.email
            };
            if (payloadData.adminId) {
                criteria._id = { $ne: payloadData.adminId }
            }
            await checkDuplicate(criteria, model, 'email');
        }
        payloadData.lastUpdateBy = userData._id;

        if(payloadData.roles){
            payloadData.roles = JSON.parse(payloadData.roles)
        }
    
        if (payloadData.adminId) {
            await Service.findAndUpdate(model, { _id: payloadData.adminId }, payloadData, {})

        } else {
            const pass = generatePassword()
            payloadData.password = await cryptData(pass);
            payloadData.superAdmin = true
            await Service.saveData(model, payloadData);

            const html = `<h3>Welcome to Mobility Ideal Health</span></h3><p><strong>You are added as a User. Please find below credentials for logged In.</strong></p><p>Email: <strong>${payloadData.email}</strong></p><p>Password: <strong>${pass}</strong></p><p>Link: <a href="https://admin.bracetekk.com/">https://admin.bracetekk.com/</a></p><p>Note: You can change your password after logged In</p>`
            sendEmail(payloadData.email, 'Mobility Panel Credentials!', html)
        }
    }
    catch (e) {
        throw e
    }
}

async function addEditInsurance(payloadData, userData) {
    try {
        let model = Modal.InsuranceCompanies;

        if (payloadData.phoneNumber) {
            const criteria = {
                status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED },
                phoneNumber: payloadData.phoneNumber
            };
            if (payloadData.id) {
                criteria._id = { $ne: payloadData.id }
            }
            await checkDuplicate(criteria, model, 'phone');
        }

        if (payloadData.email) {
            const criteria = {
                status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED },
                email: payloadData.email
            };
            if (payloadData.id) {
                criteria._id = { $ne: payloadData.id }
            }
            await checkDuplicate(criteria, model, 'email');
        }
        payloadData.lastUpdateBy = userData._id;

        if (payloadData.id) {
            await Service.findAndUpdate(model, { _id: payloadData.id }, payloadData, {})

        } else {
            // const pass = generatePassword()
            // payloadData.password =  await CryptData(pass);

            await Service.saveData(model, payloadData);
        }
    }
    catch (e) {
        throw e
    }
}

async function addEditPhysician(payloadData, userData) {
    try {
        let model = Modal.Physician;

        if (payloadData.phoneNumber) {
            const criteria = {
                status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED },
                phoneNumber: payloadData.phoneNumber
            };
            if (payloadData.id) {
                criteria._id = { $ne: payloadData.id }
            }
            await checkDuplicate(criteria, model, 'phone');
        }

        // if (payloadData.email) {
        //     const criteria = {
        //         status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED },
        //         email: payloadData.email
        //     };
        //     if (payloadData.id) {
        //         criteria._id = { $ne: payloadData.id }
        //     }
        //     await checkDuplicate(criteria,model, 'email');
        // }
        payloadData.lastUpdateBy = userData._id;

        if (payloadData.id) {
            await Service.findAndUpdate(model, { _id: payloadData.id }, payloadData, {})

        } else {
            // const pass = generatePassword()
            // payloadData.password =  await CryptData(pass);

            await Service.saveData(model, payloadData);
        }
    }
    catch (e) {
        throw e
    }
}

async function addEditPatient(payloadData, userData) {
    try {
        let model = Modal.Patients;

        if (payloadData.phoneNumber) {
            const criteria = {
                status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED },
                phoneNumber: payloadData.phoneNumber
            };
            if (payloadData.id) {
                criteria._id = { $ne: payloadData.id }
            }
            await checkDuplicate(criteria, model, 'phone');
        }

        // if (payloadData.email) {
        //     const criteria = {
        //         status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED },
        //         email: payloadData.email
        //     };
        //     if (payloadData.id) {
        //         criteria._id = { $ne: payloadData.id }
        //     }
        //     await checkDuplicate(criteria,model, 'email');
        // }
        payloadData.lastUpdateBy = userData._id;

        if (payloadData.id) {
            await Service.findAndUpdate(model, { _id: payloadData.id }, payloadData, {})

        } else {
            // const pass = generatePassword()
            // payloadData.password =  await CryptData(pass);
            payloadData.patientNo = await generateUniqueNo(1)
            await Service.saveData(model, payloadData);
        }
    }
    catch (e) {
        throw e
    }
}

async function changePassword(payloadData, userData) {

    if (payloadData.oldPassword === payloadData.newPassword) {
        throw generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.SAME_PASSWORD, payloadData.language);
    }
    else if (!await comparePassword(payloadData.oldPassword.toString(), userData.password)) {
        throw generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_OLD_PASSWORD, payloadData.language);
    }
    else {
        let criteria = {
            _id: userData._id,
        };
        let setQuery = {
            password: await CryptData(payloadData.newPassword)
        };
        await Service.findAndUpdate(Modal.Admins, criteria, setQuery, {});
        return {}
    }
}

async function listAdminData(payloadData, userData) {
    try {
        const criteria = {
            status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED },
            _id: { $ne: userData._id }
        };

        if (payloadData.search && payloadData.search !== '') {
            criteria.$or = [
                { userCode: new RegExp(payloadData.search, 'i') },
                { name: new RegExp(payloadData.search, 'i') },
                { email: new RegExp(payloadData.search, 'i') },
                { phoneNumber: new RegExp(payloadData.search, 'i') },
            ];
        }

        if (payloadData.id)
            criteria._id = payloadData.id

        if ('status' in payloadData)
            criteria.status = payloadData.status

        if (payloadData.startDate && payloadData.startDate !== '' && payloadData.endDate && payloadData.endDate !== '') {
            criteria.createdAt = {
                $gte: moment(payloadData.startDate, 'MM/DD/YYYY').format(),
                $lte: moment(payloadData.endDate, 'MM/DD/YYYY').format()
            }
        }

        const options = {
            lean: true,
            sort: { _id: -1 },
            skip: payloadData.skip || 0,
            limit: payloadData.limit || 10
        };

        const [data, count] = await Promise.all([
            Service.getData(Modal.Admins, criteria, {}, options),
            Service.count(Modal.Admins, criteria),
        ]);

        return { data: payloadData.id ? data[0] : data, count }
    }
    catch (e) {
        return Promise.reject(e)
    }
}

async function prescriptions(payloadData, userData) {
    try {
        const criteria = {
            status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED },
        };

        let modelName = Modal.Prescriptions;
        if (payloadData.search && payloadData.search !== '') {
            criteria.$or = [
                { orderNo: new RegExp(payloadData.search, 'i') },
            ];
        }

        if (payloadData.id)
            criteria._id = payloadData.id

        if (payloadData.patientId && payloadData.patientId !== '')
            criteria.patientId = payloadData.patientId

        if(payloadData.patientDob) {
            const query = { 
                dob : {
                    $gte: moment(payloadData.patientDob, 'MM/DD/YYYY').startOf('day').toDate(),
                    $lte: moment(payloadData.patientDob, 'MM/DD/YYYY').endOf('day').toDate(),
                }
            }
            const patients = await Service.getData(Modal.Patients,query,{ _id:1 },{lean:true});
            criteria.patientId = {$in: patients.map((patient) => patient._id)}
        }

        if ('status' in payloadData)
            criteria.orderStatus = payloadData.status

        if (payloadData.startDate && payloadData.startDate !== '' && payloadData.endDate && payloadData.endDate !== '') {
            criteria.createdAt = {
                $gte: moment(payloadData.startDate, 'MM/DD/YYYY').startOf('day').format(),
                $lte: moment(payloadData.endDate, 'MM/DD/YYYY').endOf('day').format()
            }
        }

        const options = {
            lean: true,
            sort: { _id: -1 },
            skip: payloadData.skip || 0,
            limit: payloadData.limit || 10
        };

        const populateData = [
            {
                path: 'patientId', model: 'Patients',
                populate: [
                    { path: "primaryInsurance", select: "name" },
                    { path: "secondaryInsurance", select: "name" }
                ]
            },
            { path: 'prescriptions.deviceType', model: 'DeviceTypes', select: 'name' },
            { path: 'prescriptions.icdCode', model: 'Codes', select: 'code description' },
            { path: 'prescriptions.lCode', model: 'Codes', select: 'code description' },
            { path: 'physicianId', model: 'Physicians', select: 'name fax npiNo address phoneNumber countryCode' },
            { path: 'renderingPhysicianId', model: 'Physicians', select: 'name fax npiNo address phoneNumber countryCode' },
            { path: 'locationId', model: 'Locations', select: 'name' },
            { path: 'appointmentLocationId', model: 'Locations', select: 'name' },
        ]

        const [data, count] = await Promise.all([
            Service.populateData(modelName, criteria, {}, options, populateData),
            Service.count(modelName, criteria),
        ]);

        return { data: payloadData.id ? data[0] : data, count }
    }
    catch (e) {
        return Promise.reject(e)
    }
}

async function addEditData(payloadData, userData) {

    let model;
    switch (payloadData.modelType) {
        case 1: {
            model = Modal.DeviceTypes;
            break;
        }
        case 2: {
            model = Modal.Locations;
            break;
        }
        case 3: {
            model = Modal.Codes;
            break;
        }
    }

    payloadData.lastUpdateBy = userData._id;

    if (payloadData.id) {
        return await Service.findAndUpdate(model, { _id: payloadData.id }, payloadData, { new: true });
    }
    else {
        return await Service.saveData(model, payloadData);
    }
}

async function addEditPrescription(payloadData, userData) {

    let model = Modal.Prescriptions, dataToSet = {};
    payloadData.lastUpdateBy = userData._id;

    if (payloadData.prescriptions) {
        payloadData.prescriptions = JSON.parse(payloadData.prescriptions)
    };

    if (payloadData.insuranceDocument)
        payloadData.insuranceDocument = await uploadFileStorage(payloadData.insuranceDocument, APP_CONSTANTS.FOLDER_PATH(APP_CONSTANTS.DATABASE.MEDIA_UPLOAD_TYPE.ORDERS));

    if (payloadData.prescriptionDocument)
        payloadData.prescriptionDocument = await uploadFileStorage(payloadData.prescriptionDocument, APP_CONSTANTS.FOLDER_PATH(APP_CONSTANTS.DATABASE.MEDIA_UPLOAD_TYPE.ORDERS));


    if (payloadData.primaryInsurance) {
        dataToSet.primaryInsurance = payloadData.primaryInsurance;
    }
    if (payloadData.secondaryInsurance) {
        dataToSet.secondaryInsurance = payloadData.secondaryInsurance;
    }
    if ("primaryInsuranceNo" in payloadData) {
        dataToSet.primaryInsuranceNo = payloadData.primaryInsuranceNo;
    }
    if ("secondaryInsuranceNo" in payloadData) {
        dataToSet.secondaryInsuranceNo = payloadData.secondaryInsuranceNo;
    }

    if(payloadData.appointmentLocationId && payloadData.appointmentLocationId === 'undefined') {
        delete payloadData.appointmentLocationId
    }
    if(payloadData.renderingPhysicianId && payloadData.renderingPhysicianId === 'undefined') {
        delete payloadData.renderingPhysicianId
    }

    if (Object.keys(dataToSet).length > 0)
        await Service.findAndUpdate(Modal.Patients, { _id: payloadData.patientId }, dataToSet, { new: true });

    if (payloadData.id) {
        return await Service.findAndUpdate(model, { _id: payloadData.id }, payloadData, { new: true });
    }
    else {
        payloadData.orderNo = await generateUniqueNo(2);
        return await Service.saveData(model, payloadData);
    }
}

async function dashboardData(payloadData, userData) {

    const criteria = { status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED } };

    const [totalPatient, totalPhysician] = await Promise.all([
        Service.count(Modal.Patients, { ...criteria }),
        Service.count(Modal.Physician, { ...criteria }),
    ]);

    return {
        totalPatient,
        totalPhysician,
    }
}

async function importData(payloadData, userData) {
    try {
        const sheetData = await covertXlsxToJson(payloadData);
        switch (payloadData.type) {
            case 1: {
                return await importCodes(sheetData, userData);
            }
            case 2: {
                return await importInsurance(sheetData, userData);
            }
        }
    }
    catch (e) {
        console.log(e);
        return Promise.reject(e)
    }

}

function covertXlsxToJson(payloadData) {
    let xlsx = payloadData.file.path;
    return new Promise((resolve, reject) => {
        mongoXlsx.xlsx2MongoData(xlsx, null, (err, result) => {
            if (err)
                reject(err);
            else {
                console.log(result.length,'result');
                resolve(result)
            };
        });
    });
}

async function importCodes(sheetData,userData) {
    try {
        const model = Modal.Codes;
        for (let data of sheetData) {

            let findData = await Service.findOne(model, { type: data.type, code: data.code }, { _id: 1 }, { lean: true });
            data.lastUpdateBy = userData._id

            if (findData && findData._id)
                await Service.findAndUpdate(model, { _id: findData._id }, data, { new: true });
            else {
                await Service.saveData(model, data)
            }
        }
        return {};
    }
    catch (e) {
        return Promise.reject(e)
    }
}

async function importInsurance(sheetData,userData) {
    try {
        const model = Modal.InsuranceCompanies;
        for (let data of sheetData) {
            const dataToSet = {
                name: data['Name'],
                address: `${data['Address Line 1']}, ${data['City']}, ${data['State']}, ${data['Zip']}`,
            }
            if (data.Tel && data.Tel !== '') {
                dataToSet['phoneNumber'] = data.Tel
            }
            // let findData = await Service.findOne(model, {type: data.type, code: data.code },{_id:1}, {lean: true});
            data.lastUpdateBy = userData._id

            // if (findData && findData._id) 
            //     await Service.findAndUpdate(model, { _id: findData._id },dataToSet, { new: true });
            // else {
            await Service.saveData(model, dataToSet)
            // }
        }
        return {};
    }
    catch (e) {
        return Promise.reject(e)
    }
}

async function generatePdf(payloadData) {
    try {
        // payloadData.data = JSON.parse(payloadData.data);
        const html = payloadData.type === 1 ?  generateMedical(payloadData.data) : generateDelivery(payloadData.data);
        const fileName = `${payloadData.data.orderNo}_${payloadData.type === 1 ? 'medical':'delivery'}.pdf`;
        console.log(html);
        const path = `${APP_CONSTANTS.SERVER.SERVER_STORAGE_NAME}pdfs/${fileName}`;
        await html_to_pdf(html, {path});

        return {path : 'pdfs/'+fileName}
    }
    catch (e) { 

    }
}


module.exports = {
    adminLogin,
    getProfile: profile,
    updateProfile: updateProfile,
    changePassword: changePassword,
    blockDeleteData: blockDeleteData,
    listAdminData: listAdminData,
    addEditSubAdmin: addEditSubAdmin,
    addEditInsurance: addEditInsurance,
    addEditPhysician: addEditPhysician,
    addEditPatient: addEditPatient,

    dashboardData: dashboardData,
    addEditData: addEditData,
    addEditPrescription: addEditPrescription,
    prescriptions: prescriptions,
    listData: listData,
    importData: importData,
    generatePdf: generatePdf

};


