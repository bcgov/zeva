import React, { useState } from "react";
import axios from "axios";
import moment from "moment-timezone";
import PropTypes from "prop-types";
import parse from "html-react-parser";
import Button from "../../app/components/Button";
import CreditAgreementsAlert from "./CreditAgreementsAlert";
import CreditAgreementsDetailsTable from "./CreditAgreementsDetailsTable";
import CreditTransactionTabs from "../../app/components/CreditTransactionTabs";
import EditableCommentList from "../../app/components/EditableCommentList";
import CommentInput from "../../app/components/CommentInput";
import history from "../../app/History";
import ROUTES_CREDIT_AGREEMENTS from "../../app/routes/CreditAgreements";
import CustomPropTypes from "../../app/utilities/props";
import Modal from "../../app/components/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CreditAgreementsDetailsPage = (props) => {
  const {
    analystAction,
    details,
    directorAction,
    handleAddComment,
    handleCommentChangeBceid,
    handleCommentChangeIdir,
    handleInternalCommentEdit,
    handleInternalCommentDelete,
    handleSubmit,
    id,
    user,
  } = props;

  const [showModal, setShowModal] = useState(false);
  const showComments =
    details?.filteredIdirComments && details?.filteredIdirComments.length > 0;
  const showCommentInput = details?.status !== "ISSUED";
  const modal = (
    <Modal
      confirmLabel={analystAction ? "Submit" : "Issue"}
      handleCancel={() => {
        setShowModal(false);
      }}
      handleSubmit={() => {
        setShowModal(false);
        handleSubmit(analystAction ? "RECOMMENDED" : "ISSUED");
      }}
      modalClass="w-75"
      showModal={showModal}
      confirmClass="button primary"
      icon={<FontAwesomeIcon icon="paper-plane" />}
    >
      <div>
        <div>
          <br />
          <br />
        </div>
        <h3 className="d-inline">
          {analystAction
            ? "Submit this to the director?"
            : "Issue credits to the supplier?"}
        </h3>
        <div>
          <br />
          <br />
        </div>
      </div>
    </Modal>
  );

  return [
    <CreditTransactionTabs active="credit-agreements" key="tabs" user={user} />,
    <div id="credit-agreements-detail-page" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>{details.transactionType}</h2>
        </div>
        <div className="credit-agreements-alert col-sm-12 mt-2">
          <CreditAgreementsAlert
            id={id}
            isGovernment={user.isGovernment}
            date={moment(details.updateTimestamp).format("MMM D, YYYY")}
            status={details.status}
            transactionType={details.transactionType}
            updateUser={details.updateUser}
          />
        </div>
      </div>
      {user && user.isGovernment && (showComments || showCommentInput) && (
        <div className="row mt-3 mb-2">
          <div className="col-sm-12">
            <div
              className="grey-border-area p-3 comment-box mt-2"
              id="comment-input"
            >
              {showComments && (
                <EditableCommentList
                  comments={details.filteredIdirComments}
                  user={user}
                  handleCommentEdit={handleInternalCommentEdit}
                  handleCommentDelete={handleInternalCommentDelete}
                />
              )}
              {showCommentInput && (
                <div>
                  <CommentInput
                    handleAddComment={handleAddComment}
                    handleCommentChange={handleCommentChangeIdir}
                    title={
                      analystAction
                        ? "Add comment to director: "
                        : "Add comment to the analyst"
                    }
                    buttonText="Add Comment"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="credit-agreements-details grey-border-area">
        {user && user.isGovernment && (
          <div className="row">
            <span className="col-3">
              <h4 className="d-inline">Supplier: </h4>
            </span>
            <span className="col-5">{details.organization.name}</span>
          </div>
        )}
        <div className="row mt-2">
          <span className="col-3">
            <h4 className="d-inline">Agreement ID: </h4>
          </span>
          <span className="col-5">
            {details.optionalAgreementId ? details.optionalAgreementId : "N/A"}
          </span>
        </div>
        <div className="row mt-2">
          <span className="col-3">
            <h4 className="d-inline">Transaction Date: </h4>
          </span>
          <span className="col-5">{details.effectiveDate}</span>
        </div>
        <div className="row mt-2">
          <span className="col-3">
            <h4 className="d-inline">Agreement Attachment: </h4>
          </span>
          <div className="col-5 filename">
            {details.attachments && details.attachments.length > 0
              ? details.attachments.map((attachment) => (
                  <div className="row" key={attachment.id}>
                    <div className="col-9 file">
                      <button
                        className="link"
                        onClick={() => {
                          axios
                            .get(attachment.url, {
                              responseType: "blob",
                              headers: {
                                Authorization: null,
                              },
                            })
                            .then((response) => {
                              const objectURL = window.URL.createObjectURL(
                                new Blob([response.data]),
                              );
                              const link = document.createElement("a");
                              link.href = objectURL;
                              link.setAttribute(
                                "download",
                                attachment.filename,
                              );
                              document.body.appendChild(link);
                              link.click();
                            });
                        }}
                        type="button"
                      >
                        {attachment.filename}
                      </button>
                    </div>
                  </div>
                ))
              : " - "}
          </div>
        </div>
        {details &&
          details.filteredBceidComments &&
          details.filteredBceidComments.length > 0 && (
            <div className="row mt-2">
              <span className="col-3">
                <h4 className="d-inline">Message from the Director: </h4>
              </span>
              <span className="col-5">
                {parse(details.filteredBceidComments[0].comment)}
              </span>
            </div>
          )}
        <div className="row mt-2">
          <span className="col-3" />
          <span className="col-5">
            {details &&
              details.creditAgreementContent &&
              details.creditAgreementContent.length > 0 && (
                <CreditAgreementsDetailsTable
                  items={details.creditAgreementContent}
                />
              )}
          </span>
        </div>
      </div>
      {directorAction && details && details.status === "RECOMMENDED" && (
        <div
          className="grey-border-area p-3 comment-box mt-4"
          id="comment-input"
        >
          <div id="comment-input">
            <CommentInput
              defaultComment={
                details &&
                details.filteredBceidComments &&
                details.filteredBceidComments.length > 0
                  ? details.filteredBceidComments[0]
                  : {}
              }
              handleCommentChange={handleCommentChangeBceid}
              title="Message to the Supplier: "
            />
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-3">
            {directorAction && details.status === "RECOMMENDED" && (
              <>
                <span className="left-content">
                  <Button
                    buttonType="back"
                    locationRoute="/credit-agreements"
                  />

                  <button
                    className="button text-danger"
                    onClick={() => {
                      handleSubmit("RETURNED");
                    }}
                    type="button"
                  >
                    Return to Analyst
                  </button>
                </span>

                <span className="right-content">
                  <Button
                    buttonType="save"
                    optionalClassname="button"
                    optionalText="Save"
                    action={() => {
                      handleAddComment("bceidComment");
                    }}
                  />
                  <Button
                    buttonType="submit"
                    optionalClassname="button primary"
                    optionalText="Issue Transaction"
                    action={() => {
                      setShowModal(true);
                    }}
                  />
                </span>
              </>
            )}
            {analystAction &&
              (details.status === "DRAFT" || details.status === "RETURNED") && (
                <>
                  <span className="left-content">
                    <Button
                      buttonType="back"
                      locationRoute="/credit-agreements"
                    />
                    <Button
                      buttonType="delete"
                      optionalText="Delete"
                      action={() => {
                        handleSubmit("DELETED");
                      }}
                    />
                  </span>
                  <span className="right-content">
                    <Button
                      buttonType="edit"
                      optionalText="Edit"
                      action={() => {
                        history.push(
                          ROUTES_CREDIT_AGREEMENTS.EDIT.replace(/:id/g, id),
                        );
                      }}
                    />
                    <Button
                      buttonType="submit"
                      optionalClassname="button primary"
                      optionalText="Submit to Director"
                      action={() => {
                        setShowModal(true);
                      }}
                    />
                  </span>
                </>
              )}
            {details.status === "ISSUED" && (
              <>
                <span className="left-content">
                  <Button
                    buttonType="back"
                    locationRoute="/credit-agreements"
                  />
                </span>
                <span className="right-content" />
              </>
            )}
          </div>
        </div>
      </div>
      {modal}
    </div>,
  ];
};

CreditAgreementsDetailsPage.propTypes = {
  details: PropTypes.shape({
    attachments: PropTypes.arrayOf(PropTypes.shape()),
    creditAgreementContent: PropTypes.arrayOf(PropTypes.shape()),
    effectiveDate: PropTypes.string,
    filteredBceidComments: PropTypes.arrayOf(PropTypes.shape()),
    filteredIdirComments: PropTypes.arrayOf(PropTypes.shape()),
    optionalAgreementId: PropTypes.string,
    organization: PropTypes.shape(),
    status: PropTypes.string,
    transactionType: PropTypes.string,
    updateTimestamp: PropTypes.string,
  }).isRequired,
  analystAction: PropTypes.bool.isRequired,
  directorAction: PropTypes.bool.isRequired,
  handleAddComment: PropTypes.func.isRequired,
  handleCommentChangeBceid: PropTypes.func.isRequired,
  handleCommentChangeIdir: PropTypes.func.isRequired,
  handleInternalCommentEdit: PropTypes.func.isRequired,
  handleInternalCommentDelete: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditAgreementsDetailsPage;
