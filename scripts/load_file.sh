#!/usr/bin/env bash

set -e

# Usage and argument parsing

usage() { echo "Usage: $0 -r <revision_key>" 1>&2; exit 1; }

while getopts ":r:" o; do
    case "${o}" in 
        r)
            revision_key="${OPTARG}"
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

if [ -z "${revision_key}" ]
then
    echo "Error: Missing revision key!" 1>&2;
    usage
fi

# git commands

file_hash=$(git diff-tree --no-commit-id "${revision_key}" | cut -d ' ' -f 4)
file_text=$(git cat-file -p "${file_hash}")
file_name=$(git diff-tree --no-commit-id --name-only "${revision_key}")
revision_history=($(git rev-list "${revision_key}" -- "${file_name}"))

# Output result

echo "${revision_history[@]}"
echo "${file_text}"
