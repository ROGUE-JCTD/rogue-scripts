#!/bin/bash

cd /var/lib/geonode
source bin/activate


cd geonode
uwsgi --ini django.ini
#source bin/activate

#cd geonode
#paver start
rogue@jarvis:/var/lib/geonode$ sudo cat stop-geonode.sh 
#!/bin/bash

cd /var/lib/geonode/
source bin/activate

cd geonode
paver stop
rogue@jarvis:/var/lib/geonode$ sudo cat restart-geonode.sh 
#!/bin/bash

cd /var/lib/geonode/
source bin/activate

cd geonode

paver stop
paver start