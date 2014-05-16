#!/bin/bash

if [ $# -eq 0 ]
  then
    echo "Please specify path to the root folder whose media should be skipped."
    echo "Usage: android-skip-media.sh <path>"
    echo "Note: to  remove .nomedia files recursively you can use"
    echo "   find <path> -name '.nomedia' -type f -delete"
else
  # run this inside the Arbiter folder
  touch .nomedia
  find $1 -type d  -exec cp -f .nomedia {} \;
  rm .nomedia
fi
