
// third party imports
import Polyglot = require('node-polyglot');
import { Manager } from 'hammerjs';
import Granim = require('granim');
import tippy from 'tippy.js';
import { Props } from 'tippy.js';
// local imports
import { translations } from './translations/translations';
import { getRandomElementFromArray, getElementCoordinate, calcAngleDegrees, preventSelection, getRandomIntFromRange } from './utils';

const defaultTippyConfig: Props = {
    arrow: true,
    arrowType: 'round',
    animation: 'scale',
    touch: true
};
export class Portfolio {

    private granims: any[];

    private languagesPicker: HTMLElement;

    private me: HTMLElement;
    private scene: HTMLElement;
    private card: HTMLElement;
    private faces: NodeListOf<Element>;

    private searchInput: HTMLElement;
    private searchableItems: NodeListOf<HTMLElement>;

    private catchPhrase: any;
    private translationsKeys: string[];
    private polyglot: any;

    private _locale: string;

    private isScrolling = false;
    private isRotating = false;

    private set locale(newLocale: string) {
        this._locale = newLocale;
        localStorage.setItem('locale', newLocale);
        this.polyglot = new Polyglot({
            locale: this.locale,
            phrases: translations[this.locale]
        });
    }

    private get locale(): string {
        const locale: string = localStorage.getItem('locale') || this._locale || navigator.language || 'en';
        return locale.split('-').length > 0 ? locale.split('-')[0] : locale;
    }

    constructor() {
        this._locale = this.locale;
        this.polyglot = new Polyglot({
            locale: this.locale,
            phrases: translations[this.locale]
        });
        this.translationsKeys = Object.keys(translations[this.locale]);

        this.initElements();

        tippy.setDefaults(defaultTippyConfig);
        tippy('.tippy');

        this.initGradients();
        this.render();
    }

