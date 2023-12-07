
import { FieldResolveInput } from 'stucco-js';
import { DATA_SOURCE_TYPE, resolverFor } from '../zeus/index.js';
import { orm } from '../utils/orm.js';


export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'test', async (args) => {
    console.log("test")
    // const o = await orm();
    // const cities = await o("cities").collection.find({}).toArray();
    // await Promise.all(cities.map(async (city) => {
    //   const duplicatedFiles = await o("file_stations").collection.find({ city: city.name, kind: DATA_SOURCE_TYPE.OPEN_WEATHER }).toArray();
    //   console.log(duplicatedFiles.length)
    //   if (duplicatedFiles.length > 1) {
    //     await o("file_stations").collection.deleteOne({ _id: duplicatedFiles[0]._id });
    //   }
    // }))
    return "xuz";
  })(input.arguments);