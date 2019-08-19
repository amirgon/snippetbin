#!/usr/bin/env bash

# Set up SSH key and git credentials
# Expects SNIPPETBIN_DEPLOY_KEY and optionally SNIPPETBIN_DATA_DIR, SNIPPETBIN_REMOTE_HOST, SNIPPETBIN_REMOTE_REPO to be defined at this point
# Use: heroku config:set SNIPPETBIN_DEPLOY_KEY="$(cat ~/.ssh/snippetbin_service)"

export data_dir=${SNIPPETBIN_DATA_DIR:-/app/data}
export remote_host=${SNIPPETBIN_REMOTE_HOST:-github.com}
export remote_repo=${SNIPPETBIN_REMOTE_REPO:-amirgon/snippetbin_data.git}

mkdir -p $data_dir
[ -e "$data_dir/.git" ] && exit 0

mkdir -p ~/.ssh

echo "$SNIPPETBIN_DEPLOY_KEY" > ~/.ssh/snippetbin_service

cat << EOF > ~/.ssh/config

Host snippetbin_service
    HostName $remote_host
    User git
    IdentityFile ~/.ssh/snippetbin_service
    IdentitiesOnly yes

EOF

ssh-keyscan github.com >> ~/.ssh/known_hosts
git clone ssh://git@snippetbin_service/$remote_repo $data_dir
git config -f $data_dir/.git/config user.email "service@snippet-bin.herokuapp.com"
git config -f $data_dir/.git/config user.name "service"

