const moment = require('moment');

const logoUrl = "https://api.bracetekk.com/bucket/logoImg.jpeg";
const dateFormat = 'MM-DD-YYYY'

function generateMedical(data) {   
    let icdItems = '', lcodeItems =''
    const title = data.companyId === "67a1984810cc713bf308c626"
        ? "North American Spine & Pain Clinic" 
        : data.companyId === "67bbf74a4381684ac8e9a836" 
        ? "PPS" 
        : "Medical Report";
    
    data.icd.map((item) => {
        icdItems+= `
         <tr>
        <td>${item?.code}</td>
        <td colspan="5">${item?.description}</td>
         </tr>
        `
    })

    data.lCode.map((item) => {
        lcodeItems+= `
         <tr>
            <td>${item?.code}</td>
            <td>${item?.quantity}</td>
            <td colspan="4">${item?.description}</td>
        </tr>
        `
    })

return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
   <style>
    body {
        /* display: flex; */
        justify-content: center;
        align-items: center;
        margin: 0;
        font-family: Arial, sans-serif;
    }
    
    .header-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px;
        width: 85%;
        margin: auto;
        background-color: #f8f8f8;
    }
    img{
        height: 80px;
        width: 220;
    }
    .container {
        text-align: center;
    } 
    table {
        border-collapse: collapse;
        width: 90%;
        margin: 0 auto;
        /* margin-top: 10px; */
        clear: both;
    }
     .top-border {
        border-top: 2px solid black;
        padding-top: 15px; 
        width: 85%;
    }
     
    th, td {
        border: 2px solid black;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2;
        text-align: center;
    }
    header {
        /* position: absolute; */
        /* top: 10px; */
        padding-top: 40px;
        padding-bottom: 40px;
        margin: auto;
        font-size: 20px;
        width: 85%;
        font-weight: bold;
    }
    h3 {
        /* position: absolute; */
        /* top: 50px; */
        width: 100%;
        text-align: center;
        margin: auto;
        padding-bottom: 15px;
    }
    p,h5{
        width: 90%;
        margin: auto;
    }
    h5{
        padding: 10px;
    }
    footer{
        margin: 50px;
    }
    .grid-container{
        display: grid;
        grid-template-columns:auto auto ;
    }
    .p{
        margin-top: 15px;
    }    

   </style>
</head>
<body>
    <div class="header-container">
        <header>${title}</header>
        <img src=${logoUrl} alt="Clinic Logo" class="logo">
    </div>

    <h3 class="top-border">Rx / Detailed Written Order and Letter of Medical Necessity</h3>
    <div class="container">
    <table>
        <tr>
            <th colspan="6">Patient Information</th>
        </tr>
        <tr>
            <th colspan="3">Patient Name (Last, First, Middle)</th>
            <th>Patient ID</th>
            <th>Patient DOB</th>
            <th>Primary Device Type</th>
        </tr>
         <tr>
            <td colspan="3">${data?.patientName}</td>
            <td>${data?.patientId}</td>
            <td>${data?.patientDob}</td>
            <td>${data?.primaryDeviceType}</td>
        </tr>
        <tr>
            <th colspan="6">Product / Procedure</th>
        </tr>
        <tr>
            <th>L-CODE</th>
            <th>QTY</th>
            <th colspan="4">DESCRIPTION</th>
        </tr>
            ${lcodeItems}
        <tr>
            <th colspan="6">Diagnosis</th>
        </tr>
        <tr>
            <th>ICD</th>
            <th colspan="5">DESCRIPTION</th>
        </tr>
        ${icdItems}
        <tr>
            <th colspan="6">Prescription</th>
        </tr>
        <tr>
            <td colspan="2" rowspan="2">Projected Monthly Frequency <br><br> ${data?.monthlyFrequency || 'Daily'}</td>
            <td colspan="2" rowspan="2">Estimated Length of Need <br><br> ${data?.lengthOfNeed || 'Life Time'}</td>
            <td colspan="2" rowspan="2">Start Date <br><br>${data?.startDate}</td>
        </tr>
        <tr></tr>
        <tr >
            <td colspan="2" rowspan="3">Insurance / Medicare Info <br><br>${data?.insuranceInfo}</td>
            <td colspan="2" rowspan="3">Prescriber Name <br><br> ${data?.prescriberName}</td>
            <td colspan="2" rowspan="3">Prescriber NPI <br><br>${data?.prescriberNpi}</td>
        </tr>
        <tr></tr>
        <tr></tr>
        <tr>
            <td colspan="4" rowspan="2">Doctor Name <br><br>${data?.doctorName || '-'}</td>
            <td colspan="2" rowspan="2">Doctor NPI <br><br>${data?.doctorNpi || '-'}</td>
        </tr>
        <tr></tr>
        <tr>
            <td colspan="4" rowspan="2">Prescriber Address <br><br>${data?.prescriberAddress || '-'}</td>
            <td colspan="2" rowspan="2">Prescriber Work Phone<br><br>${data?.prescriberWorkPhone}</td>
        </tr>
    </table>
    </div>
    
    <div >
        <!-- <header >North American Spine & Pain Clinic</header> -->
        <!-- <h3 class="top-border"></h3> -->
        <p class="p">The above procedures and any repair and/or parts to maintain proper fit and function are appropriate for this patient and are deemed medically necessary</p>
        <h5>Medical Necessity:</h5>
        <p>${data?.notes}</p>
        <footer class="grid-container">
            <div>
                <p>${data?.prescriberName}</p>
            </div>
            <div>
                <p>${moment().format(dateFormat)}</p>
            </div>
        </footer>
    </div>
