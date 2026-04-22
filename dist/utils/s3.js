"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToS3 = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const uuid_1 = require("uuid");
const s3 = new aws_sdk_1.default.S3();
const uploadFileToS3 = async (bucketName, fileContent, fileName, contentType) => {
    const key = `catalog/${(0, uuid_1.v4)()}-${fileName}`;
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
    };
    try {
        const result = await s3.upload(params).promise();
        console.log(`File uploaded successfully: ${result.Location}`);
        return result.Location;
    }
    catch (error) {
        console.error('Error uploading file to S3:', error);
        throw error;
    }
};
exports.uploadFileToS3 = uploadFileToS3;
//# sourceMappingURL=s3.js.map