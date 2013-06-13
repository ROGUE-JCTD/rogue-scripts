#!/bin/bash
GEONODE_VIRTUALENV_PATH=/var/lib/geonode
GEONODE_STATIC_PATH=$GEONODE_VIRTUALENV_PATH/rogue_geonode/rogue_geonode/static
GEONODE_TEMPLATE_PATH=$GEONODE_VIRTUALENV_PATH/rogue_geonode/rogue_geonode/templates

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

pushd .
cd $GEONODE_VIRTUALENV_PATH
source bin/activate
cd $GEONODE_VIRTUALENV_PATH/geonode
echo "yes"|python manage.py collectstatic
chmod 755 -R $GEONODE_STATIC_PATH/../static_root
popd

rm -r $SALAMATI_TEMP_DIR
popd
