#!/bin/bash
# profiles
_rprofiles=("testprofile1")
# sync it
for r in "${_rprofiles[@]}"
do
#        uncomment this if you are using keychain
#        source $HOME/.keychain/$HOSTNAME-sh

#       if you are using a pem file for ssh then add this after unison
#        -sshargs "-i /path/to/file.pem"
        unison ${r}
done
