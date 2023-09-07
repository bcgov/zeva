const getTotalReduction = (ldvSales, complianceRatio, supplierClass) => {
  if (!ldvSales || isNaN(ldvSales) || supplierClass === 'S') {
    return 0
  }

  const totalReduction = Math.round(ldvSales * (complianceRatio / 100) * 100) / 100

  return totalReduction
}

export default getTotalReduction
