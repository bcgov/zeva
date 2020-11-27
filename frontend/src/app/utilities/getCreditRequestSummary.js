const getCreditRequestSummary = (submission, validationStatus, user) => {
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

  submission.content.forEach((item) => {
    submitted.sales += item.sales;
    let creditValue = 0;

    if (item.vehicle) {
      ({ creditValue } = item.vehicle);

      if (!creditValue || Number.isNaN(creditValue)) {
        creditValue = 0;
      }

      if (item.vehicle.creditClass === 'A') {
        submitted.a += item.sales * creditValue;
      } else if (item.vehicle.creditClass === 'B') {
        submitted.b += item.sales * creditValue;
      }
    }

    let vinCount = 0;

    if (item.vehicle && item.vehicle.id) {
      const eligibleVins = submission.eligible.find((eligibleItem) => eligibleItem.vehicleId === item.vehicle.id);

      if (eligibleVins) {
        vinCount = eligibleVins.vinCount;
      }
    }

    eligible.sales += vinCount;

    if (item.vehicle) {
      if (item.vehicle.creditClass === 'A') {
        eligible.a += eligible.sales * creditValue;
      } else if (item.vehicle.creditClass === 'B') {
        eligible.b += eligible.sales * creditValue;
      }
    }

    notEligible.sales += item.sales - vinCount;

    if (item.vehicle) {
      if (item.vehicle.creditClass === 'A') {
        notEligible.a += notEligible.sales * creditValue;
      } else if (item.vehicle.creditClass === 'B') {
        notEligible.b += notEligible.sales * creditValue;
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
