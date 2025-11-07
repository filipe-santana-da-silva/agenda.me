
/**
 * Converte um valor monetário em reais (BRL) para centavos
 * @param {string} amount - O valor monetáio em reais (BRL) a ser convertido.
 * @returns {number} O valor convertido em centavos
 * 
 * @example
 * convetRealToCents("1.300,50"); // Retorna ele convertido em centavos
 */

export function convertRealToCents(amount: string){
    const numericPrice = parseFloat(amount.replace(/\./g,'').replace(',','.'))
    const priceInCents = Math.round(numericPrice * 100)
    return priceInCents;
}