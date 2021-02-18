import getDataUsingS3Select from './getDataUsingS3Select.js';
import path from 'path';
let expression = 'select * from s3object s'

// if (event.queryStringParameters && event.queryStringParameters.dragonName && event.queryStringParameters.dragonName !== '') {
//   expression = `select * from s3object[*][*] s where s.dragon_name_str = '${event['queryStringParameters']['dragonName']}'`
// }

// if (event.queryStringParameters && event.queryStringParameters.family && event.queryStringParameters.family !== '') {
//   expression = `select * from s3object[*][*] s where s.family_str = '${event['queryStringParameters']['family']}'`
// }

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

const result = await getDataUsingS3Select(params);
console.log(path.resolve());
console.log('result', result);
