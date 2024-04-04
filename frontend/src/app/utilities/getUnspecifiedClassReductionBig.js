import Big from 'big.js'

const getUnspecifiedClassReductionBig = (ldvSales, complianceRatio, zevClassARatio, supplierClass) => {
  const zeroBig = new Big(0)
  if (supplierClass === 'S' || isNaN(ldvSales) || isNaN(complianceRatio) || isNaN(zevClassARatio)) {
    return zeroBig
  }
  const ldvSalesBig = new Big(ldvSales)
  const complianceRatioBig = new Big(complianceRatio)
  const zevClassARatioBig = new Big(zevClassARatio)
  let reduction = ldvSalesBig.times(complianceRatioBig)
  if (supplierClass === 'L') {
    reduction = reduction.minus(ldvSalesBig.times(zevClassARatioBig))
  }
  return reduction.div(100)
}
  
export default getUnspecifiedClassReductionBig