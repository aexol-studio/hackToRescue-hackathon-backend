import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'getCityParameters', async ({ city, startDate, endDate, stationId }) => {
    const o = await orm();
    const t = await o('file_stations').collection.find({
      city,
      ...(stationId && { stationId }),
      ...(startDate && { 'parameters.time': { $gte: startDate } }),
      ...(endDate && { 'parameters.time': { $lte: endDate } }),
    }).toArray();
    return t;

  })(input.arguments);
