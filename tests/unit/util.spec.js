import {
  decimalRaToSexigesimal,
  decimalDecToSexigesimal,
  formatValue,
  formatField,
  formatFloat,
  formatDate,
  sexagesimalDecToDecimal,
  sexagesimalRaToDecimal,
  rotateCoordinate,
  stateToBsClass,
  stateToIcon,
  timeFromNow
} from '@/util';

describe('sexagesimalDecToDecimal', () => {
  it('converts positive decimal right ascension to sexagesimal correctly', () => {
    let expected = 90.4443;
    let result = sexagesimalRaToDecimal('06:01:46.632');
    expect(parseFloat(result)).toBeCloseTo(parseFloat(expected), 3);
  });
});

describe('sexagesimalRaToDecimal', () => {
  it('converts positive decimal declination to sexagesimal correctly', () => {
    let expected = 14.888;
    let result = sexagesimalDecToDecimal('14:53:16.8');
    expect(parseFloat(result)).toBeCloseTo(expected, 3);
  });
});

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

describe('formatFloat', () => {
  it('formats float to precision 0 rounding up', () => {
    let value = 41.666;
    let result = formatFloat(value);
    let expected = '42';
    expect(result).toEqual(expected);
  });

  it('formats float represented as string to precision 0 rounding up', () => {
    let value = '41.666';
    let result = formatFloat(value);
    let expected = '42';
    expect(result).toEqual(expected);
  });

  it('formats float represented as string to precision 0', () => {
    let value = '41.166';
    let result = formatFloat(value);
    let expected = '41';
    expect(result).toEqual(expected);
  });

  it('formats float to precision 5', () => {
    let value = 41.12;
    let result = formatFloat(value, 5);
    let expected = '41.12000';
    expect(result).toEqual(expected);
  });

  it('formats zero', () => {
    let value = '0';
    let result = formatFloat(value, 1);
    let expected = '0.0';
    expect(result).toEqual(expected);
  });
});

describe('rotateCoordinates', () => {
  it('does nothing when rotation 0', () => {
    let coordinate = { ra: 1, dec: 0 };
    let result = rotateCoordinate(coordinate, { ra: 0, dec: 0 }, 0);
    let expected = { ra: 1, dec: 0 };
    expect(result.ra).toEqual(expected.ra);
    expect(result.dec).toEqual(expected.dec);
  });

  it('rotates positive rotation', () => {
    let coordinate = { ra: 1, dec: 0 };
    let result = rotateCoordinate(coordinate, { ra: 0, dec: 0 }, 90);
    let expected = { ra: 0, dec: 1 };
    expect(result.ra).toBeCloseTo(expected.ra, 1);
    expect(result.dec).toBeCloseTo(expected.dec, 1);
  });

  it('rotates negative rotation', () => {
    let coordinate = { ra: 1, dec: 0 };
    let result = rotateCoordinate(coordinate, { ra: 0, dec: 0 }, -90);
    let expected = { ra: 0, dec: -1 };
    expect(result.ra).toBeCloseTo(expected.ra, 1);
    expect(result.dec).toBeCloseTo(expected.dec, 1);
  });

  it('rotates around a point that is not the origin', () => {
    let coordinate = { ra: 2, dec: 2 };
    let result = rotateCoordinate(coordinate, { ra: 1, dec: 1 }, 90);
    let expected = { ra: 0, dec: 2 };
    expect(result.ra).toBeCloseTo(expected.ra, 1);
    expect(result.dec).toBeCloseTo(expected.dec, 1);
  });
});
