import { fireEvent, render, screen } from '@testing-library/react';
import { CONSENT_KEY, CookieNotice } from '../cookie-notice';

describe('CookieNotice', () => {
  beforeEach(() => localStorage.clear());

  it('shows the notice until it is accepted', () => {
    render(<CookieNotice />);
    expect(screen.getByRole('region', { name: /aviso de cookies/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /entendi/i }));
    expect(screen.queryByRole('region', { name: /aviso de cookies/i })).not.toBeInTheDocument();
    expect(localStorage.getItem(CONSENT_KEY)).toBe('true');
  });

  it('stays hidden for people who already accepted', () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    render(<CookieNotice />);
    expect(screen.queryByRole('region', { name: /aviso de cookies/i })).not.toBeInTheDocument();
  });
});
