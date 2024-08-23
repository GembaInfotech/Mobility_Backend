"use strict";

const moment = require('moment');
const xlsx = require("json-as-xlsx")
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

        switch (payloadData.type) {

            case 1: {
                model = Models.Prescriptions;
                fileName = `Patient_prescription_${moment().format('DD-MM-YYYY')}`
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
                ]
                if (payloadData.userId)
                    criteria.patientId = payloadData.userId
                break;
            }
        }

        let data = await Services.populateData(model, criteria, {}, { lean: true, sort: { _id: -1 } }, populate)

        if (data && data.length) {
            columns = formatExcelData(payloadData.type)
        }

        data = [
            {
                sheet: "data",
                columns,
                content: data
            }
        ]
        let settings = {
            fileName: APP_CONSTANTS.SERVER.SERVER_STORAGE_NAME + 'excelFiles/' + fileName, // Name of the resulting spreadsheet
            extraLength: 3, // A bigger number means that columns will be wider
            writeMode: "writeFile", // The available parameters are 'WriteFile' and 'write'. This setting is optional. Useful in such cases https://docs.sheetjs.com/docs/solutions/output#example-remote-file
            writeOptions: {}, // Style options from https://docs.sheetjs.com/docs/api/write-options
            // RTL: true, // Display the columns from right-to-left (the default value is false)
        }

        xlsx(data, settings) // Will download the excel file

        return { fileName: `excelFiles/${fileName}.xlsx` }
    }
    catch (e) {
        console.log(e)
        throw e
    }
}

function formatExcelData(type) {
    try {
        let columns = []
        switch (type) {
            case 1: {

                columns = [
                    // { label: "Service Order ID", value: "serviceOrderNo" },
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

                    { label: 'Device Type', value: (row) => row?.prescriptions[0]?.deviceType?.name},
                    { label: 'L code', value: (row) => row?.prescriptions[0]?.lCode?.code},
                    {
                        label: 'Icd Codes',
                        value: (row) => (row?.prescriptions[0]?.icdCode?.map((icd) => icd?.code )).join(', '),
                    },
                    {
                        label: 'Quantity',
                        value:(row) => row?.prescriptions[0]?.quantity,
                    },
                    {
                        label: 'Segment' ,
                        value: (row) => findKeyByValue(APP_CONSTANTS.DATABASE.SEGMENT_CONSTANT, row?.prescriptions[0]?.segment),
                    },
                    { label: "Notes", value: 'notes' },
                   
                ]

                break;
            }
        }

        return columns
    }
    catch (e) {
        throw e
    }
}

function formatPrescriptions(prescriptions){
    const data = [];

    prescriptions.map((item) => {
       data.push({
            label: 'Device Type',
            value: item.deviceType?.name,
        });
        data.push({
            label: 'L code' ,
            value: item.lCode?.name,
        });
        data.push({
            label: 'Icd Codes',
            value: item.icdCode?.map((icd) => icd?.name+', ')
        });
        data.push({
            label: 'Quantity',
            value: item.quantity,
        });
        data.push({
            label: 'Segment' ,
            value: findKeyByValue(APP_CONSTANTS.DATABASE.SEGMENT_CONSTANT, item.segment),
        });
    })
    return data
}

// Function to find the key that matches a specific value
function findKeyByValue(obj, value) {
    for (let key in obj) {
        if (obj[key] === value) {
            return key;
        }
    }
    return null; // Return null if the value is not found
}

function formatUsaPhone(phone) {

    if(phone){
        phone = phone.replace(/\D/g, '');
        const match = phone.match(/^(\d{1,3})(\d{0,3})(\d{0,4})$/);
        if (match) {
            phone = `${match[1]}${match[2] ? ' ' : ''}${match[2]}${match[3] ? '-' : ''}${match[3]}`;
        }    
    }
    return phone
}

module.exports = {
    exportData: exportData

};
