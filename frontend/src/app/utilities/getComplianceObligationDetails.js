import getNewProvisionalBalance from "./getNewProvisionalBalance"

const getComplianceObligationDetails = (complianceResponseDetails, creditOffsetSelection) => {
  const creditBalanceStart = {}
  const creditBalanceEnd = {}
  const provisionalProvisionalBalance = {}
  const pendingBalance = []
  const transfersIn = []
  const transfersOut = []
  const creditsIssuedSales = []
  const initiativeAgreement = []
  const purchaseAgreement = []
  const administrativeAllocation = []
  const administrativeReduction = []
  const automaticAdministrativePenalty = []
  const deficits = []
  const deficitCollection = {}
  let pendingBalanceExist = false

  complianceResponseDetails.forEach((item) => {
    let endingBalanceA = 0
    let endingBalanceB = 0
    let deficitA = 0
    let deficitB = 0

    if (creditBalanceEnd[item.modelYear.name]) {
      endingBalanceA = Number(creditBalanceEnd[item.modelYear.name].A)
      endingBalanceB = Number(creditBalanceEnd[item.modelYear.name].B)
    }

    if (item.category === 'creditBalanceStart') {
      creditBalanceStart[item.modelYear.name] = {
        A: Number(item.creditAValue),
        B: Number(item.creditBValue)
      }

      endingBalanceA += Number(item.creditAValue)
      endingBalanceB += Number(item.creditBValue)
    }

    if (item.category === 'deficit') {
      if (item.modelYear.name in creditBalanceStart) {
        creditBalanceStart[item.modelYear.name].A -= Number(item.creditAValue)
        creditBalanceStart[item.modelYear.name].B -= Number(item.creditBValue)
      } else {
        creditBalanceStart[item.modelYear.name] = {
          A: Number(item.creditAValue) * -1,
          B: Number(item.creditBValue) * -1
        }
      }

      deficitA -= Number(item.creditAValue)
      deficitB -= Number(item.creditBValue)
    }

    if (item.category === 'transfersIn') {
      transfersIn.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue)
      })

      endingBalanceA += Number(item.creditAValue)
      endingBalanceB += Number(item.creditBValue)
    }

    if (item.category === 'transfersOut') {
      transfersOut.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue)
      })

      endingBalanceA -= Number(item.creditAValue)
      endingBalanceB -= Number(item.creditBValue)
    }
    if (item.category === 'initiativeAgreement') {
      initiativeAgreement.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue)
      })
      endingBalanceA += Number(item.creditAValue)
      endingBalanceB += Number(item.creditBValue)
    }

    if (item.category === 'purchaseAgreement') {
      purchaseAgreement.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue)
      })
      endingBalanceA += Number(item.creditAValue)
      endingBalanceB += Number(item.creditBValue)
    }
    if (item.category === 'administrativeAllocation') {
      administrativeAllocation.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue)
      })
      endingBalanceA += Number(item.creditAValue)
      endingBalanceB += Number(item.creditBValue)
    }
    if (item.category === 'administrativeReduction') {
      administrativeReduction.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue)
      })
      endingBalanceA -= Number(item.creditAValue)
      endingBalanceB -= Number(item.creditBValue)
    }
    if (item.category === 'automaticAdministrativePenalty') {
      automaticAdministrativePenalty.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue)
      })
      endingBalanceA += Number(item.creditAValue)
      endingBalanceB += Number(item.creditBValue)
    }

    if (item.category === 'creditsIssuedSales') {
      const index = creditsIssuedSales.findIndex(
        (each) => each.modelYear === item.modelYear.name
      )
      if (index >= 0) {
        creditsIssuedSales[index].A += Number(item.creditAValue)
        creditsIssuedSales[index].B += Number(item.creditBValue)
      } else {
        creditsIssuedSales.push({
          modelYear: item.modelYear.name,
          A: Number(item.creditAValue),
          B: Number(item.creditBValue)
        })
      }

      endingBalanceA += Number(item.creditAValue)
      endingBalanceB += Number(item.creditBValue)
    }

    if (item.category === 'pendingBalance') {
      if (item.creditAValue > 0 || item.creditBValue > 0) {
        pendingBalanceExist = true
      }

      pendingBalance.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue)
      })
    }

    creditBalanceEnd[item.modelYear.name] = {
      A: Number(endingBalanceA),
      B: Number(endingBalanceB)
    }
    deficitCollection[item.modelYear.name] = {
      A: Number(deficitA),
      B: Number(deficitB)
    }
  })

  // go through every year in end balance and push to provisionalProvisionalBalance
  Object.keys(creditBalanceEnd).forEach((item) => {
    provisionalProvisionalBalance[item] = {
      A: Number(creditBalanceEnd[item].A),
      B: Number(creditBalanceEnd[item].B)
    }
  })

  // go through every item in pending and add to total if year already there or create new
  pendingBalance.forEach((item) => {
    if (provisionalProvisionalBalance[item.modelYear]) {
      provisionalProvisionalBalance[item.modelYear].A += Number(item.A)
      provisionalProvisionalBalance[item.modelYear].B += Number(item.B)
    } else {
      provisionalProvisionalBalance[item.modelYear] = {
        A: item.A,
        B: item.B
      }
    }
  })

  // calculate total deficits; total deficits are >= 0
  let totalDeficitA = 0
  let totalDeficitUnspecified = 0
  for (const balanceStart of Object.values(creditBalanceStart)) {
    if (balanceStart.A < 0) {
      totalDeficitA += balanceStart.A * -1
    }
    if (balanceStart.B < 0) {
      totalDeficitUnspecified += balanceStart.B * -1
    }
  }

  const provisionalBalance = getNewProvisionalBalance(provisionalProvisionalBalance, totalDeficitA, totalDeficitUnspecified, creditOffsetSelection)

  //add deficits to creditBalanceEnd
  Object.entries(deficitCollection).forEach(([modelYear, credits]) => {
    if (modelYear in creditBalanceEnd) {
      creditBalanceEnd[modelYear].A -= credits.A
      creditBalanceEnd[modelYear].B -= credits.B
    } else {
      creditBalanceEnd[modelYear] = {
        A: credits.A,
        B: credits.B
      }
    }
  })

  return {
    creditBalanceEnd,
    creditBalanceStart,
    creditsIssuedSales,
    deficits,
    pendingBalance,
    pendingBalanceExist,
    provisionalProvisionalBalance,
    provisionalBalance,
    transfersIn,
    transfersOut,
    initiativeAgreement,
    purchaseAgreement,
    administrativeAllocation,
    administrativeReduction,
    automaticAdministrativePenalty,
    totalDeficitA,
    totalDeficitUnspecified
  }
}

export default getComplianceObligationDetails
