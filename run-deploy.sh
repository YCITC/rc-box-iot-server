#!/bin/bash
 
# Set the environment by loading from the file "environment" in the same directory
DIR="$( cd "$( dirname "$0" )" && pwd)"
source $DIR/deploy/environment.sh

# Provide credentials.
while false; do
    read -p "==> WHO ARE YOU? " DEPLOY_ACCOUNT
    case $DEPLOY_ACCOUNT in
        "" )
            echo -e "\e[00;31mTELL ME WHO YOU ARE\e[00m"
            ;;

        * )
            DEPLOY_ACCOUNT=$(echo "$DEPLOY_ACCOUNT" | tr  -d "[:space:]")
            break;;
    esac
done

printf "\e[00;33mDeploying as          \e[00;31m$DEPLOY_ACCOUNT\e[00m\e[00m \n"
printf "\e[00;33mDeploying from        \e[00;31m$DEPLOY_SOURCE_DIR\e[00m\e[00m \n"
printf "\e[00;33mDeploying to          \e[00;31m$DEPLOY_SERVER:$DEPLOY_DEST_DIR\e[00m\e[00m \n"
echo  -e


# Deploy test with rsync.
echo -e 
while true; do
    read -p "==> Do you want to run deploy test? (Y/N) " 
    case $REPLY in
        [Yy] )
            # Change entire owner/group to deploy account in order to have the proper permissions.
            # echo -e "\e[00;33mChanging directory permission to $DEPLOY_ACCOUNT:$DEPLOY_ACCOUNT...\e[00m"
            # ssh -i $DEPLOY_KEY -t $DEPLOY_ACCOUNT@$DEPLOY_SERVER "sudo chown -R $DEPLOY_ACCOUNT:$DEPLOY_ACCOUNT $DEPLOY_DEST_DIR"

            printf "\e[00;33mBegin rsync...\e[00m"
            if [ "$DEPLOY_KEY" == "" ]; then
                # Access by tediously typing a password over and again
                rsync --chmod=ug=rwX -e ssh -axv -r -files-from=$DIR/deploy/rsync-include --exclude-from=$DIR/deploy/rsync-exclude  --dry-run \
                    $DEPLOY_SOURCE_DIR $DEPLOY_ACCOUNT@$DEPLOY_SERVER:$DEPLOY_DEST_DIR
            else
                # Access by key
                echo 'Access by key'
                rsync --verbose --chmod=ug=rwX -axv -r --files-from=$DIR/deploy/rsync-include --exclude-from=$DIR/deploy/rsync-exclude --dry-run \
                    -e "ssh -i $DEPLOY_KEY" $DEPLOY_SOURCE_DIR $DEPLOY_ACCOUNT@$DEPLOY_SERVER:$DEPLOY_DEST_DIR
            fi

            # Change back permissions.
            # echo -e "\e[00;33mChanging directory permission back to $WWW_RIGHTFUL_OWNER:$WWW_RIGHTFUL_OWNER...\e[00m"
            # ssh  -i $DEPLOY_KEY -t $DEPLOY_ACCOUNT@$DEPLOY_SERVER "sudo chown -R $WWW_RIGHTFUL_OWNER:$WWW_RIGHTFUL_OWNER $DEPLOY_DEST_DIR"
            
            break;;

        [Nn] )
            printf "\e[00;31mSkipping deploy test...\e[00m"
            break;;

        * )
            printf "\e[00;31mPlease type Y or N\e[00m"
    esac
done

# Deploy with rsync.
echo -e 
while true; do
    read -p "==> Does this look good? Can I go ahead and deploy ? (Y/N) " 
    case $REPLY in
        [Yy] )
            # Change entire owner/group to deploy account in order to have the proper permissions.
            # echo -e "\e[00;33mChanging directory permission to $DEPLOY_ACCOUNT:$DEPLOY_ACCOUNT...\e[00m"
            # ssh -i $DEPLOY_KEY -t $DEPLOY_ACCOUNT@$DEPLOY_SERVER "sudo chown -R $DEPLOY_ACCOUNT:$DEPLOY_ACCOUNT $DEPLOY_DEST_DIR"

            printf "\e[00;33mBegin rsync...\e[00m"
            if [ "$DEPLOY_KEY" == "" ]; then
                # Access by tediously typing a password over and again
                rsync --chmod=ug=rwX -e ssh -axv -r -files-from=$DIR/deploy/rsync-include --exclude-from=$DIR/deploy/rsync-exclude \
                    $DEPLOY_SOURCE_DIR $DEPLOY_ACCOUNT@$DEPLOY_SERVER:$DEPLOY_DEST_DIR
            else
                # Access by key
                echo 'Access by key'
                rsync --verbose --chmod=ug=rwX -axv -r --files-from=$DIR/deploy/rsync-include --exclude-from=$DIR/deploy/rsync-exclude \
                    -e "ssh -i $DEPLOY_KEY" $DEPLOY_SOURCE_DIR $DEPLOY_ACCOUNT@$DEPLOY_SERVER:$DEPLOY_DEST_DIR
            fi

            # Change back permissions.
            # echo -e "\e[00;33mChanging directory permission back to $WWW_RIGHTFUL_OWNER:$WWW_RIGHTFUL_OWNER...\e[00m"
            # ssh  -i $DEPLOY_KEY -t $DEPLOY_ACCOUNT@$DEPLOY_SERVER "sudo chown -R $WWW_RIGHTFUL_OWNER:$WWW_RIGHTFUL_OWNER $DEPLOY_DEST_DIR"
            
            break;;

        [Nn] )
            printf "\e[00;31mSkipping deploy...\e[00m"
            break;;

        * )
            printf "\e[00;31mPlease type Y or N\e[00m"
    esac
done





# Saying good-bye.
echo -e
printf "\e[34m Deploy complete, you're responsible now.\e[00m \n"
exit 1



