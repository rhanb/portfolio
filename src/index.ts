import { Portfolio } from "./portfolio";


navigator.serviceWorker && navigator.serviceWorker.register('./sw.ts').then(function (registration) {
});

const portfolio = new Portfolio();

window.addEventListener('load', () => {
    portfolio.onLoad();
});