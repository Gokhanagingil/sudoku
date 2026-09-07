import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

describe('Kuş Köyü app flow', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  it('shows Başla rather than a false Continue state on first launch', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Oyuna başla/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Kaldığın yerden devam et/i })).not.toBeInTheDocument();
  });

  it('changes theme without leaving settings', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Ayarları aç' }));
    const geometric = screen.getByRole('button', { name: /Geometrik/i });
    fireEvent.click(geometric);
    expect(geometric).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Bulmaca değişmez; yalnızca simgeler değişir.')).toBeInTheDocument();
  });

  it('opens the first guided lesson before the board is played', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Oyuna başla/i }));
    expect(screen.getByText('KISA DERS 1/2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Birlikte yapalım' })).toBeInTheDocument();
  });
});
