const got = require('got');

exports.sendEmail = function(email, subject, content,attachment) {
    return new Promise((resolve, reject) => {
        got.post(
            "https://api.sendinblue.com/v3/smtp/email",
            {
                json: {
                        subject,
                        "sender": {
                            "name": "Mobility Health",
                            "email": "is@mobilityidealhealth.com"
                        },
                        "htmlContent": content,
                        "to":[
                            {
                                email
                            }
                        ]
                    },
                responseType: "json",
                headers: {
                    "Content-Type" : "application/json",
                    "api-key": "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"
                }
            }
        )
            .then((success)=> {
                console.log('Success Email--', success?.body)
                resolve()
            })
            .catch((err)=> {
                console.log(err,'err')
                reject(err)
            })
    })
};

