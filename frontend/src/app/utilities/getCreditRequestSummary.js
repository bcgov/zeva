const getCreditRequestSummary = (items, validationStatus, user) => {
  const submitted = {
    a: 0,
    b: 0,
    sales: 0,
    label: validationStatus === 'DRAFT' ? 'Uploaded' : 'Submitted',
    creditsLabel: 'Applied for',
  };
  const eligible = {
    a: 0,
    b: 0,
    sales: 0,
    label: 'Eligible for Credits',
    creditsLabel: validationStatus === 'VALIDATED' ? 'Issued' : 'Recommended for Issuance',
  };
  const notEligible = {
    a: 0,
    b: 0,
    sales: 0,
    label: 'Not Eligible for Credits',
    creditsLabel: validationStatus === 'VALIDATED' ? 'Not Issued' : 'Not Recommended for Issuance',
  };
  items.forEach((item) => {
    submitted.sales += 1;
    let creditValue = 0;

    if (item.vehicle) {
      ({ creditValue } = item.vehicle);

      if (!creditValue || Number.isNaN(creditValue)) {
        creditValue = 0;
      }

      if (item.vehicle.creditClass === 'A') {
        submitted.a += creditValue;
      } else if (item.vehicle.creditClass === 'B') {
        submitted.b += creditValue;
      }
    }
    if (item.recordOfSale) {
      eligible.sales += 1;
      if (item.vehicle) {
        if (item.vehicle.creditClass === 'A') {
          eligible.a += creditValue;
        } else if (item.vehicle.creditClass === 'B') {
          eligible.b += creditValue;
        }
      }
    } else {
      notEligible.sales += 1;
      if (item.vehicle) {
        if (item.vehicle.creditClass === 'A') {
          notEligible.a += creditValue;
        } else if (item.vehicle.creditClass === 'B') {
          notEligible.b += creditValue;
        }
      }
    }
  });
  const summaryData = [submitted];
  if (validationStatus === 'VALIDATED' || (user.isGovernment && ['CHECKED', 'RECOMMEND_APPROVAL'].indexOf(validationStatus) >= 0)) {
    summaryData.push(eligible);
    summaryData.push(notEligible);
  }
  return summaryData;
};

export default getCreditRequestSummary;
