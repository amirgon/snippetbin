#!/usr/bin/env bash

: >> lock
{
    flock ${lock_fd}

    git switch master
    git pull --all
    git push --all

} {lock_fd}<lock

