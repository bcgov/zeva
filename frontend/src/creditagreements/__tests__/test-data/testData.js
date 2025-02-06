import moment from 'moment';
import { jest } from '@jest/globals';

export const CreditAgreementDetailsPageTestData = (status = "DRAFT") => ({
	mockProps: {
		analystAction: true,
		directorAction: false,
		details: {
			transactionType: 'Credit Agreement',
			updateTimestamp: moment().toISOString(),
			updateUser: { id: 12345, displayName: 'Jonny' },
			status: status,
			filteredIdirComments: [
				{ id: 1, comment: 'LGTM!', createUser: { id: '12345' }, user: { id: 1, name: 'Jonny' } },
			],
			filteredBceidComments: [],
			creditAgreementContent: [],
			attachments: [{ id: 1, filename: 'test.pdf', url: '/test.pdf' }],
			optionalAgreementId: '12345',
			effectiveDate: '2024-12-31',
			organization: { name: 'Test Organization' },
		},
		handleAddComment: jest.fn(),
		handleCommentChangeBceid: jest.fn(),
		handleCommentChangeIdir: jest.fn(),
		handleInternalCommentEdit: jest.fn(),
		handleInternalCommentDelete: jest.fn(),
		handleSubmit: jest.fn(),
		id: '1',
		user: { isGovernment: true },
	},
});

export const CreditAgreementsFilterTestData = {
	mockProps: {
		user: {
			isGovernment: true,
			roles: [{ roleCode: 'Analyst' }],
		},
		items: [
			{ organization: { name: 'Supplier A' }, status: 'DRAFT' },
			{ organization: { name: 'Supplier B' }, status: 'ISSUED' },
		],
		filtered: [],
		setFiltered: jest.fn(),
		handleClear: jest.fn(),
	},
};

