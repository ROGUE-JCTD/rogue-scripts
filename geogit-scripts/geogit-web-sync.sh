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
EXECUTE_PATH=/home/rogue/aws-sync

LOCKFILE=$EXECUTE_PATH/lock.pid

# check for existing lockfile
if [ -e "$LOCKFILE" ]; then
# lockfile exists
   if [ ! -r "$LOCKFILE" ]; then
      echo error: lockfile is not readable
      exit 1
   fi
   PID=`cat "$LOCKFILE"`
   kill -0 "$PID" 2>/dev/null
   if [ $? == 0 ]; then
      echo error: existing instance of this task is already running
      exit 1
   fi
# process that created lockfile is no longer running - delete lockfile
   rm -f "$LOCKFILE"
   if [ $? != 0 ]; then
# error: failed to delete lockfile
      exit 1
   fi
fi

# create lockfile
echo $$ >"$LOCKFILE"
if [ $? != 0 ]; then
# error: failed to create lockfile
   exit 1
fi

PYTHON=/var/lib/geonode/bin/python
MANAGE_PY=/var/lib/geonode/rogue_geonode/manage.py
REPO_URL=http://dev.rogue.lmnsolutions.com/geoserver/geogit/geonode:copeco_capas_repo
REMOTE_NAME=aws
USERNAME=admin
PASSWORD=admin
AUTHORNAME="Script_Sync"
AUTHOREMAIL="scriptsync@lmnsolutions.com"

# Auto-Sync Delay (in seconds)
AUTO_SYNC_DELAY=60

# Sync Attempts
SYNC_ATTEMPTS=5

# Output log file
LOG_FILE=output.txt

# Error file
ERROR_FILE=error.txt

# Email address to recieve error reports
EMAIL_ADDRESS=rogue@lmnsolutions.com

# Subject for the error report email
EMAIL_SUBJECT="GeoGit Sync Error Occurred $(date)"

# Error message to be logged to the error file
ERROR_MESSAGE="Error Occurred $(date)"

# This will track whether or not an error occurred
ERROR_OCCURED=0

# Switch to the repository directory
cd $EXECUTE_PATH

if [ -f $ERROR_FILE ];
then
# delete lockfile
rm -f "$LOCKFILE"
if [ $? != 0 ]; then
# error: failed to delete lockfile
   exit 256
fi
exit 255
fi

# Send output to a file
exec > $LOG_FILE 2>&1

# Synchronize the repository with first remote
printf "\n===========================";
printf "\nSynchronizing repository with $REMOTE_NAME...";
printf "\n===========================\n";
printf "\nRepo: $REPO_URL";
printf "\nRemote: $REMOTE_NAME\n";
for i in `seq 1 $SYNC_ATTEMPTS`
do
        echo "Attempt $i of $SYNC_ATTEMPTS."
        $PYTHON $MANAGE_PY geogit-sync -u $REPO_URL -r $REMOTE_NAME --username $USERNAME --password $PASSWORD --authorname $AUTHORNAME --authoremail $AUTHOREMAIL
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 0 ]; then
	 ERROR_OCCURED=0
	 break
        fi
	ERROR_OCCURED=255
        sleep $AUTO_SYNC_DELAY
done

if [ $ERROR_OCCURED -eq 255 ]; then
        cat $LOG_FILE | mail -s "$EMAIL_SUBJECT" $EMAIL_ADDRESS
        echo $ERROR_MESSAGE >> $ERROR_FILE
fi

# delete lockfile
rm -f "$LOCKFILE"
if [ $? != 0 ]; then
# error: failed to delete lockfile
   exit 1
fi
