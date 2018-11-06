
// third party imports
import { Manager } from 'hammerjs';
import Granim = require('granim');
import tippy from 'tippy.js';
// local imports
import { getRandomElementFromArray, getElementCoordinate, calcAngleDegrees, preventSelection, getRandomIntFromRange } from './utils';
import { Tutorial } from './tutorial/tutorial';
import { TippyElement } from './common';
import { Translator } from './translator/translator';

const devilTimeout = 66.6;

export class Portfolio {

    private granims: {
        [key: string]: any
    } = {};

    private me: HTMLElement;
    private scene: HTMLElement;
    private card: HTMLElement;
    private faces: NodeListOf<Element>;

    private searchInput: TippyElement;
    private searchableItems: NodeListOf<HTMLElement>;

    private isScrolling = false;
    private isRotating = false;

    private translator: Translator;

    private tutorial: Tutorial;

    constructor() {
        this.translator = new Translator();

        this.initElements();

        this.tutorial = new Tutorial(this.translator);

        this.initGradients();
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
                // avoid scroll and pan conflicts
                this.isScrolling = false;
            }, devilTimeout);

        }, { passive: true });

        documentManager.on('panmove', (moveEvent: TouchMouseInput) => {
            if (!this.isScrolling && !this.isRotating) {
                this.onDrag(moveEvent);
            }
        });

        documentManager.on('panend pancancel', () => {
            this.tutorial.changeTutorialState('pan', true);
            this.rotateCard(0, 0);
        });

        sceneManager.on('doubletap', () => {
            this.tutorial.changeTutorialState('doubleTap', true);
            this.flipCard();
        });

        cardManager.on('swipe', () => {
            this.tutorial.changeTutorialState('swipe', true);
            this.flipCard();
        });

        this.initSearch();
    }

    private initElements() {
        this.scene = document.getElementById('scene');
        this.card = document.getElementById('card');
        this.me = document.getElementById('gradient-canvas-me');
        this.searchInput = document.getElementById('search-input');
        tippy(this.searchInput, {
            sticky: true,
            content: this.translator.getTranslatedText('inputHelp')
        });

        document.addEventListener('languageChanged', (event) => {
            this.searchInput._tippy.setContent(
                this.translator.getTranslatedText('inputHelp')
            );
        });

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

        this.granims['me'] = new Granim({
            element: this.me,
            ...options
        });

        this.granims['body'] = new Granim({
            element: '#gradient-canvas-body',
            ...options
        });
    }

    private initSearch() {
        this.searchInput.addEventListener('input', (event: any) => {
            this.searchableItems.forEach((item: TippyElement) => {
                let itemValue = item.id.toLowerCase().trim();
                if (item._tippy.props.content) {
                    itemValue = `${itemValue}${item._tippy.props.content.toLowerCase().trim()}`;
                }
                const typedValue = event.target.value.toLowerCase().trim();

                if (itemValue.indexOf(typedValue) < 0) {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'flex';
                }
            });
        });
    }


    private rotateCard(angleDegX: number, angleDegY: number): void {
        this.isRotating = true;
        this.scene.style.transform = 'rotateY(' + angleDegX + 'deg) rotateX(' + angleDegY + 'deg)';
        setTimeout(() => {
            // prevent glitches
            this.isRotating = false;
        }, devilTimeout);
    }

    private flipCard(): void {
        this.card.classList.toggle('is-flipped');
        /*
        * Issue: Can't use CSS proprty backface-visibility, all text is displayed once the rotation's animation is done
        * Solution: hide non-active card's face using the CSS class hidden
        */
        this.faces.forEach(cardFace => {
            cardFace.classList.toggle('hidden');
            cardFace.classList.toggle('shown');
        });

    }

    private isFlipped(): boolean {
        return this.card.classList.contains('is-flipped');
    }

    private rotateGradient(granimKey: 'body' | 'me', x: number, y: number) {
        const customDirection = {
            x0: '0px',
            y0: '0px',
            x1: `${x}px`,
            y1: `${y}px`
        };
        this.granims[granimKey].customDirection = customDirection;
        this.granims[granimKey].changeDirection('custom');
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

        this.rotateGradient('body', x, y);
        this.rotateGradient('me', meX, meY);
        this.rotateCard(angleDegX, angleDegY);
    }
}