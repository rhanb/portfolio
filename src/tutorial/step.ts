export interface Step {
    animationClass: StepName
    contentKey: string,
    triggered?: boolean
}

export type StepName = 'pan' | 'swipe' | 'doubleTap';

export interface Steps {
    [key: string]: Step
}

export const steps: Steps = {
    'swipe': {
        animationClass: 'swipe',
        contentKey: 'tutorialSwipe'
    },
    'pan': {
        animationClass: 'pan',
        contentKey: 'tutorialPan'
    },
    'doubleTap': {
        animationClass: 'doubleTap',
        contentKey: 'tutorialDoubleTap'
    }
}; 