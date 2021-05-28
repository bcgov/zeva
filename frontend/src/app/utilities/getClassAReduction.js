import formatNumeric from './formatNumeric';

const getClassAReduction = (ldvSales, zevClassARatio, supplierClass = 'L') => {
  if (supplierClass !== 'L' || !ldvSales) {
    return formatNumeric(0, 2);
  }

  const totalReduction = ldvSales * (zevClassARatio / 100);

  return formatNumeric(totalReduction, 2);
};

export default getClassAReduction;
