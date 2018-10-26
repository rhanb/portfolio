export function getElementCoordinate(position: number, size: number): number {
    if (size <= 0) {
        throw new Error('Size must be greater than 0');
    }
    return position + (size / 2);
};

export function calcAngleDegrees(x: number, y: number): number {
    return Math.atan2(y, x) * 180 / Math.PI;
};

export function preventSelection(event: TouchEvent | MouseEvent | PointerEvent): TouchEvent | MouseEvent | PointerEvent {
    if (event.stopPropagation) event.stopPropagation();
    if (event.preventDefault) event.preventDefault();
    event.cancelBubble = true;
    event.returnValue = false;
    return event;
};

export function getRandomElementFromArray(array) {
    if (!array || array.length <= 0) {
        throw new Error('Array parameter must be defined and must have at least one element');
    }
    return array[this.getRandomIntFromRange(0, array.length - 1)];
};

export function getRandomIntFromRange(min, max) {
    if (min >= max) {
        throw new Error('The maximum value from the range must be greater than the minimum value');
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
};