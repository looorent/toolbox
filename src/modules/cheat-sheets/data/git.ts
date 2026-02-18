import type { CheatSheet } from '../types'

export const gitSheet: CheatSheet = {
  label: 'Git',
  key: 'git',
  categories: [
    {
      category: 'Setup & Config',
      entries: [
        { command: 'git init', description: 'Initialize a new repository' },
        { command: 'git clone <url>', description: 'Clone an existing repository' },
        { command: 'git config --global user.name "Name"', description: 'Set global username' },
        { command: 'git config --global user.email "email"', description: 'Set global email' },
        { command: 'git config --list', description: 'List all configuration settings' },
      ],
    },
    {
      category: 'Staging & Committing',
      entries: [
        { command: 'git status', description: 'Show working tree status' },
        { command: 'git add <file>', description: 'Stage a specific file' },
        { command: 'git add .', description: 'Stage all changes in current directory' },
        { command: 'git commit -m "message"', description: 'Commit staged changes with a message' },
        { command: 'git commit --amend', description: 'Amend the last commit' },
        { command: 'git reset HEAD <file>', description: 'Unstage a file' },
        { command: 'git diff', description: 'Show unstaged changes' },
        { command: 'git diff --staged', description: 'Show staged changes' },
      ],
    },
    {
      category: 'Branching',
      entries: [
        { command: 'git branch', description: 'List local branches' },
        { command: 'git branch <name>', description: 'Create a new branch' },
        { command: 'git checkout <branch>', description: 'Switch to a branch' },
        { command: 'git checkout -b <branch>', description: 'Create and switch to a new branch' },
        { command: 'git switch <branch>', description: 'Switch to a branch (modern)' },
        { command: 'git switch -c <branch>', description: 'Create and switch to a new branch (modern)' },
        { command: 'git branch -d <branch>', description: 'Delete a merged branch' },
        { command: 'git branch -D <branch>', description: 'Force delete a branch' },
        { command: 'git branch -m <old> <new>', description: 'Rename a branch' },
      ],
    },
    {
      category: 'Merging & Rebasing',
      entries: [
        { command: 'git merge <branch>', description: 'Merge a branch into current branch' },
        { command: 'git merge --abort', description: 'Abort a conflicted merge' },
        { command: 'git rebase <branch>', description: 'Rebase current branch onto another' },
        { command: 'git rebase --abort', description: 'Abort an in-progress rebase' },
        { command: 'git rebase --continue', description: 'Continue rebase after resolving conflicts' },
        { command: 'git cherry-pick <commit>', description: 'Apply a specific commit to current branch' },
      ],
    },
    {
      category: 'Stashing',
      entries: [
        { command: 'git stash', description: 'Stash current changes' },
        { command: 'git stash pop', description: 'Apply and remove latest stash' },
        { command: 'git stash apply', description: 'Apply latest stash without removing it' },
        { command: 'git stash list', description: 'List all stashes' },
        { command: 'git stash drop', description: 'Delete the latest stash' },
        { command: 'git stash show -p', description: 'Show stash contents as a diff' },
      ],
    },
    {
      category: 'Remote',
      entries: [
        { command: 'git remote -v', description: 'List remote repositories' },
        { command: 'git remote add <name> <url>', description: 'Add a remote repository' },
        { command: 'git fetch', description: 'Download objects and refs from remote' },
        { command: 'git pull', description: 'Fetch and merge remote changes' },
        { command: 'git push', description: 'Push commits to remote' },
        { command: 'git push -u origin <branch>', description: 'Push and set upstream branch' },
        { command: 'git push origin --delete <branch>', description: 'Delete a remote branch' },
      ],
    },
    {
      category: 'Inspecting & History',
      entries: [
        { command: 'git log', description: 'Show commit history' },
        { command: 'git log --oneline', description: 'Show condensed commit history' },
        { command: 'git log --graph --oneline', description: 'Show commit graph' },
        { command: 'git show <commit>', description: 'Show details of a specific commit' },
        { command: 'git blame <file>', description: 'Show who changed each line of a file' },
        { command: 'git reflog', description: 'Show reference log of HEAD changes' },
      ],
    },
    {
      category: 'Undoing & Rewriting',
      entries: [
        { command: 'git revert <commit>', description: 'Create a new commit that undoes a previous one' },
        { command: 'git reset --soft HEAD~1', description: 'Undo last commit, keep changes staged' },
        { command: 'git reset --mixed HEAD~1', description: 'Undo last commit, keep changes unstaged' },
        { command: 'git reset --hard HEAD~1', description: 'Undo last commit, discard all changes' },
        { command: 'git checkout -- <file>', description: 'Discard changes to a file' },
        { command: 'git restore <file>', description: 'Discard changes to a file (modern)' },
        { command: 'git clean -fd', description: 'Remove untracked files and directories' },
      ],
    },
    {
      category: 'Tags',
      entries: [
        { command: 'git tag', description: 'List all tags' },
        { command: 'git tag <name>', description: 'Create a lightweight tag' },
        { command: 'git tag -a <name> -m "message"', description: 'Create an annotated tag' },
        { command: 'git push origin <tag>', description: 'Push a specific tag to remote' },
        { command: 'git push origin --tags', description: 'Push all tags to remote' },
      ],
    },
  ],
}
