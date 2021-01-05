/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import Button from '../app/components/Button';
import { withRouter } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ROUTES_NOTIFICATIONS from '../app/routes/Notifications';
import CustomPropTypes from '../app/utilities/props';
import NotificationListPage from './components/NotificationListPage';

const qs = require('qs');

const NotificationListContainer = (props) => {
  const [notifications, setNotifications] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const { keycloak, user, location ,
    } = props;

  const handleCheckboxClick = (event) => {
    if (!event.target.checked) {
      const checked = checkboxes.filter((each) => Number(each) !== Number(event.target.id));
      setCheckboxes(checked);
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(event.target.id);
      setCheckboxes(checked);
    }
  }; 

  const alertSuccess = (
    <div className="alert alert-success"  id= "alert-success" role="alert"><FontAwesomeIcon icon="check-circle" size="lg"/>
              &nbsp;<b>Success:&nbsp;</b> Email notification preferences saved.
      </div>
  );
  const alertError = (
    <div className="alert alert-danger" role="alert"><FontAwesomeIcon icon="exclamation-circle" size="lg"/>
              &nbsp;<b>Error:&nbsp;</b> Something went wrong, please try after some time.
      </div>
  );

  const handleSave = (checkboxes) => {
    axios.post(ROUTES_NOTIFICATIONS.LIST, {
        notification: checkboxes,
      })
        .then(() => {
        setSuccess(true);
      })
        .catch(() => {
        setError(true);
      })
        
  }
  const refreshList = (showLoading) => {
    setLoading(showLoading);
    axios.get(ROUTES_NOTIFICATIONS.LIST).then((response) => {
      filterNotifications(response.data);
      setLoading(false);
    });
    axios.get(ROUTES_NOTIFICATIONS.SUBSCRIPTIONS).then((response) => {
      setCheckboxes(response.data);
    });
  };

  const filterNotifications = (notifications) => {
    let filteredNotifications = notifications.filter((notification) => 
      user.hasPermission(notification.permission)) 
    setNotifications(filteredNotifications);
  }

  useEffect(() => {
    refreshList(true);
  }, [keycloak.authenticated]);

  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content"> 
          </span>
          <span className="right-content mr-3">
            <Button
              optionalClassname="button primary"
              disabled={checkboxes.length < 1}
              buttonType="save"
              action={()=> {handleSave(checkboxes);}}
            />
          </span>
        </div>
      </div>
    </div>
  );
  return (
    <div id="notification-list" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Email Notifications</h2>
          <div className="mt-3 mb-2">
            <div className="text-blue">
              Receive email notifications of transactions and status changes of interest in the system to : {user.email} 
            </div>
          </div>
          {(success) ? alertSuccess : (error) ? alertError : false}
        </div>
      </div>
      <div id="form">
        <form onSubmit={(event) => handleSave(event)}>
          <div className="row">
            <div className="col-sm-12">
              <fieldset>
              <NotificationListPage
              notifications={notifications}
              checkboxes={checkboxes}
              handleCheckboxClick={handleCheckboxClick}
              user={user}
              />
              {actionbar}
            </fieldset>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

NotificationListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default withRouter(NotificationListContainer);
