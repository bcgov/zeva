import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

const Comment = (props) => {
  const { comment, date, user } = props;
  return (
    <div className="bcgov-callout" role="alert">
      <span>
        <b>Comments &mdash;</b> {user}, {date}
        <p className="mt-3">{comment}</p>
      </span>
    </div>
  );
};

Comment.defaultProps = {
  date: '',
  user: '',
};
Comment.propTypes = {
  date: PropTypes.string,
  user: PropTypes.string,
  comment: PropTypes.string.isRequired,
};
export default Comment;
