/*
 * Presentational component
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';

import ReactTable from '../../app/components/ReactTable';
import CustomPropTypes from '../../app/utilities/props';
import getFileSize from '../../app/utilities/getFileSize';

const ModelListTable = (props) => {
  const { submission, user } = props;

  const columns = [{
    Header: () => (
      <div className="p-2">
        <h4>Analyst Recommendation</h4>
        <ul className="mt-2 mb-0 pl-4">
          <li>View sales not eligible for credits or overridden by the analyst from system default</li>
        </ul>
      </div>
    ),
    headerClassName: 'header-group text-left analyst-recommendation',
    columns: [{
      accessor: (item) => {
        if (!submission.eligible) {
          return '-';
        }

        const eligibleSales = submission.eligible.find(
          (eligible) => (eligible.vehicleId === item.vehicle.id),
        );

        if (!eligibleSales) {
          return '-';
        }

        return eligibleSales.vinCount;
      },
      className: 'text-right eligible-sales',
      Footer: (reactTable) => {
        const sum = _.sumBy(reactTable.data, (item) => {
          if (isNaN(item['eligible-sales'])) {
            return 0;
          }

          return item['eligible-sales'];
        });

        if (sum === 0) {
          return '-';
        }

        return sum;
      },
      Header: 'Eligible Sales',
      headerClassName: ' eligible-sales',
      id: 'eligible-sales',
      show: (user.isGovernment || submission.validationStatus === 'VALIDATED'),
      width: 150,
    }, {
      accessor: (item) => {
        const { vehicle } = item;

        if (!submission.eligible) {
          return '-';
        }

        const eligibleSales = submission.eligible.find(
          (eligible) => (eligible.vehicleId === vehicle.id),
        );

        if (!eligibleSales) {
          return '-';
        }

        if (vehicle && vehicle.creditValue && vehicle.creditValue !== 0) {
          return (eligibleSales.vinCount * _.round(vehicle.creditValue, 2)).toFixed(2);
        }

        return '-';
      },
      className: 'text-right eligible-zev-credits',
      Footer: (reactTable) => {
        const sum = _.sumBy(reactTable.data, (item) => {
          if (isNaN(item['eligible-zev-credits'])) {
            return 0;
          }

          return Number(item['eligible-zev-credits']);
        });

        if (sum === 0) {
          return '-';
        }

        return _.round(sum, 2).toFixed(2);
      },
      Header: 'Eligible ZEV Credits',
      headerClassName: ' eligible-sales',
      id: 'eligible-zev-credits',
      show: (user.isGovernment || submission.validationStatus === 'VALIDATED'),
      width: 200,
    }],
  }, {
    Header: () => {
      const serviceAddress = submission.organization.organizationAddress.find((address) => address.addressType.addressType === 'Service');
      const recordsAddress = submission.organization.organizationAddress.find((address) => address.addressType.addressType === 'Records');

      return (
        <div className="p-2">
          <h4>
            Credit Application as Submitted {submission.organization && `${submission.organization.name} `}
          </h4>
          <div>
            <h4 className="mt-2">
              {submission.organization.name}
            </h4>
            <h5 className="d-inline-block sales-upload-grey my-2">Service address: </h5>
            {serviceAddress && <h5 className="d-inline-block sales-upload-blue">{serviceAddress.addressLine1} {serviceAddress.city} {serviceAddress.state} {serviceAddress.postalCode}</h5>}
            <br />
            <h5 className="d-inline-block sales-upload-grey">Records address: </h5>
            {recordsAddress && <h5 className="d-inline-block sales-upload-blue">{recordsAddress.addressLine1} {recordsAddress.city} {recordsAddress.state} {recordsAddress.postalCode}</h5>}
            {submission.evidence.length > 0 && (
              <>
                <h3 className="mt-3">
                  Sales Evidence
                </h3>
                <div id="sales-edit" className="mt-2 col-8 pl-0">
                  <div className="files px-3">
                    {submission.evidence.map((file) => (
                      <div className="row py-1" key={file.id}>
                        <div className="col-9 filename pl-1">
                          <button
                            className="link"
                            onClick={() => {
                              axios.get(file.url, {
                                responseType: 'blob',
                                headers: {
                                  Authorization: null,
                                },
                              }).then((response) => {
                                const objectURL = window.URL.createObjectURL(
                                  new Blob([response.data]),
                                );
                                const link = document.createElement('a');
                                link.href = objectURL;
                                link.setAttribute('download', file.filename);
                                document.body.appendChild(link);
                                link.click();
                              });
                            }}
                            type="button"
                          >
                            {file.filename}
                          </button>
                        </div>
                        <div className="col-3 size">{getFileSize(file.size)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      );
    },
    headerClassName: `header-group text-left gap-left ${!user.isGovernment ? 'd-none' : ''}`,
    columns: [{
      accessor: 'sales',
      className: 'text-right gap-left sales-submitted',
      Footer: (reactTable) => {
        const sum = _.sumBy(reactTable.data, (item) => {
          if (isNaN(item.sales)) {
            return 0;
          }

          return item.sales;
        });

        if (sum === 0) {
          return '-';
        }

        return sum;
      },
      Header: 'Sales Submitted',
      headerClassName: 'gap-left',
      id: 'sales',
      width: 150,
    }, {
      accessor: (item) => {
        const { vehicle, sales } = item;

        if (!sales) {
          return '-';
        }

        if (vehicle && vehicle.creditValue && vehicle.creditValue !== 0) {
          return (sales * _.round(vehicle.creditValue, 2)).toFixed(2);
        }

        return '-';
      },
      className: `text-right credits-applied-for ${!user.isGovernment ? 'd-none' : ''}`,
      Footer: (reactTable) => {
        const sum = _.sumBy(reactTable.data, (item) => {
          if (isNaN(item['credits-applied-for'])) {
            return 0;
          }

          return Number(item['credits-applied-for']);
        });

        if (sum === 0) {
          return '-';
        }

        return _.round(sum, 2).toFixed(2);
      },
      Header: 'Credits Applied For',
      headerClassName: `${!user.isGovernment ? 'd-none' : ''}`,
      id: 'credits-applied-for',
      width: 175,
    }, {
      accessor: (item) => (`${item.xlsModelYear} ${item.xlsMake} ${item.xlsModel}`),
      className: 'no-footer',
      Header: 'Model',
      id: 'model',
    }, {
      accessor: (item) => {
        const { vehicle } = item;

        if (vehicle) {
          return vehicle.creditClass;
        }

        return '';
      },
      className: 'text-center no-footer',
      Header: 'ZEV Class',
      id: 'credit-class',
      width: 120,
    }, {
      accessor: (item) => {
        const { vehicle } = item;

        if (vehicle && vehicle.creditValue && vehicle.creditValue !== 0) {
          return _.round(vehicle.creditValue, 2).toFixed(2);
        }

        return '-';
      },
      className: 'text-right no-footer',
      Header: 'Credit Entitlement',
      id: 'credits',
      width: 150,
    }, {
      accessor: 'vehicle.vehicleZevType.vehicleZevCode',
      className: 'text-center no-footer',
      Header: 'ZEV Type',
      width: 150,
    }, {
      accessor: 'vehicle.range',
      className: 'text-right no-footer',
      Header: 'Range (km)',
      width: 150,
    }],
  }];

  return (
    <div className={`model-list-table ${!user.isGovernment ? 'bceid-user' : ''}`}>
      <ReactTable
        columns={columns}
        data={submission.content}
        defaultSorted={[{
          id: 'make',
        }]}
        getTrProps={(state, row) => {
          if (row && row.original && (!row.original.vehicle || !row.original.vehicle.id || row.original.modelName === '')) {
            return {
              className: 'danger',
            };
          }

          return {};
        }}
        key="table"
      />
    </div>
  );
};

ModelListTable.defaultProps = {};

ModelListTable.propTypes = {
  submission: PropTypes.shape({
    content: PropTypes.arrayOf(PropTypes.shape()),
    eligible: PropTypes.arrayOf(PropTypes.shape()),
    validationStatus: PropTypes.string,
  }).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default ModelListTable;
