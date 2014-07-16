#!/bin/bash

# Path to the offline OSM repository that will receive the updates.
REPO_PATH=/path/to/repo

# The remote to sync changes to. Note, this is not the URL, it's the remote name (e.g. origin)
SYNC_WITH_REMOTE=origin

# Auto-Sync Delay (in seconds)
AUTO_SYNC_DELAY=60

# Sync Attempts
SYNC_ATTEMPTS=10

# Output log file
LOG_FILE=output.txt

# Error file
ERROR_FILE=error.txt

# Email adress to recieve error reports
EMAIL_ADDRESS=example@email.com

# Subject for the error report email
EMAIL_SUBJECT="Error Occurred $(date)"

# Error message to be logged to the error file
ERROR_MESSAGE="Error Occurred $(date)"

# This will track whether or not an error occurred
ERROR_OCCURED=0

# Switch to the repository directory
cd $REPO_PATH

if [ -f $ERROR_FILE ];
then
exit 255
fi

# Send output to a file
exec 1>$LOG_FILE

# Update OSM Data
printf "\n===========================";
printf "\nUpdating OSM Data...";
printf "\n===========================\n";
geogit checkout master
geogit osm download --update
# Checkout master again in case download leaves it on OSM_FETCH
geogit checkout master

# Synchronize the repository
printf "\n===========================";
printf "\nSynchronizing repository...";
printf "\n===========================\n";
for i in `seq 1 $SYNC_ATTEMPTS`
do
	echo "Attempt $i of $SYNC_ATTEMPTS."
        ERROR_OCCURED=0
	geogit pull $SYNC_WITH_REMOTE
        EXIT_CODE=$?
        if [ $EXIT_CODE -gt 0 ]; then
         ERROR_OCCURED=255
        fi
        OUTPUT=$(geogit push $SYNC_WITH_REMOTE)
        EXIT_CODE=$?
        echo $OUTPUT
        if [ $EXIT_CODE -gt 0 ]; then 
        if [  "$OUTPUT" != "Nothing to push." ]; then
        ERROR_OCCURED=255
        fi
        fi
	if [ $ERROR_OCCURED -eq 0 ]; then
         break
	fi
	sleep $AUTO_SYNC_DELAY
done

if [ $ERROR_OCCURED -eq 255 ]; then
        cat $LOG_FILE | mail -s "$EMAIL_SUBJECT" $EMAIL_ADDRESS
        echo $ERROR_MESSAGE >> $ERROR_FILE
fi
