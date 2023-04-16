#!/bin/bash

# Don't forget the trailing / on the source directory - if you omit it,
# it will copy the directory over, rather than just its contents.
# NOTE: no trailing slash on destination directory


export DEPLOY_SOURCE_DIR=./
export DEPLOY_DEST_DIR=/home/tid/RC-Box/iot-server/
export DEPLOY_SERVER=34.80.129.4
export DEPLOY_ACCOUNT=tid

export DEPLOY_KEY=$HOME/.ssh/id_rsa
export SSH_PORT=22
export WWW_RIGHTFUL_OWNER=tid