</body>
</html>`

}

function generateDelivery(data) {   
      /*<p class="patient">Patient: SANDOVAL, Cesar DOB: Sep 16, 1980</p> 
    <p class="top-h">IMPORTANT: EMAIL PATIENT SIGNED RECEIPT TO <U>DME@NASPACMD.COM</U></p>
    */
    let lcodeItems = '';
    data?.lCode?.map((item) => {
        lcodeItems+= `<tr>
                <td>${item?.code}</td>
                <td>${item?.quantity}</td>
                <td colspan="2">${item?.description}</td>
                <td>No</td>
                <td>No</td>
                </tr>`
    })

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>North American Spine & Pain Clinic</title>
        <style>
            body {
                /* display: flex; */
                justify-content: center;
                align-items: center;
                margin: 0;
                font-family: Arial, sans-serif;
            }
            .container {
                text-align: center;
            } 
            .patient{
                margin: 0;
                width: 100%;
            }
            .head{
                text-align: center;
                margin-bottom: 5px;
            }
            table {
                border-collapse: collapse;
                width: 90%;
                margin: 0 auto;
                /* margin-top: 10px; */
                clear: both;
            }
            .top-border {
                border-top: 2px solid rgb(92, 181, 216);
                padding-top: 15px; 
                width: 85%;
            }
            .top-h{
                width: 85%;
                text-align: center;
                margin-top: 30px;
                margin-bottom: 10px;
                color: rgb(88, 86, 86);
            }
            
            th, td {
                border: 2px solid black;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
                text-align: center;
            }
            header {
                /* position: absolute; */
                /* top: 10px; */
                padding-top: 20px;
                padding-bottom: 40px;
                margin: auto;
                width: 85%;
                font-size: 20px;
                font-weight: bold;
                color:rgb(60, 174, 219);
            }
            h3 {
                /* position: absolute; */
                /* top: 50px; */
                width: 100%;
                text-align: center;
                margin: auto;
                padding-bottom: 10px;
                
            }
            p,h5{
                width: 90%;
                margin: auto;
            }
            h5{
                padding: 10px;
            }
            .para{
                margin-bottom: 10px;
                margin-top: 15px;
                text-align: center;
            }
            footer{
                margin: 50px;
                margin-top: 80px;
                
            }
            .grid-container{
                display: grid;
                grid-template-columns:auto auto ;
            }
            .sig,.date{
                border-top: 1px solid black;
                width: 200px;
                padding-top: 20px;
                margin-left: 100px;
            }
            .p{
                width: 90%;
                text-align: justify;
            }
            img{
                height: 80px;
                width: 220px;
            }
            .logo{
                width: 85%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: auto;
            }
            
        </style>
    </head>
    <body>
        <div class="logo">
        <header >North American Spine & Pain Clinic</header>
        <img src=${logoUrl} alt="logo">
        </div>
        <h3 class="top-border">DME Delivery Receipt</h3>
        <p class="head">Product Dispensed - Signature Form</p>
        <div class="container">
        <table>
            <tr>
                <th colspan="6">Patient Information</th>
            </tr>
            <tr>
                <th colspan="3">Patient Name (Last, First, Middle)</th>
                <th>Patient ID</th>
                <th>Patient DOB</th>
                <th>Primary Device Type</th>
            </tr>
            <tr>
                <td colspan="3">${data?.patientName}</td>
                <td>${data?.patientId}</td>
                <td>${data?.patientDob}</td>
                <td>${data?.primaryDeviceType}</td>
            </tr>

            <tr>
                <th colspan="6">Product / Procedure</th>
            </tr>
            <tr>
                <th>L-CODE</th>
                <th>QTY</th>
                <th colspan="2">DESCRIPTION</th>
                <th>SIZE</th>
                <th>ORIENTATION</th>
            </tr>
            ${lcodeItems}
            <tr>
                <th colspan="6">Prescription</th>
            </tr>
            <tr>
                <td colspan="2" rowspan="2">Projected Monthly Frequency <br> ${data?.monthlyFrequency || 'Daily'}</td>
                <td colspan="2" rowspan="2">Estimated Length of Need <br>${data?.lengthOfNeed || 'Life Time'}</td>
                <td colspan="2" rowspan="2">Start Date <br>${data?.startDate}</td>
            </tr>
            <tr></tr>
            <tr >
                <td colspan="3" rowspan="3">Insurance / Medicare Info <br>${data?.insuranceInfo}</td>
                <td colspan="1" rowspan="3">Prescriber Name <br>${data?.prescriberName}</td>
                <td colspan="1" rowspan="3">Prescriber NPI <br>${data?.prescriberNpi}</td>
            </tr>
            <tr></tr>
            <tr></tr>
            <tr>
                <td colspan="4" rowspan="2">Doctor Name <br>${data?.doctorName || '-'}</td>
                <td colspan="2" rowspan="2">Doctor NPI <br>${data?.doctorNpi || '-'}</td>
            </tr>
            <tr></tr>
            <tr>
                <td colspan="4" rowspan="2">Prescriber Address <br>${data?.prescriberAddress}</td>
                <td colspan="2" rowspan="2">Prescriber Work Phone<br>${data?.prescriberWorkPhone}</td>
            </tr>
        </table>
        </div>
        
        <div >
            <p class="para">AUTHORIZATION TO ASSIGN BENEFITS TO PROVIDER & RELEASE MEDICAL INFORMATION</p>
            <p class="p">My signature below states that I request and authorize payment from the Centers for Medicare and Medicaid Services or my Primary, Secondary or Tertiary Insurance carriers of benefits to be made on my behalf to the above company and its physicians or medical staff for medical equipment, products or services that they have provided me. I further authorize the above provider and authorized holders of my medical information to release to the Centers of Medicare and Medicaid Services and its agents or affiliates any information needed to determine these benefits or compliance with current healthcare standards. I have received a copy of the HIPAA privacy statement. I certify that the information given by me in applying for payment under Title XVIII of the Social Security Act, or under a policy of insurance is correct. I authorized any of my medical providers or any other holder of my medical information or the above-named patient, to be released or received by any governmental agency or insurance company to whom application has been made for payment for services rendered to myself or the above patient; to any physicians, other healthcare providers or facilities, institutions or agencies providing treatment to myself or the above-named patient or providing continuity of care and to quality reviewers. The terms of the agreement are incorporated herein and part hereof, and I acknowledge that I have read the same and received a copy thereof. I authorize North American Spine and Pain to provide care and/or services. I understand that I have the right to make decisions about my medical care, including the right to accept or refuse medical or surgical treatment or equipment.
            <br> <br>MY SIGNATURE BELOW STATES THAT I HAVE RECEIVED THE ABOVE MEDICAL EQUIPMENT ITEM(S) IN GOOD CONDITION AND IN PROPER WORKING ORDER. I HAVE BEEN PROPERLY TRAINED AND INSTRUCTED ON THE USE AND CARE OF THE MEDICAL EQUIPMENT(S) AND THE MANUFACTURE GUIDELINES, PRODUCT SAFETY (HOME SAFETY ASSESSMENT), MAINTENANCE AND CLEANING AND WARRANTIES. I UNDERSTAND AND HAVE READ MY RIGHTS AND RESPONSIBILITIES ALONG WITH REPAIR AND REFUND POLICIES, MY SIGNATURE BELOW ALSO STATES THAT THE ITEM(S) DISPENSED TO ME HAVE BEEN INSPECTED FOR STRUCTURAL SAFETY AND MEET THE SPECIFICATIONS OF MY CURRENT PRESCRIPTION/WRITTEN DOCTOR'S ORDER. I HAVE READ AND AGREE TO EACH AND ALL OF THE TERMS AND CONDITIONS WRITTEN IN THIS DOCUMENT. I CONSENT TO RECEIVE MEDICAL EQUIPMENT AND SERVICES FROM THE ABOVE-NAMED PROVIDER</p>
            <footer class="grid-container">
                <div class="sig">
                    <p>PATIENT SIGNATURE</p>
                </div>
                <div class="date">
                    <p>${moment().format(dateFormat)}</p>
                </div>
            </footer>
        </div>
    </body>
    </html>`
}

module.exports = {
    generateMedical,
    generateDelivery,
}