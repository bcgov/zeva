const calculateCreditBalance = (balances, assessedBalances) => {
  const currentBalances = {}
  if (balances) {
    balances.forEach((balance) => {
      if (balance.modelYear?.name && balance.creditClass?.creditClass) {
        const modelYear = balance.modelYear.name
        const creditClass = balance.creditClass.creditClass
        const totalValue = isNaN(parseFloat(balance.totalValue)) ? 0 : parseFloat(balance.totalValue)
        if (creditClass === 'A' || creditClass === 'B') {
          if (!currentBalances[modelYear]) {
            currentBalances[modelYear] = {
              A: 0,
              B: 0
            }
          }
          currentBalances[modelYear][creditClass] = currentBalances[modelYear][creditClass] + totalValue
        }
      }
    })
  }

  const assessedDeficits = {}
  let deficitAExists = false
  let deficitBExists = false
  if (assessedBalances.deficits) {
    assessedBalances.deficits.forEach((deficit) => {
      const modelYear = deficit.modelYear
      const creditA = isNaN(parseFloat(deficit.creditA)) ? 0 : parseFloat(deficit.creditA)
      const creditB = isNaN(parseFloat(deficit.creditB)) ? 0 : parseFloat(deficit.creditB)
      if (creditA) {
        deficitAExists = true
      }
      if (creditB) {
        deficitBExists = true
      }
      if (!assessedDeficits[modelYear]) {
        assessedDeficits[modelYear] = {
          A: 0,
          B: 0
        }
      }
      assessedDeficits[modelYear].A = assessedDeficits[modelYear].A + (-1 * creditA)
      assessedDeficits[modelYear].B = assessedDeficits[modelYear].B + (-1 * creditB)
    })
  }

  if ((deficitAExists || deficitBExists) && Object.keys(assessedDeficits).length === 1) {
    const key = Object.keys(assessedDeficits)[0]
    assessedDeficits['Deficit from last assessment'] = assessedDeficits[key]
    delete assessedDeficits[key]
  }

  const bCreditsInCaseOfDeficit = {}
  if (deficitAExists && !deficitBExists) {
    if (assessedBalances.balances) {
      assessedBalances.balances.forEach((balance) => {
        const modelYear = balance.modelYear
        const creditB = isNaN(parseFloat(balance.creditB)) ? 0 : parseFloat(balance.creditB)
        if (creditB) {
          if (!bCreditsInCaseOfDeficit[modelYear]) {
            bCreditsInCaseOfDeficit[modelYear] = {
              A: 0,
              B: 0
            }
          }
          bCreditsInCaseOfDeficit[modelYear].B = bCreditsInCaseOfDeficit[modelYear].B + creditB
        }
      })
    }
  }

  const assessedCredits = {}
  if (!(deficitAExists || deficitBExists)) {
    if (assessedBalances.balances) {
      assessedBalances.balances.forEach((balance) => {
        const modelYear = balance.modelYear
        const creditA = isNaN(parseFloat(balance.creditA)) ? 0 : parseFloat(balance.creditA)
        const creditB = isNaN(parseFloat(balance.creditB)) ? 0 : parseFloat(balance.creditB)
        if (!assessedCredits[modelYear]) {
          assessedCredits[modelYear] = {
            A: 0,
            B: 0
          }
        }
        assessedCredits[modelYear].A = assessedCredits[modelYear].A + creditA
        assessedCredits[modelYear].B = assessedCredits[modelYear].B + creditB
      })
    }
  }

  const totalCredits = {}
  if (deficitAExists || deficitBExists) {
    totalCredits['Total Current LDV Credits - Your total balance cannot be calculated due to having an assessed deficit.'] = {
      A: 0,
      B: 0
    }
  } else {
    let totalA = 0
    let totalB = 0
    const structures = [currentBalances, assessedCredits]
    structures.forEach((structure) => {
      for (const [key, creditsAandB] of Object.entries(structure)) {
        if (!totalCredits[key]) {
          totalCredits[key] = {
            A: 0,
            B: 0
          }
        }
        totalCredits[key].A = totalCredits[key].A + creditsAandB.A
        totalCredits[key].B = totalCredits[key].B + creditsAandB.B
        totalA = totalA + creditsAandB.A
        totalB = totalB + creditsAandB.B
      }
    })
    totalCredits['Total Current LDV Credits'] = {
      A: totalA,
      B: totalB
    }
  }

  return {
    assessedCredits,
    assessedDeficits,
    bCreditsInCaseOfDeficit,
    currentBalances,
    deficitAExists,
    deficitBExists,
    totalCredits
  }
}

export default calculateCreditBalance
