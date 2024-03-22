import Big from 'big.js'

export const reduceFromBalanceBig = (balance, creditType, paramRemainingReduction) => {
  const bigZero = new Big(0)
  let remainingReduction = paramRemainingReduction
  const deduction = {
    creditA: bigZero,
    creditB: bigZero
  }
  const balanceType = creditType === 'A' ? 'creditA' : 'creditB'

  if ((balance[balanceType]).gte(remainingReduction)) {
    deduction[balanceType] = remainingReduction
    remainingReduction = bigZero
  } else {
    // if balance is less than the reduction value
    deduction[balanceType] = balance[balanceType]
    remainingReduction = remainingReduction.minus(balance[balanceType])
  }

  return {
    deduction,
    reduction: remainingReduction
  }
}

export const updateBalancesBig = (paramUpdatedBalances, balance, deduction) => {
  const updatedBalances = paramUpdatedBalances

  const balanceIndex = updatedBalances.findIndex(
    (each) => each.modelYear === balance.modelYear
  )

  if (balanceIndex >= 0) {
    updatedBalances[balanceIndex] = {
      ...updatedBalances[balanceIndex],
      creditA: (updatedBalances[balanceIndex].creditA).minus(deduction.creditA),
      creditB: (updatedBalances[balanceIndex].creditB).minus(deduction.creditB)
    }
  } else {
    updatedBalances.push({
      modelYear: balance.modelYear,
      creditA: (balance.creditA).minus(deduction.creditA),
      creditB: (balance.creditB).minus(deduction.creditB)
    })
  }
}

export const updateDeductionsBig = (paramDeductions, balance, deduction) => {
  const deductions = paramDeductions

  const index = deductions.findIndex(
    (each) =>
      each.modelYear === balance.modelYear &&
        each.type === 'unspecifiedReduction'
  )

  if (index >= 0) {
    deductions[index].creditA = (deductions[index].creditA).plus(deduction.creditA)
    deductions[index].creditB = (deductions[index].creditB).plus(deduction.creditB)
  } else {
    deductions.push({
      creditA: deduction.creditA,
      creditB: deduction.creditB,
      modelYear: balance.modelYear,
      type: 'unspecifiedReduction'
    })
  }
}

const calculateCreditReductionBig = (
  argBalances,
  classAReductions,
  unspecifiedReductions,
  radioId,
  carryOverDeficits
) => {
  const bigZero = new Big(0)
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
  let remainingReduction = bigZero

  classAReductions.forEach((reduction) => {
    remainingReduction = reduction.value

    // go through old balances first
    balances.forEach((balance, index) => {
      const deduction = {
        creditA: bigZero,
        creditB: bigZero,
        modelYear: balance.modelYear,
        type: 'classAReduction'
      }

      if (balance.creditA.gte(remainingReduction)) {
        deduction.creditA = remainingReduction

        const balanceIndex = updatedBalances.findIndex(
          (each) => each.modelYear === balance.modelYear
        )

        if (balanceIndex >= 0) {
          updatedBalances[balanceIndex] = {
            ...updatedBalances[balanceIndex],
            creditA: (updatedBalances[balanceIndex].creditA).minus(remainingReduction)
          }
        } else {
          updatedBalances.push({
            modelYear: balance.modelYear,
            creditA: (balance.creditA).minus(remainingReduction),
            creditB: balance.creditB
          })
        }

        remainingReduction = bigZero

        balances[index].creditA = (balances[index].creditA).minus(remainingReduction)
      } else {
        // if balance is less than the reduction value
        deduction.creditA = balance.creditA
        remainingReduction = remainingReduction.minus(balance.creditA)

        const balanceIndex = updatedBalances.findIndex(
          (each) => each.modelYear === balance.modelYear
        )

        if (balanceIndex >= 0) {
          updatedBalances[balanceIndex] = {
            ...updatedBalances[balanceIndex],
            creditA: bigZero
          }
        } else {
          updatedBalances.push({
            modelYear: balance.modelYear,
            creditA: bigZero,
            creditB: balance.creditB
          })
        }

        balances[index].creditA = bigZero
      }

      balances = updatedBalances

      if ((deduction.creditA).gt(bigZero)) {
        const deductionIndex = deductions.findIndex(
          (each) => Number(each.modelYear) === Number(deduction.modelYear)
        )

        if (deductionIndex >= 0) {
          deductions[deductionIndex].creditA = (deductions[deductionIndex].creditA).plus(deduction.creditA)
        } else {
          deductions.push(deduction)
        }
      }
    })

    if (remainingReduction.gt(bigZero)) {
      // deficit
      deficits.push({
        modelYear: reduction.modelYear,
        creditA: remainingReduction
      })
    }
  })

  remainingReduction = bigZero

  if (updatedBalances.length > 0) {
    balances = updatedBalances.map((each) => ({ ...each }))
  }

  if (radioId) {
    const secondaryReduction = radioId === 'A' ? 'B' : 'A'

    unspecifiedReductions.forEach((reduction) => {
      remainingReduction = reduction.value

      balances.forEach((balance) => {
        const { deduction, reduction: updatedReduction } = reduceFromBalanceBig(
          balance,
          radioId,
          remainingReduction
        )

        remainingReduction = updatedReduction

        updateDeductionsBig(deductions, balance, deduction)
        updateBalancesBig(updatedBalances, balance, deduction)
      })

      balances.forEach((balance) => {
        const { deduction, reduction: updatedReduction } = reduceFromBalanceBig(
          balance,
          secondaryReduction,
          remainingReduction
        )

        remainingReduction = updatedReduction

        updateDeductionsBig(deductions, balance, deduction)
        updateBalancesBig(updatedBalances, balance, deduction)
      })

      if (remainingReduction.gt(bigZero)) {
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
    if ((deficit.A).gt(bigZero) || (deficit.unspecified).gt(bigZero)) {
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

export default calculateCreditReductionBig
