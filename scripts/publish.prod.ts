import { pushItAll } from "./publish";

pushItAll(`${__dirname.split('scripts').join('')}/dist`, () => {
    console.log('Visit: www.rhanb.me to see the new version');
});