# Date - 2013-09-05_at_11-41-22
ROGUE_DATE=`date +%Y-%m-%d_at_%H-%M-%S`
# Where to store the backups
BACKUP_DIR=/path/to/backup/directory
# Directory to back up
BACKUP_TARGET=/directory/to/backup
# Backup prefix - Backups are stored as prefix-date ex. backup-2013-09-05_at_11-41-22
BACKUP_PREFIX=backup

BACKUP_FOLDER=$BACKUP_DIR/$BACKUP_PREFIX-$ROGUE_DATE
mkdir -p $BACKUP_FOLDER
cp -r $BACKUP_TARGET/ $BACKUP_FOLDER
