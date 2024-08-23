const { APP_CONSTANTS, awsS3Config } = require('../Config');
const Path = require('path');
const fsExtra = require('fs-extra');
const Fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });
const {logger} = require('./LoggerManager');
const storagePath = APP_CONSTANTS.SERVER.SERVER_STORAGE_NAME;

const uploadFilesOnBucket = async function (fileData, folderPath) {
    if (!fileData || !fileData.filename) {
        return Promise.reject(APP_CONSTANTS.STATUS_MSG.ERROR.FILE_ISSUE_ERROR)
    }

    let imageFile = false,width = 0,height = 0;

    try {

        let filename = fileData.filename.toString();
        let ext = filename.substr(filename.lastIndexOf('.'));
        let type;

        switch (ext.toLowerCase()) {
            case '.jpg':
            case '.jpeg':
            case '.png':
            case '.gif':
                imageFile = true;
                type = 'IMAGE';
                break;
            case '.3gp':
            case '.mp4':
            case '.avi':
            case '.mpeg':
                type = 'VIDEO';
                break;
            case '.mp3':
            case '.aac':
                type = 'AUDIO';
                break;
            case '.xlsx':
            case '.pdf':
            case '.csv':
            case '.docx':
            case '.doc':
            case '.ppt':
            case '.pptx':
            case '.html':
            case '.zip':
                type = 'OTHER';
                break;
            default:
                return Promise.reject(APP_CONSTANTS.STATUS_MSG.ERROR.FILE_ISSUE_ERROR);
        }

        fileData.original = getFileName(false, filename);
        fileData.thumb = getFileName(true, imageFile && filename || (filename.substr(0, filename.lastIndexOf('.'))) + '.jpg');

        if (imageFile) {
            const thumbnailPath = Path.resolve('.') + '/Uploads/' + fileData.thumb;
            generateThumbnail(fileData.path, thumbnailPath, async  (err,result)=>{
                if(err) console.log(err)
                else {
                    width = result.width
                    height = result.height
                    await readAndUploadFile({path : thumbnailPath}, fileData.thumb, storagePath + folderPath);
                    deleteFile(thumbnailPath)
                }
            }) 
        }

        const response = await readAndUploadFile(fileData, fileData.original, storagePath + folderPath);

        logger.info(response)
        const responseObject = {
            width, height,
            ext: ext.replace('.', ''),
            original: `${folderPath}${response?.name || fileData.original}`,
            thumbnail: `${folderPath}${fileData.thumb}`,
            type
        };

        if (type === 'OTHER' || type === 'AUDIO') responseObject.thumbnail = responseObject.original;

        return responseObject;

    }
    catch (e) {
        console.log(e)
        return Promise.reject(e)
    }
};

const readAndUploadFile = async (fileData, fileName, folderName) => {
    const fileRead = await Fs.promises.readFile(fileData.path);
    return new Promise((resolve, reject) => {
        Fs.promises.writeFile(folderName + fileName, fileRead)
        .then(() => {
            resolve({name : fileName});
        })
        .catch(err => {
            reject(err);
        });
    });
};

const deleteFile = async (path) => {
    try {
        await fsExtra.remove(path);
    } catch (err) {
        console.log('error deleting file>>', err);
    }
};

const createThumbnailImage = (originalPath, thumbnailPath) => {

    const readStream = Fs.createReadStream(originalPath);
    return new Promise((resolve, reject) => {
        gm(readStream)
            .size({ bufferStream: true }, function (err, size) {
                logger.debug("sixw***********", size)
                if (size) {
                    this.thumb(size.width, size.height, thumbnailPath, 20, (err, data) => {
                        if (err) reject(err)
                        else resolve(null)
                    })
                } else reject(err)
            });
    })
};

function generateThumbnail(inputImagePath, outputImagePath, callback) {
    // Check if the input image file exists
    if (!Fs.existsSync(inputImagePath)) {
      console.error('Error: Input image not found.');
      return;
    }
  
    // Get the dimensions of the main image
    gm(inputImagePath).size((err, mainImageSize) => {
      if (err) {
        console.error('Error getting main image dimensions:', err);
        return;
      }
  
      const width = mainImageSize.width ||  300;
      const height = mainImageSize.height || 300;
  
      gm(inputImagePath)
        .resizeExact(width, height)
        .quality(70)
        .write(outputImagePath, (err) => {
          if(err)callback(err)
          else callback(null,{size : mainImageSize})
        });
    });
  }

const getFileName = (thumbFlag, fullFileName) => {
    const { name } = Path.parse(fullFileName);
    const uiniqueId = Math.round(Math.random() * Date.now());
    const prefix = `${name}`;
  
    const ext = fullFileName.substr(fullFileName.lastIndexOf('.') || 0);
    const prefixWithThumb = thumbFlag ? `${prefix}_thumb` : prefix;

    return `${prefixWithThumb}_${uiniqueId}${ext}`;
};

module.exports = {
    uploadFilesOnBucket: uploadFilesOnBucket,
    deleteFile: deleteFile,
    createThumbnailImage: createThumbnailImage,
};
