import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import CustomPropTypes from '../../app/utilities/props';

const NotificationListPage = (props) => {
  const {
    notifications,
    checkboxes,
    handleCheckboxClick,
    user,
  } = props;

  return (
    <div id="notification-list">
      <ReactTooltip />
      {notifications.map((notification) => (
        <div key={notification.id}>
          <div className="d-inline-block align-middle my-2 ml-2 mr-1">
            <input
              checked={checkboxes.findIndex((checkbox) => (parseInt(checkbox, 10) === parseInt(notification.id, 10))) >= 0}
              id={notification.id}
              name="notifications"
              onChange={(event) => { handleCheckboxClick(event); }}
              type="checkbox"
            />
          </div>
          <label className="d-inline" htmlFor={notification.id} id="transfer-text">
            {notification.name}
          </label>
        </div>
      ))}
    </div>
  );
};

NotificationListPage.defaultProps = {
  notifications: [],
  checkboxes: [],
};
NotificationListPage.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.shape()),
  checkboxes: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
  handleCheckboxClick: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default NotificationListPage;
