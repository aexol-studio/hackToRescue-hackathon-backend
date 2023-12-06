import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import fs from 'fs';
import xlsx from 'node-xlsx';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'test', async (args) => {
    const readFolder = () => {
      const file = fs.readFileSync('wadowice.xlsx');
      const data = xlsx.parse(file)[0].data;
      data.shift();
      data.shift();
      data.shift();
      console.log(data);

      return {
        city: 'Wadowice',
        parameters: data.map((row) => ({
          time: new Date(row[0]),
          pm1: row[1],
          pm10: row[2],
          pm25: row[3],
        })),
      };
    };

    fs.writeFileSync('data.json', JSON.stringify(readFolder()));
    return 'hello world';
  })(input.arguments);
