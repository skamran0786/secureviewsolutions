// __tests__/footer.test.js

import { getByText, getByRole } from '@testing-library/dom';
import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

/**
 * @jest-environment jsdom
 */

describe('Footer Bottom Section', () => {
  beforeAll(() => {
    // Load the HTML file's content into JSDOM.
    // This assumes your tests are run from the project root.
    const html = fs.readFileSync(
      path.resolve(__dirname, '../index.html'),
      'utf8'
    );
    document.body.innerHTML = html;
  });

  test('should display the correct copyright notice', () => {
    // The HTML source is `&copy; 2024 SecureView Solutions`.
    // The DOM parser converts `&copy;` to the '©' symbol, which we test for.
    const copyrightRegex = /© 2024 SecureView Solutions/i;
    
    // Find the paragraph containing the copyright text
    const copyrightElement = getByText(document.body, copyrightRegex);

    // Assert that the element exists and is a paragraph with the correct class
    expect(copyrightElement).toBeInTheDocument();
    expect(copyrightElement.tagName).toBe('P');
    expect(copyrightElement).toHaveClass('copyright-text');
  });

  test('should include a link to the Privacy Policy', () => {
    const privacyLink = getByRole(document.body, 'link', { name: /privacy policy/i });

    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveClass('privacy-link');
    expect(privacyLink).toHaveAttribute('href', '#');
  });

  test('should display the developer credit with a correct link', () => {
    const creditParagraph = getByText(document.body, /Designed & Developed by/i);
    const developerLink = getByRole(creditParagraph, 'link', { name: /Mohd Kamran Siddiquee/i });
    
    expect(developerLink).toBeInTheDocument();
    expect(developerLink).toHaveAttribute('href', 'https://mohdkamransiddiquee.netlify.app/');
    expect(developerLink).toHaveAttribute('target', '_blank');
  });
});