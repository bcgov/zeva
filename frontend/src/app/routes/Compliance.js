const API_BASE_PATH = '/compliance';

const COMPLIANCE = {
  LDVSALES: `${API_BASE_PATH}/ldv-sales`,
  CALCULATOR: `${API_BASE_PATH}/calculator`,
  REPORTS: `${API_BASE_PATH}/reports`,
  RATIOS: `${API_BASE_PATH}/ratios`,
  REPORT_ADD: `${API_BASE_PATH}/reports/add`,
  REPORT_DETAILS: `${API_BASE_PATH}/reports/:id`,
  REPORT_EDIT: `${API_BASE_PATH}/reports/:id/edit`,
};

export default COMPLIANCE;
