import { promptVersion, commitAllChanges, pushTags, getCurrentVersion, commitAllChangesAndPush } from './publish';
import { exec, ExecException } from 'child_process';

const dir = __dirname.split('scripts').join('');

console.log(dir);

commitAllChanges(dir, () => {
    promptVersion((versionType: string) => {
        exec(`npm version ${versionType}`, (error: ExecException, stdout: string) => {
            console.log('version should be changed');
            if (error) {
                console.error(error);
            } else {
                commitAllChangesAndPush(dir, () => {
                    pushTags(dir, getCurrentVersion(), () => {
                        console.log('Congrats!');
                    });
                }, getCurrentVersion());
            }
        });
    });
});