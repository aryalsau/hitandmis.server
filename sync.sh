#!/bin/bash
uncomitted=$(git status -s)
# some arguments don't have a corresponding value to go with it such as in the --default example.
# ./sync.sh --server=192.168.1.2 --user=ikon --code --force --time
for i in "$@"
do
case $i in

	-ip=*|--server=*) # the ip of the hit&mis computer
		ip="${i#*=}"
		shift # past argument=value
	;;

	-u=*|--user=*) # the user on the client to run camdaemon
		user="${i#*=}"
		shift # past argument=value
	;;

	-c|--code) # send code
		code=true
		shift # past argument=value
	;;

	-f|--force) # force push even if uncomitted changes available
		force=true
		shift # past argument=value
	;;

	-d|--data) # sync data
		data=true
		shift # past argument=value
	;;

	-t|--time) # force push even if uncomitted changes available
		time=true
		shift # past argument=value
	;;

	--default)
		DEFAULT=YES
		shift # past argument with no value
	;;

	*)
		# unknown option
	;;

esac
done

if [ "$data" = true ]; then

	if [ -z "$ip" ] || [ -z "$user" ]; then
		echo 'Requires both ip and user'
	else
		echo TODO rsync data
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

if [ "$code" = true ]; then

	if [[ -z "$uncomitted" ]] || [ "$force" = true ]; then

		echo pushing git revision "$(git rev-parse HEAD)" to server

		if [ -z "$ip" ] || [ -z "$user" ]; then
			echo 'Requires both ip and user'
		else
			echo rsyncing files to "$user"@"$ip"
			rsync --exclude='data/*' --exclude='LICENSE' --exclude='README.md' --exclude='README.md' --exclude='sync.sh' --exclude='server.sh' -a -v * "$user"@"$ip":/home/"$user"/hitandmis.server
			echo rsyncing complete

			echo building hitandmis.server on "$user"@"$ip"
			ssh "$user"@"$ip" "cd /home/'"$user"'/hitandmis.server; npm install"


			serversh='#!/bin/bash
/bin/su - '"$user"' -c "cd /home/'"$user"'/hitandmis.server; npm start"'

			echo "$serversh" | ssh "$user"@"$ip" "cat > /home/"$user"/hitandmis.server/server.sh"

			ssh "$user"@"$ip" "chmod +x /home/"$user"/hitandmis.server/server.sh"

		fi

		exit

	else

		echo 'uncomitted changes available'
		echo "${uncomitted}"
		echo 'commit changes before pushing to the server'
		exit

	fi


fi
