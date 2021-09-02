const getUnspecifiedClassReduction = (_totalReduction, _classAReduction) => {
  const totalReduction = String(_totalReduction).replace(/,/g, '');
  const classAReduction = String(_classAReduction).replace(/,/g, '');

  if (isNaN(totalReduction) || isNaN(classAReduction)) {
    return 0;
  }

  let unspecifiedReduction = Number(totalReduction);
  unspecifiedReduction -= Number(classAReduction);

  return unspecifiedReduction;
};

export default getUnspecifiedClassReduction;
