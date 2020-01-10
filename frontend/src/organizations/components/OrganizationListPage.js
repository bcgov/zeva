import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Loading from '../../app/components/Loading';
import OrganizationsTable from './OrganizationsTable';

const OrganizationListPage = (props) => {
  const { loading, organizations } = props;

  if (loading) {
    return <Loading />;
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
            <button className="button" type="button">
              <FontAwesomeIcon icon="download" /> Download as Excel
            </button>

            <button className="button primary" type="button">
              <FontAwesomeIcon icon="plus" /> New Supplier
            </button>
          </div>

          <OrganizationsTable
            items={organizations}
          />

          <div className="action-bar">
            <button className="button" type="button">
              <FontAwesomeIcon icon="download" /> Download as Excel
            </button>

            <button className="button primary" type="button">
              <FontAwesomeIcon icon="plus" /> New Supplier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

OrganizationListPage.defaultProps = {
  organizations: [],
};

OrganizationListPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  organizations: PropTypes.arrayOf(PropTypes.shape()),
};

export default OrganizationListPage;
