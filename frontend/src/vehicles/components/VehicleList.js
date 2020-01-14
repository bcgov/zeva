import React from 'react';
import PropTypes from 'prop-types';
import Loading from "../../app/components/Loading";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import OrganizationsTable from "../../organizations/components/OrganizationsTable";
import VehicleListTable from "./VehicleListTable";

const VehicleList = (props) => {
  const {loading, vehicles} = props;

  if (loading) {
    return <Loading/>;
  }

  return (
    <div id="organization-list" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>Vehicle Suppliers</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar">
            <span className="left-content"/>

            <span className="right-content">
              <button className="button" type="button">
                <FontAwesomeIcon icon="download"/> Download as Excel
              </button>

              <button className="button primary" type="button">
                <FontAwesomeIcon icon="plus"/> New Vehicle
              </button>
            </span>
          </div>

          <VehicleListTable items={vehicles}/>

          <div className="action-bar">
            <span className="left-content"/>

            <span className="right-content">
              <button className="button" type="button">
                <FontAwesomeIcon icon="download"/> Download as Excel
              </button>

              <button className="button primary" type="button">
                <FontAwesomeIcon icon="plus"/> New Vehicle
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

VehicleList.defaultProps = {};

VehicleList.propTypes = {
  loading: PropTypes.bool.isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default VehicleList;
