import { Props } from 'tippy.js';

export interface TippyElement extends HTMLElement {
    _tippy: any;
}

export const defaultTippyConfig: Props = {
    arrow: true,
    arrowType: 'round',
    animation: 'perspective',
    touch: true,
    inertia: true,
    theme: 'light',
    size: 'small'
};