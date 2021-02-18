// This file creates a bucket and uploads a file to it
// Load the SDK and UUID
import AWS from 'aws-sdk';
// Create unique bucket name
const bucketName = 'node-sdk-sample-edx.org-test2';
// Create name for uploaded object key
const keyName = 'hello_world.txt';
export default async () => {
  try {
    // Create a promise on S3 service object
    const bucketPromise = await new AWS.S3({ apiVersion: '2020-12-05', region: 'sa-east-1' })
      .createBucket({ Bucket: bucketName })
      .promise();
      console.log('bucketPromise', bucketPromise)

    // Handle promise fulfilled/rejected states
    // bucketPromise.then(
    //   function(data) {
    // Create params for putObject call
    const objectParams = {
      Bucket: bucketName,
      Key: keyName,
      Body: 'Hello World!',
    };
    // Create object upload promise
    const uploadPromise = await new AWS.S3({ apiVersion: '2020-12-05' })
      .putObject(objectParams)
      .promise();
      console.log('uploadPromise', uploadPromise)
    // uploadPromise.then(
    // function(data) {
    console.log('Successfully uploaded data to ' + bucketName + '/' + keyName);
  } catch (err) {
    console.log(err);
  }
};
