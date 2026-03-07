import { render, screen, fireEvent } from '@testing-library/react';
import CookieBanner from '../CookieBanner';

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders initially', () => {
    render(<CookieBanner />);
    expect(screen.getByText(/Usamos cookies para personalizar/i)).toBeInTheDocument();
  });

  it('hides after clicking accept', () => {
    render(<CookieBanner />);
    
    const bannerText = screen.getByText(/Usamos cookies para personalizar/i);
    const acceptBtn = screen.getByRole('button', { name: /entendi/i });

    expect(bannerText).toBeInTheDocument();
    
    fireEvent.click(acceptBtn);
    
    expect(bannerText).not.toBeInTheDocument();
    expect(localStorage.getItem('cookie-consent')).toBe('true');
  });
});
