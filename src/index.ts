// third party imports
import tippy from 'tippy.js';

// local imports
import { defaultTippyConfig } from './common';
import { Portfolio } from './portfolio';

tippy.setDefaults(defaultTippyConfig);

const userAgent = navigator.userAgent;

// prevents having a fixed position for safari on desktop
if (!(!!userAgent.match(/iPad|iPhone/i)) && !!userAgent.match(/WebKit/i)) {
    document.body.className = 'not-fixed';
}

const portfolio = new Portfolio();

window.addEventListener('load', () => {
    portfolio.onLoad();
});