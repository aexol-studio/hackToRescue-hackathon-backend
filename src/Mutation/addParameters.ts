import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import fs from 'fs';
import xlsx from 'node-xlsx';
import { orm } from '../utils/orm.js';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Mutation', 'addParameters', async ({ base64: blob, city }) => {
    console.log(blob);
    // const readFolder = () => {
    //   const data = xlsx.parse(file)[0].data;
    //   console.log(base64, city);
    //   data.shift();
    //   data.shift();
    //   data.shift();

    //   return {
    //     city,
    //     parameters: data.map((row) => ({
    //       time: new Date(row[0]).toISOString(),
    //       pm1: Number(row[1]),
    //       pm10: Number(row[2]),
    //       pm25: Number(row[3]),
    //     })),
    //   };
    // };
    const o = await orm();
    // const result = await o('stations').createWithAutoFields('_id')(readFolder());
    // return result.insertedId.length !== 0;
    return true;
  })(input.arguments);
