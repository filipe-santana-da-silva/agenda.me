/**
 * Formata um número de telefone brasileiro
 * @param {string} phone - O número de telefone a ser formatado
 * @returns {string} O número formatado
 */
export function formatPhone(phone: string): string {
  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, '')
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11)
  
  // Aplica formatação baseada no tamanho
  if (limited.length <= 2) {
    return `(${limited}`
  } else if (limited.length <= 7) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`
  }
}

/**
 * Formata um CPF brasileiro
 * @param {string} cpf - O CPF a ser formatado
 * @returns {string} O CPF formatado
 */
export function formatCPF(cpf: string): string {
  // Remove tudo que não é número
  const numbers = cpf.replace(/\D/g, '')
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11)
  
  // Aplica formatação baseada no tamanho
  if (limited.length <= 3) {
    return limited
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`
  }
}

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