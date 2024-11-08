"use strict";

const moment = require('moment');
const xlsx = require("json-as-xlsx");
const { APP_CONSTANTS } = require('../Config');
const Models = require('../Models');
const Services = require('../Services').queries;
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const unlinkFile = util.promisify(fs.unlink);

async function updateExcel(payload, userData) {
    try {
        const file = payload.file;
        if (!file) {
            throw new Error("No file uploaded");
        }

        console.log("File received:", {
            filename: file.hapi.filename,
            headers: file.hapi.headers
        });

        const uploadsDirectory = path.join(__dirname, '../', APP_CONSTANTS.SERVER.SERVER_STORAGE_NAME + 'excelFiles');
        const tempFilePath = path.join(uploadsDirectory, file.hapi.filename);

        if (!fs.existsSync(uploadsDirectory)) {
            fs.mkdirSync(uploadsDirectory, { recursive: true });
        }

        await writeFile(tempFilePath, file._data);

        const workbook = XLSX.readFile(tempFilePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        for (let row of worksheet) {
            const orderNo = row['Order No'];

            if (orderNo) {
                const orderData = await Services.getData(Models.Prescriptions, { orderNo }, {}, { lean: true });

                if (orderData && orderData.length > 0) {
                    const order = orderData[0];

                    if (order.orderStatus !== 9 || order.orderStatus !== 10 || order.orderStatus !== 11) {
                        console.log("Order status is in process, updating NAD and NAL");

                        row['Next Appointment Date'] = moment(order.nextAppointmentDate).format('MM/DD/YYYY');
                        if (order.appointmentLocationId) {
                            const location = await Services.getData(Models.Locations, { _id: order.appointmentLocationId }, {}, { lean: true });

                            row['Next Appointment Location'] = location.length > 0 ? location[0].name : '';
                        } else {
                            row['Next Appointment Location'] = '';
                        }
                    } else {
                        console.log("Order status is not in process, skipping NAD and NAL update");
                    }
                }
            }
        }

        console.log("Updated worksheet", worksheet);
        const updatedSheet = XLSX.utils.json_to_sheet(worksheet);

        // Calculate and adjust column widths (same as before)
        // Calculate and adjust column widths based on character length
        // Calculate and adjust column widths based on both header and content length
        const columnWidths = {};
        const headers = Object.keys(worksheet[0]); // Assuming the first row has all headers

        // Set initial width based on headers
        headers.forEach(header => {
            columnWidths[header] = header.length; // Set initial width to the header length
        });

        // Update width based on content in each row
        worksheet.forEach(row => {
            Object.keys(row).forEach(key => {
                const contentLength = String(row[key] || '').length;
                if (contentLength > columnWidths[key]) {
                    columnWidths[key] = contentLength;
                }
            });
        });

        // Set the width in characters (wch), accounting for both headers and data
        const wscols = headers.map(header => ({
            wch: Math.min(columnWidths[header] + 2, 30)  // Add padding, limit width if necessary
        }));

        updatedSheet['!cols'] = wscols;



        workbook.Sheets[sheetName] = updatedSheet;

        // Overwrite the same file in the 'excelFiles' directory
        XLSX.writeFile(workbook, tempFilePath);

        // Return success message with the path of the updated file
        return {
            message: 'File updated and saved successfully',
            filePath: `excelFiles/${file.hapi.filename}`
        };
    } catch (error) {
        console.error("Error updating Excel:", error);
        throw error;
    }
}


async function exportData(payloadData) {
    try {
        let model, criteria = {
            status: { $ne: APP_CONSTANTS.DATABASE.STATUS.DELETED }
        }, populate = [], fileName = '', columns = [];

        if (payloadData.id) {
            criteria._id = payloadData.id;
        }

        if (payloadData.nad) {
            console.log("Hello from NAD");
            criteria.nextAppointmentDate = {
                $gte: moment(payloadData.nad, 'MM/DD/YYYY').startOf('day').toDate(),
                $lte: moment(payloadData.nad, 'MM/DD/YYYY').endOf('day').toDate(),
            };
            console.log(criteria);
        }

        if (payloadData.patientId && payloadData.patientId !== '') {
            criteria.patientId = payloadData.patientId;
        }

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

        if ('status' in payloadData) {
            criteria.orderStatus = payloadData.status;
        }

        if (payloadData.startDate && payloadData.endDate) {
            criteria.createdAt = {
                $gte: moment(payloadData.startDate, 'MM/DD/YYYY').startOf('day').toDate(),
                $lte: moment(payloadData.endDate, 'MM/DD/YYYY').endOf('day').toDate(),
            };
        }

        if (payloadData.search && payloadData.search.trim() !== '') {
            criteria.$or = [];
            criteria.$or.push({ orderNo: new RegExp(payloadData.search, 'i') });

            const locations = await Services.getData(Models.Locations, { name: new RegExp(payloadData.search, 'i') }, { _id: 1 }, { lean: true });
            if (locations && locations.length > 0) {
                criteria.$or.push({ appointmentLocationId: { $in: locations.map((location) => location._id) } });
            }

            const physicians = await Services.getData(Models.Physician, { name: new RegExp(payloadData.search, 'i') }, { _id: 1 }, { lean: true });
            if (physicians && physicians.length > 0) {
                criteria.$or.push({ renderingPhysicianId: { $in: physicians.map((physician) => physician._id) } });
            }

            const lCodes = await Services.getData(Models.Codes, { code: new RegExp(payloadData.search, 'i') }, { _id: 1 }, { lean: true });
            if (lCodes && lCodes.length > 0) {
                criteria.$or.push({
                    'prescriptions': {
                        $elemMatch: { lCode: { $in: lCodes.map((lCode) => lCode._id) } }
                    }
                });
            }
        }

        if (payloadData.nalId && payloadData.nalId !== '') {
            criteria.appointmentLocationId = payloadData.nalId;
        }
        if (payloadData.physicianId && payloadData.physicianId !== '') {
            criteria.renderingPhysicianId = payloadData.physicianId;
        }

        if (payloadData.lcodeId && payloadData.lcodeId !== '') {
            const query = {
                _id: payloadData.lcodeId
            };
            const lCodes = await Services.getData(Models.Codes, query, { _id: 1 }, { lean: true });
            console.log("Lcodes", lCodes);

            if (lCodes && lCodes.length > 0) {
                criteria.prescriptions = {
                    $elemMatch: {
                        lCode: { $in: lCodes.map((lCode) => lCode._id) }
                    }
                };
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
                if (payloadData.userId) {
                    criteria.patientId = payloadData.userId;
                }
                break;
            }
        }

        let data = await Services.populateData(model, criteria, {}, { lean: true, sort: { _id: -1 } }, populate);
        if (data && data.length) {
            columns = formatExcelData(payloadData.type);
        }

        data = [{ sheet: "data", columns, content: data }];
        let settings = {
            fileName: APP_CONSTANTS.SERVER.SERVER_STORAGE_NAME + 'excelFiles/' + fileName,
            extraLength: 3,
            writeMode: "writeFile",
            writeOptions: {},
        };

        xlsx(data, settings);
        return { fileName: `excelFiles/${fileName}.xlsx` };
    } catch (e) {
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
                    { label: "Order No", value: (row) => `${row?.orderNo}` || '' },
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
                    // { label: 'L code description', value: (row) => row?.prescriptions[0]?.lCode?.description },

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

module.exports = { exportData, updateExcel };
