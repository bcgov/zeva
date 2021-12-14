import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useParams, useLocation } from 'react-router-dom';

import ROUTES_SUPPLEMENTARY from '../app/routes/SupplementaryReport';
import SupplementaryDetailsPage from './components/SupplementaryDetailsPage';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import history from '../app/History';
import CustomPropTypes from '../app/utilities/props';

const qs = require('qs');

const SupplementaryContainer = (props) => {
  const { id, supplementaryId } = useParams();
  const [checkboxConfirmed, setCheckboxConfirmed] = useState(false);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [salesRows, setSalesRows] = useState([]);
  const { keycloak, user } = props;
  const [files, setFiles] = useState([]);
  const [deleteFiles, setDeleteFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [newData, setNewData] = useState({ zevSales: {}, creditActivity: [] });
  let [obligationDetails, setObligationDetails] = useState([]);
  const [ldvSales, setLdvSales] = useState();
  const [ratios, setRatios] = useState();
  const [newBalances, setNewBalances] = useState({});
  const [commentArray, setCommentArray] = useState({});
  const [idirComment, setIdirComment] = useState([]);
  const [bceidComment, setBceidComment] = useState([]);
  const [supplementaryAssessmentData, setSupplementaryAssessmentData] = useState({});
  const [radioDescriptions, setRadioDescriptions] = useState([{ id: 0, description: '' }]);
  const [newReport, setNewReport] = useState(false);
  const location = useLocation();

  const query = qs.parse(location.search, { ignoreQueryPrefix: true });

  const getNumeric = (parmValue) => {
    let value = parmValue;

    if (value) {
      value += '';
      return value.replace(',', '');
    }

    return value;
  };

  const analystAction = user.isGovernment
  && user.hasPermission('RECOMMEND_COMPLIANCE_REPORT');

  const directorAction = user.isGovernment
  && user.hasPermission('SIGN_COMPLIANCE_REPORT');

  const calculateBalance = (creditActivity) => {
    const balances = {};

    obligationDetails.forEach((each) => {
      if (!(each.modelYear.name in balances)) {
        balances[each.modelYear.name] = {
          A: 0,
          B: 0,
        };
      }

      if ([
        'administrativeAllocation',
        'automaticAdministrativePenalty',
        'creditBalanceStart',
        'creditsIssuedSales',
        'initiativeAgreement',
        'purchaseAgreement',
        'transfersIn',
      ].indexOf(each.category) >= 0) {
        const found = creditActivity.findIndex((activity) => (
          activity.category === each.category
          && Number(activity.modelYear) === Number(each.modelYear.name)
        ));

        if (found >= 0) {
          balances[each.modelYear.name].A += creditActivity[found].creditAValue
            ? Number(getNumeric(creditActivity[found].creditAValue)) : Number(getNumeric(each.creditAValue));
          balances[each.modelYear.name].B += creditActivity[found].creditBValue
            ? Number(getNumeric(creditActivity[found].creditBValue)) : Number(getNumeric(each.creditBValue));
        } else {
          balances[each.modelYear.name].A += Number(getNumeric(each.creditAValue));
          balances[each.modelYear.name].B += Number(getNumeric(each.creditBValue));
        }
      }

      if ([
        'administrativeReduction',
        'deficit',
        'transfersOut',
      ].indexOf(each.category) >= 0) {
        const found = creditActivity.findIndex((activity) => (
          activity.category === each.category
          && Number(activity.modelYear) === Number(each.modelYear.name)
        ));

        if (found >= 0) {
          balances[each.modelYear.name].A -= creditActivity[found].creditAValue
            ? Number(getNumeric(creditActivity[found].creditAValue)) : Number(getNumeric(each.creditAValue));
          balances[each.modelYear.name].B -= creditActivity[found].creditBValue
            ? Number(getNumeric(creditActivity[found].creditBValue)) : Number(getNumeric(each.creditBValue));
        } else {
          balances[each.modelYear.name].A -= Number(getNumeric(each.creditAValue));
          balances[each.modelYear.name].B -= Number(getNumeric(each.creditBValue));
        }
      }
    });

    setNewBalances(balances);
  };

  const handleAddIdirComment = () => {
    const commentData = { fromGovtComment: idirComment, director: true };
    axios.post(ROUTES_SUPPLEMENTARY.COMMENT_SAVE.replace(':id', id), commentData).then(() => {
      history.push(ROUTES_COMPLIANCE.REPORTS);
      if (supplementaryId) {
        history.replace(ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(':id', id).replace(':supplementaryId', supplementaryId));
      } else {
        history.replace(ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(':id', id).replace(':supplementaryId', ''));
      }
    });
  };

  const handleCommentChangeIdir = (text) => {
    setIdirComment(text);
  };

  const handleCommentChangeBceid = (text) => {
    setBceidComment(text);
  };

  const handleCommentChange = (content) => {
    setComment(content);
  };

  const handleCheckboxClick = (event) => {
    setCheckboxConfirmed(event.target.checked);
  };

  const addSalesRow = () => {
    salesRows.push({
      oldData: {},
      newData: {
        modelYearReportVehicle: '',
      },
    });
    setSalesRows([...salesRows]);
  };
  const handleUpload = (paramId) => {
    const promises = [];
    files.forEach((file, index) => {
      promises.push(new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const blob = reader.result;

          axios.get(ROUTES_SUPPLEMENTARY.MINIO_URL.replace(/:id/gi, paramId)).then((response) => {
            const { url: uploadUrl, minioObjectName } = response.data;
            axios.put(uploadUrl, blob, {
              headers: {
                Authorization: null,
              },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.loaded >= progressEvent.total) {
                  resolve({
                    filename: file.name,
                    mimeType: file.type,
                    minioObjectName,
                    size: file.size,
                  });
                }
              },
            }).catch(() => {
              reject();
            });
          });
        };

        reader.readAsArrayBuffer(file);
      }));
    });

    return promises;
  };

  const handleSupplementalChange = (obj) => {
    let creditActivity = [];

    if (newData.creditActivity) {
      ({ creditActivity } = newData);
    } else {
      newData.creditActivity = [];
    }

    if (obj.modelYear && obj.title) {
      const index = newData.creditActivity.findIndex((each) => (
        Number(each.modelYear) === Number(obj.modelYear)
        && each.category === obj.title
      ));

      if (index >= 0) {
        if ((obj.creditA || creditActivity[index].creditAValue)
          && (obj.creditB || creditActivity[index].creditBValue)) {
          creditActivity[index] = {
            ...newData.creditActivity[index],
            creditAValue: obj.creditA || creditActivity[index].creditAValue,
            creditBValue: obj.creditB || creditActivity[index].creditBValue,
          };
        } else if (obj.creditA || creditActivity[index].creditAValue) {
          creditActivity[index] = {
            ...newData.creditActivity[index],
            creditAValue: obj.creditA || creditActivity[index].creditAValue,
          };
        } else if (obj.creditB || creditActivity[index].creditBValue) {
          creditActivity[index] = {
            ...newData.creditActivity[index],
            creditBValue: obj.creditB || creditActivity[index].creditBValue,
          };
        }
      } else {
        creditActivity.push({
          category: obj.title,
          modelYear: obj.modelYear,
          creditAValue: obj.creditA,
          creditBValue: obj.creditB,
        });
      }

      calculateBalance(creditActivity);
    }

    setNewData({
      ...newData,
      creditActivity: [...creditActivity],
    });
  };

  const handleSubmit = (status, paramNewReport) => {
    if ((status === 'ASSESSED' && paramNewReport) || (status === 'SUBMITTED' && analystAction)) {
      status = 'DRAFT';
    }
    const uploadPromises = handleUpload(id);
    Promise.all(uploadPromises).then((attachments) => {
      const evidenceAttachments = {};
      if (attachments.length > 0) {
        evidenceAttachments.attachments = attachments;
      }

      if (status) {
        const data = {
          ...newData,
          status,
          evidenceAttachments,
          deleteFiles,
          fromSupplierComment: comment,
        };

        if ((status === 'RECOMMENDED' || status === 'DRAFT') && paramNewReport) {
          data.newReport = paramNewReport;
        }
        if (analystAction) {
          data.analystAction = true;
          data.penalty = supplementaryAssessmentData.supplementaryAssessment.assessmentPenalty;
          data.description = supplementaryAssessmentData.supplementaryAssessment.decision.id;
        }

        axios.patch(ROUTES_SUPPLEMENTARY.SAVE.replace(':id', id), data).then((response) => {
          const { id: supplementalId } = response.data;
          if (status === 'DELETED') {
            history.push(ROUTES_COMPLIANCE.REPORTS);
          } else if (status === 'RETURNED') {
            history.push(ROUTES_COMPLIANCE.REPORTS);
            history.replace(ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(':id', id).replace(':supplementaryId', ''));
          } else {
            const commentData = { fromGovtComment: bceidComment, director: false };
            axios.post(ROUTES_SUPPLEMENTARY.COMMENT_SAVE.replace(':id', id), commentData).then(() => {
              history.push(ROUTES_COMPLIANCE.REPORTS);
              history.replace(ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(':id', id).replace(':supplementaryId', supplementalId));
            });
          }
        });
      }
    }).catch((e) => {
      setErrorMessage(e);
    });
  };

  const handleInputChange = (event) => {
    const { id, name, value } = event.target;
    if (name === 'zevSales') {
      const rowId = id.split('-')[1];
      const type = id.split('-')[0];
      const index = salesRows.findIndex((each, index) => Number(index) === Number(rowId));
      if (index >= 0) {
        salesRows[index].newData = {
          ...salesRows[index].newData,
          [type]: value,
          modelYearReportVehicle: salesRows[index].oldData.modelYearReportVehicle,
        };
      }
      const zevSales = [];
      salesRows.forEach((each) => {
        if (each.newData && Object.keys(each.newData).length > 0) {
          zevSales.push(each.newData);
        }
      });
      newData.zevSales = zevSales;
    } else {
      const dataToUpdate = {
        ...newData[name],
        [id]: value,
      };
      setNewData({ ...newData, [name]: dataToUpdate });
    }
  };

  const refreshDetails = () => {
    setLoading(true);

    axios.all([
      axios.get(`${ROUTES_SUPPLEMENTARY.DETAILS.replace(':id', id)}?supplemental_id=${supplementaryId || ''}`),
      axios.get(ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID.replace(':id', id)),
      axios.get(ROUTES_COMPLIANCE.RATIOS),
      axios.get(`${ROUTES_SUPPLEMENTARY.ASSESSMENT.replace(':id', id)}?supplemental_id=${supplementaryId || ''}`),
    ]).then(axios.spread((response, complianceResponse, ratioResponse, assessmentResponse) => {
      if (response.data) {
        if (query && query.new === 'Y') {
          setNewReport(true);
        } else {
          setNewReport(false);
        }
        setDetails(response.data);
        const newSupplier = response.data.supplierInformation;
        const newLegalName = newSupplier.find((each) => each.category === 'LEGAL_NAME') || '';
        const newServiceAddress = newSupplier.find((each) => each.category === 'SERVICE_ADDRESS') || '';
        const newRecordsAddress = newSupplier.find((each) => each.category === 'RECORDS_ADDRESS') || '';
        const newMakes = newSupplier.find((each) => each.category === 'LDV_MAKES') || '';
        const newSupplierClass = newSupplier.find((each) => each.category === 'SUPPLIER_CLASS') || '';
        const idirCommentArrayResponse = [];
        const bceidCommentResponse = response.data.fromSupplierComments;

        const {
          assessment,
          descriptions: assessmentDescriptions,
          assessmentComment,
        } = assessmentResponse.data;

        let assessmentPenalty;
        let decision;
        let deficit;
        let inCompliance;

        if (assessment) {
          ({
            penalty: assessmentPenalty,
            decision,
            deficit,
            inCompliance,
          } = assessment);
        }
        setRadioDescriptions(assessmentDescriptions);

        if (assessmentComment) {
          assessmentComment.forEach((item) => {
            if (item.toDirector === true) {
              idirCommentArrayResponse.push(item);
            }
            // else {
            //   bceidCommentResponse = item;
            // }
          });
        }
        setCommentArray({
          bceidComment: bceidCommentResponse,
          idirComment: idirCommentArrayResponse,
        });

        const supplierInfo = {
          legalName: newLegalName.value,
          serviceAddress: newServiceAddress.value,
          recordsAddress: newRecordsAddress.value,
          ldvMakes: newMakes.value,
          supplierClass: newSupplierClass.value,
          ldvSales: response.data.ldvSales,
        };
        const newZevSales = response.data.zevSales;
        const salesData = [];
        // sales from assessment
        response.data.assessmentData.zevSales.forEach((item) => {
          salesData.push({
            newData: {},
            oldData: {
              make: item.make,
              model: item.modelName,
              modelYear: item.modelYear,
              sales: item.salesIssued,
              modelYearReportVehicle: item.id,
              range: item.range,
              zevClass: item.zevClass,
              zevType: item.vehicleZevType,
            },
          });
        });
        // new /adjusted sales
        newZevSales.forEach((item) => {
          if (item.modelYearReportVehicle) {
            const match = salesData.findIndex((record) => record.oldData.modelYearReportVehicle === item.modelYearReportVehicle);
            if (match >= 0) {
              salesData[match].newData = item;
            } else {
              salesData.push({ newData: item, oldData: {} });
            }
          } else {
            salesData.push({ newData: item, oldData: {} });
          }
        });
        setSalesRows(salesData);

        const creditActivity = [];

        response.data.creditActivity.forEach((each) => {
          creditActivity.push({
            category: each.category,
            creditAValue: each.creditAValue,
            creditBValue: each.creditBValue,
            modelYear: each.modelYear.name,
          });
        });

        setSupplementaryAssessmentData({
          supplementaryAssessment: {
            inCompliance,
            assessmentPenalty,
            decision,
            deficit,
          },
        });

        setNewData({
          ...newData,
          supplierInfo,
          creditActivity,
        });

        if (complianceResponse.data && complianceResponse.data.complianceObligation) {
          obligationDetails = complianceResponse.data.complianceObligation;
          setObligationDetails(complianceResponse.data.complianceObligation);
          setLdvSales(complianceResponse.data.ldvSales);
        }

        calculateBalance(creditActivity);
      }

      const reportYear = response.data.assessmentData && response.data.assessmentData.modelYear;
      const filteredRatios = ratioResponse.data.find(
        (data) => Number(data.modelYear) === Number(reportYear),
      );
      setRatios(filteredRatios);

      setLoading(false);
    }));
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated, location.pathname]);

  return (
    <SupplementaryDetailsPage
      addSalesRow={addSalesRow}
      analystAction={analystAction}
      checkboxConfirmed={checkboxConfirmed}
      commentArray={commentArray}
      deleteFiles={deleteFiles}
      details={details}
      directorAction={directorAction}
      errorMessage={errorMessage}
      files={files}
      handleAddIdirComment={handleAddIdirComment}
      handleCheckboxClick={handleCheckboxClick}
      handleCommentChange={handleCommentChange}
      handleCommentChangeBceid={handleCommentChangeBceid}
      handleCommentChangeIdir={handleCommentChangeIdir}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      handleSupplementalChange={handleSupplementalChange}
      id={id}
      ldvSales={ldvSales}
      loading={loading}
      newBalances={newBalances}
      newData={newData}
      newReport={newReport}
      obligationDetails={obligationDetails}
      query={query}
      radioDescriptions={radioDescriptions}
      ratios={ratios}
      salesRows={salesRows}
      setDeleteFiles={setDeleteFiles}
      setSupplementaryAssessmentData={setSupplementaryAssessmentData}
      setUploadFiles={setFiles}
      supplementaryAssessmentData={supplementaryAssessmentData}
      user={user}
    />
  );
};

SupplementaryContainer.defaultProps = {
  reassessment: false,
};

SupplementaryContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  reassessment: PropTypes.bool,
  user: CustomPropTypes.user.isRequired,
};

export default SupplementaryContainer;