    onLoad(): void {

        const sceneManager = new Manager(this.scene),
            documentManager = new Hammer(document.body),
            cardManager = new Hammer(this.card);

        const DoubleTap = new Hammer.Tap({
            event: 'doubletap',
            taps: 2
        });

        sceneManager.add(DoubleTap);

        const PanTimeout = new Hammer.Pan({
            event: 'panmove',
            threshold: 500
        });

        const searchableItemsContainer = document.getElementById('search-items');
        let timeout;

        searchableItemsContainer.addEventListener('scroll', (event) => {
            event.stopPropagation();
            this.isScrolling = true;

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                this.isScrolling = false;
            }, 66);

        }, { passive: true });

        documentManager.on('panmove', (moveEvent: TouchMouseInput) => {
            if (!this.isScrolling && !this.isRotating) {
                this.onDrag(moveEvent);
            }
        });

        documentManager.on('panend pancancel', () => {
            this.rotateCard(0, 0);
        });

        sceneManager.on('doubletap', () => {
            this.flipCard();
        });

        cardManager.on('swipe', () => {
            this.flipCard();
        });

        this.initLanguagePicker();

        this.initSearch();
    }


    private render(): void {
        this.renderTranslatedText();
        this.orderLanguages();
    }

    private initElements() {
        this.scene = document.getElementById('scene');
        this.languagesPicker = document.getElementById('language-picker');
        this.card = document.getElementById('card');
        this.me = document.getElementById('gradient-canvas-me');
        this.searchInput = document.getElementById('search-input');
        this.searchableItems = document.querySelectorAll('.tippy');
        this.faces = document.querySelectorAll('.card-face');
    }

    private initGradients() {
        const options = {
            direction: 'diagonal',
            opacity: [1, 1],
            states: {
                'default-state': {
                    gradients: [
                        ['#21C2CC', '#6B4BBA'],
                        ['#229EA6', '#3F28B1']
                    ]
                }
            }
        };

        const meOptions = {
            element: this.me,
            ...options
        };
        const bodyOptions = {
            element: '#gradient-canvas-body',
            ...options
        };
        this.granims = [new Granim(bodyOptions), new Granim(meOptions)];
    }

    private initLanguagePicker() {
        const languagesOptions = document.getElementsByClassName('language') as HTMLCollectionOf<HTMLElement>;

        for (let index = 0; index < languagesOptions.length; index++) {
            const languageManager = new Hammer(languagesOptions.item(index));
            languageManager.on('tap', (tapEvent) => {
                if (this.languagesPicker.classList.contains('hover')) {
                    this.locale = tapEvent.target.dataset.language;
                    this.render();
                }
                this.languagesPicker.classList.toggle('hover');
            });
        }
    }

    private initSearch() {
        this.searchInput.addEventListener('input', (event: any) => {
            console.log(event);
            this.searchableItems.forEach((item: HTMLElement) => {
                console.log(item.id)
                const itemValue = item.id.toLowerCase().trim();
                const typedValue = event.target.value.toLowerCase().trim();

                if (itemValue.indexOf(typedValue) < 0) {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'flex';
                }
            });
        });
    }

    private renderTranslatedText(): void {

        this.translationsKeys.forEach((translationKey) => {
            const elementKey: string = translationKey;

            const translation: string | Object = translations[this.locale][translationKey];

            if (translation instanceof Object) {
                if (!this.catchPhrase) {
                    this.catchPhrase = {};
                    const randomIndex = getRandomIntFromRange(0, Object.keys(translation).length - 1);
                    this.catchPhrase[translationKey] = randomIndex;
                    translationKey = `${translationKey}.${randomIndex}`;
                } else {
                    translationKey = `${translationKey}.${this.catchPhrase[translationKey]}`;
                }
            }

            const element: any = document.getElementById(elementKey);

            const translatedText: string = this.polyglot.t(translationKey);

            if (element) {
                if (element.classList.contains('tippy')) {
                    element._tippy.setContent(translatedText ? translatedText : element.dataset.tippy);
                } else {
                    element.innerText = translatedText;
                }
            }
        });
    }

    private orderLanguages(): void {

        const languages: HTMLCollectionOf<HTMLElement> = this.languagesPicker.children as HTMLCollectionOf<HTMLElement>;

        let languageIndex = -1, i = 0;
        while (i < languages.length && languageIndex < 0) {
            if (languages[i].dataset.language === this.locale) {
                languageIndex = i;
            } else {
                i++;
            }
        }

        this.languagesPicker.insertBefore(languages[languageIndex], languages[0]);
    }


    private rotateCard(angleDegX: number, angleDegY: number): void {
        this.isRotating = true;
        this.scene.style.transform = 'rotateY(' + angleDegX + 'deg) rotateX(' + angleDegY + 'deg)';
        setTimeout(() => {
            this.isRotating = false;
        }, 50);
    }

    private flipCard(): void {
        this.card.classList.toggle('is-flipped');
        /*
        * Issue: Can't use CSS proprty backface-visibility, all text is displayed once the rotation's animation is done
        * Solution: hide non active card's face using the CSS class hidden
        */
        this.faces.forEach(cardFace => {
            cardFace.classList.toggle('hidden');
            cardFace.classList.toggle('shown');
        });

    }

    private rotateGradient(granimIndex: number, x: number, y: number) {
        const customDirection = {
            x0: '0px',
            y0: '0px',
            x1: `${x}px`,
            y1: `${y}px`
        };

        this.granims[granimIndex].customDirection = customDirection;
        this.granims[granimIndex].changeDirection('custom');
    }

    private onDrag(moveEvent): void {

        const event = { ...preventSelection(moveEvent.srcEvent) };

        const coordinateOwner = moveEvent.srcEvent;

        const x = coordinateOwner.pageX,
            y = coordinateOwner.pageY;

        const elementOffset: ClientRect = this.scene.getBoundingClientRect();

        const elementX: number = getElementCoordinate(elementOffset.left, elementOffset.width),
            elementY: number = getElementCoordinate(elementOffset.right, elementOffset.height);

        const angleDegX: number = calcAngleDegrees(elementX, x - elementX),
            angleDegY: number = calcAngleDegrees(elementY, y - elementY);

        const meOffset: ClientRect = this.me.getBoundingClientRect();

        const meX: number = x / elementOffset.width * meOffset.width,
            meY: number = y / elementOffset.height * meOffset.height;

        this.rotateGradient(0, x, y);
        this.rotateGradient(1, meX, meY);
        this.rotateCard(angleDegX, angleDegY);
    }
}