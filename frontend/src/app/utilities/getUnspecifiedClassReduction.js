import formatNumeric from './formatNumeric';

const getUnspecifiedClassReduction = (_totalReduction, _classAReduction) => {
  const totalReduction = String(_totalReduction).replace(/,/g, '');
  const classAReduction = String(_classAReduction).replace(/,/g, '');

  if (isNaN(totalReduction) || isNaN(classAReduction)) {
    return formatNumeric(0, 2);
  }

  let unspecifiedReduction = Number(totalReduction);
  unspecifiedReduction -= Number(classAReduction);

  return formatNumeric(unspecifiedReduction, 2);
};

export default getUnspecifiedClassReduction;
