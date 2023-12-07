#!/bin/sh
helm ls
helm -n "${NAMESPACE}" upgrade \
	--install \
	-f "${VALUES:-./tuki_backend_dev_values.yaml}" \
	--set "image.tag=$TAG" \
	--set "mongo.url=${MONGO_URL}" \
	--set "apiurl=${API_URL}" \
	--set "openweather.apiKey=${OPENWEATHER_API_KEY}" \
	"${RELEASE}" ./tuki-backend-api
