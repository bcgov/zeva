const getClassAReduction = (ldvSales, zevClassARatio, supplierClass) => {
  if (supplierClass === 'S' || !ldvSales) {
    return 0
  }

  const totalReduction = Math.round(ldvSales * (zevClassARatio / 100) * 100) / 100

  return totalReduction
}

export default getClassAReduction
