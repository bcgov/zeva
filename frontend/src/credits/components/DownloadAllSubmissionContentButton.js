import axios from "axios";
import React from "react";
import Button from "../../app/components/Button";
import download from "../../app/utilities/download";
import ROUTES_CREDIT_REQUESTS from "../../app/routes/CreditRequests";

const DownloadAllSubmissionContentButton = ({ submission }) => {
  const downloadAll = (e) => {
    const element = e.currentTarget;
    const original = element.innerHTML;

    element.innerText = "Downloading...";
    element.disabled = true;

    return download(
      ROUTES_CREDIT_REQUESTS.DOWNLOAD_DETAILS.replace(":id", submission.id),
      {}
    ).then(() => {
      element.innerHTML = original;
      element.disabled = false;
    });
  };
  return (
    <Button
      buttonType="download"
      optionalText="Export to Excel"
      optionalClassname="button primary"
      action={(e) => {
        downloadAll(e);
      }}
    />
  );
};

export default DownloadAllSubmissionContentButton;
