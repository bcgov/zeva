import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../app/components/Loading';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import ComplianceCalculatorDetailsPage from './components/ComplianceCalculatorDetailsPage';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import ROUTES_VEHICLES from '../app/routes/Vehicles';

const LDVSalesContainer = (props) => {
  const { user } = props;
  const [supplierSize, setSupplierSize] = useState('');
  const [selectedOption, setSelectedOption] = useState('--');
  const [complianceInfo, setComplianceInfo] = useState('');
  const [complianceRatios, setComplianceRatios] = useState({});
  const [modelYearList, setModelYearList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [complianceNumbers, setComplianceNumbers] = useState({ total: 0, classA: 0, remaining: 0 });
  const handleSalesChange = (event) => {
    const { value } = event.target;
    setComplianceNumbers({ total: value, classA: value, remaining: value });
  };
  const handleYearChange = (event) => {
    const { id, value } = event.target;
    setSelectedOption(value);
    setComplianceInfo(complianceRatios.filter((each) => each.modelYear === value)[0]);
  };
  const refreshDetails = () => {
    axios.all([
      axios.get(ROUTES_VEHICLES.YEARS),
      axios.get(ROUTES_COMPLIANCE.RATIOS),
    ]).then(axios.spread((modelYearResponse, complianceRatiosResponse) => {
      setModelYearList(modelYearResponse.data);
      setComplianceRatios(complianceRatiosResponse.data);
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
      <ComplianceTabs active="calculator" user={user} />
      <ComplianceCalculatorDetailsPage
        user={user}
        supplierSize={supplierSize}
        setSupplierSize={setSupplierSize}
        complianceInfo={complianceInfo}
        modelYearList={modelYearList}
        handleYearChange={handleYearChange}
        selectedOption={selectedOption}
        handleSalesChange={handleSalesChange}
        complianceNumbers={complianceNumbers}
      />
    </>
  );
};
LDVSalesContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default LDVSalesContainer;
