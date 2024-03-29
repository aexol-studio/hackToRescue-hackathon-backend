import { FieldResolveInput } from 'stucco-js';
import { DATA_SOURCE_TYPE, resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'getIndexForCity', async ({ city, day }) => {
    const o = await orm();
    let file = await o('file_stations').collection.findOne({ kind: DATA_SOURCE_TYPE.MANUAL, city });
    if (!file) {
      file = await o('file_stations').collection.findOne({ kind: DATA_SOURCE_TYPE.OPEN_WEATHER, city });
      if (!file) {
        file = await o('file_stations').collection.findOne({ kind: DATA_SOURCE_TYPE.AUTOMATIC, city });
        if (!file) {
          throw new Error('cannot currently get any data');
        }
      }
    }
    const sortedParameters = file.parameters.sort((o1, o2) =>
      new Date(o1.time) > new Date(o2.time) ? -1 : new Date(o1.time) < new Date(o2.time) ? 1 : 0,
    );
    if (!sortedParameters || sortedParameters.length < 1) {
      return [-1];
    }
    const fd = sortedParameters[0].time;
    let slicedDays = sortedParameters.filter(
      (pd) =>
        new Date(pd.time) > new Date(new Date(fd).getTime() - day * 60 * 60 * 60 * 1000) &&
        new Date(fd) > new Date(pd.time),
    );
    const calculatePm10 =
      slicedDays.reduce((pv, c) => {
        if (c?.pm10) {
          pv += c.pm10 * 1;
        }
        return pv;
      }, 0.0) / slicedDays.length;
    const calculatePm2p5 =
      slicedDays.reduce((pv, c) => {
        if (c?.pm25) {
          pv += c.pm25 * 1;
        }
        return pv;
      }, 0.0) / slicedDays.length;
    const IndexForPm10 = (calculatePm10 * (1 / (15 - day))) / 200;
    const IndexForPm2p5 = (calculatePm2p5 * (1 / (15 - day))) / 75;
    return Math.max(IndexForPm10, IndexForPm2p5) * 100;
  })(input.arguments);
