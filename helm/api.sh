#!/bin/sh
helm ls
helm -n "${NAMESPACE}" upgrade \
	--install \
	-f "${VALUES:-./tuki_backend_dev_values.yaml}" \
	--set "image.tag=$TAG" \
	--set "mongo.url=${MONGO_URL}" \
	"${RELEASE}" ./tuki-backend-api
