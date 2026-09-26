jest.mock('react-native-html-to-pdf', () => ({
  generatePDF: jest.fn(),
}));

jest.mock('react-native-blob-util', () => ({
  MediaCollection: {
    copyToMediaStore: jest.fn(),
  },
}));

const { getPdfWatermarkMarkup } = require('../src/services/pdfExport');

describe('pdf watermark generation', () => {
  it('falls back to a branded SVG when the logo uri is missing', () => {
    const html = getPdfWatermarkMarkup();

    expect(html).toContain('data:image/svg+xml');
    expect(html).toContain('PEHRA');
    expect(html).not.toContain('src="null"');
    expect(html).not.toContain('src="undefined"');
  });
});
