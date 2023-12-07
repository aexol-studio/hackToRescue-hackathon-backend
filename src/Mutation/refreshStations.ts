import { FieldResolveInput } from 'stucco-js';
import { DATA_SOURCE_TYPE, ModelTypes, resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';
import { fetcher } from '../utils/featcher.js';
import { getEnv } from '../utils/getEnv.js';
import { getLatLong } from '../utils/latlong.js';
import { AirQuality } from '../models/AirQuality.js';

interface Parameter {
  co: number;
  no: number;
  no2: number;
  o3: number;
  so2: number;
  pm2p5: number;
  pm10: number;
  nh3: number;
  [key: string]: number;
}

interface AirQualityCategory {
  name: string;
  index: number;
  ranges: { [key: string]: [number, number] };
}

const airQualityCategories: AirQualityCategory[] = [
  {
    name: 'Good',
    index: 1,
    ranges: {
      so2: [0, 20],
      no2: [0, 40],
      pm10: [0, 20],
      pm2p5: [0, 10],
      o3: [0, 60],
      co: [0, 4400],
    },
  },
  {
    name: 'Fair',
    index: 2,
    ranges: {
      so2: [20, 80],
      no2: [40, 70],
      pm10: [20, 50],
      pm2p5: [10, 25],
      o3: [60, 100],
      co: [4400, 9400],
    },
  },
  {
    name: 'Moderate',
    index: 3,
    ranges: {
      so2: [80, 250],
      no2: [70, 150],
      pm10: [50, 100],
      pm2p5: [25, 50],
      o3: [100, 140],
      co: [9400, 12400],
    },
  },
  {
    name: 'Poor',
    index: 4,
    ranges: {
      so2: [250, 350],
      no2: [150, 200],
      pm10: [100, 200],
      pm2p5: [50, 75],
      o3: [140, 180],
      co: [12400, 15400],
    },
  },
  {
    name: 'Very Poor',
    index: 5,
    ranges: {
      so2: [350, Infinity],
      no2: [200, Infinity],
      pm10: [200, Infinity],
      pm2p5: [75, Infinity],
      o3: [180, Infinity],
      co: [15400, Infinity],
    },
  },
];

export const getIndex = (pollutant: keyof AirQualityCategory['ranges'], value: number): number => {
  for (const category of airQualityCategories) {
    const [min, max] = category.ranges[pollutant];
    if (value >= min && value <= max) {
      return category.index;
    }
  }
  return -1;
};

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
    let d = new Date().setMinutes(new Date().getMinutes() + 30);
    const locker = await o('locks').collection.findOne({
      lockTitle: 'refreshStations',
      lockTime: { $lte: new Date().getTime() },
    });
    // if (!locker) {
    //   return;
    // }
    await o('locks').collection.updateOne({ lockTitle: 'refreshStations' }, { $set: { lockTime: d } });
    const stations = await fetcher<fetchedStation[]>(`${getEnv('API_URL')}/station/findAll`);
    if (!stations) {
      return;
    }
    await Promise.all(
      stations.map(async (city) => {
        const c = await o('cities').collection.findOne({
          name: city.city.name,
        });
        if (!c) {
          const geo = await getLatLong(city.city.name);
          if (!geo) {
            return;
          }
          await o('cities').createWithAutoFields()({
            country: geo.country,
            state: geo.state,
            createdAt: new Date().toISOString(),
            name: city.city.name,
            location: {
              ...geo,
            },
          });
        }
      }),
    );
    await Promise.all(
      stations.map(async (station) => {
        const s = await o('file_stations').collection.findOne({
          stationId: station.id,
        });
        if (!s) {
          const quality = await fetcher<AirQuality>(`${getEnv('API_URL')}/aqindex/getIndex/${station.id}`);
          if (!quality) {
            return;
          }
          const parameters: ModelTypes['Parameters'][] = [
            {
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
              o3: quality.o3IndexLevel?.id,
              time: new Date().toISOString(),
            },
          ];
          await o('file_stations').collection.insertOne({
            city: station.city.name,
            stationId: station.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            parameters,
            kind: DATA_SOURCE_TYPE.AUTOMATIC,
          });
          return;
        }
        const quality = await fetcher<AirQuality>(`${getEnv('API_URL')}/aqindex/getIndex/${station.id}`);
        if (!quality) {
          return;
        }
        const parameter: ModelTypes['Parameters'] = {
          no2Time:
            quality.no2SourceDataDate &&
              s.parameters.length &&
              s.parameters[s.parameters.length - 1].no2Time?.length &&
              s.parameters[s.parameters.length - 1].no2Time !== quality.no2SourceDataDate
              ? quality.no2SourceDataDate
              : undefined,
          o3Time:
            quality.o3SourceDataDate &&
              s.parameters.length &&
              s.parameters[s.parameters.length - 1].o3Time?.length &&
              s.parameters[s.parameters.length - 1].o3Time !== quality.o3SourceDataDate
              ? quality.o3SourceDataDate
              : undefined,
          so2Time:
            quality.so2SourceDataDate &&
              s.parameters.length &&
              s.parameters[s.parameters.length - 1].so2Time?.length &&
              s.parameters[s.parameters.length - 1].so2Time !== quality.so2SourceDataDate
              ? quality.so2SourceDataDate
              : undefined,
          pm25Time:
            quality.pm25SourceDataDate &&
              s.parameters.length &&
              s.parameters[s.parameters.length - 1].pm25Time?.length &&
              s.parameters[s.parameters.length - 1].pm25Time !== quality.pm25SourceDataDate
              ? quality.pm25SourceDataDate
              : undefined,
          pm10Time:
            quality.pm10SourceDataDate &&
              s.parameters.length &&
              !!s.parameters[s.parameters.length - 1].pm10Time?.length &&
              s.parameters[s.parameters.length - 1].pm10Time !== quality.pm10SourceDataDate
              ? quality.pm10SourceDataDate
              : undefined,
          pm10:
            quality.pm10SourceDataDate &&
              s.parameters.length &&
              s.parameters[s.parameters.length - 1].pm10Time?.length &&
              s.parameters[s.parameters.length - 1].pm10Time !== quality.pm10SourceDataDate
              ? quality.pm10IndexLevel?.id
              : undefined,
          pm25:
            quality.pm25SourceDataDate &&
              s.parameters.length &&
              s.parameters[s.parameters.length - 1].pm25Time?.length &&
              s.parameters[s.parameters.length - 1].pm25Time !== quality.pm25SourceDataDate
              ? quality.pm25IndexLevel?.id
              : undefined,
          no2:
            quality.no2SourceDataDate &&
              s.parameters.length &&
              s.parameters[s.parameters.length - 1].no2Time?.length &&
              s.parameters[s.parameters.length - 1].no2Time !== quality.no2SourceDataDate
              ? quality.no2IndexLevel?.id
              : undefined,
          so2:
            quality.so2SourceDataDate &&
              s.parameters.length &&
              s.parameters[s.parameters.length - 1].so2Time?.length &&
              s.parameters[s.parameters.length - 1].so2Time !== quality.so2SourceDataDate
              ? quality.so2IndexLevel?.id
              : undefined,
          o3:
            quality.o3SourceDataDate &&
              s.parameters.length &&
              s.parameters[s.parameters.length - 1].o3Time?.length &&
              s.parameters[s.parameters.length - 1].o3Time !== quality.o3SourceDataDate
              ? quality.o3IndexLevel?.id
              : undefined,
          time: new Date().toISOString(),
        };
        if (!!parameter.pm10 || !!parameter.pm25 || !!parameter.no2 || !!parameter.so2 || !!parameter.o3)
          if (
            s.parameters[s.parameters.length - 1].pm10Time !== quality.pm10SourceDataDate ||
            s.parameters[s.parameters.length - 1].no2Time !== quality.no2SourceDataDate ||
            s.parameters[s.parameters.length - 1].so2Time !== quality.so2SourceDataDate ||
            s.parameters[s.parameters.length - 1].pm25Time !== quality.pm25SourceDataDate ||
            s.parameters[s.parameters.length - 1].o3Time !== quality.o3SourceDataDate ||
            s.parameters[s.parameters.length - 1].so2Time !== quality.so2SourceDataDate
          ) {
            if (
              s.parameters[s.parameters.length - 1].o3Time?.length ||
              s.parameters[s.parameters.length - 1].so2Time?.length ||
              s.parameters[s.parameters.length - 1].no2Time?.length ||
              s.parameters[s.parameters.length - 1].pm25Time?.length ||
              s.parameters[s.parameters.length - 1].pm10Time?.length
            )
              await o('file_stations').collection.updateOne(
                { stationId: station.id },
                { $push: { parameters: parameter }, $set: { updatedAt: new Date().toISOString() } },
              );
          }
      }),
    );
    const refreshOpenWeatherLocker = await o('locks').collection.findOne({
      lockTitle: 'refreshOpenWeather',
      lockTime: { $lte: new Date().getTime() },
    });
    if (!refreshOpenWeatherLocker) {
      return;
    }
    d = new Date().setMinutes(new Date().getMinutes() + 240);
    await o('locks').collection.updateOne({ lockTitle: 'refreshOpenWeather' }, { $set: { lockTime: d } });
    const allCities = (await o('cities').collection.find().toArray()).slice(10);
    await Promise.all(
      allCities.map(async (city) => {
        const data = await fetch(
          `http://api.openweathermap.org/data/2.5/air_pollution?lat=${city.location.lat}&lon=${city.location.long
          }&appid=${getEnv('OPENWEATHER_API_KEY')}`,
        ).then((r) => r.json());
        const parameter = {
          co: getIndex('co', data.list[0].components.co),
          no2: getIndex('no2', data.list[0].components.no2),
          o3: getIndex('o3', data.list[0].components.o3),
          so2: getIndex('so2', data.list[0].components.so2),
          pm2p5: getIndex('pm2p5', data.list[0].components.pm2_5),
          pm10: getIndex('pm10', data.list[0].components.pm10),
          time: new Date(data.list[0].dt * 1000).toISOString(),
        };
        const openWeatherApi = await o('file_stations').collection.findOne({
          city: city.name,
          kind: DATA_SOURCE_TYPE.OPEN_WEATHER,
        });
        if (!openWeatherApi) {
          await o('file_stations').createWithAutoFields()({
            city: city.name,
            kind: DATA_SOURCE_TYPE.OPEN_WEATHER,
            parameters: [parameter],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          const currentDate = new Date();
          const futureDate = new Date(currentDate.getTime() - 2 * 60 * 60 * 1000);
          if (futureDate > new Date(openWeatherApi.updatedAt))
            await o('file_stations').collection.updateOne(
              { city: city.name, kind: DATA_SOURCE_TYPE.OPEN_WEATHER },
              { $push: { parameters: parameter }, $set: { updatedAt: new Date().toISOString() } },
              {},
            );
        }
      }),
    );
    return 'Ok';
  })(input.arguments);
