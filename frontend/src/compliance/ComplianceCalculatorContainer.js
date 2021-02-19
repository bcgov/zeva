import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../app/components/Loading';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import ComplianceCalculatorDetailsPage from './components/ComplianceCalculatorDetailsPage';
import ComplianceCalculatorModelTable from './components/ComplianceCalculatorModelTable';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import ROUTES_VEHICLES from '../app/routes/Vehicles';

const LDVSalesContainer = (props) => {
  const { user } = props;
  const [selectedYearOption, setSelectedYearOption] = useState('--');
  const [supplierSize, setSupplierSize] = useState('');
  const [totalSales, setTotalSales] = useState('');
  const [complianceYearInfo, setComplianceYearInfo] = useState({});
  const [allComplianceRatios, setAllComplianceRatios] = useState({});
  const [modelYearList, setModelYearList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allVehicleModels, setAllVehicleModels] = useState([]);
  const [complianceNumbers, setComplianceNumbers] = useState({ total: '', classA: '', remaining: '' });
  const [estimatedModelSales, setEstimatedModelSales] = useState([{}]);

  const calculateNumbers = () => {
    if (totalSales && supplierSize && selectedYearOption !== '--') {
      const total = Math.round(totalSales * (complianceYearInfo.complianceRatio / 100) * 100) / 100;
      const classA = supplierSize === 'large' ? Math.round(totalSales * (complianceYearInfo.zevClassA / 100) * 100) / 100 : 'NA';
      const remaining = supplierSize === 'large' ? Math.round((total - classA) * 100) / 100 : 'NA';
      setComplianceNumbers({ total, classA, remaining });
    }
  };

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    if (id === 'model-year') {
      setSelectedYearOption(value);
      setComplianceYearInfo(allComplianceRatios.filter((each) => each.modelYear === value)[0]);
    }
    if (id === 'supplier-size') {
      setSupplierSize(value);
    }
    if (id === 'total-sales-number') {
      setTotalSales(value);
    }
  };
  const refreshDetails = () => {
    axios.all([
      axios.get(ROUTES_VEHICLES.YEARS),
      axios.get(ROUTES_COMPLIANCE.RATIOS),
      axios.get(ROUTES_VEHICLES.LIST),
    ]).then(axios.spread((
      modelYearResponse,
      allComplianceRatiosResponse,
      allVehicleModelsResponse,
    ) => {
      setModelYearList(modelYearResponse.data);
      setAllComplianceRatios(allComplianceRatiosResponse.data);
      setAllVehicleModels(allVehicleModelsResponse.data.filter((each) => each.isActive === true && each.validationStatus === 'VALIDATED'));
      setLoading(false);
    }));
  };

  useEffect(() => {
    if (loading === true) {
      refreshDetails();
    }
    calculateNumbers();
  }, [totalSales, supplierSize, selectedYearOption]);

  if (loading) {
    return (<Loading />);
  }

  return (
    <>
      <ComplianceTabs active="calculator" user={user} />
      <ComplianceCalculatorDetailsPage
        user={user}
        complianceNumbers={complianceNumbers}
        complianceYearInfo={complianceYearInfo}
        handleInputChange={handleInputChange}
        modelYearList={modelYearList}
        selectedYearOption={selectedYearOption}
        supplierSize={supplierSize}
        allVehicleModels={allVehicleModels}
        estimatedModelSales={estimatedModelSales}
        setEstimatedModelSales={setEstimatedModelSales}
      />
    </>
  );
};
LDVSalesContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default LDVSalesContainer;
