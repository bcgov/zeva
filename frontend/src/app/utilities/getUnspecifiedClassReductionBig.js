import Big from 'big.js'

const getUnspecifiedClassReductionBig = (ldvSales, complianceRatio, zevClassARatio, supplierClass) => {
  const zeroBig = new Big(0)
  if (supplierClass === 'S' || isNaN(ldvSales) || isNaN(complianceRatio) || isNaN(zevClassARatio)) {
    return zeroBig
  }
  const ldvSalesBig = new Big(ldvSales)
  const complianceRatioBig = new Big(complianceRatio)
  const zevClassARatioBig = new Big(zevClassARatio)
  const ratioDifferenceBig = complianceRatioBig.minus(zevClassARatioBig)
  const productBig = ldvSalesBig.times(ratioDifferenceBig)
  if (productBig.lt(0)) {
    return zeroBig
  }
  return productBig.div(100)
}
  
export default getUnspecifiedClassReductionBig