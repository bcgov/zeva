import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import history from '../../app/History';
import Loading from '../../app/components/Loading';
import OrganizationsTable from './OrganizationsTable';
import ROUTES_ORGANIZATIONS from '../../app/routes/Organizations';

const OrganizationListPage = (props) => {
  const {
    filtered, loading, organizations, setFiltered,
  } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="organization-list" className="page">
      <div className="row mb-2">
        <div className="col-md-8">
          <h2>Vehicle Suppliers</h2>
        </div>
        <div className="col-md-4 text-right">
          <button
            className="button primary"
            type="button"
            onClick={() => {
              history.push(ROUTES_ORGANIZATIONS.NEW);
            }}
          >
            <FontAwesomeIcon icon="plus" /> New Supplier
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <OrganizationsTable
            filtered={filtered}
            items={organizations}
            setFiltered={setFiltered}
          />
        </div>
      </div>
    </div>
  );
};

OrganizationListPage.defaultProps = {
  organizations: [],
};

OrganizationListPage.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  organizations: PropTypes.arrayOf(PropTypes.shape()),
  setFiltered: PropTypes.func.isRequired,
};

export default OrganizationListPage;
