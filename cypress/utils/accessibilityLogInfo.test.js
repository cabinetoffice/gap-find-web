import accessibilityLogInfo from './accessibilityLogInfo';

describe('accessibilityLogInfo', () => {
  const singleViolation = 1;
  const multipleViolations = 3;
  it('Should return correct message when more that 1 violation', () => {
    expect(accessibilityLogInfo(singleViolation)).toBe(
      '1 accessibility violation was detected.',
    );
  });

  it('Should return correct message when there is only 1 violation', () => {
    expect(accessibilityLogInfo(multipleViolations)).toBe(
      '3 accessibility violations were detected.',
    );
  });
});
