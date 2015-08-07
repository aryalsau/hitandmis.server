#!/bin/bash
cd $HOME/hitandmis.server/
#nodemon app.js
forever -a -l server.log -o server.log -e server.log start --uid "hitandmis.server" app.js
