// third party imports
import tippy from 'tippy.js';

// local imports
import { defaultTippyConfig } from './common';
import { Portfolio } from './portfolio';

navigator.serviceWorker && navigator.serviceWorker.register('./sw.ts').then(function (registration) {
});

tippy.setDefaults(defaultTippyConfig);

const portfolio = new Portfolio();

window.addEventListener('load', () => {
    portfolio.onLoad();
});