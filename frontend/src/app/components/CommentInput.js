import React from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill";
import ReactTooltip from "react-tooltip";

const CommentInput = (props) => {
  const {
    handleAddComment,
    handleCommentChange,
    title,
    buttonText,
    defaultComment,
    disable,
    buttonDisable,
    tooltip,
  } = props;
  return (
    <div className="text-editor no-print">
      <label htmlFor="comment" className="text-blue">
        <b>{title}</b>
      </label>
      <ReactQuill
        readOnly={disable}
        defaultValue={defaultComment ? defaultComment.comment : ""}
        theme="snow"
        modules={{
          toolbar: [
            ["bold", "italic"],
            [{ list: "bullet" }, { list: "ordered" }],
          ],
          keyboard: {
            bindings: { tab: false },
          },
        }}
        formats={["bold", "italic", "list", "bullet"]}
        onChange={handleCommentChange}
      />
      {!disable && buttonText && (
        <>
          {tooltip !== "" && buttonDisable && <ReactTooltip />}
          <span data-tip={(buttonDisable && tooltip) || ""}>
            <button
              className="button mt-2"
              onClick={() => {
                handleAddComment();
              }}
              type="button"
              disabled={buttonDisable}
            >
              {buttonText}
            </button>
          </span>
        </>
      )}
    </div>
  );
};

CommentInput.defaultProps = {
  buttonText: null,
  defaultComment: null,
  disable: false,
  handleAddComment: () => {},
  tooltip: "",
};
CommentInput.propTypes = {
  handleAddComment: PropTypes.func,
  handleCommentChange: PropTypes.func.isRequired,
  defaultComment: PropTypes.shape(),
  buttonText: PropTypes.string,
  title: PropTypes.string.isRequired,
  disable: PropTypes.bool,
  tooltip: PropTypes.string,
};
export default CommentInput;
