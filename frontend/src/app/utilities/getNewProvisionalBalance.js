const getNewProvisionalBalance = (provisionalProvisionalBalance, totalDeficitA, totalDeficitUnspecified, creditOffsetSelection) => {
    const provisionalBalance = getBalancesCopy(provisionalProvisionalBalance)
  
    // offset A deficit first
    offset(provisionalBalance, totalDeficitA, 'A')
  
    // offset unspecified deficit according to creditOffsetSelection
    if (!creditOffsetSelection || creditOffsetSelection === 'B') {
      offset(provisionalBalance, totalDeficitUnspecified, 'B')
      offset(provisionalBalance, totalDeficitUnspecified, 'A')
    } else {
      offset(provisionalBalance, totalDeficitUnspecified, 'A')
      offset(provisionalBalance, totalDeficitUnspecified, 'B')
    }
    return provisionalBalance
  }

  // reduces balances accordingly; the "balances" parameter should be an object where the keys are model years (for the sake of iteration order) and values are of the type {A: number, B: number}
const offset = (balances, deficit, creditType) => {
    let runningPositiveBalance = 0
    Object.values(balances).forEach((credits) => {
      if (credits[creditType] > 0) {
        runningPositiveBalance += credits[creditType]
        if (runningPositiveBalance <= deficit) {
          credits[creditType] = 0
        } else {
          credits[creditType] = runningPositiveBalance - deficit
        }
      }
    })
  }
  
  // the "balances" parameter should be an object where the values are of the type {A: primitive of type Number, B: primitive of type Number}
  const getBalancesCopy = (balances) => {
    const result = {}
    Object.entries(balances).forEach(([key, credits]) => {
      result[key] = {...credits}
    })
    return result
  }

  export default getNewProvisionalBalance