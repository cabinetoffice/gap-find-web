ssh:
	cf ssh ${GAP_ENV}

log:
	cf logs ${GAP_ENV}

eye:
	cf app ${GAP_ENV}