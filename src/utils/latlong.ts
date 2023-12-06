import { getEnv } from "./getEnv.js";

export const getLatLong = async (cityName: string) => {
    const askForLatLong = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${getEnv("OPENWEATHER_API_KEY")}`,
        { headers: { "Content-Type": "application/json" } }
    );
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
        response[0].lon
    ) return {
        lat: response[0].lat,
        long: response[0].lon
    }
}
