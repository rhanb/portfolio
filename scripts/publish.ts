import { createInterface } from 'readline';
import { dirname } from 'path';

const ora = require('ora');

export function commitAllChanges(dirName: string, callback: () => void, defaultCommitMessage?: string) {
    const git = require('simple-git')(dirName);
    git.status((error, status) => {
        if (hasNoChanges(status)) {
            callback();
        } else {
            if (defaultCommitMessage) {
                commitAllChangesFromMessage(dirName, defaultCommitMessage, () => {
                    callback();
                });
            } else {
                promptCommitMessage((commitMessage: string) => {
                    commitAllChangesFromMessage(dirName, commitMessage, () => {
                        callback();
                    });
                });
            }
        }
    });
}

export function commitAllChangesFromMessage(dirName: string, commitMessage: string, callback: () => void) {
    const git = require('simple-git')(dirName);
    const spinner = ora('Adding unstaged files').start();
    git
        .add('.', () => {
            spinner.text = 'Committing files';
        })
        .commit(commitMessage, () => {
            spinner.stop();
            callback();
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

export function commitAllChangesAndPush(dirName: string, callback: () => void, defaultCommitMessage?: string) {
    commitAllChanges(dirName, () => {
        push(dirName, () => {
            callback();
        });
    }, defaultCommitMessage);
}

export function pushItAll(dirName: string, callback: () => void, defaultCommitMessage?: string) {
    commitAllChangesAndPush(dirName, () => {
        createAndPushTags(dirName, getCurrentVersion(), () => {
            callback();
        });
    }, defaultCommitMessage);
}

export function createAndPushTags(dirName: string, version: string, callback: () => void) {
    const git = require('simple-git')(dirName);
    const spinner = ora('Creating new version tag').start();
    git
        .tag(['-a', `v${version}`, '-m', `v${version}`], (error, stdin) => {
            spinner.text = 'Pushing new version tag';
            /*
            * always getting the error tag 'x.x.x' already exists even when it doesn't
            * had to ignore the error
            * PS: same when pushing tags..
            */
            git.pushTags('origin', () => {
                spinner.stop();
                callback();
            });
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
    const prompt = createInterface({
        input: process.stdin,
        output: process.stdout
    });

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
