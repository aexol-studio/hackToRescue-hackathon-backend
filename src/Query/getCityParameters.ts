import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'getCityParameters', async ({ city, startDate, endDate, stationId }) => {
    const o = await orm();
    let t = await o('file_stations').collection.find({
      city,
      ...(stationId && { stationId }),
    }).toArray();
    if (!!startDate) {
      t = t.map((file) => ({ ...file, parameters: file.parameters.filter((parameter) => new Date(parameter.time) < new Date() && new Date(parameter.time) > new Date(startDate)) }))
    }
    if (!!endDate) {
      t = t.map((file) => ({ ...file, parameters: file.parameters.filter((parameter) => new Date(parameter.time) < new Date(endDate)) }))
    }

    return t;

  })(input.arguments);
