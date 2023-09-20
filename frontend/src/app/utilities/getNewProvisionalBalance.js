const getNewProvisionalBalance = (provisionalProvisionalBalance, deficitCollection, creditOffsetSelection) => {
  const provisionalBalance = getBalancesCopy(provisionalProvisionalBalance)
  const deficitBalances = getBalancesCopy(deficitCollection)

  // offset A deficit first
  offset(provisionalBalance, deficitBalances, 'A', 'A')

  // offset unspecified deficit according to creditOffsetSelection
  if (!creditOffsetSelection || creditOffsetSelection === 'B') {
    offset(provisionalBalance, deficitBalances, 'B', 'unspecified')
    offset(provisionalBalance, deficitBalances, 'A', 'unspecified')
  } else {
    offset(provisionalBalance, deficitBalances, 'A', 'unspecified')
    offset(provisionalBalance, deficitBalances, 'B', 'unspecified')
  }
  const reductionsToOffsetDeficit = getReductions(provisionalProvisionalBalance, provisionalBalance)
  return {
    provisionalBalance,
    reductionsToOffsetDeficit,
    carryOverDeficits: deficitBalances
  }
}

// the "balances" parameter should be an object where the values are of the type {A: primitive of type Number, B: primitive of type Number}
const getBalancesCopy = (balances) => {
  const result = {}
  Object.entries(balances).forEach(([key, credits]) => {
    result[key] = { ...credits }
  })
  return result
}

// reduces balances accordingly; the "balances" and "deficitBalances" parameters should be objects where the keys are model years (for the sake of iteration order) 
// and values of "balances" are of the type {A: number, B: number}
// and values of "deficitBalances" are of the type {A: number >= 0, unspecified: number >= 0}
const offset = (balances, deficitBalances, creditType, deficitType) => {
  let totalCredit = 0
  let totalDeficit = 0
  for (const units of Object.values(balances)) {
    if (units[creditType] > 0) {
      totalCredit += units[creditType]
    }
  }
  for (const deficits of Object.values(deficitBalances)) {
    totalDeficit += deficits[deficitType]
  }

  if (totalCredit === totalDeficit) {
    for (const units of Object.values(balances)) {
      if (units[creditType] > 0) {
        units[creditType] = 0
      }
    }
    for (const deficits of Object.values(deficitBalances)) {
      deficits[deficitType] = 0
    }
  } else if (totalCredit < totalDeficit) {
    for (const units of Object.values(balances)) {
      if (units[creditType] > 0) {
        units[creditType] = 0
      }
    }
    let runningDeficit = 0
    for (const deficits of Object.values(deficitBalances)) {
      runningDeficit += deficits[deficitType]
      if (runningDeficit < totalCredit) {
        deficits[deficitType] = 0
      } else {
        deficits[deficitType] = runningDeficit - totalCredit
        break
      }
    }
  } else if (totalCredit > totalDeficit) {
    for (const deficits of Object.values(deficitBalances)) {
      deficits[deficitType] = 0
    }
    let runningCredit = 0
    for (const units of Object.values(balances)) {
      if (units[creditType] > 0) {
        runningCredit += units[creditType]
        if (runningCredit < totalDeficit) {
          units[creditType] = 0
        } else {
          units[creditType] = runningCredit - totalDeficit
          break
        }
      }
    }
  }
}

// "initialBalances" should be objects whose values are of the type {A: number, B: number}
// "endingBalances" should be objects whose values are of the type {A: number, B: number}
const getReductions = (initialBalances, endingBalances) => {
  const result = {}
  for (const [modelYear, balance] of Object.entries(initialBalances)) {
    let reductionA = 0
    let reductionB = 0
    const initialBalanceA = balance.A
    const initialBalanceB = balance.B
    const endingBalanceA = endingBalances[modelYear] ? endingBalances[modelYear].A : Number.POSITIVE_INFINITY
    const endingBalanceB = endingBalances[modelYear] ? endingBalances[modelYear].B : Number.POSITIVE_INFINITY
    if (initialBalanceA > 0 && endingBalanceA >= 0 && initialBalanceA > endingBalanceA) {
      reductionA = initialBalanceA - endingBalanceA
    }
    if (initialBalanceB > 0 && endingBalanceB >= 0 && initialBalanceB > endingBalanceB) {
      reductionB = initialBalanceB - endingBalanceB
    }
    if (reductionA || reductionB) {
      result[modelYear] = {
        A: reductionA,
        B: reductionB
      }
    }
  }
  return result
}

export default getNewProvisionalBalance
