import Big from 'big.js'

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
  const bigZero = new Big(0)
  Object.keys(deficits).forEach((year) => {
    const deficitA = deficits[year].A
    const deficitUnspecified = deficits[year].unspecified
    const deficitAPositive = (deficitA instanceof Big) ? deficitA.gt(bigZero) : deficitA > 0
    const deficitUnspecifiedPositive = (deficitUnspecified instanceof Big) ? deficitUnspecified.gt(bigZero) : deficitUnspecified > 0
    if (deficitAPositive || deficitUnspecifiedPositive) {
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
