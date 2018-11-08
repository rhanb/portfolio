// local imports
import { Step, steps, StepName, Steps } from './step';
import { TippyElement } from '../common';
import { Translator } from '../translator/translator';

// this party libraries imports
import tippy from 'tippy.js';
import { Props } from 'tippy.js';

export class Tutorial {

    private hand: TippyElement;
    private _stepIndex: number;

    private get stepIndex(): number {
        return this._stepIndex;
    }

    private set stepIndex(stepIndexValue: number) {
        this._stepIndex = stepIndexValue >= Object.keys(steps).length ? 0 : stepIndexValue
    }

    private currentStep: Step;
    private translator: Translator;

    private _tutorialState: Steps;

    get tutorialState(): Steps {
        return this._tutorialState || JSON.parse(localStorage.getItem('tutorialState')) || { ...steps };
    }

    set tutorialState(tutorialStateValue: Steps) {
        localStorage.setItem('tutorialState', JSON.stringify(tutorialStateValue));
        this._tutorialState = tutorialStateValue;
    }

    private setCurrentStep() {
        this.currentStep = this.tutorialState[Object.keys(steps).find((key: string, index: number) => {
            return index === this.stepIndex && !this.tutorialState[key].triggered;
        })];
        this.playCurrentStep();
    }

    constructor(translatorInstance: Translator) {
        this.translator = translatorInstance;
        this._tutorialState = this.tutorialState;
        this.hand = <TippyElement>(document.getElementById('hand'));
        tippy(this.hand, {
            sticky: true,
            updateDuration: 0,
            livePlacement: true
        });
        this.stepIndex = Object.keys(steps).findIndex(key => !this.tutorialState[key].triggered);
        this.setCurrentStep();

        document.addEventListener('languageChanged', () => {
            this.playCurrentStep();
        });

        document.getElementById('resetTutorial').addEventListener('click', () => {
            this.restart();
        });

    }

    playCurrentStep() {
        if (this.currentStep) {
            this.hand._tippy.setContent(
                this.translator.getTranslatedText(this.currentStep.contentKey)
            );
            if (this.hand.className !== this.currentStep.animationClass) {
                this.hand.className = this.currentStep.animationClass;
            }
            setTimeout(() => {
                this.hand._tippy.show();
            }, 200);
        } else {
            this.hand.className = 'hidden';
            this.hand._tippy.hide();
        }
    }

    next(): void {
        this.stepIndex = this.stepIndex + 1;
        this.setCurrentStep();
    }

    changeTutorialState(actionType: StepName, value: boolean): void {
        // Need to trigger the setter
        if (this._tutorialState[actionType].triggered !== value) {
            this._tutorialState[actionType].triggered = value;
            this.tutorialState = {
                ...this.tutorialState,
                [actionType]: {
                    ...this.tutorialState[actionType],
                    triggered: value
                }
            }
            this.next();
        }
    }

    restart() {
        this.tutorialState = this.getInitialSteps();
        this.stepIndex = 0;
        this.setCurrentStep();
    }

    private getInitialSteps() {
        Object.keys(steps).forEach(key => {
            steps[key].triggered = false;
        });
        return steps;
    }
}