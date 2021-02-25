import {
  decimalRaToSexigesimal,
  decimalDecToSexigesimal,
  formatValue,
  formatField,
  formatDate,
  stateToBsClass,
  stateToIcon,
  timeFromNow
} from '@/util';

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

describe('formatDate', () => {
  it('formats date using default format', () => {
    let date = '2021-02-03T04:55:28.474845Z';
    let result = formatDate(date);
    let expected = '2021-02-03 04:55:28';
    expect(result).toEqual(expected);
  });
  it('formats date using supplied format', () => {
    let date = '2021-02-03T04:55:28.474845Z';
    let result = formatDate(date, 'YYYY/MM/DD HH:mm');
    let expected = '2021/02/03 04:55';
    expect(result).toEqual(expected);
  });
});

describe('stateToBsClass', () => {
  it('returns correct class for pending', () => {
    let result = stateToBsClass('PENDING', 'text');
    let expected = 'text-info';
    expect(result).toEqual(expected);
  });
});

describe('stateToIcon', () => {
  it('returns correct icon for pending', () => {
    let expected = 'fa fa-fw fa-sync';
    let result = stateToIcon('PENDING');
    expect(result).toEqual(expected);
  });
});

describe('timeFromNow', () => {
  it('returns time in past', () => {
    let result = timeFromNow('2009-10-10 00:00:00'); // This date is definitely in the past
    expect(result).toContain('ago');
  });
});
