import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

const Comment = (props) => {
  const {
    comment, date, user, commentArray,
  } = props;

  return (
    <div className="bcgov-callout" role="alert">
      <span>
        <b>Comments &mdash;</b> {user && date && ({ user }, { date })}
        {comment && (<p className="mt-3">{comment}</p>)}
        {commentArray && (
          commentArray.map((each) => (
            <p key={each.id}>
              {each.createUser.displayName}, {moment(each.createTimestamp).format('YYYY-MM-DD h[:]mm a')}: {each.comment}
            </p>
          ))
        )}
      </span>
    </div>
  );
};

Comment.defaultProps = {
  date: '',
  user: '',
  comment: '',
  commentArray: [],
};
Comment.propTypes = {
  date: PropTypes.string,
  user: PropTypes.string,
  comment: PropTypes.string,
  commentArray: PropTypes.arrayOf(PropTypes.shape()),
};
export default Comment;
