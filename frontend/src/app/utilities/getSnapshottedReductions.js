import Big from 'big.js'

const getSnapshottedComplianceRatioReductions = (complianceResponseDetails) => {
    const result = {}
    const reductionValueCategories = ['complianceRatioTotalReduction', 'complianceRatioClassAReduction', 'complianceRatioUnspecifiedReduction']
    complianceResponseDetails.forEach((item) => {
        const category = item.category
        const reductionValue = item.reductionValue
        if (reductionValue !== undefined && reductionValue !== null && reductionValueCategories.indexOf(category) > -1) {
            result[category] = new Big(reductionValue)
        }
    })
    return result
}

export default getSnapshottedComplianceRatioReductions