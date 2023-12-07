import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'getCollectedCities', async (args) => {
    const o = await orm();
    return await o('cities')
      .collection.find({})
      .toArray().then((cities) => cities.map((city) => ({
        ...city,
        createdAt: new Date(city.createdAt).toISOString()
      })));
  })(input.arguments);
