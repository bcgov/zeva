const getComplianceYear = (date) => {
  let dateObject = date
  if (typeof date === 'string') {
    dateObject = new Date(date)
  }
  const month = dateObject.getMonth()
  // 9 is October
  let result = dateObject.getFullYear()
  if (month < 9) {
    result = result - 1
  }
  return result
}

export default getComplianceYear
