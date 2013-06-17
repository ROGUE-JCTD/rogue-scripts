#!/bin/bash

# define rogue variables here.
GEONODE_VIRTUALENV_PATH=/var/lib/geonode
GEONODE_ROGUE_REPO_PATH=$GEONODE_VIRTUALENV_PATH/rogue_geonode
GEONODE_REPO_PATH=$GEONODE_VIRTUALENV_PATH/geonode

# variabled used to signal exit
ROGUE_ABORT=false;

# This will cause the shell to exit immediately if a simple
# command exits with a nonzero exit value.
#set -e

echo ""
echo "=================================================="
echo "GEONODE_VIRTUALENV_PATH = $GEONODE_VIRTUALENV_PATH"
echo "GEONODE_ROGUE_REPO_PATH = $GEONODE_ROGUE_REPO_PATH"
echo "GEONODE_REPO_PATH = $GEONODE_REPO_PATH"
echo "=================================================="
echo ""


function verify_variables() {
    while true; do
        read -p "Are the above paths correct? " yn
        case $yn in
            [Yy]* ) break;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no. ";;
        esac
    done
}

echo "-- rogue-variables.sh loaded"
