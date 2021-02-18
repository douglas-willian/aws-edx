const AWS = require('aws-sdk');
const S3 = new AWS.S3({ region: 'sa-east-1' });

exports.handler = function (event, context, callback) {
  getDataUsingS3Select(event, callback);
};
const handleData = (data, callback) => {
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
      throw err;
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

        callback(null, {
          statusCode: 200,
          body: JSON.stringify(resultData),
        });
      } catch (error) {
        reject(
          new Error(
            `Unable to convert S3 data to JSON object. S3 Select Query: ${params.Expression}`
          )
        );
      }
    });
};
async function getDataUsingS3Select(event, callback) {
  // 1
  let expression = 'select * from s3object s';
  const queryParams = event.queryStringParameters;

  if (queryParams && queryParams.dragonName && queryParams.dragonName !== '') {
    expression = `select * from s3object[*][*] s where s.dragon_name_str = '${event['queryStringParameters']['dragonName']}'`;
  }

  if (queryParams && queryParams.family && queryParams.family !== '') {
    expression = `select * from s3object[*][*] s where s.family_str = '${event['queryStringParameters']['family']}'`;
  }

  const params = {
    Bucket: 'edx.org-dev',
    Expression: expression,
    ExpressionType: 'SQL',
    Key: 'test.json',
    InputSerialization: {
      JSON: {
        Type: 'DOCUMENT',
      },
    },
    OutputSerialization: {
      JSON: {
        RecordDelimiter: ',',
      },
    },
  };
  return new Promise((resolve, reject) => {
    S3.selectObjectContent(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(handleData(data, callback));
      }
      // if (!data) {
      //   reject('Empty data object');
      // }
      // This will be an array of bytes of data, to be converted to a buffer
    });
  });
}
