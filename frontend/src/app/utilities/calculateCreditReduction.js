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
  balances, classAReductions, unspecifiedReductions, radioId,
) => {
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
  let remainingReduction = 0;
  const deficits = [];

  classAReductions.forEach((reduction) => {
    remainingReduction = reduction.value;

    // go through old balances first
    balances.forEach((balance) => {
      const deduction = {
        modelYear: balance.modelYear,
        creditA: 0,
        creditB: 0,
      };

      if (balance.creditA >= remainingReduction) {
        deduction.creditA = remainingReduction;
        remainingReduction = 0;
      } else { // if balance is less than the reduction value
        deduction.creditA = balance.creditA;
        remainingReduction -= balance.creditA;
      }

      deductions.push(deduction);
    });

    if (remainingReduction > 0) { // deficit
      deficits.push({
        modelYear: reduction.modelYear,
        creditA: remainingReduction,
      });
    }
  });

  remainingReduction = 0;

  unspecifiedReductions.forEach((reduction) => {
    remainingReduction = reduction.value;

    balances.forEach((balance) => {
      const { deduction, reduction: updatedReduction } = reduceFromBalance(balance, radioId, remainingReduction);

      remainingReduction = updatedReduction;

      const index = deductions.findIndex((each) => each.modelYear === balance.modelYear);

      if (index >= 0) {
        deductions[index].creditA += deduction.creditA;
        deductions[index].creditB += deduction.creditB;
      } else {
        deductions.push({
          modelYear: balance.modelYear,
          creditA: deduction.creditA,
          creditB: deduction.creditB,
        });
      }
    });

    if (remainingReduction > 0) {
      deficits.push({
        modelYear: reduction.modelYear,
        creditB: remainingReduction,
      });
    }
  });

  console.error('deductions');
  console.error(deductions);
  console.error('deficits');
  console.error(deficits);

  return {
    creditBalance: 0,
    unspecifiedReductions: 0,
    zevClassAReduction: 0,
  };
};

export default calculateCreditReduction;
