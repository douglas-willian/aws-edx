import AWS from 'aws-sdk';
import fs from 'fs';

const S3 = new AWS.S3({ region: 'sa-east-1' });

// const handleData = (data, callback) => {
//   const event = data.Payload
//   let dataToReturn

//   event.on('data', (event) => {
//     if (event.Records) {
//       dataToReturn += event.Records.Payload.toString()
//     }
//   })

//   event.on('end', () => {
//     callback(null, {
//       statusCode: 200,
//       body: JSON.stringify(dataToReturn)
//     })
//   })

// }

process.on('unhandledRejection', (error) => {
  fs.appendFileSync('rejection.txt', error.message || JSON.stringify(error));
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  fs.appendFileSync('exception.txt', error.message || JSON.stringify(error));
  process.exit(1);
});

export default async function getDataUsingS3Select(params) {
  // 1
  return new Promise((resolve, reject) => {
    S3.selectObjectContent(params, (err, data) => {
      if (err) {
        reject(err);
      }
      if (!data) {
        reject('Empty data object');
      }
      // This will be an array of bytes of data, to be converted to a buffer
      const records = [];
      // This is a stream of events
      data.Payload.on('data', (event) => {
        // There are multiple events in the eventStream, but all we
        // care about are Records events. If the event is a Records
        // event, there is data inside it
        if (event.Records) {
          records.push(event.Records.Payload);
        }
      })
        .on('error', (err) => {
          reject(err);
        })
        .on('end', () => {
          // Convert the array of bytes into a buffer, and then
          // convert that to a string
          const convertedBuffer = Buffer.concat(records).toString('utf8');
          console.log('1. convertedBuffer', convertedBuffer);
          // 2
          // remove any trailing commas so JSON.parse won't break
          const removedTrailingCommas = convertedBuffer.replace(/\,$/, '');
          console.log('2. removedTrailingCommas', removedTrailingCommas);

          // 3
          // Add into JSON 'array'
          const makeJSONArray = `[${removedTrailingCommas}]`;
          console.log('3. makeJSONArray', makeJSONArray);

          try {
            const resultData = JSON.parse(makeJSONArray);
            console.log('4. resultData', resultData);

            resolve(makeJSONArray); // resultData
          } catch (error) {
            reject(
              new Error(
                `Unable to convert S3 data to JSON object. S3 Select Query: ${params.Expression}`
              )
            );
          }
        });
    });
  });
}
