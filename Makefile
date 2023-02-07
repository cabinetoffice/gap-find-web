GAP_ENV:=d_gap

dev: build.check.dev build.app build.deploy.dev
qat: build.check.qat build.app build.deploy.qat

login: 
	cf login -a api.london.cloud.service.gov.uk --sso

build.check.dev:
	@[ -z "$$(git status --porcelain)" ] || (git status && printf "\nerror: please commit or stash them....\n\n" && false)
	@git checkout develop
	
build.app:
	@yarn build || ( yarn install && yarn build )

build.deploy.dev:
	@cf push ${GAP_ENV} || ( cf login -a api.london.cloud.service.gov.uk --sso && cf push ${GAP_ENV} )
	@open https://${GAP_ENV}.london.cloudapps.digital

include makefiles/*.mk
