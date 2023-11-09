const getNewBalancesStructure = (balances) => {
  const result = []
  Object.keys(balances).forEach((year) => {
    const { A: creditA, B: creditB } = balances[year]
    result.push({
      modelYear: Number(year),
      creditA,
      creditB
    })
  })
  return result
}

const getNewDeficitsStructure = (deficits) => {
  const result = []
  Object.keys(deficits).forEach((year) => {
    const deficitA = deficits[year].A
    const deficitUnspecified = deficits[year].unspecified
    if (deficitA > 0 || deficitUnspecified > 0) {
      result.push({
        modelYear: Number(year),
        creditA: deficitA,
        creditB: deficitUnspecified
      })
    }
  })
  return result
}

export { getNewBalancesStructure, getNewDeficitsStructure }
