import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import parse from 'html-react-parser';
import { Link } from 'react-router-dom';


const DisplayCommentEditable = (props) => {
  const { commentArray, editComment, user } = props;
  return (
    <div className="bcgov-callout" role="alert">
      <span>
        {commentArray &&
          commentArray.map((each) => {
            const comment = typeof each.comment === 'string' ? each : each.comment
            const isOwner = user.id == each.createUser.id
            return (
              <div
                key={typeof each.comment === 'string' ? each.id : each.comment.id}
              >
                <b>{'Comments '}</b>{!isOwner && <span>&#8212; </span>}
                {isOwner &&
                  <span>[<Link to={'#'} onClick={() => editComment(comment)}>edit</Link>] &#8212; </span>
                }
                {each.createUser.displayName},{' '}
                {moment(each.createTimestamp).format('YYYY-MM-DD h[:]mm a')} :{' '}
                {parse(each.comment)}
                <br />
              </div>
            )
        })}
      </span>
    </div>
  );
};

DisplayCommentEditable.defaultProps = {
  commentArray: [],
};
DisplayCommentEditable.propTypes = {
  commentArray: PropTypes.arrayOf(PropTypes.shape()),
  editComment: PropTypes.func.isRequired
};
export default DisplayCommentEditable;
