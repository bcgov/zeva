import axios from 'axios';
import { now } from 'moment';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Loading from '../app/components/Loading';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ComplianceReportSummaryDetailsPage from './components/ComplianceReportSummaryDetailsPage';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
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
  const [assertions, setAssertions] = useState([]);
  
  const handleCheckboxClick = (event) => {
    if (!event.target.checked) {
      const checked = checkboxes.filter((each) => Number(each) !== Number(event.target.id));
      setCheckboxes(checked);
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(event.target.id);
      setCheckboxes(checked);
    }
  };
  const handleSubmit = (status) => {
    const data = {
      modelYearReportId: id,
      validation_status: status,
      confirmation: checkboxes
    };

    axios.patch(ROUTES_COMPLIANCE.REPORT_SUBMISSION, data).then((response) => {
      console.log('Report Submitted ', response);
    });
  };

  const reportStatuses = {
    assessment: '',
    consumerSales: '',
    creditActivity: '',
    reportSummary: 'draft',
    supplierInformation: '',
  };
  const refreshDetails = () => {
    setLoading(true);
    axios.all([
      axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)),
      axios.get(ROUTES_COMPLIANCE.RATIOS),
      axios.get(ROUTES_VEHICLES.VEHICLES_SALES),
      axios.get(ROUTES_COMPLIANCE.RETRIEVE_CONSUMER_SALES.replace(':id', id)),
      axios.get(ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID.replace(':id', id)),
    ]).then(axios.spread((
      reportDetailsResponse,
      allComplianceRatiosResponse,
      vehicleSalesResponse,
      consumerSalesResponse,
      creditActivityResponse,
    ) => {
      const {
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

      // SUPPLIER INFORMATION
      if (modelYearReportMakes) {
        const currentMakes = modelYearReportMakes.map((each) => (each.make));
        setMakes(currentMakes);
      }
      setSupplierDetails({
        organization: {
          name: organizationName,
          organizationAddress: modelYearReportAddresses,
        },
        supplierInformation: {
          history: modelYearReportHistory,
          validationStatus,
        },
      });
      // CONSUMER SALES
      let { supplierClass } = reportDetailsResponse.data;
      if (supplierClass === 'M') {
        supplierClass = 'Medium';
      } else if (supplierClass === 'L') {
        supplierClass = 'Large';
      } else {
        supplierClass = 'Small';
      }
      const year = reportDetailsResponse.data.modelYear.name;
      let pendingZevSales = 0;
      let zevSales = 0;
      vehicleSalesResponse.data.forEach((vehicle) => {
        pendingZevSales += vehicle.pendingSales;
        zevSales += vehicle.salesIssued;
      });
      let averageLdv3Years = 0;
      consumerSalesResponse.data.previousSales.forEach((each) => {
        averageLdv3Years += parseFloat(each.previousSales);
      });
      averageLdv3Years = formatNumeric((averageLdv3Years / 3), 2);
      setConsumerSalesDetails({
        ...consumerSalesDetails,
        pendingZevSales,
        zevSales,
        ldvSales: consumerSalesResponse.data.ldvSales,
        averageLdv3Years,
        year,
        supplierClass,
      });
      setComplianceRatios(allComplianceRatiosResponse.data
        .filter((each) => each.modelYear === year));

      // CREDIT ACTIVITY
      const creditBalanceStart = { year: '', A: 0, B: 0 };
      const creditBalanceEnd = { A: 0, B: 0 };
      const provisionalBalance = {};
      const pendingBalance = { A: 0, B: 0 };
      const transfersIn = { A: 0, B: 0 };
      const transfersOut = { A: 0, B: 0 };
      const creditsIssuedSales = { A: 0, B: 0 };
      const offsetNumbers = { A: 0, B: 0 };
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
        }
        if (item.category === 'provisionalBalance') {
          const aValue = parseFloat(item.creditAValue);
          const bValue = parseFloat(item.creditBValue);
          provisionalBalance.A += aValue;
          provisionalBalance.B += bValue;
        }
        if (item.category === 'pendingBalance') {
          const aValue = parseFloat(item.creditAValue);
          const bValue = parseFloat(item.creditBValue);
          pendingBalance.A += aValue;
          pendingBalance.B += bValue;
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
        creditBalanceStart,
        creditBalanceEnd,
        pendingBalance,
        provisionalBalance,
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
  }, []);
  if (loading) {
    return (<Loading />);
  }

  return (
    <>
      <ComplianceReportTabs
        active="summary"
        reportStatuses={reportStatuses}
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
      />

    </>
  );
};
ComplianceReportSummaryContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ComplianceReportSummaryContainer;
