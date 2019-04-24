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


function NumOr0(target: any, propertyKey: string | symbol, parameterIndex: number) {

}


//NOT USED #############################################################################################################

/**
 * A adjusting function to smooth stuff out :D
 *
 * https://www.wolframalpha.com/input/?i=plot+%5B(cos((x%2Fpi+%2B+pi))+%2B+0.8),+log10(x+%2B+0.5)+-+0.397%5D+between+0+and+10
 * plot [(cos((x/pi + pi)) + 0.8), log10(x + 0.5) - 0.397] between 0 and 10
 *
 * TODO: not in use
 *
 * @param {number} v
 * @param {number} averageRatio
 * @returns {number}
 */
export function adjust_1_wl(v : number, averageRatio : number){
    const adjust = 2 - averageRatio;
    if(v > 10) return 1.8;
    else if(v > 2) return Math.cos(((v + adjust) / Math.PI) + Math.PI) + 0.8;
    else if(v <= adjust || v <= 0) return 0;
    else return Math.log10(v + 0.5 + adjust) - 0.398;
}

export function adjustV(valuePerGame : number, average : number) : number{
    return log10_x2(Math.log2( (valuePerGame / average)+ 1)) + 1
}

export function av10(valuePerGame : number, average : number) : number | null{
    const adjust = adjustV(valuePerGame, average);
    if(adjust <= 0) return null;
    return valuePerGame * adjust;
}

export function av2(valuePerGame : number, average : number){
    return log10_1At1(valuePerGame / average)
}

export function log10_1At1(value : number){
    return Math.log10(value + 0.5) - 0.176
}

export function log10_x2(value : number) {
    return Math.log10(value * value)
}