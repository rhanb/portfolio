import { getRandomIntFromRange } from '../utils';
import { translations } from './translations';
import { TippyElement } from '../common';
import tippy, { Tippy } from 'tippy.js';

export class Translator {
    private languagesPicker: HTMLElement;

    private _locale: string;
    public translationsKeys: string[];
    public catchPhraseIndex: number;

    private languageChangeEvent: CustomEvent;

    public set locale(newLocale: string) {
        this._locale = newLocale;
        localStorage.setItem('locale', newLocale);
    }

    public get locale(): string {
        const locale: string = this._locale || localStorage.getItem('locale') || navigator.language || 'en';
        return locale.split('-').length > 0 ? locale.split('-')[0] : locale;
    }

    constructor() {
        tippy('.tippy');
        this._locale = this.locale;
        this.languageChangeEvent = document.createEvent('CustomEvent');
        this.languageChangeEvent.initCustomEvent('languageChanged', true, true, {
            language: this.locale
        });
        this.translationsKeys = Object.keys(translations[this.locale]);
        this.initLanguagePicker();
    }

    private initLanguagePicker() {
        this.languagesPicker = document.getElementById('language-picker');

        this.onLanguageChange();

        const languagesOptions = document.getElementsByClassName('language') as HTMLCollectionOf<HTMLElement>;

        for (let index = 0; index < languagesOptions.length; index++) {
            const languageManager = new Hammer(languagesOptions.item(index));
            languageManager.on('tap', (tapEvent) => {
                if (this.languagesPicker.classList.contains('hover')) {
                    this.locale = tapEvent.target.dataset.language;
                    document.dispatchEvent(this.languageChangeEvent);
                    this.onLanguageChange();
                }
                this.languagesPicker.classList.toggle('hover');
            });
        }
    }

    private onLanguageChange() {
        this.orderLanguages();
        this.renderTranslatedTexts();
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

    public getTranslatedText(key: string): string {
        let translation = translations[this.locale][key];

        if (translation instanceof Object) {
            if (this.catchPhraseIndex === undefined) {
                this.catchPhraseIndex = getRandomIntFromRange(0, Object.keys(translation).length - 1);
            }
            translation = `"${translations[this.locale][key][this.catchPhraseIndex]}"`;
        }

        return translation;
    }

    private renderTranslatedTexts(): void {
        this.translationsKeys.forEach((translationKey) => {
            const element: TippyElement | HTMLElement = document.getElementById(translationKey);
            this.renderElementTranslatedText(element, translationKey);
        });
    }

    private renderElementTranslatedText(element: HTMLElement | TippyElement, translationKey: string): void {
        const translatedText: string = this.getTranslatedText(translationKey);
        if (element) {
            if (element.classList.contains('tippy')) {
                const tip: TippyElement = <TippyElement>(element);
                tip._tippy.setContent(translatedText ? translatedText : element.dataset.tippy);
            } else {
                element.innerText = translatedText;
            }
        }
    }

}