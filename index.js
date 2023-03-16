const github = require('@actions/github');
const core = require('@actions/core');

async function all_commits_trusted(client, pr) {
    const trustedBraches = core.getInput('trusted-branches', { required: true });

    // Get list of commits on a PR
    const changeCommits = await client.pulls.listCommits({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: pr.number,
    }).data;

    const trustedCommitsByBranch = await client.repos.listCommits({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        branch: pr.number,
    }).data;

    for (let trustedBrach of trustedBraches) {
        const trustedCommits = await client.repos.listCommits({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            branch: trustedBrach,
        }).data;

        trustedCommitHashes = []
        for (let commit of listCommits) {
            trustedCommitHashes.push(commit.sha);
        }
    }


    // Get all committers on a PR
    for (let commit of listCommits) {
        // Check if there are committers other than ALLOWED_COMMITTERS
        if (!fromTrustedBranch(trustedBraches, commit.sha)) {
            core.info(
                `Commit ${commit.sha} is not from a trusted branch)`
            );
            return false;
        }
    }
    
    return true;
}

async function fromTrustedBranch(trustedBraches, sha) {

}

github.context = {
    'payload': {
        'pull_request': {
            'number' : 31
        }
    },
    'repo': {
        'repo': 'auto-approve-into-main-if-approved-in-qa',
        'owner': 'rnordmanASU'
    }
};
const orgGetInput = core.getInput;
core.getInput = (key, opt) => {
    if (key === 'github-token') return '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';
    else if (key === 'trusted-branches') return 'mule-qa';
    else return orgGetInput(key, opt)
}

async function run() {
    try {
        const token = core.getInput('github-token', { required: true });

        const { pull_request: pr } = github.context.payload;
        if (!pr) {
            throw new Error('Event payload missing `pull_request`');
        }

        const octoclient = new github.getOctokit(token);
        const client = octoclient.rest;

        if (!(await all_commits_trusted(client, pr))) return;

        core.debug(`Creating approving review for pull request #${pr.number}`);
        await client.pulls.createReview({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: pr.number,
            event: 'APPROVE',
        });
        core.info(`Approved pull request #${pr.number}`);
    } catch (error) {
        core.setFailed(error.message);
    }
}
  
run();