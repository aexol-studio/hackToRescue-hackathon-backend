import { iGraphQL } from 'i-graphql';
import { ObjectId } from 'mongodb';
import { Models } from '../models';

export const orm = async () => {
  return iGraphQL<
    {
      file_stations: Models['StationModel'];
      cities: {
        name: string
        createdAt: Date,
        location: {
          lat: number,
          long: number
        }
        country: string,
      }
      locks: {
        lockTime: number;
        lockTitle: string;
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
