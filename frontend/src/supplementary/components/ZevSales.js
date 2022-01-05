import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import ReactTable from 'react-table';

const ZevSales = (props) => {
  const {
    addSalesRow,
    details,
    handleInputChange,
    salesRows,
    isEditable,
  } = props;

  const currentStatus = details.actualStatus ? details.actualStatus : details.status;

  const columns = [{
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.sales}</span>
        <input
          id={`sales-${item.index}`}
          size="5"
          name="zevSales"
          defaultValue={item.original.newData.sales ? item.original.newData.sales : item.original.oldData.sales}
          onChange={handleInputChange}
          readOnly={!isEditable}
          className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${item.original.newData.sales && item.original.newData.sales !== item.original.oldData.sales ? 'highlight' : ''}`}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Sales',
    headerClassName: 'font-weight-bold ',
    id: 'zevSales',
    sortable: false,
    minWidth: 125,
  }, {
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.modelYear}</span>
        <input
          name="zevSales"
          id={`modelYear-${item.index}`}
          onChange={handleInputChange}
          size="4"
          maxLength="4"
          defaultValue={item.original.newData.modelYear ? item.original.newData.modelYear : item.original.oldData.modelYear}
          readOnly={!isEditable}
          className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${item.original.newData.modelYear && item.original.newData.modelYear !== item.original.oldData.modelYear ? 'highlight' : ''}`}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Model Year',
    headerClassName: 'font-weight-bold ',
    id: 'model-year',
    sortable: false,
    minWidth: 120,
  }, {
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.make}</span>
        <input
          size="8"
          name="zevSales"
          id={`make-${item.index}`}
          onChange={handleInputChange}
          defaultValue={item.original.newData.make ? item.original.newData.make : item.original.oldData.make}
          readOnly={!isEditable}
          className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${item.original.newData.make && item.original.newData.make !== item.original.oldData.make ? 'highlight' : ''}`}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Make',
    headerClassName: 'font-weight-bold',
    id: 'make',
    sortable: false,
    minWidth: 190,
  }, {
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.model}</span>
        <input
          size="11"
          name="zevSales"
          id={`modelName-${item.index}`}
          onChange={handleInputChange}
          defaultValue={item.original.newData.modelName ? item.original.newData.modelName : item.original.oldData.model}
          readOnly={!isEditable}
          className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${item.original.newData.modelName && item.original.newData.modelName !== item.original.oldData.model ? 'highlight' : ''}`}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Model',
    headerClassName: 'font-weight-bold',
    id: 'modelName',
    sortable: false,
    minWidth: 300,
  }, {
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.zevType}</span>
        <input
          size="5"
          name="zevSales"
          id={`vehicleZevType-${item.index}`}
          onChange={handleInputChange}
          defaultValue={item.original.newData.vehicleZevType ? item.original.newData.vehicleZevType : item.original.oldData.zevType}
          readOnly={!isEditable}
          className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${item.original.newData.vehicleZevType && item.original.newData.vehicleZevType !== item.original.oldData.zevType ? 'highlight' : ''}`}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Type',
    headerClassName: 'font-weight-bold',
    id: 'type',
    sortable: false,
    minWidth: 120,
  }, {
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.range}</span>
        <input
          size="4"
          name="zevSales"
          id={`range-${item.index}`}
          onChange={handleInputChange}
          defaultValue={item.original.newData.range ? item.original.newData.range : item.original.oldData.range}
          readOnly={!isEditable}
          className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${item.original.newData.range && item.original.newData.range !== item.original.oldData.range ? 'highlight' : ''}`}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Range (km)',
    headerClassName: 'font-weight-bold',
    id: 'range',
    sortable: false,
    minWidth: 150,
  }, {
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.zevClass}</span>
        <input
          maxLength="3"
          size="3"
          name="zevSales"
          id={`zevClass-${item.index}`}
          onChange={handleInputChange}
          defaultValue={item.original.newData.zevClass ? item.original.newData.zevClass : item.original.oldData.zevClass}
          readOnly={!isEditable}
          className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${item.original.newData.zevClass && item.original.newData.zevClass !== item.original.oldData.zevClass ? 'highlight' : ''}`}
        />
      </>
    ),
    className: 'text-right',
    Header: 'ZEV Class',
    headerClassName: 'font-weight-bold',
    id: 'zev-class',
    sortable: false,
    minWidth: 110,
  }];
  return (
    <>
      <h3>
        {details.assessmentData && details.assessmentData.modelYear}
        &nbsp; Model Year Zero-Emission Vehicles Sales
      </h3>
      <div className="text-blue my-3">
        Provide additional details in the comment box at the bottom of this form if there are
        changes to the consumer ZEV sales details.
      </div>
      <div className="my-4 sales-table-container">
        {salesRows
        && (
        <ReactTable
          className="sales-table"
          overflow="auto"
          columns={columns}
          data={salesRows}
          filterable={false}
          minRows={1}
          showPagination={false}
        />
        )}
        {currentStatus !== 'ASSESSED' && (
        <button
          className="transfer-add-line m-2"
          onClick={() => {
            addSalesRow();
          }}
          type="button"
        >
          <FontAwesomeIcon icon="plus" /> Add another line for a new ZEV model
        </button>
        )}
      </div>
    </>
  );
};

ZevSales.propTypes = {
  addSalesRow: PropTypes.func.isRequired,
  details: PropTypes.shape().isRequired,
  handleInputChange: PropTypes.func.isRequired,
  salesRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default ZevSales;
