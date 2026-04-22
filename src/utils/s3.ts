import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3();

export const uploadFileToS3 = async (
  bucketName: string,
  fileContent: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  const key = `catalog/${uuidv4()}-${fileName}`;
  
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
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};
