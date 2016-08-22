#!/bin/bash

# to push code only from macbook to vmware
#sh sync.sh --server=192.168.205.140 --user=root --location=/opt --code --force

for i in "$@"
do
	case $i in

		-ip=*|--server=*) # the ip of the clent
			ip="${i#*=}"
			shift # pass argument=value
		;;

		-u=*|--user=*) # the user on the client to run camdaemon
			user="${i#*=}"
			shift # pass argument=value
		;;

		-l=*|--location=*) # the location on the client to run camdaemon
			location="${i#*=}"
			shift # pass argument=value
		;;

		-a|--all) # send everything
			all=true
			shift # pass argument=value
		;;

		-c|--code) # send code
			code=true
			shift # pass argument=value
		;;

		-f|--force) # force push even if uncomitted changes available
			force=true
			shift # pass argument=value
		;;

		-d|--data) # sync data
			data=true
			shift # pass argument=value
		;;

		-t|--time) # force push even if uncomitted changes available
			time=true
			shift # pass argument=value
		;;

		-h|--help) # show help
			help=true
			shift # pass argument=value
		;;

		--default)
			DEFAULT=YES
			shift # pass argument with no value
		;;

		*)
			# unknown option
			echo 'Unknown option'
		;;

	esac
done


if [ "$data" = true ]; then
	if [ -z "$ip" ] || [ -z "$user" ] || [ -z "$location" ]; then
		echo 'Requires ip, user and location'
		exit
	else
		echo rsyncing data from "$user"@"$ip":"$location"/hitandmis.server to the current directory
		rsync -a -v "$user"@"$ip":"$location"/camdaemon/data .
		exit
	fi
fi


if [ "$all" = true ]; then
	uncomitted=$(git status -s)
	if [[ -z "$uncomitted" ]] || [ "$force" = true ]; then
		echo pushing revision "$(git rev-parse HEAD)" all to computer
		if [ -z "$ip" ] || [ -z "$user" ] || [ -z "$location" ]; then
			echo 'Requires ip, user and location'
			exit
		else
			echo rsyncing all files to "$user"@"$ip":"$location"/hitandmis.server
			rsync -a -v * "$user"@"$ip":"$location"/hitandmis.server
			echo rsync complete
			exit
		fi
	else
		echo 'uncomitted changes available'
		echo "${uncomitted}"
		echo 'commit changes before pushing to the server'
		exit
	fi
fi


if [ "$code" = true ]; then
	uncomitted=$(git status -s)
	if [ -z "$uncomitted" ] || [ "$force" = true ]; then
		echo pushing revision "$(git rev-parse HEAD)" code to computer
		if [ -z "$ip" ] || [ -z "$user" ] || [ -z "$location" ]; then
			echo 'Requires ip, user and location'
			exit
		else
			echo rsyncing just code to "$user"@"$ip":"$location"/hitandmis.server
			rsync --exclude='.git' --exclude='.gitignore' --exclude='LICENSE' --exclude='README.md' --exclude='sync.sh' -a -v * "$user"@"$ip":"$location"/hitandmis.server
			echo rsync complete
			echo generating server.sh
			serversh='#!/bin/bash\ncd '"$location"'/hitandmis.server; npm start'
			echo "$serversh" | ssh "$user"@"$ip" "cat > "$location"/hitandmis.server/server.sh"
			echo make server.sh executable
			ssh "$user"@"$ip" "chmod +x "$location"/hitandmis.server/server.sh"
		fi
	else
		echo 'uncomitted changes available'
		echo "${uncomitted}"
		echo 'commit changes before pushing to the server'
		exit
	fi
fi


if [ "$time" = true ]; then
	if [ -z "$ip" ] || [ -z "$user" ]; then
		echo 'Requires both ip and user'
	else
		echo setting server time to client time
		# Sun Mar  6 01:34:35 CET 2016
		clienttime="$(date +'"%d %b %Y %T"')"
		ssh "$user"@"$ip" "sudo date --set=$clienttime"
	fi
fi


if [ "$help" = true ]; then
	echo '-h or --help (This help screen)'
	echo '-ip=x.x.x.x or --server=x.x.x.x (Destination computer ip)'
	echo '-u=someuser or --user=someuser (User name on the destination computer)'
	echo '-l=/somelocation or --location=/somelocation (Absoulte directory on the destination computer)'
	echo '-a or --all (Sync all files)'
	echo '-c or --code (Sync only code)'
	echo '-m or --make=xxx (Build on the destination computer for xxx device)'
	echo '-f or --force (Force a sync even if uncomitted changes are available)'
	echo '-d or --data (Sync data folder)'
fi
