import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import parse from 'html-react-parser';
import { Link } from 'react-router-dom';


const AssessmentEditableCommentList = (props) => {
  const { commentArray, editComment, user } = props;
  return (
    <div className="bcgov-callout" role="alert">
      <span>
        {commentArray &&
          commentArray.map((each) => {
            const comment = typeof each.comment === 'string' ? each : each.comment
            const userEditable = user.id == each.createUser.id
            return (
              <div
                key={typeof each.comment === 'string' ? each.id : each.comment.id}
              >
                <b>{'Comments '}</b>{!userEditable && <span>&#8212; </span>}
                {userEditable &&
                  <button
                  className="inline-edit"
                  onClick={() => {
                    editComment(comment);
                  }}
                  >
                    [edit] &#8212;
                  </button>
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

AssessmentEditableCommentList.defaultProps = {
  commentArray: [],
};
AssessmentEditableCommentList.propTypes = {
  commentArray: PropTypes.arrayOf(PropTypes.shape()),
  editComment: PropTypes.func.isRequired
};
export default AssessmentEditableCommentList;
