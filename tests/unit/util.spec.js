import $ from 'jquery';
import flushPromises from 'flush-promises';

import {
  cosineDeclinationTerm,
  decimalRaToSexigesimal,
  decimalDecToSexigesimal,
  formatValue,
  formatField,
  formatFloat,
  formatDate,
  mostRecentRequest,
  objAsString,
  offsetCoordinate,
  sexagesimalDecToDecimal,
  sexagesimalRaToDecimal,
  rotateCoordinate,
  stateToBsClass,
  stateToIcon,
  timeFromNow
} from '@/util';

// Mock out remote network calls
jest.mock('jquery');
const { Deferred } = jest.requireActual('jquery');

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
    let result = rotateCoordinate(coordinate, 0, { ra: 0, dec: 0 });
    let expected = { ra: 1, dec: 0 };
    expect(result.ra).toEqual(expected.ra);
    expect(result.dec).toEqual(expected.dec);
  });

  it('rotates positive rotation', () => {
    let coordinate = { ra: 1, dec: 0 };
    let result = rotateCoordinate(coordinate, -90, { ra: 0, dec: 0 });
    let expected = { ra: 0, dec: 1 };
    expect(result.ra).toBeCloseTo(expected.ra, 1);
    expect(result.dec).toBeCloseTo(expected.dec, 1);
  });

  it('rotates negative rotation', () => {
    let coordinate = { ra: 1, dec: 0 };
    let result = rotateCoordinate(coordinate, 90, { ra: 0, dec: 0 });
    let expected = { ra: 0, dec: -1 };
    expect(result.ra).toBeCloseTo(expected.ra, 1);
    expect(result.dec).toBeCloseTo(expected.dec, 1);
  });

  it('rotates around a point that is not the origin', () => {
    let coordinate = { ra: 2, dec: 2 };
    let result = rotateCoordinate(coordinate, -90, { ra: 1, dec: 1 });
    let expected = { ra: 0, dec: 2 };
    expect(result.ra).toBeCloseTo(expected.ra, 1);
    expect(result.dec).toBeCloseTo(expected.dec, 1);
  });
});

describe('offsetCoordinate', () => {
  it('offsets coordinate', () => {
    let coordinate = { ra: 0, dec: 0 };
    let result = offsetCoordinate(coordinate, { ra: 3600, dec: 3600 });
    let expected = { ra: 1, dec: 1 };
    expect(result.ra).toBeCloseTo(expected.ra, 1);
    expect(result.dec).toEqual(expected.dec, 1);
  });

  it('offsets coordinate close to pole', () => {
    let coordinate = { ra: 0, dec: 89 };
    let result = offsetCoordinate(coordinate, { ra: 3600, dec: 3600 });
    let cosDec = cosineDeclinationTerm(coordinate.dec + 1.0);
    let expected = { ra: 1.0 / cosDec, dec: 90 };
    expect(result.ra).toBeCloseTo(expected.ra, 1);
    expect(result.dec).toBeCloseTo(expected.dec, 1);
  });
});

describe('objAsString', () => {
  it('returns object string', () => {
    let obj = { apples: 12, bananas: 4, pineapples: 1 };
    let result = objAsString(obj);
    let expected = 'apples: 12, bananas: 4, pineapples: 1';
    expect(result).toEqual(expected);
  });
  it('returns object string for empty object', () => {
    let obj = {};
    let result = objAsString(obj);
    let expected = '';
    expect(result).toEqual(expected);
  });
});

describe('mostRecentRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends single request runs done callback', async () => {
    let result;
    let alwaysRan = false;
    let failRan = false;
    let successResult = 1;
    $.ajax.mockReturnValueOnce(Deferred().resolve(successResult));
    const myMostRecentRequest = new mostRecentRequest(
      () => {
        return $.ajax({
          url: 'http://localhost'
        });
      },
      data => {
        result = data;
      },
      () => {
        failRan = true;
      },
      () => {
        alwaysRan = true;
      }
    );
    myMostRecentRequest.send();
    await flushPromises();
    expect(result).toBe(successResult);
    expect(alwaysRan).toBe(true);
    expect(failRan).toBe(false);
  });

  it('sends single request runs fail callback', async () => {
    let result;
    let alwaysRan = false;
    let failRan = false;
    let successResult = 1;
    $.ajax.mockReturnValueOnce(Deferred().reject());
    const myMostRecentRequest = new mostRecentRequest(
      () => {
        return $.ajax({
          url: 'http://localhost'
        });
      },
      data => {
        result = data;
      },
      () => {
        failRan = true;
      },
      () => {
        alwaysRan = true;
      }
    );
    myMostRecentRequest.send();
    await flushPromises();
    expect(result).not.toBe(successResult);
    expect(alwaysRan).toBe(true);
    expect(failRan).toBe(true);
  });

  it('sends two requests and only saves the most recent request', async () => {
    let result;
    let alwaysRan = false;
    let failRan = false;
    let successResultFirst = 1;
    let successResultSecond = 2;
    $.ajax.mockReturnValueOnce(Deferred().resolve(successResultFirst)).mockReturnValueOnce(Deferred().resolve(successResultSecond));
    const myMostRecentRequest = new mostRecentRequest(
      () => {
        return $.ajax({
          url: 'http://localhost'
        });
      },
      data => {
        result = data;
      },
      () => {
        failRan = true;
      },
      () => {
        alwaysRan = true;
      }
    );
    let firstRequest = myMostRecentRequest.send();
    let secondRequest = myMostRecentRequest.send();
    await flushPromises();
    expect(myMostRecentRequest.isCurrent(firstRequest)).toBe(false);
    expect(myMostRecentRequest.isCurrent(secondRequest)).toBe(true);
    expect(firstRequest.number).toBeLessThan(secondRequest.number);
    expect(result).toBe(successResultSecond);
    expect(alwaysRan).toBe(true);
    expect(failRan).toBe(false);
  });
});
