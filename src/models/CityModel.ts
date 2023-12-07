import { ModelTypes } from '../zeus/index.js';

export type CityModel = Omit<ModelTypes['City'], "stationsInCity">;

