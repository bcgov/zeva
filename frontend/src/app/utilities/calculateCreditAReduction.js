const calculateCreditAReduction = (
  supplierClass, classAReduction, provisionalBalance, reportYear,
) => {
  let provisionalBalanceCurrentYearA = 0;
  let provisionalBalanceLastYearA = 0;
  let creditADeficit = 0;
  let remainingABalance = {};
  let zevClassACreditReduction = false;

  Object.keys(provisionalBalance).forEach((each) => {
    const modelYear = Number(each);
    if (modelYear === reportYear) {
      provisionalBalanceCurrentYearA = Number(provisionalBalance[each].A);
    }
    if (modelYear === reportYear - 1) {
      provisionalBalanceLastYearA = Number(provisionalBalance[each].A);
    }
  });

  if (supplierClass === 'L') {
    let lastYearReduction = 0;
    let currentYearReduction = 0;

    // Perform ZEV Class A reduction first for older year then current year.
    if (provisionalBalanceLastYearA > 0
      && classAReduction >= provisionalBalanceLastYearA) {
      lastYearReduction = provisionalBalanceLastYearA;
    }
    if (provisionalBalanceLastYearA > 0 && classAReduction < provisionalBalanceLastYearA) {
      lastYearReduction = classAReduction;
    }

    const remainingReduction = classAReduction - lastYearReduction;

    if (provisionalBalanceCurrentYearA > 0
      && remainingReduction <= provisionalBalanceCurrentYearA) {
      currentYearReduction = remainingReduction;
    }
    if (provisionalBalanceCurrentYearA >= 0
      && remainingReduction > provisionalBalanceCurrentYearA) {
      currentYearReduction = provisionalBalanceCurrentYearA;
      creditADeficit = (remainingReduction - provisionalBalanceCurrentYearA);
    }

    zevClassACreditReduction = {
      lastYearA: Number(lastYearReduction),
      currentYearA: Number(currentYearReduction),
    };

    remainingABalance = {
      lastYearABalance: Number(provisionalBalanceLastYearA) - Number(lastYearReduction),
      currentYearABalance: Number(provisionalBalanceCurrentYearA) - Number(currentYearReduction),
      creditADeficit: Number(creditADeficit),
    };
  } else {
    remainingABalance = {
      lastYearABalance: Number(provisionalBalanceLastYearA),
      currentYearABalance: Number(provisionalBalanceCurrentYearA),
      creditADeficit: Number(creditADeficit),
    };
  }

  return {
    remainingABalance,
    zevClassACreditReduction,
  };
};

export default calculateCreditAReduction;
