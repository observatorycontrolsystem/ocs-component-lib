import { decimalRaToSexigesimal, decimalDecToSexigesimal, formatValue, formatField } from '@/util';

describe('decimalRaToSexigesimal', () => {
  it('converts positive decimal right ascension to sexagesimal correctly', () => {
    let expected = '06:01:46.632';
    let result = decimalRaToSexigesimal(90.4443).str;
    expect(result).toEqual(expected);
  });
});

describe('decimalDecToSexigesimal', () => {
  it('converts positive decimal declination to sexagesimal correctly', () => {
    let expected = '14:53:16.8';
    let result = decimalDecToSexigesimal(14.888).str;
    expect(result).toEqual(expected);
  });
});

describe('formatValue', () => {
  it('formats numbers to 4 decimal places', () => {
    let expected = '5.9000';
    let result = formatValue(5.9);
    expect(result).toEqual(expected);
  });
});

describe('formatField', () => {
  it('formats string without human readable translation correctly', () => {
    let expected = 'Foo Bar Baz';
    let result = formatField('foo_bar_baz');
    expect(result).toEqual(expected);
  });
});
