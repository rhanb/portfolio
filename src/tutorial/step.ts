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
    'pan': {
        animationClass: 'pan',
        contentKey: 'tutorialPan'
    },
    'swipe': {
        animationClass: 'swipe',
        contentKey: 'tutorialSwipe'
    },
    'doubleTap': {
        animationClass: 'doubleTap',
        contentKey: 'tutorialDoubleTap'
    }
}; 