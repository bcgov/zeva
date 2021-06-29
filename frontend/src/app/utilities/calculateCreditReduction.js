const calculateCreditReduction = (
  radioId, supplierClass, classAReduction, provisionalBalance, ldvSales, filteredRatio, reportYear,
) => {
  let provisionalBalanceCurrentYearA = 0;
  let provisionalBalanceCurrentYearB = 0;
  let provisionalBalanceLastYearA = 0;
  let provisionalBalanceLastYearB = 0;
  let zevClassAReduction = false;

  Object.keys(provisionalBalance).forEach((each) => {
    const modelYear = Number(each);
    if (modelYear === reportYear) {
      provisionalBalanceCurrentYearA = Number(provisionalBalance[each].A);
    }
    if (modelYear === reportYear - 1) {
      provisionalBalanceLastYearA = Number(provisionalBalance[each].A);
    }
  });
  let lastYearABalance = 0;
  let currentYearABalance = 0;
  let tempCreditADeficit = 0;

  if (supplierClass === 'L') {
    let lastYearReduction = 0;
    let currentYearReduction = 0;

    // Perform ZEV Class A reduction first for older year then current year.
    if (provisionalBalanceLastYearA > 0 && classAReduction >= provisionalBalanceLastYearA) {
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
      tempCreditADeficit = (remainingReduction - provisionalBalanceCurrentYearA);
    }

    zevClassAReduction = {
      lastYearA: Number((lastYearReduction)),
      currentYearA: Number(currentYearReduction),
    };

    lastYearABalance = provisionalBalanceLastYearA - lastYearReduction;
    currentYearABalance = provisionalBalanceCurrentYearA - currentYearReduction;
  } else {
    lastYearABalance = provisionalBalanceLastYearA;
    currentYearABalance = provisionalBalanceCurrentYearA;
  }

  const totalReduction = ((filteredRatio.complianceRatio / 100) * ldvSales);
  const leftoverReduction = ((filteredRatio.complianceRatio / 100) * ldvSales)
    - ((filteredRatio.zevClassA / 100) * ldvSales);

  const unspecifiedZevClassReduction = supplierClass === 'L' ? leftoverReduction : totalReduction;
  let unspecifiedZevClassCurrentYearA = 0;
  let unspecifiedZevClassCurrentYearB = 0;
  let unspecifiedZevClassLastYearA = 0;
  let unspecifiedZevClassLastYearB = 0;
  let remainingUnspecifiedReduction = 0;
  let unspecifiedCreditDeficit = 0;

  Object.keys(provisionalBalance).forEach((each) => {
    const modelYear = Number(each);
    if (modelYear === reportYear) {
      provisionalBalanceCurrentYearA = Number(provisionalBalance[each].A);
      provisionalBalanceCurrentYearB = Number(provisionalBalance[each].B);
    }
    if (modelYear === reportYear - 1) {
      provisionalBalanceLastYearA = Number(provisionalBalance[each].A);
      provisionalBalanceLastYearB = Number(provisionalBalance[each].B);
    }
  });

  if (radioId === 'A') {
    // Reduce older year's A credits first then older year's B.
    if (lastYearABalance > 0 && lastYearABalance >= unspecifiedZevClassReduction) {
      unspecifiedZevClassLastYearA = unspecifiedZevClassReduction;
    }

    if (lastYearABalance > 0 && lastYearABalance < unspecifiedZevClassReduction) {
      unspecifiedZevClassLastYearA = lastYearABalance;
      remainingUnspecifiedReduction = unspecifiedZevClassReduction - unspecifiedZevClassLastYearA;

      if (remainingUnspecifiedReduction > 0 && provisionalBalanceLastYearB > 0) {
        if (provisionalBalanceLastYearB >= remainingUnspecifiedReduction) {
          unspecifiedZevClassLastYearB = remainingUnspecifiedReduction;
        }

        if (provisionalBalanceLastYearB < remainingUnspecifiedReduction) {
          unspecifiedZevClassLastYearB = provisionalBalanceLastYearB;
        }
      }
    }

    if (lastYearABalance === 0 && provisionalBalanceLastYearB > 0
      && unspecifiedZevClassReduction >= provisionalBalanceLastYearB) {
      unspecifiedZevClassLastYearB = provisionalBalanceLastYearB;
    }
    // Reduce current year's A credits first then current year's B.
    remainingUnspecifiedReduction = unspecifiedZevClassReduction
      - (unspecifiedZevClassLastYearA + unspecifiedZevClassLastYearB);

    if (currentYearABalance > 0 && currentYearABalance >= remainingUnspecifiedReduction) {
      unspecifiedZevClassCurrentYearA = remainingUnspecifiedReduction;
    }

    if (currentYearABalance === 0 && provisionalBalanceCurrentYearB > 0
      && remainingUnspecifiedReduction >= provisionalBalanceCurrentYearB) {
      unspecifiedZevClassCurrentYearB = provisionalBalanceCurrentYearB;

      if (remainingUnspecifiedReduction > provisionalBalanceCurrentYearB) {
        unspecifiedCreditDeficit = remainingUnspecifiedReduction - provisionalBalanceCurrentYearB;
      }
    }

    if (currentYearABalance > 0 && currentYearABalance < remainingUnspecifiedReduction) {
      unspecifiedZevClassCurrentYearA = currentYearABalance;
      const unspecifieldBalance = unspecifiedZevClassReduction - unspecifiedZevClassCurrentYearA;

      if (unspecifieldBalance > 0 && provisionalBalanceCurrentYearB > 0) {
        if (provisionalBalanceCurrentYearB >= unspecifieldBalance) {
          unspecifiedZevClassCurrentYearB = unspecifieldBalance;
        }

        if (provisionalBalanceCurrentYearB < unspecifieldBalance) {
          unspecifiedZevClassLastYearB = unspecifieldBalance - provisionalBalanceLastYearB;
        }
      }
    }
  }

  if (radioId === 'B') {
    // Reduce older year's B credits first then older year's A.
    if (provisionalBalanceLastYearB > 0) {
      if (provisionalBalanceLastYearB >= unspecifiedZevClassReduction) {
        unspecifiedZevClassLastYearB = unspecifiedZevClassReduction;
      }

      if (provisionalBalanceLastYearB < unspecifiedZevClassReduction) {
        unspecifiedZevClassLastYearB = provisionalBalanceLastYearB;
        remainingUnspecifiedReduction = unspecifiedZevClassReduction - unspecifiedZevClassLastYearB;

        if (remainingUnspecifiedReduction > 0
          && lastYearABalance > 0 && lastYearABalance >= remainingUnspecifiedReduction) {
          unspecifiedZevClassLastYearA = remainingUnspecifiedReduction;
        }

        if (remainingUnspecifiedReduction > 0
          && lastYearABalance > 0 && lastYearABalance < remainingUnspecifiedReduction) {
          unspecifiedZevClassLastYearA = lastYearABalance;
        }
      }
    }

    if (provisionalBalanceLastYearB === 0
      && lastYearABalance >= 0 && unspecifiedZevClassReduction >= lastYearABalance) {
      unspecifiedZevClassLastYearA = lastYearABalance;
    }

    // Reduce current year's B credits first then current year's A.
    remainingUnspecifiedReduction = unspecifiedZevClassReduction
      - (unspecifiedZevClassLastYearA + unspecifiedZevClassLastYearB);

    if (provisionalBalanceCurrentYearB >= 0
      && provisionalBalanceCurrentYearB >= remainingUnspecifiedReduction) {
      unspecifiedZevClassCurrentYearB = remainingUnspecifiedReduction;
    }

    if (provisionalBalanceCurrentYearB === 0) {
      if (currentYearABalance >= 0) {
        if (currentYearABalance >= remainingUnspecifiedReduction) {
          unspecifiedZevClassCurrentYearA = remainingUnspecifiedReduction;
        }

        if (remainingUnspecifiedReduction >= currentYearABalance) {
          unspecifiedZevClassCurrentYearA = currentYearABalance;
          remainingUnspecifiedReduction -= unspecifiedZevClassCurrentYearA;
        }
      }
    }

    if (provisionalBalanceCurrentYearB > 0
      && provisionalBalanceCurrentYearB < remainingUnspecifiedReduction) {
      unspecifiedZevClassCurrentYearB = provisionalBalanceCurrentYearB;
      const unspecifieldBalance = unspecifiedZevClassReduction - (
        unspecifiedZevClassLastYearA
        + unspecifiedZevClassLastYearB
        + unspecifiedZevClassCurrentYearB
      );

      if (unspecifieldBalance > 0 && currentYearABalance > 0) {
        if (currentYearABalance >= unspecifieldBalance) {
          unspecifiedZevClassCurrentYearA = unspecifieldBalance;
        }

        if (currentYearABalance < unspecifieldBalance) {
          unspecifiedZevClassCurrentYearA = unspecifieldBalance - currentYearABalance;
        }
      }
    }
  }

  const ratioBalance = unspecifiedZevClassReduction
    - (unspecifiedZevClassLastYearA
      + unspecifiedZevClassLastYearB
      + unspecifiedZevClassCurrentYearB
      + unspecifiedZevClassCurrentYearA);
  if (ratioBalance > 0) {
    unspecifiedCreditDeficit = ratioBalance;
  }

  const unspecifiedReductions = {
    currentYearA: unspecifiedZevClassCurrentYearA,
    currentYearB: unspecifiedZevClassCurrentYearB,
    lastYearA: unspecifiedZevClassLastYearA,
    lastYearB: unspecifiedZevClassLastYearB,
  };

  const creditBalance = {
    A: (currentYearABalance - unspecifiedZevClassCurrentYearA),
    B: (provisionalBalanceCurrentYearB - (unspecifiedZevClassCurrentYearB)),
    lastYearA: lastYearABalance - unspecifiedZevClassLastYearA,
    lastYearB: provisionalBalanceLastYearB - unspecifiedZevClassLastYearB,
    creditADeficit: tempCreditADeficit,
    unspecifiedCreditDeficit,
  };

  return {
    creditBalance,
    unspecifiedReductions,
    zevClassAReduction,
  };
};

export default calculateCreditReduction;
