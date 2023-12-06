export type AirQuality = {
    id: number;
    no2CalcDate: string | null;
    no2IndexLevel: { id: number; indexLevelName: string } | null;
    no2SourceDataDate: string | null;

    o3CalcDate: string | null;
    o3IndexLevel: { id: number; indexLevelName: string } | null;
    o3SourceDataDate: string | null;

    pm10CalcDate: string | null;
    pm10IndexLevel: { id: number; indexLevelName: string } | null;
    pm10SourceDataDate: string | null;

    pm25CalcDate: string | null;
    pm25IndexLevel: { id: number; indexLevelName: string } | null;
    pm25SourceDataDate: string | null;

    so2CalcDate: string | null;
    so2IndexLevel: { id: number; indexLevelName: string } | null;
    so2SourceDataDate: string | null;

    stCalcDate: string | null;
    stIndexLevel: { id: number; indexLevelName: string } | null;
    stSourceDataDate: string | null;

    lastCacheUpdate: number;
};