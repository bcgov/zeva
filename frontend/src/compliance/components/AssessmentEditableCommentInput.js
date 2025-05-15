import React from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill";
import Tooltip from "../../app/components/Tooltip";

const AssessmentEditableCommentInput = (props) => {
  const {
    handleAddComment,
    handleCommentChange,
    saveEditableComment,
    cancelEditableComment,
    deleteEditableComment,
    editing,
    title,
    buttonText,
    disable,
    buttonDisable,
    tooltip,
    value,
  } = props;
  return (
    <div className="text-editor no-print">
      <label htmlFor="comment" className="text-blue">
        <b>{title}</b>
      </label>
      <ReactQuill
        readOnly={disable}
        value={value}
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
          <Tooltip
            tooltipId="assessment-comment-tip"
            tooltipText={buttonDisable && tooltip}
          >
            <button
              className="button mt-2"
              onClick={() => {
                if (editing && value && value !== "<p><br></p>") {
                  saveEditableComment();
                } else if (editing && (!value || value === "<p><br></p>")) {
                  deleteEditableComment();
                } else {
                  handleAddComment();
                }
              }}
              type="button"
              disabled={buttonDisable}
            >
              {buttonText}
            </button>

            {editing && (
              <button
                className="button mt-2 ml-2"
                onClick={() => {
                  cancelEditableComment();
                }}
                type="button"
              >
                {"Cancel"}
              </button>
            )}
          </Tooltip>
        </>
      )}
    </div>
  );
};

AssessmentEditableCommentInput.defaultProps = {
  buttonText: null,
  editing: false,
  disable: false,
  handleAddComment: () => {},
  tooltip: "",
};
AssessmentEditableCommentInput.propTypes = {
  handleAddComment: PropTypes.func,
  handleCommentChange: PropTypes.func.isRequired,
  saveEditableComment: PropTypes.func.isRequired,
  cancelEditableComment: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  title: PropTypes.string.isRequired,
  disable: PropTypes.bool,
  tooltip: PropTypes.string,
};
export default AssessmentEditableCommentInput;
