import { Portfolio } from "./portfolio";

const portfolio = new Portfolio();

window.addEventListener('load', () => {
    portfolio.onLoad();
});