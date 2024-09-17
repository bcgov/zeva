const getSupplierSummary = (submission, orgBalances) => {
  const initiatingSupplier = {
    currentBalanceA: parseFloat(orgBalances.debitFrom.balance.A),
    currentBalanceB: parseFloat(orgBalances.debitFrom.balance.B),
    newBalanceA: parseFloat(orgBalances.debitFrom.balance.A),
    newBalanceB: parseFloat(orgBalances.debitFrom.balance.B),
    supplierLabel: orgBalances.debitFrom.name
  }
  const receivingSupplier = {
    currentBalanceA: parseFloat(orgBalances.creditTo.balance.A),
    currentBalanceB: parseFloat(orgBalances.creditTo.balance.B),
    newBalanceA: parseFloat(orgBalances.creditTo.balance.A),
    newBalanceB: parseFloat(orgBalances.creditTo.balance.B),
    supplierLabel: orgBalances.creditTo.name
  }
  submission.creditTransferContent.forEach((item) => {
    if (item.creditClass.creditClass === 'A') {
      initiatingSupplier.newBalanceA -= parseFloat(item.creditValue)
      receivingSupplier.newBalanceA += parseFloat(item.creditValue)
    }
    if (item.creditClass.creditClass === 'B') {
      initiatingSupplier.newBalanceB -= parseFloat(item.creditValue)
      receivingSupplier.newBalanceB += parseFloat(item.creditValue)
    }
  })

  const summaryData = [initiatingSupplier, receivingSupplier]
  return summaryData
}

export default getSupplierSummary
