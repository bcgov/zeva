import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import CustomPropTypes from '../../app/utilities/props';

const NotificationListPage = (props) => {
  const {
    notifications,
    checkboxes,
    handleCheckboxClick,
    handleChange,
    displayList,
    subscribe,
    unsubscribe,
    user,
  } = props;

 

  return (
    <div id="notification-list">
      <div className="col-sm-12">
        <input type="radio" id="Unsubscribe" onChange={(event) => { handleChange(event); }} name="Subscription" value="Unsubscribe" defaultChecked={unsubscribe} />
         <label className="d-inline" id="transfer-text">
          Unsubscribe, do not receive email notifications<br />
         </label>
        <input type="radio" id="Subscribe" onChange={(event) => { handleChange(event); }} name="Subscription" value="Subscribe" defaultChecked={subscribe}/>
          <label className="d-inline" id="transfer-text">
            Suscribe to receive immediate email (one email per notification)
          </label>           
      </div>
      <ReactTooltip />
      {displayList && (notifications.map((notification) => (
        <div className="col-sm-12 ml-3" key={notification.id}>
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
      )))}
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
  handleChange: PropTypes.func.isRequired,
  displayList: PropTypes.bool.isRequired,
  subscribe: PropTypes.bool,
  unsubscribe: PropTypes.bool,
  user: CustomPropTypes.user.isRequired,
};

export default NotificationListPage;
