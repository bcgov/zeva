const API_BASE_PATH = '/compliance'

const COMPLIANCE = {
  LDVSALES: `${API_BASE_PATH}/ldv-sales`,
  CALCULATOR: `${API_BASE_PATH}/calculator`,
  REPORTS: `${API_BASE_PATH}/reports`,
  RATIOS: `${API_BASE_PATH}/ratios`,
  NEW: `${API_BASE_PATH}/reports/new/supplier-information`,
  ASSESSMENT_EDIT: `${API_BASE_PATH}/report/:id/assessment/edit`,
  REPORT_DETAILS: `${API_BASE_PATH}/reports/:id`,
  REPORT_SUPPLIER_INFORMATION: `${API_BASE_PATH}/reports/:id/supplier-information`,
  REPORT_CONSUMER_SALES: `${API_BASE_PATH}/reports/:id/consumer-sales`,
  REPORT_CREDIT_ACTIVITY: `${API_BASE_PATH}/reports/:id/credit-activity`,
  REPORT_SUMMARY: `${API_BASE_PATH}/reports/:id/summary`,
  REPORT_ASSESSMENT: `${API_BASE_PATH}/reports/:id/assessment`,
  REPORT_ASSESSMENT_SAVE: `${API_BASE_PATH}/reports/:id/assessment_patch`,
  OBLIGATION: `${API_BASE_PATH}/compliance-activity-details`,
  OBLIGATION_SAVE: `${API_BASE_PATH}/compliance-activity-details/:id/update_obligation`,
  CONSUMER_SALES: `${API_BASE_PATH}/consumer-sales`,
  RETRIEVE_CONSUMER_SALES: `${API_BASE_PATH}/consumer-sales/:id`,
  REPORT_COMPLIANCE_DETAILS_BY_ID: `${API_BASE_PATH}/compliance-activity-details/:id/details`,
  REPORT_SUMMARY_CONFIRMATION: `${API_BASE_PATH}/reports/:id/submission_confirmation`,
  REPORT_SUBMISSION: `${API_BASE_PATH}/reports/:id/submission`,
  ASSESSMENT_COMMENT_SAVE: `${API_BASE_PATH}/reports/:id/comment_save`,
  ASSESSMENT_COMMENT_PATCH: `${API_BASE_PATH}/reports/:id/comment_patch`,
  ASSESSMENT_COMMENT_DELETE: `${API_BASE_PATH}/reports/:id/comment_delete`,
  YEARS: `${API_BASE_PATH}/reports/years`,
  MAKES: `${API_BASE_PATH}/reports/:id/makes`,
  SUPPLEMENTAL_CREATE: `${API_BASE_PATH}/reports/:id/supplemental_save`,
  NOA_HISTORY: `${API_BASE_PATH}/reports/:id/noa_history`,
  SUPPLEMENTAL_HISTORY: `${API_BASE_PATH}/reports/:id/supplemental_history`,
  STATUSES_ALLOW_REASSESSMENT: `${API_BASE_PATH}/reports/:id/statuses_allow_reassessment`,
  SUPPLEMENTAL_CREDIT_ACTIVITY: `${API_BASE_PATH}/reports/:supp_id/supplemental_credit_activity`,
  PREVIOUS_REASSESSMENT_CREDIT_ACTIVITY: `${API_BASE_PATH}/compliance-activity-details/:id/previous_reassessment_credit_activity`,
  REASSESSMENT_CREDIT_ACTIVITY: `${API_BASE_PATH}/compliance-activity-details/:supp_id/reassessment_credit_activity`
}

export default COMPLIANCE