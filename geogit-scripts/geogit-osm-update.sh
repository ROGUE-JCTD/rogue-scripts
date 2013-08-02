#!/bin/bash

# Path to the offline OSM repository that will receive the updates.
REPO_PATH=/home/rogue/osmrepo

# Path to the mapping file.  If the file is in the repository directory, just use the name of the file.
MAPPING_FILE=osmmapping.txt

# The remote to sync changes to. Note, this is not the URL, it's the remote name (e.g. origin)
SYNC_WITH_REMOTE=syncrepo

# Switch to the repository directory
cd $REPO_PATH

# Update OSM Data
printf "\n===========================";
printf "\nUpdating OSM Data...";
printf "\n===========================\n";
geogit osm download --update

# Update mappings
printf "\n===========================";
printf "\nUpdating mappings...";
printf "\n===========================\n";
geogit osm map $MAPPING_FILE
geogit add
geogit commit -m "Updated Mappings"

# Synchronize the repository
printf "\n===========================";
printf "\nSynchronizing repository...";
printf "\n===========================\n";
geogit pull $SYNC_WITH_REMOTE
geogit push $SYNC_WITH_REMOTE
