const AWS = require('aws-sdk');

const uploadToS3=(file, fileName)=> {

    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        // Bucket:BUCKET_NAME
    })

    var params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ACL: 'public-read'
    }

    return new Promise((resolve, reject) => {

        s3bucket.upload(params, (err, s3res) => {
            if (err) {
                console.log('err');
                reject(err);
            }
            else {
                console.log('SUCCESS', s3res);
                resolve(s3res.Location);
            }
        })
    })
}

module.exports={
    uploadToS3
};