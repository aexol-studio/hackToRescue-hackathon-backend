import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'getCollectedCities', async (args) => {
    const o = await orm();
    const cities = await o('cities')
      .collection.find({})
      .toArray();
    return await Promise.all(cities.map(async (city) => {
      const stations = await o("file_stations").collection.find({ city: city.name }).toArray().then((st) => st.map((s) => ({ ...s, createdAt: new Date(s.createdAt).toISOString() })));
      return { ...city, createdAt: new Date(city.createdAt).toISOString(), stationsInCity: stations };
    }
    ));
  })(input.arguments);


