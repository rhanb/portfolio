import { promptVersion, commitAllChanges, push, pushTags, getCurrentVersion } from './publish';
import { exec, ExecException } from 'child_process';

const dir = __dirname;

commitAllChanges(dir, () => {
    promptVersion((versionType: string) => {
        exec(`npm version ${versionType}`, (error: ExecException, stdout: string) => {
            if (error) {
                console.error(error);
            } else {
                push(dir, () => {
                    pushTags(dir, getCurrentVersion(), () => {
                        console.log('Congrats!');
                    });
                });
            }
        });
    });
});