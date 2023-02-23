const getTotalReduction = (ldvSales, complianceRatio) => {
  if (!ldvSales || isNaN(ldvSales)) {
    return 0
  }

  const totalReduction = ldvSales * (complianceRatio / 100)

  return totalReduction
}

export default getTotalReduction
