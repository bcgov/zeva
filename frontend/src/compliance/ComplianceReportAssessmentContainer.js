import axios from 'axios';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { withRouter } from 'react-router';

import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import CustomPropTypes from '../app/utilities/props';

const ComplianceReportAssessmentContainer = (props) => {
  const { keycloak } = props;
  const { id } = useParams();
  const [make, setMake] = useState('');
  const [makes, setMakes] = useState([]);
  const [sales, setSales] = useState({
    2018: 1500,
    2019: 2000,
  });
  const today = new Date();
  console.error('nyan');

  const [adjustments, setAdjustments] = useState([{
    creditClass: 'A',
    modelYear: today.getFullYear(),
    quantity: 0,
    type: 'Allocation',
  }]);

  const handleAddMake = () => {
    setMake('');
    setMakes([...makes, make]);
  };

  const handleChangeMake = (event) => {
    const { value } = event.target;
    setMake(value.toUpperCase());
  };

  const handleDeleteMake = (index) => {
    makes.splice(index, 1);
    setMakes([...makes]);
  };

  const handleAddAdjustmentRow = () => {
    adjustments.push({
      creditClass: 'A',
      modelYear: today.getFullYear(),
      quantity: 0,
      type: 'Allocation',
    });

    setAdjustments(adjustments);
  };

  const handleChangeAdjustmentRow = (attr, value, index) => {
    adjustments[index][attr] = value;

    setAdjustments(adjustments);
  };

  const handleChangeSale = (year, value) => {
    setSales({
      ...sales,
      [year]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = {
      makes,
      sales,
      adjustments,
    };

    axios.patch(ROUTES_COMPLIANCE.REPORT_ASSESSMENT_SAVE.replace(/:id/g, id), data);
  };

  const refreshDetails = () => {
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <>
      <input type="text" onChange={handleChangeMake} /> <button type="button" onClick={handleAddMake}>Add Make</button>
      {makes.map((each, index) => (
        <>
          <div>{each}</div> <button type="button" onClick={() => { handleDeleteMake(index); }}>Delete</button>
        </>
      ))}
      {adjustments.map((each, index) => (
        <div key={index}>
          <input type="radio" name={`type-${index}`} value="Allocation" checked={each.type === 'Allocation'} onChange={() => { handleChangeAdjustmentRow('type', 'Allocation', index); }} /> Allocation
          <input type="radio" name={`type-${index}`} value="Reduction" checked={each.type === 'Reduction'} onChange={() => { handleChangeAdjustmentRow('type', 'Reduction', index); }} /> Reduction

          <input type="radio" name={`credit-class-${index}`} value="A" checked={each.creditClass === 'A'} onChange={() => { handleChangeAdjustmentRow('creditClass', 'A', index); }} /> A Credits
          <input type="radio" name={`credit-class-${index}`} value="B" checked={each.creditClass === 'B'} onChange={() => { handleChangeAdjustmentRow('creditClass', 'B', index); }} /> B Credits

          <select value={each.modelYear} onChange={(event) => { handleChangeAdjustmentRow('modelYear', event.target.value, index); }}>
            <option value="2018">2018</option>
            <option value="2019">2019</option>
            <option value="2020">2020</option>
          </select>
          <input type="text" value={each.quantity} onChange={(event) => { handleChangeAdjustmentRow('quantity', event.target.value, index); }} />
        </div>
      ))}
      <button type="button" onClick={handleAddAdjustmentRow}>Add Adjustment</button>
      <div>
        2019 <input type="text" onChange={(event) => { handleChangeSale(2019, event.target.value); }} value={sales['2019']} />
      </div>
      <div>
        2018 <input type="text" onChange={(event) => { handleChangeSale(2018, event.target.value); }} value={sales['2018']} />
      </div>

      <button type="button" onClick={handleSubmit}>Submit</button>
    </>
  );
};

ComplianceReportAssessmentContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
};

export default withRouter(ComplianceReportAssessmentContainer);
