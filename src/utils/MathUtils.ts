// MATH.shit -----------------------------------------------------------------------------------------------------------

export function round(zahl,n_stelle) {
    zahl = (Math.round(zahl * n_stelle) / n_stelle);
    return zahl;
}

/**
 * Does return 0 if the value is null
 * @param {number | null} value
 * @returns {number}
 */
export function vOr0(value : any) : number{
    if(!value || isNaN(value) || value < 0) return 0;
    return value;
}

export function vOr1(value : any) : number{
    if(!value || isNaN(value) || value <= 0) return 1;
    return value;
}
