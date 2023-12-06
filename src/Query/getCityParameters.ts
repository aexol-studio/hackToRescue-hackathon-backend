import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'getCityParameters', async ({ city, startDate, endDate }) => {
    const o = await orm();
    const t = await o('stations').collection.findOne({
      city,
      ...(startDate && { 'parameters.startDate': { $gte: startDate } }),
      ...(endDate && { 'parameters.endDate': { $lte: endDate } }),
    });
    return t;
  })(input.arguments);
