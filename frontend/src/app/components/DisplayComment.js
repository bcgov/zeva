import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import parse from 'html-react-parser'
// shows array of comments like
// Comments (bold) - Name, Date: Comment
const DisplayComment = (props) => {
  const { commentArray } = props
  return (
    <div className="bcgov-callout" role="alert">
      <span>
        {commentArray &&
          commentArray.map((each) => (
            <div
              key={typeof each.comment === 'string' ? each.id : each.comment.id}
            >
              <b>{'Comments - '}</b>
              {each.createUser.displayName},{' '}
              {moment(each.createTimestamp).format('YYYY-MM-DD h[:]mm a')} :{' '}
              {parse(each.comment)}
              <br />
            </div>
          ))}
      </span>
    </div>
  )
}

DisplayComment.defaultProps = {
  commentArray: []
}
DisplayComment.propTypes = {
  commentArray: PropTypes.arrayOf(PropTypes.shape())
}
export default DisplayComment
