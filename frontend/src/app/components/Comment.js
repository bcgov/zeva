import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
// shows array of comments like
// Name, Date: Comment
const Comment = (props) => {
  const {
    commentArray,
  } = props;
  return (
    <div className="bcgov-callout" role="alert">
      <span>
        {commentArray && (
          commentArray.map((each) => (
            <p key={typeof each.comment === 'string' ? each.id : each.comment.id}>
              {each.createUser.displayName}, {moment(each.createTimestamp).format('YYYY-MM-DD h[:]mm a')}: {typeof each.comment === 'string' ? each.comment : each.comment.comment}
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
