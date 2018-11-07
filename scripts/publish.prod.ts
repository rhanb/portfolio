import { pushItAll, getCurrentVersion } from "./publish";

const dir = `${__dirname.split('scripts').join('')}/dist`

require('simple-git')(dir)
    .init()
    .addRemote('origin', 'https://github.com/rhanb/rhanb.github.io', () => {
        pushItAll(dir, () => {
            console.log('Visit: www.rhanb.me to see the new version');
        }, getCurrentVersion(), '-f');
    });