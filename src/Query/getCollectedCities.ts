import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'getCollectedCities', async (args) => {
    const o = await orm();
    return await o('stations')
      .collection.find({})
      .toArray()
      .then((e) => e.reduce((pv, cv) => pv.push(cv.city), [] as string[]));
  })(input.arguments);
