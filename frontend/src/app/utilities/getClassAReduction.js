const getClassAReduction = (ldvSales, zevClassARatio, supplierClass = 'L') => {
  if (supplierClass !== 'L' || !ldvSales) {
    return 0;
  }

  const totalReduction = ldvSales * (zevClassARatio / 100);

  return totalReduction;
};

export default getClassAReduction;
