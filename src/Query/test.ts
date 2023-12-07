
import { FieldResolveInput } from 'stucco-js';
import { DATA_SOURCE_TYPE, resolverFor } from '../zeus/index.js';
import { getEnv } from '../utils/getEnv.js';
import { orm } from '../utils/orm.js';
import { getLatLong } from '../utils/latlong.js';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'test', async (args) => {
    await getLatLong("Jarosław");
  })(input.arguments);
