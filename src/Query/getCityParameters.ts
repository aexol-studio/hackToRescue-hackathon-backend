import { FieldResolveInput } from 'stucco-js';
import { ModelTypes, resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';

function filterByInterval(array: ModelTypes["Parameters"][], intervalInHours: number): ModelTypes["Parameters"][] {
  const filteredArray = [];

  if (array.length > 0) {
    let lastTime = new Date(array[0].time);
    filteredArray.push(array[0]);

    for (let i = 1; i < array.length; i++) {
      const currentTime = new Date(array[i].time);
      const timeDifference = currentTime.getTime() - lastTime.getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60);

      if (hoursDifference >= intervalInHours) {
        filteredArray.push(array[i]);
        lastTime = currentTime;
      }
    }
  }

  return filteredArray;
}

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'getCityParameters', async ({ city, startDate, endDate, stationId, interval }) => {
    const o = await orm();
    let t = await o('file_stations').collection.find({
      city,
      ...(stationId && { stationId }),
    }).toArray();
    if (!!startDate) {
      t = t.map((file) => ({ ...file, parameters: file.parameters.filter((parameter) => new Date(parameter.time) < new Date() && new Date(parameter.time) > new Date(startDate)) }))
    }
    if (!!endDate) {
      t = t.map((file) => ({ ...file, parameters: file.parameters.filter((parameter) => new Date(parameter.time) < new Date(endDate)) }))
    }
    const intervalInHours = interval || 1;
    t = t.map((file) => ({
      ...file,
      parameters: filterByInterval(file.parameters, intervalInHours),
    }));
    return t;

  })(input.arguments);
