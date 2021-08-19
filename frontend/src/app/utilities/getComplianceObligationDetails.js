const getComplianceObligationDetails = (complianceResponseDetails) => {
  const creditBalanceStart = {};
  const creditBalanceEnd = {};
  const provisionalBalance = {};
  const pendingBalance = [];
  const transfersIn = [];
  const transfersOut = [];
  const creditsIssuedSales = [];
  const initiativeAgreement = [];
  const purchaseAgreement = [];
  const administrativeAllocation = [];
  const administrativeReduction = [];
  const automaticAdministrativePenalty = [];
  const deficits = [];
  let pendingBalanceExist = false;

  complianceResponseDetails.forEach((item) => {
    let endingBalanceA = 0;
    let endingBalanceB = 0;

    if (creditBalanceEnd[item.modelYear.name]) {
      endingBalanceA = Number(creditBalanceEnd[item.modelYear.name].A);
      endingBalanceB = Number(creditBalanceEnd[item.modelYear.name].B);
    }

    if (item.category === 'creditBalanceStart') {
      creditBalanceStart[item.modelYear.name] = {
        A: Number(item.creditAValue),
        B: Number(item.creditBValue),
      };

      endingBalanceA += Number(item.creditAValue);
      endingBalanceB += Number(item.creditBValue);
    }

    if (item.category === 'deficit') {
      if (item.modelYear.name in creditBalanceStart) {
        creditBalanceStart[item.modelYear.name].A -= Number(item.creditAValue);
        creditBalanceStart[item.modelYear.name].B -= Number(item.creditBValue);
      } else {
        creditBalanceStart[item.modelYear.name] = {
          A: Number(item.creditAValue) * -1,
          B: Number(item.creditBValue) * -1,
        };
      }

      endingBalanceA -= Number(item.creditAValue);
      endingBalanceB -= Number(item.creditBValue);
    }

    if (item.category === 'transfersIn') {
      transfersIn.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue),
      });

      endingBalanceA += Number(item.creditAValue);
      endingBalanceB += Number(item.creditBValue);
    }

    if (item.category === 'transfersOut') {
      transfersOut.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue),
      });

      endingBalanceA -= Number(item.creditAValue);
      endingBalanceB -= Number(item.creditBValue);
    }
    if (item.category === 'initiativeAgreement') {
      initiativeAgreement.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue),
      });
      endingBalanceA += Number(item.creditAValue);
      endingBalanceB += Number(item.creditBValue);
    }

    if (item.category === 'purchaseAgreement') {
      purchaseAgreement.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue),
      });
      endingBalanceA += Number(item.creditAValue);
      endingBalanceB += Number(item.creditBValue);
    }
    if (item.category === 'administrativeAllocation') {
      administrativeAllocation.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue),
      });
      endingBalanceA += Number(item.creditAValue);
      endingBalanceB += Number(item.creditBValue);
    }
    if (item.category === 'administrativeReduction') {
      administrativeReduction.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue),
      });
      endingBalanceA -= Number(item.creditAValue);
      endingBalanceB -= Number(item.creditBValue);
    }
    if (item.category === 'automaticAdministrativePenalty') {
      automaticAdministrativePenalty.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue),
      });
      endingBalanceA += Number(item.creditAValue);
      endingBalanceB += Number(item.creditBValue);
    }

    if (item.category === 'creditsIssuedSales') {
      const index = creditsIssuedSales.findIndex((each) => each.modelYear === item.modelYear.name);
      if (index >= 0) {
        creditsIssuedSales[index].A += Number(item.creditAValue);
        creditsIssuedSales[index].B += Number(item.creditBValue);
      } else {
        creditsIssuedSales.push({
          modelYear: item.modelYear.name,
          A: Number(item.creditAValue),
          B: Number(item.creditBValue),
        });
      }

      endingBalanceA += Number(item.creditAValue);
      endingBalanceB += Number(item.creditBValue);
    }

    if (item.category === 'pendingBalance') {
      if (item.creditAValue > 0 || item.creditBValue > 0) {
        pendingBalanceExist = true;
      }

      pendingBalance.push({
        modelYear: item.modelYear.name,
        A: Number(item.creditAValue),
        B: Number(item.creditBValue),
      });
    }

    creditBalanceEnd[item.modelYear.name] = {
      A: Number(endingBalanceA),
      B: Number(endingBalanceB),
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
    deficits,
    pendingBalance,
    pendingBalanceExist,
    provisionalBalance,
    transfersIn,
    transfersOut,
    initiativeAgreement,
    purchaseAgreement,
    administrativeAllocation,
    administrativeReduction,
    automaticAdministrativePenalty,
  };
};

export default getComplianceObligationDetails;
