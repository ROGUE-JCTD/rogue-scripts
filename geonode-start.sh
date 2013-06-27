#!/bin/bash
# exit if anything returns failure
set -e

# pull in paths
source /var/lib/rogue-scripts/rogue-variables.sh

is_defined $GEONODE_VIRTUALENV_PATH
is_defined $GEONODE_ROGUE_REPO_PATH

source $GEONODE_VIRTUALENV_PATH/bin/activate
cd $GEONODE_ROGUE_REPO_PATH
uwsgi --ini django.ini
