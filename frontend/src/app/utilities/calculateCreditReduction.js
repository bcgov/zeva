const reduceFromBalance = (balance, creditType, paramRemainingReduction) => {
  let remainingReduction = paramRemainingReduction;
  const deduction = {
    creditA: 0,
    creditB: 0,
  };
  const primaryBalance = creditType === 'A' ? 'creditA' : 'creditB';
  const secondaryBalance = creditType === 'A' ? 'creditB' : 'creditA';

  if (balance[primaryBalance] >= remainingReduction) {
    deduction[primaryBalance] = remainingReduction;
    remainingReduction = 0;
  } else { // if balance is less than the reduction value
    deduction[primaryBalance] = balance[primaryBalance];
    remainingReduction -= balance[primaryBalance];
  }

  if (balance[secondaryBalance] >= remainingReduction) {
    deduction[secondaryBalance] = remainingReduction;
    remainingReduction = 0;
  } else { // if balance is less than the reduction value
    deduction[secondaryBalance] = balance[secondaryBalance];
    remainingReduction -= balance[secondaryBalance];
  }

  return {
    deduction,
    reduction: remainingReduction,
  };
};

const calculateCreditReduction = (
  argBalances, classAReductions, unspecifiedReductions, radioId,
) => {
  let balances = argBalances.map((each) => ({ ...each })); // clone the balances array

  balances.sort((a, b) => {
    if (a.modelYear < b.modelYear) {
      return -1;
    }

    if (a.modelYear > b.modelYear) {
      return 1;
    }

    return 0;
  });

  const deductions = [];
  const deficits = [];
  const updatedBalances = [];
  let remainingReduction = 0;

  classAReductions.forEach((reduction) => {
    remainingReduction = reduction.value;

    // go through old balances first
    balances.forEach((balance, index) => {
      const deduction = {
        creditA: 0,
        creditB: 0,
        modelYear: balance.modelYear,
        type: 'classAReduction',
      };

      if (balance.creditA >= remainingReduction) {
        deduction.creditA = remainingReduction;

        updatedBalances.push({
          modelYear: balance.modelYear,
          creditA: balance.creditA - remainingReduction,
          creditB: balance.creditB,
        });

        remainingReduction = 0;

        balances[index].creditA -= remainingReduction;
      } else { // if balance is less than the reduction value
        deduction.creditA = balance.creditA;
        remainingReduction -= balance.creditA;

        updatedBalances.push({
          modelYear: balance.modelYear,
          creditA: 0,
          creditB: balance.creditB,
        });

        balances[index].creditA = 0;
      }

      if (deduction.creditA > 0) {
        deductions.push(deduction);
      }
    });

    if (remainingReduction > 0) { // deficit
      deficits.push({
        modelYear: reduction.modelYear,
        creditA: remainingReduction,
      });
    }
  });

  remainingReduction = 0;

  if (updatedBalances.length > 0) {
    balances = updatedBalances.map((each) => ({ ...each }));
  }

  unspecifiedReductions.forEach((reduction) => {
    remainingReduction = reduction.value;

    balances.forEach((balance) => {
      const {
        deduction, reduction: updatedReduction,
      } = reduceFromBalance(balance, radioId, remainingReduction);

      remainingReduction = updatedReduction;

      const index = deductions.findIndex(
        (each) => each.modelYear === balance.modelYear
        && each.type === 'unspecifiedReduction',
      );

      if (index >= 0) {
        deductions[index].creditA += deduction.creditA;
        deductions[index].creditB += deduction.creditB;
      } else {
        deductions.push({
          creditA: deduction.creditA,
          creditB: deduction.creditB,
          modelYear: balance.modelYear,
          type: 'unspecifiedReduction',
        });
      }

      const balanceIndex = updatedBalances.findIndex(
        (each) => each.modelYear === balance.modelYear,
      );

      if (balanceIndex >= 0) {
        updatedBalances[balanceIndex] = {
          ...updatedBalances[balanceIndex],
          creditA: updatedBalances[balanceIndex].creditA - deduction.creditA,
          creditB: updatedBalances[balanceIndex].creditB - deduction.creditB,
        };
      } else {
        updatedBalances.push({
          modelYear: balance.modelYear,
          creditA: balance.creditA - deduction.creditA,
          creditB: balance.creditB - deduction.creditB,
        });
      }
    });

    if (remainingReduction > 0) {
      const index = deficits.findIndex((each) => each.modelYear === reduction.modelYear);

      if (index >= 0) {
        deficits[index].creditB = remainingReduction;
      } else {
        deficits.push({
          modelYear: reduction.modelYear,
          creditB: remainingReduction,
        });
      }
    }
  });

  return {
    balances: updatedBalances,
    deductions,
    deficits,
  };
};

export default calculateCreditReduction;
