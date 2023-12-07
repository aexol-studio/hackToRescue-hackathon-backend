/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	Query:{
		getCityParameters:{

		}
	},
	DATA_SOURCE_TYPE: "enum" as const
}

export const ReturnTypes: Record<string,any> = {
	Query:{
		getCityParameters:"Station",
		getCollectedCities:"City",
		test:"String"
	},
	Mutation:{
		refreshStations:"String"
	},
	City:{
		country:"String",
		name:"String",
		state:"String",
		location:"PureLocation",
		stationsInCity:"Station",
		createdAt:"String"
	},
	Station:{
		city:"String",
		stationId:"Int",
		kind:"DATA_SOURCE_TYPE",
		createdAt:"String",
		updatedAt:"String",
		parameters:"Parameters"
	},
	PureLocation:{
		lat:"Float",
		long:"Float"
	},
	Parameters:{
		pm1:"Float",
		pm2p5:"Float",
		pm10:"Float",
		pm10Time:"String",
		pm25:"Float",
		pm25Time:"String",
		no2:"Float",
		no2Time:"String",
		so2:"Float",
		so2Time:"String",
		o3:"Float",
		o3Time:"String",
		time:"String"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}