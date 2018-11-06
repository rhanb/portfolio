const readline = require('readline');
const git = require('simple-git')('./dist');
const ora = require('ora');

const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const spinner = ora('Getting repository tags').start();
git.tags((err, tags) => {
    console.log('Last version is: ', tags.latest);
    spinner.stop();
    prompt.question('Enter commit message: ', (commitMessage) => {
        prompt.question('Enter new version type (patch, minore or major): ', (versionType) => {
            const nextVersion = getVersion(versionType, !tags.latest ? 'v1.0.0' : tags.latest);
            console.log('Next version will be: ', nextVersion);
            spinner.text = 'Adding unstaged files';
            spinner.start();
            git
                .add('.', () => {
                    spinner.text = 'Commiting filed';
                })
                .commit(commitMessage, () => {
                    spinner.text = 'Creating new tag';
                })
                .tag(['-a', nextVersion, '-m', nextVersion], () => {
                    spinner.text = 'Pushing latest modifications';
                })
                .push('origin', 'master', () => {
                    spinner.text = 'Pushing new tag';
                })
                .pushTags('origin', (error, result) => {
                    spinner.stop();
                    prompt.close();
                });
        });
    });
});

function getVersion(versionType, latestTag) {
    const versionTypes = [{
        name: 'patch',
        increment: (version) => {
            return version + 1;
        }
    }, {
        name: 'minor',
        increment: (version) => {
            version = version + 10;
            let splittedVersion = version.toString().split('');
            splittedVersion[splittedVersion.length - 1] = 0;
            return splittedVersion.join('');
        },
    }, {
        name: 'major',
        increment: (version) => {
            version = version + 100;
            let splittedVersion = version.toString().split('');
            splittedVersion[splittedVersion.length - 1] = splittedVersion[splittedVersion.length - 2] = 0;
            return splittedVersion.join('');
        }
    }];

    const versionTypeIndex = versionTypes.map(value => value.name).indexOf(versionType);


    let nextVersion;

    if (versionTypeIndex < 0) {
        nextVersion = latestTag;
    } else {
        nextVersion =
            versionTypes[versionTypeIndex].increment(parseInt(latestTag
                .split('v')
                .filter(value => value.length > 0)
                .join('')
                .split('.')
                .filter(value => value.length > 0)
                .join(''), 10));

        nextVersion = ['v', nextVersion.toString().split('').join('.')].join('')
    }
    console.log(nextVersion);
    return nextVersion;
}