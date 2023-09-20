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
  const deficitCollection = {}
  let pendingBalanceExist = false

  complianceResponseDetails.forEach((item) => {
    let endingBalanceA = 0
    let endingBalanceB = 0

    if (creditBalanceEnd[item.modelYear.name]) {
      endingBalanceA = Number(creditBalanceEnd[item.modelYear.name].A)
      endingBalanceB = Number(creditBalanceEnd[item.modelYear.name].B)
    }

    // if some value in creditBalanceStart is < 0, assume it is in deficits
    if (item.category === 'creditBalanceStart') {
      const startA = Number(item.creditAValue)
      const startB = Number(item.creditBValue)
      if (startA >= 0 || startB >= 0) {
        if (item.modelYear.name in creditBalanceStart) {
          creditBalanceStart[item.modelYear.name].A += (startA >= 0 ? startA : 0)
          creditBalanceStart[item.modelYear.name].B += (startB >= 0 ? startB : 0)
        } else {
          creditBalanceStart[item.modelYear.name] = {
            A: startA >= 0 ? startA : 0,
            B: startB >= 0 ? startB : 0
          }
        }
        endingBalanceA += (startA >= 0 ? startA : 0)
        endingBalanceB += (startB >= 0 ? startB : 0)
      }
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

      if (item.modelYear.name in deficitCollection) {
        deficitCollection[item.modelYear.name].A += Number(item.creditAValue)
        deficitCollection[item.modelYear.name].unspecified += Number(item.creditBValue)
      } else {
        deficitCollection[item.modelYear.name] = {
          A: Number(item.creditAValue),
          unspecified: Number(item.creditBValue)
        }
      }
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

  const { provisionalBalance, reductionsToOffsetDeficit, carryOverDeficits } = getNewProvisionalBalance(provisionalProvisionalBalance, deficitCollection, creditOffsetSelection)

  //add deficits to creditBalanceEnd
  Object.entries(deficitCollection).forEach(([modelYear, deficits]) => {
    if (modelYear in creditBalanceEnd) {
      creditBalanceEnd[modelYear].A -= deficits.A
      creditBalanceEnd[modelYear].B -= deficits.unspecified
    } else {
      creditBalanceEnd[modelYear] = {
        A: deficits.A * -1,
        B: deficits.unspecified * -1
      }
    }
  })

  return {
    creditBalanceEnd,
    creditBalanceStart,
    creditsIssuedSales,
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
    deficitCollection,
    reductionsToOffsetDeficit,
    carryOverDeficits
  }
}

export default getComplianceObligationDetails
