stp: 
	cf stop ${GAP_ENV}

del: 
	cf delete ${GAP_ENV}

__APP:=d_gap
__APP_DOMAIN:=london.cloudapps.digital

kil:
	cf apps && echo "" && cf routes && echo "" && cf services
	cf d "${__APP}" -f 
	cf delete-route "${__APP_DOMAIN}" --hostname "${__APP}" -f
	cf apps && echo "" && cf routes && echo "" && cf services   
