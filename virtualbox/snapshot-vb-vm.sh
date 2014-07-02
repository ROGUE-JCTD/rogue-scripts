#!/bin/bash
# Example of crontab entry to run at midnight every weekday: 00 00 * * 1-5 ~/dev/rogue-scripts/virtualbox/snapshot-vb-vm.sh <vm name or id>
FORMATTED_DATE="$(date | awk '{gsub(/[ \t]/,"-");print}')"
VBoxManage snapshot $1 take "script snapshot" --description "taken by script in github repo https://github.com/ROGUE-JCTD/rogue-scripts.git on "$FORMATTED_DATE --live
