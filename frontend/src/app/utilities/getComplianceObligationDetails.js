const getComplianceObligationDetails = (complianceResponseDetails) => {
  const creditBalanceStart = {};
  const creditBalanceEnd = {};
  const provisionalBalance = {};
  const pendingBalance = [];
  const transfersIn = [];
  const transfersOut = [];
  const creditsIssuedSales = [];
  let pendingBalanceExist = false;

  complianceResponseDetails.forEach((item) => {
    let endingBalanceA = 0;
    let endingBalanceB = 0;

    if (creditBalanceEnd[item.modelYear.name]) {
      endingBalanceA = creditBalanceEnd[item.modelYear.name].A;
      endingBalanceB = creditBalanceEnd[item.modelYear.name].B;
    }

    if (item.category === 'creditBalanceStart') {
      creditBalanceStart[item.modelYear.name] = {
        A: item.creditAValue,
        B: item.creditBValue,
      };

      endingBalanceA += Number(item.creditAValue);
      endingBalanceB += Number(item.creditBValue);
    }

    if (item.category === 'transfersIn') {
      transfersIn.push({
        modelYear: item.modelYear.name,
        A: item.creditAValue,
        B: item.creditBValue,
      });

      endingBalanceA += Number(item.creditAValue);
      endingBalanceB += Number(item.creditBValue);
    }

    if (item.category === 'transfersOut') {
      transfersOut.push({
        modelYear: item.modelYear.name,
        A: item.creditAValue,
        B: item.creditBValue,
      });

      endingBalanceA -= Number(item.creditAValue);
      endingBalanceB -= Number(item.creditBValue);
    }

    if (item.category === 'creditsIssuedSales') {
      creditsIssuedSales.push({
        modelYear: item.modelYear.name,
        A: item.creditAValue,
        B: item.creditBValue,
      });

      endingBalanceA += item.creditAValue;
      endingBalanceB += item.creditBValue;
    }

    if (item.category === 'pendingBalance') {
      if (item.creditAValue > 0 || item.creditBValue > 0) {
        pendingBalanceExist = true;
      }
      pendingBalance.push({
        modelYear: item.modelYear.name,
        A: item.creditAValue,
        B: item.creditBValue,
      });

      endingBalanceA += item.creditAValue;
      endingBalanceB += item.creditBValue;
    }

    creditBalanceEnd[item.modelYear.name] = {
      A: endingBalanceA,
      B: endingBalanceB,
    };
  });

  // go through every year in end balance and push to provisional
  Object.keys(creditBalanceEnd).forEach((item) => {
    provisionalBalance[item] = {
      A: Number(creditBalanceEnd[item].A),
      B: Number(creditBalanceEnd[item].B),
    };
  });

  // go through every item in pending and add to total if year already there or create new
  pendingBalance.forEach((item) => {
    if (provisionalBalance[item.modelYear]) {
      provisionalBalance[item.modelYear].A += Number(item.A);
      provisionalBalance[item.modelYear].B += Number(item.B);
    } else {
      provisionalBalance[item.modelYear] = {
        A: item.A,
        B: item.B,
      };
    }
  });

  return {
    creditBalanceEnd,
    creditBalanceStart,
    creditsIssuedSales,
    pendingBalance,
    pendingBalanceExist,
    provisionalBalance,
    transfersIn,
    transfersOut,
  };
};

export default getComplianceObligationDetails;
