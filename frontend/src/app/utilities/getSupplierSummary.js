const getSupplierSummary = (submission) => {

  const supplier1 = {
    currentBalanceA: submission.debitFrom.balance.A,
    currentBalanceB: submission.debitFrom.balance.B,
    newBalanceA: submission.debitFrom.balance.A,
    newBalanceB: submission.debitFrom.balance.B,
    supplierLabel: submission.debitFrom.name,
  };
  const supplier2 = {
    currentBalanceA: submission.creditTo.balance.A,
    currentBalanceB: submission.creditTo.balance.B,
    newBalanceA: submission.creditTo.balance.A,
    newBalanceB: submission.creditTo.balance.B,
    supplierLabel: submission.creditTo.name,
  };
  submission.creditTransferContent.forEach((item) => {
    if (item.creditClass.creditClass === 'A') {
      supplier1.newBalanceA -= (item.creditValue * item.dollarValue);
      supplier2.newBalanceA += (item.creditValue * item.dollarValue);
    }
    if (item.creditClass.creditClass === 'B') {
      supplier1.newBalanceB -= (item.creditValue * item.dollarValue);
      supplier2.newBalanceB += (item.creditValue * item.dollarValue);
    }
  });

  const summaryData = [supplier1, supplier2];
  return summaryData;
};

export default getSupplierSummary;
