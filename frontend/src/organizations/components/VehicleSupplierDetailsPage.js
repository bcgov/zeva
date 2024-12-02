import React, { useState } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import Button from "../../app/components/Button";
import Loading from "../../app/components/Loading";
import CustomPropTypes from "../../app/utilities/props";
import ROUTES_ORGANIZATIONS from "../../app/routes/Organizations";
import VehicleSupplierClass from "./VehicleSupplierClass";
import formatNumeric from "../../app/utilities/formatNumeric";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const VehicleSupplierDetailsPage = (props) => {
  const {
    details,
    editButton,
    handleInputChange,
    handleSubmit,
    inputLDVSales,
    ldvSales,
    loading,
    locationState,
    modelYears,
    selectedModelYear,
    handleDeleteSale,
    isEditable,
    setIsEditable,
  } = props;
  const { organizationAddress } = details;
  const [showAllSales, setShowAllSales] = useState(false);
  const [showAllSupplied, setShowAllSupplied] = useState(false);
  const filteredSales = ldvSales.filter((sale) => sale.modelYear <= "2023");
  const filteredSupplied = ldvSales.filter((sale) => sale.modelYear >= "2024");
  const salesToShow = showAllSales ? filteredSales : filteredSales.slice(0, 3);
  const suppliedToShow = showAllSupplied
    ? filteredSupplied
    : filteredSupplied.slice(0, 3);
  if (loading) {
    return <Loading />;
  }

  const tooltip = `Supplier's total vehicle sales for each reportable model year's
     compliance period (October 1st - September 30th). Read-only historical record.`;

  const renderAddressType = (type) => {
    if (organizationAddress) {
      const addresses = organizationAddress.filter(
        (address) => address.addressType.addressType === type,
      );
      return addresses.map((address) => {
        return (
          <div key={address.id}>
            {address.representativeName && (
              <div> {address.representativeName} </div>
            )}
            <div> {address.addressLine1} </div>
            <div> {address.addressLine2} </div>
            <div>
              {" "}
              {address.city} {address.state} {address.country}{" "}
            </div>
            <div> {address.postalCode} </div>
          </div>
        );
      });
    }
  };

  return (
    <div id="vehicle-supplier-details" className="page">
      <div className="row mt-3">
        <div className="col">
          <h2 className="mb-2">Vehicle Supplier Information</h2>
          <div className="mt-3">
            <h4 className="d-inline">Legal Name: </h4>
            <span> {details.name} </span>
          </div>

          <div className="mt-3">
            <h4 className="d-inline">Common Name: </h4>
            <span> {details.shortName} </span>
          </div>

          <div className="mt-3">
            <h4 className="d-inline">Status: </h4>
            <span>
              {" "}
              {details.isActive
                ? "Actively supplying vehicles in British Columbia"
                : "Not actively supplying vehicles in British Columbia"}{" "}
            </span>
          </div>

          <div className="row">
            <div className="d-inline-block col-5 mr-5 mt-3">
              <h4>Service Address</h4>
              {renderAddressType("Service")}
            </div>
            <div className="d-inline-block col-5 mt-3">
              <h4>Records Address</h4>
              {renderAddressType("Records")}
            </div>
          </div>

          <div className="mt-3">
            <h4 className="d-inline">Vehicle Supplier Class: </h4>
            <span>
              {" "}
              <VehicleSupplierClass
                supplierClass={details.supplierClass}
              />{" "}
            </span>
          </div>

          <div className="mt-3">
            <h4 className="d-inline">First Model Year Report: </h4>
            <span> {details.firstModelYear} </span>
          </div>

          <div className="mt-3">
            <h4 className="d-inline">3 Year Average Vehicles {details.suppliedOrSales}: </h4>
            <span> {formatNumeric(Math.round(details.avgLdvSales), 0)} </span>
          </div>

          <div className="mt-3">
            {!details.hasSubmittedReport && (
              <div className="mb-2">
                Enter the previous 3 year vehicles supplied total to determine
                vehicle supplier class.
              </div>
            )}
            {details.hasSubmittedReport && (
              <Tooltip
                tooltipId="supplied-tooltip"
                tooltipText={suppliedTooltip}
                placement="bottom"
              >
                <FontAwesomeIcon icon="info-circle" className="info-icon" />
                <h4 className="d-inline">Previous 3 Year Vehicles Supplied:</h4>
              </Tooltip>
            )}
            <form onSubmit={handleSubmit}>
              <div className="ldv-sales">
                <div className="header-bg">
                  <div className="d-inline-block">
                    <select
                      className="form-control"
                      disabled={!isEditable}
                      id="model-year"
                      name="modelYear"
                      onChange={handleInputChange}
                      value={selectedModelYear}
                    >
                      <option> </option>
                      {modelYears.map((modelYear) => (
                        <option key={modelYear.name} value={modelYear.name}>
                          {modelYear.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="d-inline-block">
                    <input
                      className="form-control"
                      disabled={!isEditable}
                      name="ldvSales"
                      onChange={handleInputChange}
                      type="text"
                      value={inputLDVSales}
                    />
                  </div>
                  <div className="d-inline-block">
                    <button
                      className="btn button primary"
                      disabled={!isEditable}
                      type="submit"
                    >
                      Add
                    </button>

                    {!isEditable ? (
                      <button
                        className="btn button ml-3 primary"
                        onClick={() => {
                          setIsEditable(true);
                        }}
                        type="button"
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        className="btn button ml-3"
                        onClick={() => {
                          setIsEditable(false);
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                {suppliedToShow.length > 0 && (
                  <ul className="mb-0 mt-3 supplied-ldv-by-year">
                    {suppliedToShow.map((sale) => (
                      <li className="form-row my-2" key={sale.id}>
                        <div className="col-5 model-year">
                          {sale.modelYear} Model Year:
                        </div>
                        <div className="col-4 sales">
                          {formatNumeric(sale.ldvSales, 0)}
                        </div>
                        <div className="col-3 delete">
                          {isEditable && (
                            <button
                              onClick={() => {
                                handleDeleteSale(sale);
                              }}
                              type="button"
                            >
                              x
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                    {filteredSupplied.length > 3 && (
                      <div className="see-more-div">
                        <button
                          className="see-more-button"
                          onClick={() => setShowAllSupplied(!showAllSupplied)}
                          type="button"
                        >
                          {showAllSupplied ? "See less" : "See more"}
                        </button>
                      </div>
                    )}
                  </ul>
                )}
                {salesToShow.length > 0 && (
                  <ul>
                    <ReactTooltip />
                    <span data-tip={tooltip}>
                      <FontAwesomeIcon
                        id="sales-by-year-info"
                        icon="info-circle"
                      />
                    </span>
                    <b> Previous Years Vehicle Sales</b>
                    {salesToShow.length > 0 &&
                      salesToShow.map((sale) => (
                        <li className="form-row my-2" key={sale.id}>
                          <div className="col-5 model-year">
                            {sale.modelYear} Model Year:
                          </div>
                          <div className="col-4 sales">
                            {formatNumeric(sale.ldvSales, 0)}
                          </div>
                          <div className="col-3 delete">
                            {isEditable && (
                              <button
                                onClick={() => {
                                  handleDeleteSale(sale);
                                }}
                                type="button"
                              >
                                x
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    {filteredSales.length > 3 && (
                      <div className="see-more-div">
                        <button
                          className="see-more-button"
                          onClick={() => setShowAllSales(!showAllSales)}
                          type="button"
                        >
                          {showAllSales ? "See less" : "See more"}
                        </button>
                      </div>
                    )}
                  </ul>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="col-sm-2">{editButton}</div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="action-bar">
            <span className="left-content">
              <Button
                buttonType="back"
                locationRoute={ROUTES_ORGANIZATIONS.LIST}
                locationState={locationState}
              />
            </span>
            <span className="right-content" />
          </div>
        </div>
      </div>
    </div>
  );
};

VehicleSupplierDetailsPage.defaultProps = {
  inputLDVSales: "",
  locationState: undefined,
  selectedModelYear: "",
};

VehicleSupplierDetailsPage.propTypes = {
  details: CustomPropTypes.organizationDetails.isRequired,
  editButton: PropTypes.shape().isRequired,
  ldvSales: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  locationState: PropTypes.arrayOf(PropTypes.shape()),
  modelYears: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleDeleteSale: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  inputLDVSales: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selectedModelYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default VehicleSupplierDetailsPage;
