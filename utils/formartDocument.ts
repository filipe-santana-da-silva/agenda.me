export function formatDocumentValue(type: string, value: string): string {
  const digits = value.replace(/\D/g, '')

  if (type === 'CPF') {
    // CPF must have exactly 11 digits
    const limitedDigits = digits.slice(0, 11)
    return limitedDigits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
  }

  if (type === 'CNPJ') {
    // CNPJ must have exactly 14 digits
    const limitedDigits = digits.slice(0, 14)
    return limitedDigits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
  }

  if (type === 'RG') {
    // RG must have 7 to 9 digits
    const limitedDigits = digits.slice(0, 9)
    return limitedDigits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
  }

  return value
}
