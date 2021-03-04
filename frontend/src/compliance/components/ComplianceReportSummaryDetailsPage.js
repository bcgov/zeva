/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';

import formatNumeric from '../../app/utilities/formatNumeric';
import Button from '../../app/components/Button';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import ComplianceReportAlert from './ComplianceReportAlert';
import ComplianceReportSignOff from './ComplianceReportSignOff';
import SummaryCreditActivityTable from './SummaryCreditActivityTable';

const ComplianceReportSummaryDetailsPage = (props) => {
  const {
    creditsIssuedDetails,
    user,
    handleSubmit,
    loading,
    supplierInformationDetails,
    consumerSalesDetails,
  } = props;

  if (loading) {
    return <Loading />;
  }
 

  return (
    <div id="compliance-supplier-information-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>2020 Model Year Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <ComplianceReportAlert report={supplierInformationDetails.supplierInformation} type="Summary" />
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12">
          <div className="p-3 summary-page">
            <h3>Summary</h3>
            <div className="row p3 mt-3">
              <div className="col-lg-6">
                <div className="compliance-report-summary-grey text-blue">
                  <h3>Supplier Information</h3>
                  <div className="mt-3">

                    <h4 className="d-inline">Legal Name: </h4>
                    <span> {supplierInformationDetails.organization.name} </span>
                  </div>

                  <div>
                    <div className="d-block mr-5 mt-3">
                      <h4>Service Address:</h4>
                      {supplierInformationDetails.organization.organizationAddress
                && supplierInformationDetails.organization.organizationAddress.map((address) => (
                  address.addressType.addressType === 'Service' && (
                    <div key={address.id}>
                      {address.representativeName && (
                        <div> {address.representativeName} </div>
                      )}
                      <div> {address.addressLine1} </div>
                      <div> {address.city} {address.state} {address.country} </div>
                      <div> {address.postalCode} </div>
                    </div>
                  )
                ))}
                    </div>
                    <div className="d-block mt-3">
                      <h4>Records Address:</h4>
                      {supplierInformationDetails.organization.organizationAddress
                && supplierInformationDetails.organization.organizationAddress.map((address) => (
                  address.addressType.addressType === 'Records' && (
                    <div key={address.id}>
                      {address.representativeName && (
                        <div> {address.representativeName} </div>
                      )}
                      <div> {address.addressLine1} </div>
                      <div> {address.city} {address.state} {address.country} </div>
                      <div> {address.postalCode} </div>
                    </div>
                  )
                ))}
                    </div>
                    <div className="d-block my-3">
                      <h4>Makes:</h4>
                      {supplierInformationDetails.supplierInformation.makes.map((each) => `• ${each}`)}
                    </div>
                  </div>
                  Confirmed by Buzz Collins October 12, 2021
                </div>
                <div className="mt-4 compliance-report-summary-grey">
                  <h3>Consumer Sales</h3>
                  <table id="compliance-summary-consumer-sales-table">
                    <tbody>
                      <tr>
                        <td className="text-blue">{consumerSalesDetails.year} Model Year LDV Sales\Leases:</td>
                        <td className="text-right">{formatNumeric(consumerSalesDetails.ldvSales, 0)}</td>
                      </tr>
                      <tr>
                        <td className="text-blue">{consumerSalesDetails.year} Model Year Issued ZEV Sales\Leases:</td>
                        <td className="text-right">{formatNumeric(consumerSalesDetails.zevSales, 0)}</td>
                      </tr>
                      <tr>
                        <td className="text-blue">{consumerSalesDetails.year} Model Year Pending ZEV Sales\Leases:</td>
                        <td className="text-right">{formatNumeric(consumerSalesDetails.pendingZevSales, 0)}</td>
                      </tr>
                      <tr>
                        <td className="text-blue">3 Year Average ({consumerSalesDetails.year - 3}-{consumerSalesDetails.year - 1}) LDV Sales\Leases:</td>
                        <td className="text-right">{formatNumeric(consumerSalesDetails.averageLdv3Years, 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="text-blue my-3">
                    <span className="font-weight-bold">Vehicle Supplier Class: </span>
                    <span className="text-left">{consumerSalesDetails.supplierClass} Volume Supplier</span>
                  </div>
                  <span className="text-blue">
                    Confirmed by Buzz Collins October 12, 2021
                  </span>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="compliance-report-summary-grey">
                  <SummaryCreditActivityTable creditsIssuedDetails={creditsIssuedDetails} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="row">
        <div className="col-12 my-3">
          sign off
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-0">
            <span className="left-content">
              <Button buttonType="back" locationRoute="/compliance/reports" />
            </span>
            <span className="right-content">
              <Button
                buttonType="save"
                optionalClassname="button primary"
                action={(event) => {
                  handleSubmit(event);
                }}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

ComplianceReportSummaryDetailsPage.defaultProps = {
};

ComplianceReportSummaryDetailsPage.propTypes = {

};
export default ComplianceReportSummaryDetailsPage;
