const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const path = require("path");
const Fs = require('fs')
const { promisify } = require('util');

const mkdirAsync = promisify(Fs.mkdir);

handlebars.registerHelper("math", function(value, options)
{
    return parseInt(value) + 1;
});

handlebars.registerHelper("math-new-inc", function(value, options)
{
    return parseInt(value) + 8;
});

handlebars.registerHelper("currentyear", function(datetime, format) {
    return new Date().getFullYear();
});

module.exports.html_to_pdf = async (templateHtml, options) => {
    try {
            const directoryPath = options.path.substring(0, options.path.lastIndexOf('/'));
            console.log("options", options , directoryPath)

            // await mkdirAsync(directoryPath, { recursive: true });

            let pupeteerOptions = {
                args: ["--no-sandbox"],
                headless: true,
            };
            // if(process.env.NODE_ENV !== 'dev') pupeteerOptions.executablePath = '/usr/bin/chromium-browser';
    
            const browser = await puppeteer.launch(pupeteerOptions);
            const page = await browser.newPage();

            templateHtml = encodeURIComponent(templateHtml);

    
            await page.goto(`data:text/html;charset=UTF-8,${templateHtml}`, {
                waitUntil: "networkidle0",
            });
    
            await page.pdf({
                path: options.path,
                format: "a3",
                margin: {
                    top: "30px",
                    left: "5px",
                    right: "5px",
                    bottom: "100px",
                },
                printBackground: true,
                // displayHeaderFooter: true,
                // headerTemplate: `<div style=" width:100%; text-align:right;padding:0 32px;"><p style="font-size:8px;color:#2f2f2f;font-family:'Inter';"></p></div>`,
                // footerTemplate: `<div style=" width:100%; text-align:right;padding:0 32px;"><p style="font-size:8px;color:#2f2f2f;font-family:'Inter';">This is a computer generated invoice. No signature required</p></div>`,
            });
    
            await browser.close();
    }
    catch (e) {
        console.log(e,'err in pdf function');
        throw e
    }
};

