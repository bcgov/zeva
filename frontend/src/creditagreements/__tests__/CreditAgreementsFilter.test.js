import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreditAgreementsFilter from '../components/CreditAgreementsFilter';
import '@testing-library/jest-dom/extend-expect';
import history from '../../app/History'; // Mock history
import { CreditAgreementsFilterTestData } from './test-data/testData';

jest.mock('../../app/History', () => ({
	push: jest.fn(),
}));

jest.mock('../../app/utilities/getOptions', () =>
	jest.fn(() => [
		<option key="ISSUED" value="ISSUED">ISSUED</option>,
		<option key="DRAFT" value="DRAFT">DRAFT</option>,
	])
);

describe('CreditAgreementsFilter Component', () => {
	const { mockProps } = CreditAgreementsFilterTestData;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders the supplier and status filters with correct options', () => {
		const { container } = render(<CreditAgreementsFilter {...mockProps} />);

		expect(container.querySelector('#col-supplier')).toBeInTheDocument();
		expect(container.querySelector('#col-status')).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Supplier A' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Supplier B' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'ISSUED' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'DRAFT' })).toBeInTheDocument();
	});

	it('updates filters when a supplier is selected', () => {
		const { container } = render(<CreditAgreementsFilter {...mockProps} />);

		const supplierFilter = container.querySelector('#col-supplier');
		fireEvent.change(supplierFilter, { target: { value: 'Supplier A' } });

		expect(mockProps.setFiltered).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({ id: 'col-supplier', value: 'Supplier A' }),
			])
		);
	});

	it('updates filters when a status is selected', async () => {
		const { container } = render(<CreditAgreementsFilter {...mockProps} />);
		const statusFilter = container.querySelector('#col-status');

		fireEvent.change(statusFilter, { target: { value: 'ISSUED' } });

		expect(mockProps.setFiltered).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({ id: 'col-status', value: 'ISSUED' }),
			])
		);
	});

	it('calls handleClear when "Clear Filters" button is clicked', () => {
		render(<CreditAgreementsFilter {...mockProps} />);

		const clearButton = screen.getByRole('button', { name: /clear filters/i });
		fireEvent.click(clearButton);

		expect(mockProps.handleClear).toHaveBeenCalled();
	});

	it('renders "New Transaction" button for Government users but not for Directors', () => {
		render(<CreditAgreementsFilter {...mockProps} />);

		const newTransactionButton = screen.getByRole('button', { name: /new transaction/i });
		expect(newTransactionButton).toBeInTheDocument();

		fireEvent.click(newTransactionButton);
		expect(history.push).toHaveBeenCalledWith('/credit-agreements/new');
	});

	it('does not render "New Transaction" button for Directors', () => {
		const directorProps = {
			...mockProps,
			user: {
				...mockProps.user,
				roles: [{ roleCode: 'Director' }],
			},
		};

		render(<CreditAgreementsFilter {...directorProps} />);

		expect(screen.queryByText(/new transaction/i)).not.toBeInTheDocument();
	});
});

