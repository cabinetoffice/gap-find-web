prod: build.app build.deploy.prod

build.deploy.prod:
	( cf push gap ) || ( cf login -a api.london.cloud.service.gov.uk --sso && cf push gap )
	open https://gap.london.cloudapps.digital