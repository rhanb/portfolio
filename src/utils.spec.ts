import { getElementCoordinate, calcAngleDegrees, preventSelection, getRandomIntFromRange, getRandomElementFromArray } from "./utils";

test('gives the center of a position based on a size', () => {
    expect(getElementCoordinate(1, 20)).toBe(11);
    expect(() => {
        getElementCoordinate(1, -3)
    }).toThrow();
});

test('calculate angle from position', () => {
    expect(calcAngleDegrees(0, 0)).toBe(0);
    expect(calcAngleDegrees(1, 1)).toBe(45);
});

test('must prevent default behavior from an event', () => {
    const dumbEvent = {
        cancelBubble: false,
        returnValue: true   
    } as MouseEvent;
    const dumbPreventedEvent = preventSelection(dumbEvent);
    expect(dumbPreventedEvent.cancelBubble).toBeTruthy();
    expect(dumbPreventedEvent.returnValue).toBeFalsy();
});

test('getRandomIntFromRange', () => {
    const random = getRandomIntFromRange(0, 1);
    expect(random).toBeLessThanOrEqual(1);
    expect(random).toBeGreaterThanOrEqual(0);
    expect(() => {
        getRandomIntFromRange(3, 1);
    }).toThrow();
});

test('getRandomElementFromArray', () => {
    const dumbArray = [0, 1, 2, 3];
    const emptyArray = [];
    const randomElement = getRandomElementFromArray(dumbArray);
    expect(dumbArray).toContain(randomElement);
    expect(() => {
        getRandomElementFromArray(emptyArray);
    }).toThrow();
});