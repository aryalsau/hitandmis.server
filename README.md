#HiT&MIS Server

Server to manage hit&mis scheduling

Edit daemon.sh and `chmod +x daemon.sh` append the following in `etc/inittab` (with the correct location) to have the server respawn if interrupted

	h1:2345:respawn:/home/'user'/hitandmis.server/daemon.sh

## server deployment
Use `sync.sh` to deploy, (eg `./sync.sh --client=192.168.1.2 --user=ikon --camera==pixis --time`). Make sure all changes are committed before syncing.

The parameters are for `sync.sh`

* `-ip` or `--server` : ip of the server (eg `192.168.1.2`)
* `-u` or `--user` : User on the server (eg `ikon`)
* `-f` or `--force` : flag to force an upload with uncommitted changes
* `-t` or `--time` : sync time only (server time to the dev computer time)
* `-c` or `--code` : sync code only
