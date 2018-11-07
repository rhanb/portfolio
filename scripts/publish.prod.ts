import { pushItAll } from "./publish";

pushItAll(`${__dirname}/dist`, () => {
    console.log('Visit: www.rhanb.me to see the new version');
});