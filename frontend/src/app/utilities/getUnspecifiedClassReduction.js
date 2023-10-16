const getUnspecifiedClassReduction = (_totalReduction, _classAReduction, supplierClass) => {
  const totalReduction = String(_totalReduction).replace(/,/g, '')
  const classAReduction = String(_classAReduction).replace(/,/g, '')

  if (isNaN(totalReduction) || isNaN(classAReduction) || supplierClass === 'S') {
    return 0
  }

  let unspecifiedReduction = Math.round(Number(totalReduction) * 100) / 100
  unspecifiedReduction -= Math.round(Number(classAReduction) * 100) / 100
  unspecifiedReduction = Math.round(unspecifiedReduction * 100) / 100

  return unspecifiedReduction
}

export default getUnspecifiedClassReduction