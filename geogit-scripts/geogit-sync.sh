#!/bin/bash

# This script is sync two repositories that are published through geoserver,
# it uses a third repository not published to sync the other two. For this script to work
# you need to fill out all of the variables listed below. Then to have it run
# automatically you need to just add it to the crontab. To do that just run
# "sudo crontab - e" then add this line to the bottom
# "*/5 * * * * /Path/To/Script &> /dev/null" the beginning tells it how often to run,
# in this case it's every five minutes, then you need to specify the path to the script,
# the final bit is to prevent cron from sending an email to the root user every time it runs.

# Add the path to the geogit binary so that root has access to the command
export GEOGIT_HOME=/var/lib/geogit/src/cli-app/target/geogit && PATH=$PATH:$GEOGIT_HOME/bin
# Path to the offline repository that will receive the updates.
REPO_PATH=/Path/To/Repo

# The remotes to sync changes to. Note, this is not the URL, it's the remote name (e.g. origin)
SYNC_WITH_REMOTE_ONE=remote1
SYNC_WITH_REMOTE_TWO=remote2

# Auto-Sync Delay (in seconds)
AUTO_SYNC_DELAY=60

# Sync Attempts
SYNC_ATTEMPTS=10

# Output log file
LOG_FILE=output.txt

# Error file
ERROR_FILE=error.txt

# Email address to recieve error reports
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

# Synchronize the repository with first remote
printf "\n===========================";
printf "\nSynchronizing repository with $SYNC_WITH_REMOTE_ONE...";
printf "\n===========================\n";
for i in `seq 1 $SYNC_ATTEMPTS`
do
        echo "Attempt $i of $SYNC_ATTEMPTS."
        geogit pull $SYNC_WITH_REMOTE_ONE
        EXIT_CODE=$?
        if [ $EXIT_CODE -gt 0 ]; then
         ERROR_OCCURED=255
        fi
        OUTPUT=$(geogit push $SYNC_WITH_REMOTE_ONE)
        EXIT_CODE=$?
        echo $OUTPUT
        if [ $EXIT_CODE -gt 0 ]; then 
        if [  "$OUTPUT" != "Nothing to push." ]; then
        ERROR_OCCURED=255
        fi
        fi
        sleep $AUTO_SYNC_DELAY
done

# Synchronize the repository with second remote
printf "\n===========================";
printf "\nSynchronizing repository with $SYNC_WITH_REMOTE_TWO...";
printf "\n===========================\n";
for i in `seq 1 $SYNC_ATTEMPTS`
do
        echo "Attempt $i of $SYNC_ATTEMPTS."
        geogit pull $SYNC_WITH_REMOTE_TWO
        EXIT_CODE=$?
        if [ $EXIT_CODE -gt 0 ]; then 
         ERROR_OCCURED=255
        fi
        OUTPUT=$(geogit push $SYNC_WITH_REMOTE_TWO)
        EXIT_CODE=$?
        echo $OUTPUT
        if [ $EXIT_CODE -gt 0 ]; then
        if [  "$OUTPUT" != "Nothing to push." ]; then
        ERROR_OCCURED=255
        fi
        fi
        sleep $AUTO_SYNC_DELAY
done

if [ $ERROR_OCCURED -eq 255 ]; then
        cat $LOG_FILE | mail -s "$EMAIL_SUBJECT" $EMAIL_ADDRESS
        echo $ERROR_MESSAGE >> $ERROR_FILE
fi
