#!/usr/bin/env bash

set -e

# Usage and argument parsing

usage() { echo "Usage: $0 [-r <original_revision_key>] -c <commit message>" 1>&2; exit 1; }

while getopts ":r:c:" o; do
    case "${o}" in 
        r)
            original_revision_key="${OPTARG}"
            ;;
        c)
            commit_msg="${OPTARG}"
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

if [ -z "${commit_msg}" ]
then
    echo "Error: Missing commit message!" 1>&2;
    usage
fi

# Read file text from stdin

file_text=$(cat)

# git commands
# Since they modify the repo, need to run them exclusively
# https://stackoverflow.com/a/50419392/619493

: >> lock
{
    flock ${lock_fd}

    if [ -z "${original_revision_key}" ]
    then
        file_name=$(uuidgen)
        git checkout master > /dev/null
    else
        file_name=$(git diff-tree --no-commit-id --name-only -r "${original_revision_key}")
        git checkout -B branch_$(uuidgen) "${original_revision_key}" > /dev/null
    fi
    echo "${file_text}" > "${file_name}"
    git add "${file_name}" > /dev/null
    git commit -m "${commit_msg}" > /dev/null
    revision_key=$(git rev-parse HEAD)

} {lock_fd}<lock

# Output result

echo "${revision_key}"
exit 0

