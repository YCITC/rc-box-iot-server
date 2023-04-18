#!/bin/bash

# Set the environment by loading from the file "environment" in the same directory
DIR="$( cd "$( dirname "$0" )" && pwd)"
source $DIR/deploy/environment.sh


echo 'Deploy test with rsync'
rsync --verbose --chmod=ug=rwX -axv -r --files-from=$DIR/deploy/rsync-include --exclude-from=$DIR/deploy/rsync-exclude --dry-run \
    -e "ssh " $DEPLOY_SOURCE_DIR $DEPLOY_ACCOUNT@$DEPLOY_SERVER:$DEPLOY_DEST_DIR


echo -e 

echo 'Deploy with rsync.'
rsync --verbose --chmod=ug=rwX -axv -r --files-from=$DIR/deploy/rsync-include --exclude-from=$DIR/deploy/rsync-exclude \
    -e "ssh " $DEPLOY_SOURCE_DIR $DEPLOY_ACCOUNT@$DEPLOY_SERVER:$DEPLOY_DEST_DIR

echo -e
echo 'Docker Restart rc-box-iot-serer-1'
ssh $DEPLOY_ACCOUNT@$DEPLOY_SERVER docker restart rc-box-iot-serer-1