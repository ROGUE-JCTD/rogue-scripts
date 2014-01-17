#!/usr/bin/env bash
cd /opt/rogue-chef-repo
source /usr/local/rvm/bin/rvm
type rvm | head -1
git pull
berks update
berks install --path /opt/chef-run/cookbooks
rvmsudo chef-solo -c /opt/chef-run/solo.rb -j /opt/chef-run/dna.json
touch /tmp/chefcron.txt

