const getTotalReduction = (ldvSales, complianceRatio) => {
  if (!ldvSales || isNaN(ldvSales)) {
    return 0
  }

  const totalReduction = Math.round(ldvSales * (complianceRatio / 100) * 100) / 100

  return totalReduction
}

export default getTotalReduction
