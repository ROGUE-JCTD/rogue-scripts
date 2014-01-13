#!/bin/bash
# profiles
_rprofiles=("testprofile1")
# sync it
for r in "${_rprofiles[@]}"
do
        source $HOME/.keychain/$HOSTNAME-sh
   
        unison -sshargs "-i /home/rogue/rogue.pem" ${r}
done
