# conditionally-approve-pr-containing-only-trusted-commits

- [Context and motivation](#context-and-motivation)
- [Usage](#usage)
- [Example](#example)
- [Dependencies](#dependencies)
- [License](#license)

## Context and motivation

This is a Github action designed to automatically approve a pull request (PR)
so long as the head of the PR in an ancestor to a *trusted* branch.  If this is
the case, the PR is automatically approved on the assumption that the PR was
properly reviewed before being merged into the *trusted* branch.

A *trusted* branch is essentially any branch that, if commits are on this branch, they are OK to be commited to main.
The expected setup for this would be to have the main branch and the QA branch both be protected branches (requires approval on PRs),
then if QA is a *trusted* branch, you assume that any sort of code review or other authorization checks occured when the PR was merged
into QA meaning that the PR into main can be automatically approved.

This is useful for workflows that look something like:
1. Branch off of main to create feature branch.
2. Develop feature branch.
3. Make PR into QA (protected) branch.
4. Go through code review process before approval to merge into QA branch.
5. Test in QA branch.
6. Make PR into main (protected) branch.
7. This Github action automatically approves the PR since the head is an ancestor to QA.
8. Merge into main branch.

```
main     ---------+---------------+--->
                  |               ^
                  V               |
feature           +-c-c-c-+-------+
                          |
                          V
qa       -----------------+----------->
```
(c indicated a commit - after pulling into qa, there are no more commits on the feature branch)

## Usage
```
- uses: rnordmanASU/conditionally-approve-pr-containing-only-trusted-commits@v1
  with:
    # A semicolon separated list of trusted branches (trims whitespace from each branch name)
    # Default: 'master; main'
    trusted-branches: ''
```

## Example
```
name: Autoapprove PRs into main that contain only commits that exist in QA or UAT.

on:
    pull_request_target:
        types: [opened, synchronize, reopened]
        branches:
            - 'main'

jobs:
    auto-approve:
        name: Approve PRs if they only contain commits in QA or UAT
        runs-on: ubuntu-latest
        permissions:
            pull-requests: write
        steps:  
            - uses: rnordmanASU/conditionally-approve-pr-containing-only-trusted-commits@v1
              with:
                trusted-branches: 'uat;qa'
```

## Dependencies
This is a composite action and uses several other Github actions as a part of itself.
Beyond these other actions, it uses git and bash in order to check for ancestry.

| Dependency name | Purpose |
|---|---|
| [hmarr/auto-approve-action](https://github.com/hmarr/auto-approve-action) | Used to automatically approve the PR |
| [actions/checkout](https://github.com/actions/checkout) | Checkouts the repo |

# License
[GNU GPLv3 License](LICENSE) covers the scripts and documentation in this project.