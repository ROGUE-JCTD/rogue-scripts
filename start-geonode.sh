#!/bin/bash

cd /var/lib/geonode
source bin/activate


cd geonode
uwsgi --ini django.ini
#source bin/activate

#cd geonode
#paver start