import sortViolations from './sortViolations';

const mockViolationData = [
  {
    impact: 'minor',
    description: 'Ensures every id attribute value is unique',
    tags: 'cat.parsing,wcag2a,wcag411',
  },
  {
    impact: 'critical',
    description:
      'Ensures <img> elements have alternate text or a role of none or presentation',
    tags: 'cat.text-alternatives,wcag2a,wcag111,section508,section508.22.a,ACT',
  },
  {
    impact: 'serious',
    description: 'Ensures every HTML document has a lang attribute',
    tags: 'cat.language,wcag2a,wcag311,ACT',
  },
  {
    impact: 'moderate',
    description: 'Ensures all page content is contained by landmarks',
    tags: 'cat.keyboard,best-practice',
  },
];
describe('sortViolationsTest', () => {
  it('Should sort the violations by impact order', () => {
    expect(mockViolationData[0].impact).toBe('minor');
    sortViolations(mockViolationData);
    expect(mockViolationData[0].impact).toBe('critical');
    expect(mockViolationData[3].impact).toBe('minor');
  });
});
