import calculateCreditReduction, {
  reduceFromBalance,
  updateBalances,
  updateDeductions
} from '../calculateCreditReduction'

describe('reduceFromBalance', () => {
  it('should return 0 reduction when balance is 0', () => {
    const balance = { creditA: 0, creditB: 0 }
    const creditType = 'A'
    const remainingReduction = 50

    const result = reduceFromBalance(balance, creditType, remainingReduction)

    expect(result.deduction).toEqual({ creditA: 0, creditB: 0 })
    expect(result.reduction).toBe(50)
  })

  it('should deduct from creditA when creditType is A', () => {
    const balance = { creditA: 100, creditB: 25 }
    const creditType = 'A'
    const remainingReduction = 50

    const result = reduceFromBalance(balance, creditType, remainingReduction)

    expect(result.deduction).toEqual({ creditA: 50, creditB: 0 })
    expect(result.reduction).toBe(0)
  })

  it('should deduct from creditB when creditType is B', () => {
    const balance = { creditA: 25, creditB: 100 }
    const creditType = 'B'
    const remainingReduction = 50

    const result = reduceFromBalance(balance, creditType, remainingReduction)

    expect(result.deduction).toEqual({ creditA: 0, creditB: 50 })
    expect(result.reduction).toBe(0)
  })

  it('should deduct entire balance when remainingReduction is greater than balance', () => {
    const balance = { creditA: 25, creditB: 50 }
    const creditType = 'B'
    const remainingReduction = 100

    const result = reduceFromBalance(balance, creditType, remainingReduction)

    expect(result.deduction).toEqual({ creditA: 0, creditB: 50 })
    expect(result.reduction).toBe(50)
  })
})

describe('updateBalances', () => {
  it('should update existing balance', () => {
    const updatedBalances = [
      { modelYear: 2020, creditA: 100, creditB: 50 },
      { modelYear: 2021, creditA: 200, creditB: 100 }
    ]
    const balance = { modelYear: 2020, creditA: 100, creditB: 50 }
    const deduction = { creditA: 25, creditB: 10 }

    updateBalances(updatedBalances, balance, deduction)

    expect(updatedBalances).toEqual([
      { modelYear: 2020, creditA: 75, creditB: 40 },
      { modelYear: 2021, creditA: 200, creditB: 100 }
    ])
  })

  it('should add new balance when it does not exist', () => {
    const updatedBalances = [
      { modelYear: 2020, creditA: 100, creditB: 50 },
      { modelYear: 2021, creditA: 200, creditB: 100 }
    ]
    const balance = { modelYear: 2022, creditA: 50, creditB: 25 }
    const deduction = { creditA: 10, creditB: 5 }

    updateBalances(updatedBalances, balance, deduction)

    expect(updatedBalances).toEqual([
      { modelYear: 2020, creditA: 100, creditB: 50 },
      { modelYear: 2021, creditA: 200, creditB: 100 },
      { modelYear: 2022, creditA: 40, creditB: 20 }
    ])
  })
})

describe('updateDeductions', () => {
  it('should update existing deduction', () => {
    const deductions = [
      { modelYear: 2020, creditA: 100, creditB: 50, type: 'unspecifiedReduction' },
      { modelYear: 2021, creditA: 200, creditB: 100, type: 'unspecifiedReduction' }
    ]
    const balance = { modelYear: 2020 }
    const deduction = { creditA: 25, creditB: 10 }
    updateDeductions(deductions, balance, deduction)

    expect(deductions).toEqual([
      { modelYear: 2020, creditA: 125, creditB: 60, type: 'unspecifiedReduction' },
      { modelYear: 2021, creditA: 200, creditB: 100, type: 'unspecifiedReduction' }
    ])
  })

  it('should add new deduction when it does not exist', () => {
    const deductions = [
      { modelYear: 2020, creditA: 100, creditB: 50, type: 'unspecifiedReduction' },
      { modelYear: 2021, creditA: 200, creditB: 100, type: 'unspecifiedReduction' }
    ]
    const balance = { modelYear: 2022 }
    const deduction = { creditA: 10, creditB: 5 }
    updateDeductions(deductions, balance, deduction)

    expect(deductions).toEqual([
      { modelYear: 2020, creditA: 100, creditB: 50, type: 'unspecifiedReduction' },
      { modelYear: 2021, creditA: 200, creditB: 100, type: 'unspecifiedReduction' },
      { modelYear: 2022, creditA: 10, creditB: 5, type: 'unspecifiedReduction' }
    ])
  })
})

describe('calculateCreditReduction', () => {
  it('should return values with only 2 decimal places', () => {
    const balances = [
      { modelYear: 2020, creditA: 50, creditB: 25 },
      { modelYear: 2021, creditA: 20, creditB: 30 },
      { modelYear: 2022, creditA: 50, creditB: 40 }
    ]

    const classAReductions = [
      { modelYear: 2020, value: 60 },
      { modelYear: 2021, value: 10 }
    ]

    const unspecifiedReductions = [
      { modelYear: 2021, value: 10 },
      { modelYear: 2022, value: 15 }
    ]

    const radioId = 'A'

    const result = calculateCreditReduction(balances, classAReductions, unspecifiedReductions, radioId, {})

    result.balances.forEach((balance) => {
      expect(balance.creditA).toBeCloseTo(balance.creditA, 2)
      expect(balance.creditB).toBeCloseTo(balance.creditB, 2)
    })

    result.deductions.forEach((deduction) => {
      expect(deduction.creditA).toBeCloseTo(deduction.creditA, 2)
      expect(deduction.creditB).toBeCloseTo(deduction.creditB, 2)
    })

    result.deficits.forEach((deficit) => {
      expect(deficit.creditA).toBeCloseTo(deficit.creditA, 2)
    })
  })
})
