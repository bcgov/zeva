const getSupplierSummary = (submission) => {
  const initiatingSupplier = {
    currentBalanceA: parseFloat(submission.debitFrom.balance.A),
    currentBalanceB: parseFloat(submission.debitFrom.balance.B),
    newBalanceA: parseFloat(submission.debitFrom.balance.A),
    newBalanceB: parseFloat(submission.debitFrom.balance.B),
    supplierLabel: submission.debitFrom.name
  }
  const receivingSupplier = {
    currentBalanceA: parseFloat(submission.creditTo.balance.A),
    currentBalanceB: parseFloat(submission.creditTo.balance.B),
    newBalanceA: parseFloat(submission.creditTo.balance.A),
    newBalanceB: parseFloat(submission.creditTo.balance.B),
    supplierLabel: submission.creditTo.name
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
