export const DisplayPriceInRupees = (price)=>{
    const formattedAmount = new Intl.NumberFormat('en-IN',{
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price)
    return `Rs ${formattedAmount}`
}