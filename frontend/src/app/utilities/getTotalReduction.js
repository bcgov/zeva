import formatNumeric from './formatNumeric';

const getTotalReduction = (ldvSales, complianceRatio) => {
  if (!ldvSales || isNaN(ldvSales)) {
    return formatNumeric(0, 2);
  }

  const totalReduction = ldvSales * (complianceRatio / 100);

  return formatNumeric(totalReduction, 2);
};

export default getTotalReduction;
