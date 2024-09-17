"use strict";

const moment = require('moment');
const xlsx = require("json-as-xlsx");
const { APP_CONSTANTS } = require('../Config');
const Models = require('../Models');
const Services = require('../Services').queries;

async function exportData(payloadData) {
    try {
        let model, criteria = {
            createdAt: {
                $gte: moment(payloadData.startDate, 'MM/DD/YYYY').startOf('day').toDate(),
                $lte: moment(payloadData.endDate, 'MM/DD/YYYY').endOf('day').toDate(),
            },
            status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED }
        }, populate = [], fileName = '', columns = [];

        if (payloadData.id)
            criteria._id = payloadData.id;

        if (payloadData.nad) {
            console.log("Hello from NAD");
        
            // Directly modify the existing criteria object without reassigning
            criteria.nextAppointmentDate = {
                $gte: moment(payloadData.nad, 'MM/DD/YYYY').startOf('day').toDate(),  // Start of the day (00:00:00)
                $lte: moment(payloadData.nad, 'MM/DD/YYYY').endOf('day').toDate(),    // End of the day (23:59:59)
            };
        
            console.log(criteria);
        }

        if (payloadData.patientId && payloadData.patientId !== '')
            criteria.patientId = payloadData.patientId;

        if (payloadData.patientDob) {
            const query = { 
                dob: {
                    $gte: moment(payloadData.patientDob, 'MM/DD/YYYY').startOf('day').toDate(),
                    $lte: moment(payloadData.patientDob, 'MM/DD/YYYY').endOf('day').toDate(),
                }
            };
            const patients = await Services.getData(Models.Patients, query, { _id: 1 }, { lean: true });
            criteria.patientId = { $in: patients.map((patient) => patient._id) };
        }

        if ('status' in payloadData)
            criteria.orderStatus = payloadData.status

        if (payloadData.startDate && payloadData.startDate !== '' && payloadData.endDate && payloadData.endDate !== '') {
            criteria.createdAt = {
                $gte: moment(payloadData.startDate, 'MM/DD/YYYY').startOf('day').format(),
                $lte: moment(payloadData.endDate, 'MM/DD/YYYY').endOf('day').format()
            }
        }

        if (payloadData.search && payloadData.search.trim() !== '') {
            criteria.$or = [];
        
            // Search in orderNo
            criteria.$or.push({ orderNo: new RegExp(payloadData.search, 'i') });
        
            // Search in appointmentLocationId by location name
            const locations = await Services.getData(Models.Locations, { name: new RegExp(payloadData.search, 'i') }, { _id: 1 }, { lean: true });
            if (locations && locations.length > 0) {
                criteria.$or.push({ appointmentLocationId: { $in: locations.map((location) => location._id) } });
            }
        
            // Search in renderingPhysicianId by physician name
            const physicians = await Services.getData(Models.Physician, { name: new RegExp(payloadData.search, 'i') }, { _id: 1 }, { lean: true });
            if (physicians && physicians.length > 0) {
                criteria.$or.push({ renderingPhysicianId: { $in: physicians.map((physician) => physician._id) } });
            }
        
            // Search in lCode by lCode code
            const lCodes = await Services.getData(Models.Codes, { code: new RegExp(payloadData.search, 'i') }, { _id: 1 }, { lean: true });
            if (lCodes && lCodes.length > 0) {
                criteria.$or.push({
                    'prescriptions': {
                        $elemMatch: { lCode: { $in: lCodes.map((lCode) => lCode._id) } }
                    }
                });
            }
        
            // If none of the criteria match, it will search only by orderNo
            if (criteria.$or.length === 0) {
                criteria.$or.push({ orderNo: new RegExp(payloadData.search, 'i') });
            }
        }
        

        switch (payloadData.type) {
            case 1: {
                model = Models.Prescriptions;
                fileName = `Patient_prescription_${moment().format('DD-MM-YYYY')}`;
                populate = [
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
                ];
                if (payloadData.userId)
                    criteria.patientId = payloadData.userId;
                break;
            }
        }

        let data = await Services.populateData(model, criteria, {}, { lean: true, sort: { _id: -1 } }, populate);

        if (data && data.length) {
            columns = formatExcelData(payloadData.type);
        }

        data = [
            {
                sheet: "data",
                columns,
                content: data
            }
        ];

        let settings = {
            fileName: APP_CONSTANTS.SERVER.SERVER_STORAGE_NAME + 'excelFiles/' + fileName, // Name of the resulting spreadsheet
            extraLength: 3, // A bigger number means that columns will be wider
            writeMode: "writeFile", // The available parameters are 'WriteFile' and 'write'. This setting is optional. Useful in such cases https://docs.sheetjs.com/docs/solutions/output#example-remote-file
            writeOptions: {}, // Style options from https://docs.sheetjs.com/docs/api/write-options
            // RTL: true, // Display the columns from right-to-left (the default value is false)
        };

        xlsx(data, settings); // Will download the excel file

        return { fileName: `excelFiles/${fileName}.xlsx` };
    }
    catch (e) {
        console.log(e);
        throw e;
    }
}

