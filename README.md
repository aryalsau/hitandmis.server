#HiT&MIS Server

Server to manage hit&mis scheduling

Edit daemon.sh and `chmod +x daemon.sh` append the following in `etc/inittab` (with the correct location) to have the server respawn if interrupted

	h1:12345:respawn:/home/ikon/hitandmis.server/daemon.sh
