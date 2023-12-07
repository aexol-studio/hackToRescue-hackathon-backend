import { iGraphQL } from 'i-graphql';
import { ObjectId } from 'mongodb';
import { Models } from '../models';

export const orm = async () => {
  return iGraphQL<
    {
      file_stations: Models['StationModel'];
      cities: Models["CityModel"];
      locks: {
        lockTime: number;
        lockTitle: string;
      },
      weather_caches: {
        city: string,
        createdAt: Date,
        statistics: {
          main?: string,
          description?: string,
          temp?: number
          feelTemp?: number,
          clouds?: number,
          humidity?: number,
          pressure?: number,
          gustSpeed?: number,
          windSpeed?: number,
          windDeg?: number
        }
      }
    },
    {
      _id: () => string;
    }
  >({
    _id: () => new ObjectId().toHexString(),
  });
};

export const MongOrb = await orm();
