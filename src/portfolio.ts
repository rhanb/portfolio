
// third party imports
import Polyglot = require('node-polyglot');
import { Manager } from 'hammerjs';

// local imports
import { translations } from './translations/translations';
import { colors } from './style/colors';
import { getRandomElementFromArray, getElementCoordinate, calcAngleDegrees, preventSelection, getRandomIntFromRange } from './utils';

export class Portfolio {

    private scene: HTMLElement;
    private languagesPicker: HTMLElement;
    private card: HTMLElement;
    private faces: NodeListOf<Element>;

    private searchInput: HTMLElement;
    private searchableItems: NodeListOf<HTMLElement>;

    private backgroundColor: string;
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
        this.backgroundColor = getRandomElementFromArray(colors);
        this._locale = this.locale;
        this.polyglot = new Polyglot({
            locale: this.locale,
            phrases: translations[this.locale]
        });
        this.translationsKeys = Object.keys(translations[this.locale]);
        this.scene = document.getElementById('scene');
        this.languagesPicker = document.getElementById('language-picker');
        this.card = document.getElementById('card');
        this.searchInput = document.getElementById('search-input');
        this.searchableItems = document.querySelectorAll('[data-tooltip]');
        this.faces = document.querySelectorAll('.card-face');
        this.applyTheme();
        this.refresh();
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
        const faces: NodeListOf<HTMLElement> = document.querySelectorAll('.card-face');
        faces.forEach(cardFace => {
            cardFace.classList.toggle('hidden');
            cardFace.classList.toggle('shown');
        });

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

        this.rotateCard(angleDegX, angleDegY);
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
                    translationKey = [translationKey, '.', randomIndex].join('');
                } else {
                    translationKey = [translationKey, '.', this.catchPhrase[translationKey]].join('');
                }
            }

            const element: HTMLElement = document.getElementById(elementKey);

            const translatedText: string = this.polyglot.t(translationKey);

            if (element.dataset.tooltip) {
                element.dataset.tooltip = translatedText;
            } else {
                element.innerText = translatedText;
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

    private applyTheme(): void {
        document.querySelectorAll('.colorised').forEach((element: HTMLElement) => {
            element.style.backgroundColor = this.backgroundColor;
        });
    }

    private refresh(): void {
        this.renderTranslatedText();
        this.orderLanguages();
    }


    onLoad(): void {

        const languagesOptions = document.getElementsByClassName('language') as HTMLCollectionOf<HTMLElement>;

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
            console.log('scroll in card event');
            this.isScrolling = true;

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                this.isScrolling = false;
            }, 66);

        }, { passive: true });

        documentManager.on('panmove', (moveEvent: TouchMouseInput) => {
            console.log('pan move event');
            if (!this.isScrolling && !this.isRotating) {
                this.onDrag(moveEvent);
            }
        });
        documentManager.on('panend pancancel', () => {
            console.log('pan end event');
            this.rotateCard(0, 0);
        });

        sceneManager.on('doubletap', () => {
            this.flipCard();
        });

        cardManager.on('swipe', () => {
            this.flipCard();
        });

        for (let index = 0; index < languagesOptions.length; index++) {
            const languageManager = new Hammer(languagesOptions.item(index));
            languageManager.on('tap', (tapEvent) => {
                if (this.languagesPicker.classList.contains('hover')) {
                    this.locale = tapEvent.target.dataset.language;
                    this.refresh();
                }
                this.languagesPicker.classList.toggle('hover');
            });
        }

        this.searchInput.addEventListener('input', (event: any) => {
            this.searchableItems.forEach((item: HTMLElement) => {
                const itemValue = item.dataset.tooltip.toLowerCase().trim();
                const typedValue = event.target.value.toLowerCase().trim();

                if (itemValue.indexOf(typedValue) < 0) {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'flex';
                }
            });
        });
    }
}