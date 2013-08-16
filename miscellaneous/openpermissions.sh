#!/bin/bash

DIR_TO_OPEN=/var/lib/Nominatim

find $DIR_TO_OPEN -perm 700 -print0 | xargs -0 chmod 755
find $DIR_TO_OPEN -perm 600 -print0 | xargs -0 chmod 644
#find $DIR_TO_OPEN -perm 400 -print0 | xargs -0 chmod 444
