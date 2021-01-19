/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router';

import Button from '../app/components/Button';
import ROUTES_NOTIFICATIONS from '../app/routes/Notifications';
import CustomPropTypes from '../app/utilities/props';
import Alert from '../app/components/Alert';
import NotificationListPage from './components/NotificationListPage';

const NotificationListContainer = (props) => {
  const [notifications, setNotifications] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [status, setStaus] = useState(null);
  const [icon, setIcon] = useState(null);

  const { keycloak, user, } = props;

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

  const handleSave = (checkboxes) => {
    axios.post(ROUTES_NOTIFICATIONS.LIST, {
      notification: checkboxes,
    }).then(() => {
      setAlertMessage("Email notification preferences saved.");
      setStaus("SAVED");
      setIcon("check-circle");
    }).catch(() => {
      setAlertMessage("Something went wrong, please try again after some time.")
      setStaus("ERROR")
      setIcon("exclamation-circle");
    })
  }

  const filterNotifications = (notifications) => {
    const filteredNotifications = notifications.filter((notification) => user.hasPermission(notification.permission));
    setNotifications(filteredNotifications);
  };

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

  useEffect(() => {
    refreshList(true);
  }, [keycloak.authenticated]);

  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content" />
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
              Receive email notifications of transactions and status changes of interest in the system to: {user.email} 
            </div>
          </div>
          {alertMessage
          && (
            <div className="mt-2">
              <Alert message={alertMessage} status={status} icon={icon} classname={alertMessage === 'Email notification preferences saved.' ? 'alert-success' : 'alert-danger'} />
            </div>
          )}
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
