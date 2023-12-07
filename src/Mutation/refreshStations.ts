
import { FieldResolveInput } from 'stucco-js';
import { ModelTypes, resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';
import { fetcher } from '../utils/featcher.js';
import { getEnv } from '../utils/getEnv.js';
import { getLatLong } from '../utils/latlong.js';
import { AirQuality } from '../models/AirQuality.js';

export type fetchedStation = {
  id: number;
  stationName: string;
  gegrLat: string;
  gegrLon: string;
  city: {
    id: number;
    name: string;
    commune: {
      communeName: string;
      districtName: string;
      provinceName: string;
    };
  };
  addressStreet: string;
};


export const handler = async (input: FieldResolveInput) =>
  resolverFor('Mutation', 'refreshStations', async (args) => {
    const o = await orm();
    const d = new Date().setMinutes(new Date().getMinutes() + 30);
    const locker = await o("locks").collection.findOne({ lockTitle: "refreshStations", lockTime: { $lte: new Date().getTime() } })
    if (!locker) {
      return;
    }
    await o("locks").collection.updateOne({ lockTitle: "refreshStations" }, { lockTime: d })
    const stations = await fetcher<fetchedStation[]>(`${getEnv("API_URL")}/station/findAll`);
    if (!stations) {
      return;
    }
    await Promise.all(stations.map(async (city) => {
      const c = await o("cities").collection.findOne({ name: city.city.name })
      if (!c) {
        const geo = await getLatLong(city.city.name);
        if (!geo) {
          return;
        }
        await o("cities").createWithAutoFields()({
          country: "PL",
          createdAt: new Date(),
          name: city.city.name,
          location: {
            ...geo
          },
        })
      }
    }));
    await Promise.all(stations.map(async (station) => {
      const s = await o("file_stations").collection.findOne({ stationId: station.id })
      if (!s) {
        const quality = await fetcher<AirQuality>(`${getEnv("API_URL")}/aqindex/getIndex/${station.id}`);
        if (!quality) {
          return;
        }
        const parameters: ModelTypes["Parameters"][] = [{
          pm1: undefined,
          no2Time: quality.no2SourceDataDate || undefined,
          o3Time: quality.o3SourceDataDate || undefined,
          so2Time: quality.so2SourceDataDate || undefined,
          pm25Time: quality.pm25SourceDataDate || undefined,
          pm10Time: quality.pm10SourceDataDate || undefined,
          pm10: quality.pm10IndexLevel?.id,
          pm25: quality.pm25IndexLevel?.id,
          no2: quality.no2IndexLevel?.id,
          so2: quality.so2IndexLevel?.id,
          o3: quality.o3IndexLevel?.id
        }]
        await o("file_stations").collection.insertOne({
          city: station.city.name,
          stationId: station.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parameters,
        })
        return;
      }
      const quality = await fetcher<AirQuality>(`${getEnv("API_URL")}/aqindex/getIndex/${station.id}`);
      if (!quality) {
        return;
      }
      let parameter: ModelTypes["Parameters"] = {
        pm1: undefined,
        no2Time: quality.no2SourceDataDate && s.parameters.length && s.parameters[s.parameters.length - 1].no2Time?.length && s.parameters[s.parameters.length - 1].no2Time !== quality.no2SourceDataDate ? quality.no2SourceDataDate : undefined,
        o3Time: quality.o3SourceDataDate && s.parameters.length && s.parameters[s.parameters.length - 1].o3Time?.length && s.parameters[s.parameters.length - 1].o3Time !== quality.o3SourceDataDate ? quality.o3SourceDataDate : undefined,
        so2Time: quality.so2SourceDataDate && s.parameters.length && s.parameters[s.parameters.length - 1].so2Time?.length && s.parameters[s.parameters.length - 1].so2Time !== quality.so2SourceDataDate ? quality.so2SourceDataDate : undefined,
        pm25Time: quality.pm25SourceDataDate && s.parameters.length && s.parameters[s.parameters.length - 1].pm25Time?.length && s.parameters[s.parameters.length - 1].pm25Time !== quality.pm25SourceDataDate ? quality.pm25SourceDataDate : undefined,
        pm10Time: quality.pm10SourceDataDate && s.parameters.length && !!s.parameters[s.parameters.length - 1].pm10Time?.length && s.parameters[s.parameters.length - 1].pm10Time !== quality.pm10SourceDataDate ? quality.pm10SourceDataDate : undefined,
        pm10: quality.pm10SourceDataDate && s.parameters.length && s.parameters[s.parameters.length - 1].pm10Time?.length && s.parameters[s.parameters.length - 1].pm10Time !== quality.pm10SourceDataDate ? quality.pm10IndexLevel?.id : undefined,
        pm25: quality.pm25SourceDataDate && s.parameters.length && s.parameters[s.parameters.length - 1].pm25Time?.length && s.parameters[s.parameters.length - 1].pm25Time !== quality.pm25SourceDataDate ? quality.pm25IndexLevel?.id : undefined,
        no2: quality.no2SourceDataDate && s.parameters.length && s.parameters[s.parameters.length - 1].no2Time?.length && s.parameters[s.parameters.length - 1].no2Time !== quality.no2SourceDataDate ? quality.no2IndexLevel?.id : undefined,
        so2: quality.so2SourceDataDate && s.parameters.length && s.parameters[s.parameters.length - 1].so2Time?.length && s.parameters[s.parameters.length - 1].so2Time !== quality.so2SourceDataDate ? quality.so2IndexLevel?.id : undefined,
        o3: quality.o3SourceDataDate && s.parameters.length && s.parameters[s.parameters.length - 1].o3Time?.length && s.parameters[s.parameters.length - 1].o3Time !== quality.o3SourceDataDate ? quality.o3IndexLevel?.id : undefined,
      }

      await o("file_stations").collection.updateOne({ stationId: station.id }, { $push: { parameters: parameter } })

    }))
    return "Ok";

  })(input.arguments);