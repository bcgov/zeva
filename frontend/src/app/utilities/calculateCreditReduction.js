export const reduceFromBalance = (balance, creditType, paramRemainingReduction) => {
  let remainingReduction = paramRemainingReduction
  const deduction = {
    creditA: 0,
    creditB: 0
  }
  const balanceType = creditType === 'A' ? 'creditA' : 'creditB'

  if (balance[balanceType] >= remainingReduction) {
    deduction[balanceType] = remainingReduction
    remainingReduction = 0
  } else {
    // if balance is less than the reduction value
    deduction[balanceType] = balance[balanceType]
    remainingReduction -= balance[balanceType]
  }

  return {
    deduction,
    reduction: remainingReduction
  }
}

export const updateBalances = (paramUpdatedBalances, balance, deduction) => {
  const updatedBalances = paramUpdatedBalances

  const balanceIndex = updatedBalances.findIndex(
    (each) => each.modelYear === balance.modelYear
  )

  if (balanceIndex >= 0) {
    updatedBalances[balanceIndex] = {
      ...updatedBalances[balanceIndex],
      creditA: updatedBalances[balanceIndex].creditA - deduction.creditA,
      creditB: updatedBalances[balanceIndex].creditB - deduction.creditB
    }
  } else {
    updatedBalances.push({
      modelYear: balance.modelYear,
      creditA: balance.creditA - deduction.creditA,
      creditB: balance.creditB - deduction.creditB
    })
  }
}

export const updateDeductions = (paramDeductions, balance, deduction) => {
  const deductions = paramDeductions

  const index = deductions.findIndex(
    (each) =>
      each.modelYear === balance.modelYear &&
      each.type === 'unspecifiedReduction'
  )

  if (index >= 0) {
    deductions[index].creditA += deduction.creditA
    deductions[index].creditB += deduction.creditB
  } else {
    deductions.push({
      creditA: deduction.creditA,
      creditB: deduction.creditB,
      modelYear: balance.modelYear,
      type: 'unspecifiedReduction'
    })
  }
}

const calculateCreditReduction = (
  argBalances,
  classAReductions,
  unspecifiedReductions,
  radioId,
  carryOverDeficits
) => {
  let balances = argBalances.map((each) => ({ ...each })) // clone the balances array

  balances.sort((a, b) => {
    if (a.modelYear < b.modelYear) {
      return -1
    }

    if (a.modelYear > b.modelYear) {
      return 1
    }

    return 0
  })

  const deductions = []
  const deficits = []
  const updatedBalances = []
  let remainingReduction = 0

  classAReductions.forEach((reduction) => {
    remainingReduction = reduction.value

    // go through old balances first
    balances.forEach((balance, index) => {
      const deduction = {
        creditA: 0,
        creditB: 0,
        modelYear: balance.modelYear,
        type: 'classAReduction'
      }

      if (balance.creditA >= remainingReduction) {
        deduction.creditA = remainingReduction

        const balanceIndex = updatedBalances.findIndex(
          (each) => each.modelYear === balance.modelYear
        )

        if (balanceIndex >= 0) {
          updatedBalances[balanceIndex] = {
            ...updatedBalances[balanceIndex],
            creditA: Math.round((updatedBalances[balanceIndex].creditA - remainingReduction) * 100) / 100
          }
        } else {
          updatedBalances.push({
            modelYear: balance.modelYear,
            creditA: Math.round((balance.creditA - remainingReduction) * 100) / 100,
            creditB: balance.creditB
          })
        }

        remainingReduction = 0

        balances[index].creditA -= remainingReduction
      } else {
        // if balance is less than the reduction value
        deduction.creditA = balance.creditA
        remainingReduction = Math.round((remainingReduction - balance.creditA) * 100) / 100

        const balanceIndex = updatedBalances.findIndex(
          (each) => each.modelYear === balance.modelYear
        )

        if (balanceIndex >= 0) {
          updatedBalances[balanceIndex] = {
            ...updatedBalances[balanceIndex],
            creditA: 0
          }
        } else {
          updatedBalances.push({
            modelYear: balance.modelYear,
            creditA: 0,
            creditB: balance.creditB
          })
        }

        balances[index].creditA = 0
      }

      balances = updatedBalances

      if (deduction.creditA > 0) {
        const deductionIndex = deductions.findIndex(
          (each) => Number(each.modelYear) === Number(deduction.modelYear)
        )

        if (deductionIndex >= 0) {
          deductions[deductionIndex].creditA += deduction.creditA
        } else {
          deductions.push(deduction)
        }
      }
    })

    if (remainingReduction > 0) {
      // deficit
      deficits.push({
        modelYear: reduction.modelYear,
        creditA: remainingReduction
      })
    }
  })

  remainingReduction = 0

  if (updatedBalances.length > 0) {
    balances = updatedBalances.map((each) => ({ ...each }))
  }

  if (radioId) {
    const secondaryReduction = radioId === 'A' ? 'B' : 'A'

    unspecifiedReductions.forEach((reduction) => {
      remainingReduction = reduction.value

      balances.forEach((balance) => {
        const { deduction, reduction: updatedReduction } = reduceFromBalance(
          balance,
          radioId,
          remainingReduction
        )

        remainingReduction = updatedReduction

        updateDeductions(deductions, balance, deduction)
        updateBalances(updatedBalances, balance, deduction)
      })

      balances.forEach((balance) => {
        const { deduction, reduction: updatedReduction } = reduceFromBalance(
          balance,
          secondaryReduction,
          remainingReduction
        )

        remainingReduction = updatedReduction

        updateDeductions(deductions, balance, deduction)
        updateBalances(updatedBalances, balance, deduction)
      })

      if (remainingReduction > 0) {
        const index = deficits.findIndex(
          (each) => each.modelYear === reduction.modelYear
        )

        if (index >= 0) {
          deficits[index].creditB = remainingReduction
        } else {
          deficits.push({
            modelYear: reduction.modelYear,
            creditB: remainingReduction
          })
        }
      }
    })
  }

  for (const [modelYear, deficit] of Object.entries(carryOverDeficits)) {
    if (deficit.A > 0 || deficit.unspecified > 0) {
      deficits.push({
        modelYear,
        creditA: deficit.A,
        creditB: deficit.unspecified
      })
    }
  }

  return {
    balances: updatedBalances,
    deductions,
    deficits
  }
}

export default calculateCreditReduction
