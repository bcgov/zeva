import Big from 'big.js'

const getClassAReductionBig = (ldvSales, zevClassARatio, supplierClass = "L") => {
  if (supplierClass !== 'L' || isNaN(ldvSales) || isNaN(zevClassARatio)) {
    return new Big(0)
  }
  const ldvSalesBig = new Big(ldvSales)
  const zevClassARatioBig = new Big(zevClassARatio)
  return ldvSalesBig.times(zevClassARatioBig).div(100)
}
  
export default getClassAReductionBig