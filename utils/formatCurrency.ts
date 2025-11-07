
const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
    minimumFractionDigits: 0
})

export function formatCurrancy(number: number){
    return CURRENCY_FORMATTER.format(number)
}