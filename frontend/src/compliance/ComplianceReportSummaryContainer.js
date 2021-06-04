import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CONFIG from '../app/config';
import history from '../app/History';
import Loading from '../app/components/Loading';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ComplianceReportSummaryDetailsPage from './components/ComplianceReportSummaryDetailsPage';
import formatNumeric from '../app/utilities/formatNumeric';
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';

const ComplianceReportSummaryContainer = (props) => {
  const { user } = props;
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [checkboxes, setCheckboxes] = useState([]);
  const [consumerSalesDetails, setConsumerSalesDetails] = useState({});
  const [complianceRatios, setComplianceRatios] = useState({});
  const [supplierDetails, setSupplierDetails] = useState({});
  const [makes, setMakes] = useState({});
  const [confirmationStatuses, setConfirmationStatuses] = useState({});
  const [creditActivityDetails, setCreditActivityDetails] = useState({});
  const [pendingBalanceExist, setPendingBalanceExist] = useState(false);
  const [modelYear, setModelYear] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR);
  const [assertions, setAssertions] = useState([]);

  const handleCheckboxClick = (event) => {
    if (!event.target.checked) {
      const checked = checkboxes.filter((each) => Number(each) !== Number(parseInt(event.target.id,10)));
      setCheckboxes(checked);
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(parseInt(event.target.id,10));
      setCheckboxes(checked);
    }
  };
  const handleSubmit = (status) => {
    const data = {
      modelYearReportId: id,
      validation_status: status,
      confirmation: checkboxes,
    };

    axios.patch(ROUTES_COMPLIANCE.REPORT_SUBMISSION, data).then((response) => {
      history.push(ROUTES_COMPLIANCE.REPORTS);
      history.replace(ROUTES_COMPLIANCE.REPORT_SUMMARY.replace(':id', id));
    });
  };

  const refreshDetails = () => {
    setLoading(true);
    axios.all([
      axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)),
      axios.get(ROUTES_COMPLIANCE.REPORT_SUMMARY_CONFIRMATION.replace(':id', id)),
      axios.get(ROUTES_COMPLIANCE.RATIOS),
      axios.get(ROUTES_COMPLIANCE.RETRIEVE_CONSUMER_SALES.replace(':id', id)),
      axios.get(ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID.replace(':id', id)),
    ]).then(axios.spread((
      reportDetailsResponse,
      summaryConfirmationResponse,
      allComplianceRatiosResponse,
      consumerSalesResponse,
      creditActivityResponse,
    ) => {
      const {
        avgSales,
        statuses,
        makes: modelYearReportMakes,
        modelYearReportAddresses,
        modelYearReportHistory,
        organizationName,
        validationStatus,
        confirmations,
        modelYear: reportModelYear,
      } = reportDetailsResponse.data;
      // ALL STATUSES
      setConfirmationStatuses(statuses);

      const year = parseInt(reportModelYear.name, 10);

      setModelYear(year);
      setCheckboxes(summaryConfirmationResponse.data.confirmation);

      // SUPPLIER INFORMATION
      if (modelYearReportMakes) {
        const currentMakes = modelYearReportMakes.map((each) => (each.make));
        setMakes(currentMakes);
      }
      setSupplierDetails({
        organization: {
          name: organizationName,
          avgLdvSales: avgSales,
          organizationAddress: modelYearReportAddresses,
        },
        supplierInformation: {
          history: modelYearReportHistory,
          validationStatus,
        },
      });
      // CONSUMER SALES
      let supplierClassText = '';
      let { supplierClass } = reportDetailsResponse.data;
      if (supplierClass === 'M') {
        supplierClass = 'Medium';
        supplierClassText = 'Medium Volume Supplier';
      } else if (supplierClass === 'L') {
        supplierClass = 'Large';
        supplierClassText = 'Large Volume Supplier';
      } else {
        supplierClass = 'Small';
        supplierClassText = 'Small Volume Supplier';
      }

      let pendingZevSales = 0;
      let zevSales = 0;
      consumerSalesResponse.data.vehicleList.forEach((vehicle) => {
        pendingZevSales += vehicle.pendingSales;
        zevSales += vehicle.salesIssued;
      });

      setConsumerSalesDetails({
        ...consumerSalesDetails,
        pendingZevSales,
        zevSales,
        year,
      });
      setComplianceRatios(allComplianceRatiosResponse.data
        .filter((each) => each.modelYear === year.toString()));

      // CREDIT ACTIVITY
      const creditBalanceStart = { year: '', A: 0, B: 0 };
      const creditBalanceEnd = { A: 0, B: 0 };
      const provisionalBalanceBeforeOffset = { A: 0, B: 0 };
      const provisionalBalanceAfterOffset = { A: 0, B: 0 };
      const pendingBalance = { A: 0, B: 0 };
      const transfersIn = { A: 0, B: 0 };
      const transfersOut = { A: 0, B: 0 };
      const creditsIssuedSales = { A: 0, B: 0 };
      const complianceOffsetNumbers = { A: 0, B: 0 };
      const { complianceOffset, ldvSales} = creditActivityResponse.data;
      // OFFSET
      if (complianceOffset) {
        complianceOffset.forEach((item) => {
          complianceOffsetNumbers.A += item.creditAOffsetValue;
          complianceOffsetNumbers.B += item.creditBOffsetValue;
          provisionalBalanceAfterOffset.A -= item.creditAOffsetValue;
          provisionalBalanceAfterOffset.B -= item.creditBOffsetValue;
        });
      }
      creditActivityResponse.data.complianceObligation.forEach((item) => {
        if (item.category === 'creditBalanceStart') {
          creditBalanceStart.year = item.modelYear.name;
          creditBalanceStart.A = item.creditAValue;
          creditBalanceStart.B = item.creditBValue;
        }
        if (item.category === 'creditBalanceEnd') {
          const aValue = parseFloat(item.creditAValue);
          const bValue = parseFloat(item.creditBValue);
          creditBalanceEnd.A += aValue;
          creditBalanceEnd.B += bValue;
          provisionalBalanceBeforeOffset.A += aValue;
          provisionalBalanceBeforeOffset.B += bValue;
          provisionalBalanceAfterOffset.A += aValue;
          provisionalBalanceAfterOffset.B += aValue;
        }
        if (item.category === 'pendingBalance') {
          const aValue = parseFloat(item.creditAValue);
          const bValue = parseFloat(item.creditBValue);
          pendingBalance.A += aValue;
          pendingBalance.B += bValue;
          provisionalBalanceBeforeOffset.A += aValue;
          provisionalBalanceBeforeOffset.B += bValue;
          provisionalBalanceAfterOffset.A += aValue;
          provisionalBalanceAfterOffset.B += bValue;
          if (pendingBalance.A > 0 || pendingBalance.B > 0) {
            setPendingBalanceExist(true);
          }
        }
        if (item.category === 'transfersIn') {
          const aValue = parseFloat(item.creditAValue);
          const bValue = parseFloat(item.creditBValue);
          transfersIn.A += aValue;
          transfersIn.B += bValue;
        }
        if (item.category === 'transfersOut') {
          const aValue = parseFloat(item.creditAValue);
          const bValue = parseFloat(item.creditBValue);
          transfersOut.A -= aValue;
          transfersOut.B -= bValue;
        }
        if (item.category === 'creditsIssuedSales') {
          const aValue = parseFloat(item.creditAValue);
          const bValue = parseFloat(item.creditBValue);
          creditsIssuedSales.A += aValue;
          creditsIssuedSales.B += bValue;
        }
      });
      setCreditActivityDetails({
        complianceOffsetNumbers,
        creditBalanceStart,
        creditBalanceEnd,
        pendingBalance,
        provisionalBalanceBeforeOffset,
        provisionalBalanceAfterOffset,
        supplierClass,
        supplierClassText,
        ldvSales,
        transactions: {
          creditsIssuedSales,
          transfersIn,
          transfersOut,
        },
      });
      setLoading(false);
    }));

    axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST).then((response) => {
      const filteredAssertions = response.data.filter((data) => data.module === 'compliance_summary');
      setAssertions(filteredAssertions);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [modelYear]);
  if (loading) {
    return (<Loading />);
  }

  return (
    <>
      <ComplianceReportTabs
        active="summary"
        reportStatuses={confirmationStatuses}
        id={id}
        user={user}
      />
      <ComplianceReportSummaryDetailsPage
        complianceRatios={complianceRatios}
        handleCheckboxClick={handleCheckboxClick}
        checkboxes={checkboxes}
        assertions={assertions}
        creditActivityDetails={creditActivityDetails}
        consumerSalesDetails={consumerSalesDetails}
        supplierDetails={supplierDetails}
        user={user}
        loading={loading}
        handleSubmit={handleSubmit}
        makes={makes}
        confirmationStatuses={confirmationStatuses}
        pendingBalanceExist={pendingBalanceExist}
        modelYear={modelYear}
      />

    </>
  );
};
ComplianceReportSummaryContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ComplianceReportSummaryContainer;
