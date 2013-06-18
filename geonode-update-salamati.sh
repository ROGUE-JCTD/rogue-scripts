#!/bin/bash
# exit if anything returns failure
set -e

# pull in paths
source /var/lib/rogue-scripts/rogue-variables.sh

# call the function defined in rogue-variable.sh to prompt the user
# to varify paths before continuing
prompt_to_verify_paths

# if these variables are empty or have been set to empty, abort the script
is_defined $GEONODE_VIRTUALENV_PATH
is_defined $GEONODE_ROGUE_REPO_PATH


GEONODE_STATIC_PATH=$GEONODE_ROGUE_REPO_PATH/rogue_geonode/static
GEONODE_TEMPLATE_PATH=$GEONODE_ROGUE_REPO_PATH/rogue_geonode/templates
SALAMATI_TEMP_DIR=temp-salamati

pushd .
cd $GEONODE_VIRTUALENV_PATH

wget -O last-successful-salamati.war http://jenkins.rogue.lmnsolutions.com/job/salamati/lastSuccessfulBuild/artifact/build/salamati.war
mkdir $SALAMATI_TEMP_DIR
unzip last-successful-salamati.war -d $SALAMATI_TEMP_DIR

rm -r $GEONODE_STATIC_PATH/sdk/lib
mv -v $SALAMATI_TEMP_DIR/lib $GEONODE_STATIC_PATH/sdk/
rm -r $GEONODE_STATIC_PATH/sdk/theme
mv -v $SALAMATI_TEMP_DIR/theme $GEONODE_STATIC_PATH/sdk/
rm -r $GEONODE_STATIC_PATH/geoexplorer/externals/gxp/src
mv -v $SALAMATI_TEMP_DIR/src/gxp/theme $GEONODE_STATIC_PATH/geoexplorer/externals/gxp/src
rm -r $GEONODE_STATIC_PATH/geoexplorer/externals/lightbox
mv -v $SALAMATI_TEMP_DIR/src/lightbox $GEONODE_STATIC_PATH/geoexplorer/externals
rm -r $GEONODE_TEMPLATE_PATH/geonode/sdk_header.html
mv -v $SALAMATI_TEMP_DIR/sdk_header.html $GEONODE_TEMPLATE_PATH/geonode/sdk_header.html

source $GEONODE_VIRTUALENV_PATH/bin/activate

cd $GEONODE_ROGUE_REPO_PATH
echo "yes"|python manage.py collectstatic
chmod 755 -R $GEONODE_STATIC_PATH/../static_root

rm -r $SALAMATI_TEMP_DIR
popd
