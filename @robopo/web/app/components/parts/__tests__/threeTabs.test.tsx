import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThreeTabs } from '../threeTabs';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('ThreeTabs', () => {
  it('renders tabs with titles', () => {
    const tab1Content = <div>Tab 1 Content</div>;
    const tab2Content = <div>Tab 2 Content</div>;
    const tab3Content = <div>Tab 3 Content</div>;

    render(
      <ThreeTabs
        tab1Title="Tab 1"
        tab1={tab1Content}
        tab2Title="Tab 2"
        tab2={tab2Content}
        tab3Title="Tab 3"
        tab3={tab3Content}
      />
    );

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });
});
