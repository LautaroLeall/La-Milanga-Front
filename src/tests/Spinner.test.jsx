import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Spinner from '../components/Spinner';

describe('Spinner Component', () => {
  it('should render the spinner correctly', () => {
    const { container } = render(<Spinner />);

    // El spinner usa la clase spinner-wrap
    const spinnerContainer = container.querySelector('.spinner-wrap');
    expect(spinnerContainer).toBeInTheDocument();
  });
});
