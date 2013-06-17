#!/bin/bash
# exit if anything returns failure
set -e

# pull in paths
source /var/lib/rogue-scripts/rogue-variables.sh

pushd .
source $GEONODE_VIRTUALENV_PATH/bin/activate
cd $GEONODE_ROGUE_REO_PATH
paver start
popd
