import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { fetcher } from '../utils/featcher.js';
import { getEnv } from '../utils/getEnv.js';
import { orm } from '../utils/orm.js';

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Main {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level: number;
  grnd_level: number;
}

interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

interface Clouds {
  all: number;
}

interface Sys {
  type: number;
  id: number;
  country: string;
  sunrise: number;
  sunset: number;
}

interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Weather[];
  main: Main;
  wind: Wind;
  clouds: Clouds;
  dt: number;
}

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Query', 'getRealTimeWeather', async (args) => {
    const o = await orm();
    const weatcherCache = await o('weather_caches').collection.findOne({
      city: args.city,
      createdAt: { $gte: new Date(new Date().getTime() - 1 * 60 * 60 * 60 * 1000) },
    });
    if (weatcherCache) {
      console.log("finded cached")
      return {
        description: weatcherCache.statistics.description && weatcherCache.statistics.description,
        main: weatcherCache.statistics.main && weatcherCache.statistics.main,
        feelTemp: weatcherCache.statistics.feelTemp && weatcherCache.statistics.feelTemp,
        temp: weatcherCache.statistics.temp && weatcherCache.statistics.temp,
        clouds: weatcherCache.statistics.clouds && weatcherCache.statistics.clouds,
        humidity: weatcherCache.statistics.humidity && weatcherCache.statistics.humidity,
        pressure: weatcherCache.statistics.pressure && weatcherCache.statistics.pressure,
        gustSpeed: weatcherCache.statistics.gustSpeed && weatcherCache.statistics.gustSpeed,
        windSpeed: weatcherCache.statistics.windSpeed && weatcherCache.statistics.windSpeed,
        windDeg: weatcherCache.statistics.windDeg && weatcherCache.statistics.windDeg,
      };
    }
    const req = await fetcher<WeatherData>(
      `https://api.openweathermap.org/data/2.5/weather?lat=${args.lat}&lon=${args.long}&appid=${getEnv(
        'OPENWEATHER_API_KEY',
      )}`,
    );
    if (!req) {
      throw new Error('cannot fetch weather');
    }
    await o("weather_caches").collection.insertOne({
      city: args.city,
      createdAt: new Date(),
      statistics: {
        description: req.weather[0] && req.weather[0].description,
        main: req.weather[0] && req.weather[0].main,
        feelTemp: req.main.feels_like,
        temp: req.main.temp && req.main.temp,
        clouds: req.clouds.all && req.clouds.all,
        humidity: req.main.humidity && req.main.humidity,
        pressure: req.main.pressure && req.main.pressure,
        gustSpeed: req.wind.gust && req.wind.gust,
        windSpeed: req.wind.speed && req.wind.speed,
        windDeg: req.wind.deg && req.wind.deg,
      }
    })
    return {
      description: req.weather[0] && req.weather[0].description,
      main: req.weather[0] && req.weather[0].main,
      feelTemp: req.main.feels_like,
      temp: req.main.temp && req.main.temp,
      clouds: req.clouds.all && req.clouds.all,
      humidity: req.main.humidity && req.main.humidity,
      pressure: req.main.pressure && req.main.pressure,
      gustSpeed: req.wind.gust && req.wind.gust,
      windSpeed: req.wind.speed && req.wind.speed,
      windDeg: req.wind.deg && req.wind.deg,
    };
  })(input.arguments);
