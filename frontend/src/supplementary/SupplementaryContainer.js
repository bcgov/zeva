import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ROUTES_SUPPLEMENTARY from '../app/routes/SupplementaryReport';
import SupplementaryDetailsPage from './components/SupplementaryDetailsPage';

const SupplementaryContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [newData, setNewData] = useState({ zevSales: {}, creditActivity: {} });
  const [salesRows, setSalesRows] = useState([]);
  const { keycloak, user } = props;

  const handleCommentChange = (comment) => {
    setNewData({ ...newData, comment });
  };

  const addSalesRow = () => {
    salesRows.push({
      oldData: {},
      newData: {
        modelYearReportVehicle: '',
      },
    });
    setSalesRows([...salesRows]);
  };

  const handleSubmit = (status) => {
    const data = {
      ...newData,
      status,
      creditActivity: [{
        category: 'creditBalanceStart',
        modelYearId: 2,
        creditAValue: '100',
        creditBValue: '50',
      }, {
        category: 'creditBalanceEnd',
        modelYearId: 1,
        creditAValue: '100',
        creditBValue: '50',
      }],
    };
    axios.patch(ROUTES_SUPPLEMENTARY.SAVE.replace(':id', id), data);
  };

  const handleInputChange = (event) => {
    const { id, name, value } = event.target;
    if (name === 'zevSales') {
      const rowId = id.split('-')[1];
      const type = id.split('-')[0];
      const index = salesRows.findIndex((each, index) => Number(index) === Number(rowId));
      if (index >= 0) {
        salesRows[index].newData = {
          ...salesRows[index].newData,
          [type]: value,
          modelYearReportVehicle: salesRows[index].oldData.modelYearReportVehicle,
        };
      }
      const zevSales = [];
      salesRows.forEach((each) => {
        if (each.newData && Object.keys(each.newData).length > 0) {
          zevSales.push(each.newData);
        }
      });
      newData.zevSales = zevSales;
    } else {
      // seperate sections into which database table they will be inserted into ie supplierInfo
      const dataToUpdate = {
        ...newData[name],
        [id]: value,
      };
      setNewData({ ...newData, [name]: dataToUpdate });
    }
  };
  const refreshDetails = () => {
    setLoading(true);
    axios.get(ROUTES_SUPPLEMENTARY.DETAILS.replace(':id', id)).then((response) => {
      if (response.data) {
        setDetails(response.data);
        const newSupplier = response.data.supplierInformation;
        const newLegalName = newSupplier.find((each) => each.category === 'LEGAL_NAME') || '';
        const newServiceAddress = newSupplier.find((each) => each.category === 'SERVICE_ADDRESS') || '';
        const newRecordsAddress = newSupplier.find((each) => each.category === 'RECORDS_ADDRESS') || '';
        const newMakes = newSupplier.find((each) => each.category === 'LDV_MAKES') || '';
        const newSupplierClass = newSupplier.find((each) => each.category === 'SUPPLIER_CLASS') || '';
        const supplierInfo = {
          legalName: newLegalName.value,
          serviceAddress: newServiceAddress.value,
          recordsAddress: newRecordsAddress.value,
          ldvMakes: newMakes.value,
          supplierClass: newSupplierClass.value,
        };
        const newZevSales = response.data.zevSales;
        const salesData = [];
        // sales from assessment
        response.data.assessmentData.zevSales.forEach((item) => {
          salesData.push({
            newData: {},
            oldData: {
              make: item.make,
              model: item.modelName,
              modelYear: item.modelYear,
              sales: item.salesIssued,
              modelYearReportVehicle: item.id,
              range: item.range,
              zevClass: item.zevClass,
              zevType: item.vehicleZevType,
            },
          });
        });
        // new /adjusted sales
        newZevSales.forEach((item) => {
          if (item.modelYearReportVehicle) {
            const match = salesData.findIndex((record) => record.oldData.modelYearReportVehicle === item.modelYearReportVehicle);
            if (match >= 0) {
              salesData[match].newData = item;
            } else {
              salesData.push({ newData: item, oldData: {} });
            }
          } else {
            salesData.push({ newData: item, oldData: {} });
          }
        });
        setSalesRows(salesData);
        setNewData({
          ...newData,
          supplierInfo,

        });
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <SupplementaryDetailsPage
      handleCommentChange={handleCommentChange}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      loading={loading}
      user={user}
      details={details}
      newData={newData}
      addSalesRow={addSalesRow}
      salesRows={salesRows}
    />
  );
};
export default SupplementaryContainer;
