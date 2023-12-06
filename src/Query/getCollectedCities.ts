import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'getCollectedCities', async (args) => {
    const o = await orm();
    return await o('cities')
      .collection.find({})
      .toArray();
  })(input.arguments);
