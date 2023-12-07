
import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { fetcher } from '../utils/featcher.js';
import { getEnv } from '../utils/getEnv.js';

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
    const req = await fetcher<WeatherData>(`https://api.openweathermap.org/data/2.5/weather?lat=${args.lat}&lon=${args.long}&appid=${getEnv("OPENWEATHER_API_KEY")}`)
    if (!req) {
      throw new Error("cannot fetch weather");
    }
    return {
      description: req.weather[0] && req.weather[0].description,
      main: req.weather[0] && req.weather[0].main,
      feelTemp: req.main.feels_like,
      temp: req.main.temp,
      clouds: req.clouds.all,
      humidity: req.main.humidity
    }
  })(input.arguments);
