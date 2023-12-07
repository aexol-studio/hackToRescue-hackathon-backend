/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	Query:{
		getCityParameters:{

		}
	}
}

export const ReturnTypes: Record<string,any> = {
	Query:{
		getCityParameters:"Station",
		getCollectedCities:"String",
		test:"String"
	},
	Mutation:{
		refreshStations:"String"
	},
	Station:{
		city:"String",
		stationId:"Int",
		createdAt:"String",
		updatedAt:"String",
		parameters:"Parameters"
	},
	Parameters:{
		pm1:"Float",
		pm10:"Float",
		pm10Time:"String",
		pm25:"Float",
		pm25Time:"String",
		no2:"Float",
		no2Time:"String",
		so2:"Float",
		so2Time:"String",
		o3:"Float",
		o3Time:"String"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}