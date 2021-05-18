const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({ region: process.env.AWS_REGION });
const bucket = process.env.S3_BUCKET;

const fileStorage = multerS3({
    s3,
    acl: 'private',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    contentDisposition: "detachment",
    bucket,
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, callback) => {
    
        const fileName = "images/" + new Date().getTime() + "-" + encodeURIComponent(file.originalname);
        callback(null, fileName);
    }
});

const uploadFilesToS3 = 
    multer({ storage: fileStorage,
    fileFilter: function (req, file, cb) {
    if (file.originalname.split(".").slice(-1)[0] === 'pdf' || 
        file.originalname.split(".").slice(-1)[0] === 'odt' ||
        file.originalname.split(".").slice(-1)[0] === 'jpg') {
            return cb(null, true)
    }
    return cb(new Error('Only specific files are allowed'))
    
  } }).single("image");


  
const getImageFromS3 = async (req, res, next) => {

    const Key = 'images/' +  encodeURI(req.query.key.split('/')[1])
    try {
        const { Body } = await s3.getObject({
            Key,
            Bucket: bucket
        }).promise();
        req.fileBuffer = Body;
        next();
    } catch (err) {
        console.log(err);
    }
};

const deleteImageFromS3 = async (req, res, next) => {

    const Key = req.body.key;
    
    try {
        await s3.deleteObject({
            Key,
            Bucket: process.env.S3_BUCKET
        }).promise();
        next();
    } catch (err) {
        res.status(404).send({
            message: "File not found"
        });
    }
};

module.exports = {
    uploadFilesToS3,
    deleteImageFromS3,
    getImageFromS3
};