/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import Loading from '../app/components/Loading';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import CustomPropTypes from '../app/utilities/props';
import CreditTransfersPage from './components/CreditTransfersPage';
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import ROUTES_VEHICLES from '../app/routes/Vehicles';

const CreditTransfersContainer = (props) => {
  const emptyForm = {
    transferPartner: '',
    transferType: '',
  };
  const [rows, setRows] = useState([{
    creditType: '', modelYear: '', quantity: 0, value: 0,
  }]);
  const { user, keycloak } = props;
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [fields, setFields] = useState(emptyForm);
  const [years, setYears] = useState([]);

  const handleInputChange = (event) => {
    const { value, name } = event.target;
    const input = value.trim();
    fields[name] = input;
    setFields({
      ...fields,
    });
  };
  const removeRow = (rowId) => {
    const filteredRows = rows.filter((item, index) => (index !== rowId));
    setRows(filteredRows);
  };
  const handleSave = () => {
    // setFields({ ...fields, rowArray: rows });
    console.log(rows);
  };
  const handleSubmit = () => {
    // setFields({ ...fields, rowArray: rows });
    setLoading(true);
    console.log(rows);
    // axios.post(ROUTES_VEHICLES.LIST, data).then((response) => {
    //   const { id } = response.data;
    //   axios.patch(`vehicles/${id}/state_change`, { validationStatus: 'SUBMITTED' });
    setFields(emptyForm);
    setLoading(false);
    // });
  };
  const addRow = () => {
    setRows([...rows, {
      creditType: '', modelYear: '', quantity: '', value: '',
    }]);
  };
  const handleRowInputChange = (event, rowId) => {
    const { value, name } = event.target;
    let rowsCopy = JSON.parse(JSON.stringify(rows));
    rowsCopy[rowId][name] = value;
    setRows(rowsCopy);
  };

  const refreshDetails = () => {
    setLoading(true);
    axios.all([
      axios.get(ROUTES_ORGANIZATIONS.LIST),
      axios.get(ROUTES_VEHICLES.YEARS),
    ]).then(axios.spread((orgResponse, yearsResponse) => {
      setOrganizations(orgResponse.data);
      setYears(yearsResponse.data);
      setLoading(false);
    }));
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  const total = rows.reduce((a, v) => a + v.quantity * v.value, 0);
  return ([
    <CreditTransactionTabs active="credit-transfers" key="tabs" user={user} />,
    <CreditTransfersPage
      key="page"
      user={user}
      organizations={organizations}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      years={years}
      handleSave={handleSave}
      removeRow={removeRow}
      addRow={addRow}
      handleRowInputChange={handleRowInputChange}
      total={total}
      rows={rows}
    />,
  ]);
};

CreditTransfersContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default CreditTransfersContainer;
