
# SnippetBin

---

# Rational

A simple pastebin/gist-like service (server side).
The underlying database is git. 
Syncs automatically with GitHub or any other git server.

It allows
- Creating new (unamed) files and saving them on the server
- A file revision is immutable. Once written to the server it cannot be changed.
- A file revision can have history. It is an edit of another revision.
- Sharing the files by publishing a "revision id" that identifies that revision of that file
- Editing an existing file revision according to its revision id (this will create a new file with the original text and original history)
- Browsing the change history of a file, and branching it to a new file

# Demo

https://snippet-bin.herokuapp.com

# API

## LOAD-FILE

Input:
 - revision key

Output: 
 - file text
 - revision history (list of revision keys)

## SAVE-FILE

Input:
 - file text
 - original revision key (optional)

Output:
 - new revision key

# Client flows

## New file

- User provides new text, and asks to save the file
- Client calls SAVE-FILE with user text.
- Client publishes revision key in a URL
- Client saves revision key. It will be used when the user edits the file

## Edit existing file

- User continues to edit an existing file, and asks to save the file. (or file automatially saved)
- Client remembers the revision key for the file the user is editing
- Client calls SAVE-FILE with user text and the revision key

## Load file

- User provides revision key (through URL, or by selecting it from revision history)
- Client calls LOAD-FILE with the revision key
- Client displays file text to the user, and allows editing it.
- Client displays the user the revision history, in case the user wants to go back to historic revision of the file
- Client saves revision key. It will be used when the user saves his edits of the file

# Implementation

- Underlying database is git.
- Revision key is a commit hash
- Revision history is the log of a given commit hash
- Each commit will contain a singe file
- When saving a file
  - A new file without "original revision key" will be named by a unique ID and commited.
  - An existing file with commit ID will be branched from the original revision ID.


NOTE: each commit must have a parent, otherwise `git diff-tree` will not work correctly. So don't start with empty repo!

## git commands for LOAD-FILE

Get file text according to revision key. Revision key is actually the commit ID, and each commit has only one file

Inputs:
- `revision_key`

Outputs:
- `file_text`
- `revision_history`

```bash
file_hash=$(git diff-tree --no-commit-id "$revision_key" | cut -d ' ' -f 4)
file_text=$(git show --raw "$file_hash")
```

Get revision history from revision key:

```bash
file_name=$(git diff-tree --no-commit-id --name-only "$revision_key")
revision_history=$(git log --format=%H "$revision_key" -- "$file_name")
```

## git commands for SAVE-FILE

Inputs:
- `file_text`
- optional `original_revision_key`
- `commit_msg` 

Outputs:
- `revision_key`

```bash
if [ -z "$original_revision_key" ]
then
    file_name=$(uuidgen)
    git checkout master
else
    file_name=$(git diff-tree --no-commit-id --name-only -r "$original_revision_key")
    git checkout -B branch_$(uuidgen) "$original_revision_key"
fi
echo "$file_text" > "$file_name"
git add "$file_name"
git commit -am "$commit_msg"
revision_key=$(git rev-parse HEAD)
```

# TODO

- Change SAVE-FILE implementation to use git plumbing commands
- Prevent checking out, no need to update all files locally when only one is used simultaneously

