import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'getCityParameters', async ({ city, startDate, endDate, stationId }) => {
    const o = await orm();
    const t = await o('file_stations').collection.find({
      city,
      ...(stationId && { stationId }),
      ...(startDate && { 'parameters.startDate': { $gte: startDate } }),
      ...(endDate && { 'parameters.endDate': { $lte: endDate } }),
    }).toArray();
    return t.map((station) => ({ ...t, parameters: station.parameters.sort((a, b) => new Date(a.time) > new Date(b.time) ? -1 : new Date(a.time) < new Date(b.time) ? 1 : 0) }))
  })(input.arguments);
