/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	Query:{
		getCityParameters:{

		}
	},
	Mutation:{
		addParameters:{

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
		addParameters:"Boolean"
	},
	Station:{
		_id:"String",
		city:"String",
		parameters:"Parameters"
	},
	Parameters:{
		pm1:"Float",
		pm10:"Float",
		pm25:"Float",
		time:"String"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}