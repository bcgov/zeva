import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

const Comment = (props) => {
  const {
    commentArray,
  } = props;
  return (
    <div className="bcgov-callout" role="alert">
      <span>
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
  commentArray: [],
};
Comment.propTypes = {
  commentArray: PropTypes.arrayOf(PropTypes.shape()),
};
export default Comment;