function formatExcelData(type) {
    try {
        let columns = [];
        switch (type) {
            case 1: {
                columns = [
                    { label: "Prescription Date", value: (row) => moment(row.createdAt).format('MM/DD/YYYY') },
                    { label: "Order Status", value: (row) => findKeyByValue(APP_CONSTANTS.DATABASE.ORDER_STATUS, row.orderStatus) },
                    { label: "Patient ID", value: (row) => `${row?.patientId?.patientNo}` || '' },
                    { label: "Patient Name", value: (row) => `${row?.patientId?.lastName}, ${row?.patientId?.firstName}` || '' },
                    { label: "Patient DOB", value: (row) => moment(row?.patientId?.dob).format('MM/DD/YYYY') },
                    { label: "NASPAC No.", value: (row) => row?.patientId?.naspacNo || '' },
                    { label: "Mobile", value: (row) => row?.patientId?.countryCode + ' ' + formatUsaPhone(row?.patientId?.phoneNumber) },
                    { label: "Primary Insurance", value: (row) => row.patientId?.primaryInsurance?.name || '' },
                    { label: "Primary Insurance No.", value: (row) => row.patientId?.primaryInsuranceNo || '' },
                    { label: "Secondary Insurance", value: (row) => row?.patientId?.secondaryInsurance?.name || '' },
                    { label: "Secondary Insurance No.", value: (row) => row?.patientId?.secondaryInsuranceNo || '' },
                    { label: "Insurance Type", value: (row) => findKeyByValue(APP_CONSTANTS.DATABASE.INSURANCE_TYPE, row.insuranceType) },
                    { label: "Next Appointment Date", value: (row) => moment(row?.nextAppointmentDate).format('MM/DD/YYYY') || '' },
                    { label: "Prescription Location", value: (row) => row?.locationId?.name || '' },
                    { label: "Next Appointment Location", value: (row) => row?.appointmentLocationId?.name || '' },
                    { label: "Referring Physician Name", value: (row) => row.physicianId?.name || '' },
                    { label: "Rendering Physician Name", value: (row) => row.renderingPhysicianId?.name || '' },
                    { label: 'Device Type', value: (row) => row?.prescriptions[0]?.deviceType?.name },
                    { label: 'L code', value: (row) => row?.prescriptions[0]?.lCode?.code },
                    {
                        label: 'Icd Codes',
                        value: (row) => (row?.prescriptions[0]?.icdCode?.map((icd) => icd?.code)).join(', '),
                    },
                    {
                        label: 'Quantity',
                        value: (row) => row?.prescriptions[0]?.quantity,
                    },
                    {
                        label: 'Segment',
                        value: (row) => findKeyByValue(APP_CONSTANTS.DATABASE.SEGMENT_CONSTANT, row?.prescriptions[0]?.segment),
                    },
                    { label: "Notes", value: 'notes' },
                ];
                break;
            }
        }

        return columns;
    }
    catch (e) {
        console.log(e);
        throw e;
    }
}

function findKeyByValue(obj, value) {
    return Object.keys(obj).find(key => obj[key] === value);
}

function formatUsaPhone(phone) {
    if (!phone) return '';
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
    return phone;
}

module.exports = { exportData };
