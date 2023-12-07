
import { FieldResolveInput } from 'stucco-js';
import { DATA_SOURCE_TYPE, resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';
import { getEnv } from '../utils/getEnv.js';
import { fetcher } from '../utils/featcher.js';
import { getIndex } from '../Mutation/refreshStations.js';

type OpenWeatherApi = {
  coord: number[],
  list: {
    dt: number,
    main: {
      aqi: number
    },
    components: {
      co: number,
      no2: number,
      o3: number,
      so2: number,
      pm2_5: number,
      pm10: number,
      nh3: number,
    }
  }[]
}


export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'test', async (args) => {
    // const o = await orm();
    // const ciities = (await o("cities").collection.find().toArray());
    // await Promise.all(ciities.map(async (city) => {
    //   const openWeatherApi = await o('file_stations').collection.findOne({
    //     city: city.name,
    //     kind: DATA_SOURCE_TYPE.OPEN_WEATHER,
    //   });
    //   if (!openWeatherApi) {
    //     const data = await fetcher<OpenWeatherApi>(`http://api.openweathermap.org/data/2.5/air_pollution/history?lat=${city.location.lat}&lon=${city.location.long}&start=1700694000&end=${new Date().getTime()}&appid=${getEnv('OPENWEATHER_API_KEY')}`)
    //     if (!data) {
    //       throw new Error("failed fetch historical data")
    //     }
    //     const parameters = data.list.map((singleObj) => ({
    //       co: getIndex('co', singleObj.components.co),
    //       no2: getIndex('no2', singleObj.components.no2),
    //       o3: getIndex('o3', singleObj.components.o3),
    //       so2: getIndex('so2', singleObj.components.so2),
    //       pm2p5: getIndex('pm2p5', singleObj.components.pm2_5),
    //       pm10: getIndex('pm10', singleObj.components.pm10),
    //       time: new Date(singleObj.dt * 1000).toISOString(),
    //     }))
    //     await o('file_stations').createWithAutoFields()({
    //       city: city.name,
    //       kind: DATA_SOURCE_TYPE.OPEN_WEATHER,
    //       parameters,
    //       createdAt: new Date().toISOString(),
    //       updatedAt: new Date().toISOString(),
    //     });
    //   }
    //   return;
    // }));
    // return "done";
  })(input.arguments);