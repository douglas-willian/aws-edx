const AWS = require('aws-sdk');
const S3 = new AWS.S3({ region: 'sa-east-1' });
const fs = require('fs');

exports.handler = function (event, context, callback) {
  getDataUsingS3Select(event, callback);
};

class DragonValidationException extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

const handleData = (data, callback) => {
  data.Payload.on('data', (event) => {
    if (event.Records) {
      callback(new DragonValidationException('Duplicate dragon reported'));
    } else {
      callback(null, 'Valid Dragon');
    }
  });
};

async function getDataUsingS3Select(event, callback) {
  const expression = `select * from s3object s where s.dragon_name_str = '${event.dragon_name_str}'`;

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
    });
  });
}
