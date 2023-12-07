import { count } from "console";
import { getEnv } from "./getEnv.js";

export const getLatLong = async (cityName: string) => {
    const askForLatLong = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${getEnv("OPENWEATHER_API_KEY")}`,
        { headers: { "Content-Type": "application/json" } }
    );
    console.log(await askForLatLong.json());
    const response = (await askForLatLong.json()) as {
        name: string | null;
        local_names: {
            lv: string | null;
            pl: string | null;
        };
        lat: number | null;
        lon: number | null;
        country: string | null;
        state: string | null;
    }[];

    if (
        response &&
        response.length > 0 &&
        response[0].lat &&
        response[0].lon && response[0].country && response[0].state
    ) return {
        lat: response[0].lat,
        long: response[0].lon,
        country: response[0].country,
        state: response[0].state,
    }
}

// [
// 	{
// 		"name": "Białystok",
// 		"local_names": {
// 			"lv": "Bjalistoka",
// 			"pl": "Białystok"
// 		},
// 		"lat": 53.127505049999996,
// 		"lon": 23.147050870161664,
// 		"country": "PL",
// 		"state": "Podlaskie Voivodeship"
// 	}
// ]