
import { FieldResolveInput } from 'stucco-js';
import { ModelTypes, resolverFor } from '../zeus/index.js';
import { getEnv } from '../utils/getEnv.js';
import { AirQuality } from '../models/AirQuality.js';
import { fetcher } from '../utils/featcher.js';
import { orm } from '../utils/orm.js';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'getRealTimeParameters', async (args) => {
    const quality = await fetcher<AirQuality>(`${getEnv('API_URL')}/aqindex/getIndex/${args.stationId}`);
    if (!quality) {
      return;
    }
    const o = await orm();
    const station = await o("file_stations").collection.findOne({ stationId: args.stationId })
    if (!station) {
      throw new Error("we currently does not handle this station")
    }
    let parameter: ModelTypes['Parameters'] = {
      no2Time: quality.no2SourceDataDate || station.parameters[station.parameters.length - 1].no2Time || undefined,
      o3Time: quality.o3SourceDataDate || station.parameters[station.parameters.length - 1].o3Time || undefined,
      so2Time: quality.so2SourceDataDate || station.parameters[station.parameters.length - 1].so2Time || undefined,
      pm25Time: quality.pm25SourceDataDate || station.parameters[station.parameters.length - 1].pm25Time || undefined,
      pm10Time: quality.pm10SourceDataDate || station.parameters[station.parameters.length - 1].pm10Time || undefined,
      pm10: quality.pm10IndexLevel?.id || station.parameters[station.parameters.length - 1].pm10 || undefined,
      pm25: quality.pm25IndexLevel?.id || station.parameters[station.parameters.length - 1].pm25 || undefined,
      no2: quality.no2IndexLevel?.id || station.parameters[station.parameters.length - 1].no2 || undefined,
      so2: quality.so2IndexLevel?.id || station.parameters[station.parameters.length - 1].so2 || undefined,
      o3: quality.o3IndexLevel?.id || station.parameters[station.parameters.length - 1].o3 || undefined,
      time: new Date().toISOString(),
    };
    return ({ ...station, parameters: [parameter] })
  })(input.arguments);
