#!/bin/bash
SALAMATI_DIR=temp-salamati
GEONODE_VIRTUALENV_PATH=/var/lib/geonode-new
GEONODE_STATIC_PATH=$GEONODE_VIRTUALENV_PATH/geonode/geonode/static
pushd .
cd $GEONODE_VIRTUALENV_PATH

wget -O last-successful-salamati.war http://jenkins.rogue.lmnsolutions.com/job/salamati/lastSuccessfulBuild/artifact/build/salamati.war
mkdir $SALAMATI_DIR
unzip last-successful-salamati.war -d $SALAMATI_DIR

rm -r $GEONODE_STATIC_PATH/sdk/
mv $SALAMATI_DIR/lib $GEONODE_STATIC_PATH/sdk/
rm -r $GEONODE_STATIC_PATH/sdk/
mv $SALAMATI_DIR/theme $GEONODE_STATIC_PATH/sdk/
rm -r $GEONODE_STATIC_PATH/geoexplorer/externals/gxp/src
mv $SALAMATI_DIR/src/gxp/theme $GEONODE_STATIC_PATH/geoexplorer/externals/gxp/src

pushd .
cd $GEONODE_VIRTUALENV_PATH
source bin/activate
cd $GEONODE_VIRTUALENV_PATH/geonode
echo "yes"|python manage.py collectstatic
chmod 755 -R $GEONODE_STATIC_PATH/../static_root
popd

rm -r $SALAMATI_DIR
popd
exit