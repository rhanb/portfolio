import { createInterface } from 'readline';

const ora = require('ora');

const prompt = createInterface({
    input: process.stdin,
    output: process.stdout
});

export function commitAllChanges(dirName: string, callback: () => void) {
    const git = require('simple-git')(dirName);
    git.status((error, status) => {
        if (hasNoChanges(status)) {
            callback();
        } else {
            promptCommitMessage((commitMessage: string) => {
                const spinner = ora('Adding unstaged files').start();
                git
                    .add('.', () => {
                        spinner.text = 'Committing files';
                    })
                    .commit(commitMessage, () => {
                        spinner.stop();
                        callback();
                    });
            });
        }
    });
}

export function push(dirName: string, callback: () => void) {
    const git = require('simple-git')(dirName);
    const spinner = ora('Pushing files').start();
    git.push('origin', 'master', () => {
        spinner.stop();
        callback();
    });
}

export function pushItAll(dirName: string, callback: () => void) {
    commitAllChanges(dirName, () => {
        push(dirName, () => {
            pushTags(dirName, getCurrentVersion(), () => {
                callback();
            });
        });
    });
}

export function pushTags(dirName: string, version: string, callback: () => void) {
    const git = require('simple-git')(dirName);
    const spinner = ora('Creating new version tag').start();
    git
        .tag(['-a', `v${version}`, '-m', `v${version}`], () => {
            spinner.text = 'Pushing new version tag';
        })
        .pushTags('origin', () => {
            spinner.stop();
            callback();
        });
}

export function getCurrentVersion(): string {
    return require('../package.json').version;
}

function hasNoChanges(status) {
    let hasChanges: boolean;
    const keys: string[] = Object.keys(status);
    keys
        .filter(key => typeof status[key] !== 'string')
        .forEach(key => {
            if (!hasChanges) {
                hasChanges = status[key].length !== 0 || status[key] !== 0;
            }
        });
    return !hasChanges;
}


export function promptAny(question: string, callback: (answer: string) => void) {
    prompt.question(question, (anwser: string) => {
        callback(anwser);
        prompt.close();
    });
}

export function promptVersion(callback: (nextVersionType: string) => void) {
    promptAny('Enter new version type (patch, minor or major): ', callback);
}

export function promptCommitMessage(callback: (commitMessage: string) => void) {
    promptAny('Enter commit message: ', callback);
}