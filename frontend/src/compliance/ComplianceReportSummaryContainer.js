import axios from 'axios';
import { now } from 'moment';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Loading from '../app/components/Loading';
import { useParams } from 'react-router-dom';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ComplianceReportSummaryDetailsPage from './components/ComplianceReportSummaryDetailsPage';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import formatNumeric from '../app/utilities/formatNumeric';

const ComplianceReportSummaryContainer = (props) => {
  const { user } = props;
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [checkboxes, setCheckboxes] = useState([]);
  const [consumerSalesDetails, setConsumerSalesDetails] = useState({});
  const [complianceRatios, setComplianceRatios] = useState({});
  const [supplierDetails, setSupplierDetails] = useState({});
  const [makes, setMakes] = useState({});
  const [creditActivityDetails, setCreditActivityDetails] = useState({})
  const [assertions, setAssertions] = useState([{ id: 0, description: 'On behalf of [insert supplier name], I confirm the information included in this Model Year report is complete and accurate' }]);
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
  // const creditsIssuedDetails = {
  //   startingBalance: { A: 0, B: 0 },
  //   endingBalance: { A: 1513.09, B: 191.29 },
  //   creditsIssuedSales:
  //     [
  //       {
  //         year: 2020,
  //         A: 359.12,
  //         B: 43.43,
  //       },
  //       {
  //         year: 2019,
  //         A: 1367.43,
  //         B: 347.86,
  //       },
  //     ],
  //   creditsIssuedInitiative:
  //     [{
  //       year: 2019,
  //       A: 286.54,
  //     }],
  //   creditsIssuedPurchase: [
  //     {
  //       year: 2020,
  //       A: 100.00,
  //     },
  //   ],
  //   creditsTransferredIn: [
  //     {
  //       year: 2020,
  //       A: 200.00,
  //     },
  //   ],
  //   creditsTransferredAway: [
  //     {
  //       year: 2020,
  //       A: -800.00,
  //       B: -200.00,
  //     },
  //   ],
  //   pendingSales: [
  //     {
  //       year: 2020,
  //       A: 246.67,
  //       B: 0,
  //     },
  //   ],
  //   provisionalBalance: [
  //     {
  //       year: 2020,
  //       A: 1192.33,
  //       B: 43.43,
  //     },
  //     {
  //       year: 2019,
  //       A: 567.43,
  //       B: 147.86,
  //     },
  //   ],
  //   creditOffset: [
  //     {
  //       year: 2019,
  //       A: -300,
  //       B: -100,
  //     },
  //     {
  //       year: 2020,
  //       A: -458.71,
  //       B: -91.29,
  //     },
  //   ],
  //   provisionalAssessedBalance: [
  //     {
  //       year: 2019,
  //       A: 754.38,
  //       B: 0,
  //     },
  //     {
  //       year: 2020,
  //       A: 0,
  //       B: 0,
  //     },
  //   ],
  // };
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
      // SUPPLIER INFORMATION
      const {
        makes: modelYearReportMakes,
        modelYearReportAddresses,
        modelYearReportHistory,
        organizationName,
        validationStatus,
        confirmations,
        modelYear: reportModelYear,
      } = reportDetailsResponse.data;
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
      const creditBalanceStart = {};
      const creditBalanceEnd = {};
      const provisionalBalance = {};
      const pendingBalance = {};
      const transfersIn = [];
      const transfersOut = [];
      const creditsIssuedSales = [];
      const offsetNumbers = [];
      creditActivityResponse.data.forEach((item) => {
        if (item.category === 'creditBalanceStart') {
          creditBalanceStart[item.modelYear.name] = { A: item.creditAValue, B: item.creditBValue };
        }
        if (item.category === 'creditBalanceEnd') {
          creditBalanceEnd[item.modelYear.name] = { A: item.creditAValue, B: item.creditBValue };
        }
        if (item.category === 'provisionalBalance') {
          provisionalBalance[item.modelYear.name] = { A: parseFloat(item.creditAValue), B: parseFloat(item.creditBValue) };
        }
        if (item.category === 'pendingBalance') {
          pendingBalance[item.modelYear.name] = { A: item.creditAValue, B: item.creditBValue };
        }
        if (item.category === 'transfersIn') {
          transfersIn.push({ modelYear: item.modelYear.name, A: item.creditAValue, B: item.creditBValue });
        }
        if (item.category === 'transfersOut') {
          transfersOut.push({ modelYear: item.modelYear.name, A: item.creditAValue, B: item.creditBValue });
        }
        if (item.category === 'creditsIssuedSales') {
          creditsIssuedSales.push({ modelYear: item.modelYear.name, A: item.creditAValue, B: item.creditBValue });
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
        year="2020"
        makes={makes}
      />

    </>
  );
};
ComplianceReportSummaryContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ComplianceReportSummaryContainer;
