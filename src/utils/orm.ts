import { iGraphQL } from 'i-graphql';
import { ObjectId } from 'mongodb';
import { Models } from '../models';

export const orm = async () => {
  return iGraphQL<
    {
      stations: Models['StationModel'];
    },
    {
      _id: () => string;
      updatedAt: () => Date;
      createdAt: () => Date;
    }
  >({
    _id: () => new ObjectId().toHexString(),
    updatedAt: () => new Date(),
    createdAt: () => new Date(),
  });
};

export const MongOrb = await orm();
