import Big from 'big.js'

const getTotalReductionBig = (ldvSales, complianceRatio, supplierClass) => {
  if (supplierClass === 'S' || isNaN(ldvSales) || isNaN(complianceRatio)) {
    return new Big(0)
  }
  const ldvSalesBig = new Big(ldvSales)
  const complianceRatioBig = new Big(complianceRatio)
  return ldvSalesBig.times(complianceRatioBig).div(100)
}
  
export default getTotalReductionBig