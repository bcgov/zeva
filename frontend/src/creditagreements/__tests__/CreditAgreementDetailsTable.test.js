import React from 'react';
import { render, screen } from '@testing-library/react';
import CreditAgreementsDetailsTable from '../components/CreditAgreementsDetailsTable';
import '@testing-library/jest-dom/extend-expect';

describe('CreditAgreementsDetailsTable', () => {
	it('renders the table headers correctly', () => {
		const items = [
			{ numberOfCredits: 100, modelYear: '2024', creditClass: 'A' },
			{ numberOfCredits: 50, modelYear: '2023', creditClass: 'B' },
		];

		render(<CreditAgreementsDetailsTable items={items} />);

		expect(screen.getByText(/quantity/i)).toBeInTheDocument();
		expect(screen.getByText(/model year/i)).toBeInTheDocument();
		expect(screen.getByText(/zev class/i)).toBeInTheDocument();
	});

	it('renders the table rows correctly with provided data', () => {
		const items = [
			{ numberOfCredits: 1000, modelYear: '2024', creditClass: 'A' },
			{ numberOfCredits: 2000, modelYear: '2023', creditClass: 'B' },
		];

		render(<CreditAgreementsDetailsTable items={items} />);

		expect(screen.getByText('1,000.00')).toBeInTheDocument();
		expect(screen.getByText('2024')).toBeInTheDocument();
		expect(screen.getByText('A')).toBeInTheDocument();

		expect(screen.getByText('2,000.00')).toBeInTheDocument();
		expect(screen.getByText('2023')).toBeInTheDocument();
		expect(screen.getByText('B')).toBeInTheDocument();
	});

	it('renders correctly when no data is provided', () => {
		const items = [];
		render(<CreditAgreementsDetailsTable items={items} />);
		expect(screen.getByText(/no rows found/i)).toBeInTheDocument();
	});

	it('formats large numeric values correctly', () => {
		const items = [
			{ numberOfCredits: 1234567, modelYear: '2024', creditClass: 'C' },
		];

		render(<CreditAgreementsDetailsTable items={items} />);

		expect(screen.getByText('1,234,567.00')).toBeInTheDocument();
		expect(screen.getByText('2024')).toBeInTheDocument();
		expect(screen.getByText('C')).toBeInTheDocument();
	});
});

