import { promptVersion, commitAllChanges, getCurrentVersion, pushItAll } from './publish';
import { exec, ExecException } from 'child_process';

const dir = __dirname.split('scripts').join('');

commitAllChanges(dir, () => {
    promptVersion((versionType: string) => {
        exec(`npm version ${versionType}`, (error: ExecException, stdout: string) => {
            if (error) {
                console.error(error);
            } else {
                pushItAll(dir, () => {
                    console.log('Congrats!');
                }, getCurrentVersion());
            }
        });
    });
});