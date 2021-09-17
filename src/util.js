import _ from 'lodash';
import moment from 'moment';

const defaultTooltipConfig = {
  delay: {
    show: 500,
    hide: 100
  },
  trigger: 'hover'
};

const defaultDatetimeFormat = 'YYYY-MM-DD HH:mm:ss';

const defaultAladinScriptLocation = 'https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.js';
const defaultAladinStyleLocation = 'https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.css';

function zPadFloat(num) {
  return num.toLocaleString(undefined, { minimumIntegerDigits: 2, maximumFractionDigits: 4 });
}

function decimalRaToSexigesimal(deg) {
  let rs = 1;
  let ra = deg;
  if (deg < 0) {
    rs = -1;
    ra = Math.abs(deg);
  }
  let raH = Math.floor(ra / 15);
  let raM = Math.floor((ra / 15 - raH) * 60);
  let raS = ((ra / 15 - raH) * 60 - raM) * 60;
  return {
    h: raH * rs,
    m: raM,
    s: raS,
    str: (rs > 0 ? '' : '-') + zPadFloat(raH) + ':' + zPadFloat(raM) + ':' + zPadFloat(raS)
  };
}

function decimalDecToSexigesimal(deg) {
  let ds = 1;
  let dec = deg;
  if (deg < 0) {
    ds = -1;
    dec = Math.abs(deg);
  }
  let decf = Math.floor(dec);
  let decM = Math.abs(Math.floor((dec - decf) * 60));
  let decS = (Math.abs((dec - decf) * 60) - decM) * 60;
  return {
    deg: decf * ds,
    m: decM,
    s: decS,
    str: (ds > 0 ? '' : '-') + zPadFloat(decf) + ':' + zPadFloat(decM) + ':' + zPadFloat(decS)
  };
}

function sexagesimalRaToDecimal(ra) {
  // algorithm: ra_decimal = 15 * ( hh + mm/60 + ss/(60 * 60) )
  /*                 (    hh     ):(     mm            ):  (   ss  ) */
  if (typeof ra === 'string') {
    let m = ra.match('^([0-9]?[0-9])[: ]([0-5]?[0-9][.0-9]*)[: ]?([.0-9]+)?$');
    if (m) {
      let hh = parseInt(m[1], 10);
      let mm = parseFloat(m[2]);
      let ss = m[3] ? parseFloat(m[3]) : 0.0;
      if (hh >= 0 && hh <= 23 && mm >= 0 && mm < 60 && ss >= 0 && ss < 60) {
        ra = (15.0 * (hh + mm / 60.0 + ss / 3600.0)).toFixed(10);
      }
    }
  }
  return ra;
}

function sexagesimalDecToDecimal(dec) {
  // algorithm: dec_decimal = sign * ( dd + mm/60 + ss/(60 * 60) )
  /*                  ( +/-   ) (    dd     ):(     mm            ): (   ss   ) */
  if (typeof dec === 'string') {
    let m = dec.match('^([+-])?([0-9]?[0-9])[: ]([0-5]?[0-9][.0-9]*)[: ]?([.0-9]+)?$');
    if (m) {
      let sign = m[1] === '-' ? -1 : 1;
      let dd = parseInt(m[2], 10);
      let mm = parseFloat(m[3]);
      let ss = m[4] ? parseFloat(m[4]) : 0.0;
      if (dd >= 0 && dd <= 90 && mm >= 0 && mm <= 59 && ss >= 0 && ss < 60) {
        dec = (sign * (dd + mm / 60.0 + ss / 3600.0)).toFixed(10);
      }
    }
  }
  return dec;
}

function formatJson(dict) {
  let stringVal = '';
  for (let key in dict) {
    if (!_.isEmpty(dict[key]) || _.isNumber(dict[key])) {
      if (!_.isEmpty(stringVal)) {
        stringVal += ', ';
      }
      stringVal += key + ': ' + dict[key];
    }
  }
  return stringVal;
}

function formatValue(value) {
  if (_.isObject(value) && !_.isArray(value)) {
    return formatJson(value);
  } else if (_.isNumber(value) && !_.isInteger(value) && !isNaN(value)) {
    return Number(value).toFixed(4);
  }
  return value;
}

function formatField(value, apiFieldToHumanReadable) {
  apiFieldToHumanReadable = apiFieldToHumanReadable || {};
  if (value in apiFieldToHumanReadable) {
    return apiFieldToHumanReadable[value]['humanReadable'];
  } else {
    let words = value.split('_');
    words = words.map(function(word) {
      return word.charAt(0).toUpperCase() + word.substr(1);
    });
    return words.join(' ');
  }
}

function formatDate(date, formatString) {
  formatString = formatString || 'YYYY-MM-DD HH:mm:ss';
  if (date) {
    return moment.utc(String(date)).format(formatString);
  }
}

function formatFloat(value, precision = 0) {
  /* Round a number and format it with the given precision */
  let valueAsNumber = Number(value);
  if (valueAsNumber === 0 || valueAsNumber) {
    const multiplier = Math.pow(10, precision);
    return (Math.round(valueAsNumber * multiplier) / multiplier).toFixed(precision);
  } else {
    return value;
  }
}

function stateToBsClass(state, classPrefix) {
  let state_map = {
    PENDING: 'info',
    SCHEDULED: 'info',
    COMPLETED: 'success',
    FAILURE_LIMIT_REACHED: 'danger',
    WINDOW_EXPIRED: 'danger',
    CANCELED: 'danger'
  };
  return classPrefix + '-' + state_map[state];
}

function stateToIcon(state) {
  let stateMap = {
    PENDING: 'sync',
    SCHEDULED: 'sync',
    COMPLETED: 'check',
    FAILURE_LIMIT_REACHED: 'times',
    WINDOW_EXPIRED: 'times',
    CANCELED: 'times'
  };
  return 'fa fa-fw fa-' + stateMap[state];
}

function timeFromNow(date) {
  if (date) {
    return moment.utc(String(date)).fromNow();
  } else {
    return '';
  }
}

function copyObject(source) {
  let copy = {};
  _.assign(copy, source);
  return copy;
}

function extractTopLevelErrors(errors) {
  let topLevelErrors = [];
  if (_.isString(errors)) {
    // The error will be a string if a validate_xxx method of the parent serializer
    // returned an error, for example the validate_instrument_configs method on the
    // ConfigurationSerializer. These should be displayed at the top of a section.
    topLevelErrors = _.concat(topLevelErrors, [errors]);
  }
  if (errors.non_field_errors) {
    topLevelErrors = _.concat(topLevelErrors, errors.non_field_errors);
  }
  return topLevelErrors;
}

function generateDurationString(durationSeconds) {
  // Generate a string representation of a requestgroup duration
  let duration = moment.duration(durationSeconds, 'seconds');
  let durationString = '';
  if (duration.days() > 0) {
    durationString = duration.days() + ' days ';
  }
  if (duration.hours() > 0) {
    durationString += duration.hours() + ' hrs ';
  }
  durationString += duration.minutes() + ' min ' + duration.seconds() + ' sec';
  return durationString;
}

function getFromObject(obj, path, defaultValue) {
  return _.get(obj, path, defaultValue);
}

function round(value, decimalPlaces = 1) {
  let factor = Math.pow(10, decimalPlaces);
  return Math.round(value * factor) / factor;
}

function objAsString(obj) {
  // Get a string representation of a simple object
  let result = '';
  for (let key in obj) {
    if (result) {
      result += `, ${key}: ${obj[key]}`;
    } else {
      // This is the first key, value pair being printed
      result += `${key}: ${obj[key]}`;
    }
  }
  return result;
}

function cosineDeclinationTerm(declination) {
  let cosDec = Math.cos((declination * Math.PI) / 180);
  // If the cosine dec ends up being 0, offset it slightly so that there are no divisions by zero. It doesn't need to be that
  // precise since this is only for visualization purposes and a small shift won't matter.
  cosDec = Math.max(cosDec, 10e-4);
  return cosDec;
}

function offsetCoordinate(initial, offset) {
  // Calculate coordinates from provided offsets. Equations pulled
  // from https://www.atnf.csiro.au/computing/software/miriad/doc/offset.html
  // Takes a object with the initial coordinate and an object with the offsets,
  // where each object has "ra" and "dec" keys, and outputs an object with the
  // initial coordinate with the offset applied.
  const ARC_SEC_PER_DEG = 3600;
  let finalDec = initial['dec'] + offset['dec'] / ARC_SEC_PER_DEG;
  return {
    ra: initial['ra'] + offset['ra'] / ARC_SEC_PER_DEG / cosineDeclinationTerm(finalDec),
    dec: finalDec
  };
}

function rotateCoordinate(coordinate, angle, center = { ra: 0, dec: 0 }) {
  // Move the target coordinate to the origin. RA goes along the x direction and Declination along the y.
  let coordX = coordinate['ra'] - center['ra'];
  let coordY = coordinate['dec'] - center['dec'];
  // Rotate the target coordinate about the origin. To rotate clockwise, which is east of north,
  // use the following equations:
  // xrotated = x * cos(angle) + y * sin(angle)
  // yrotated = x * -sin(angle) + y * cos(angle)
  let cosAngle = Math.cos((angle * Math.PI) / 180);
  let sinAngle = Math.sin((angle * Math.PI) / 180);
  let coordXRotated = coordX * cosAngle + coordY * sinAngle;
  let coordYRotated = coordX * -sinAngle + coordY * cosAngle;
  // Shift the rotated coordinate back so that the center is taken into account
  let coordXShiftedBack = coordXRotated + center['ra'];
  let coordYShiftedBack = coordYRotated + center['dec'];
  return { ra: coordXShiftedBack, dec: coordYShiftedBack };
}

const mostRecentRequestManager = class mostRecentRequestManager {
  // Simple wrapper class used to manage a JQuery AJAX request when only the result from the most recently
  // sent request should be used.
  //
  // Parameters:
  // `request`: A function that initiates an AJAX request and returns the jqXHR object.
  // `onDone`: A function that will be called when the request succeeds.
  // `onFail`: A function that will be called when the request fails.
  // `onAlways`: A function that will always be called when the request completes.
  //
  // This wrapper class is helpful when:
  // 1. Request A is sent
  // 2. Request B is sent
  // 3. Response from Request B arrives
  // 4. Response from Request A arrives
  // In this case, the order that the reponses arrive are swapped, which is a problem if you rely on receiving
  // them in order.
  #request;
  #onDone;
  #onFail;
  #onAlways;
  #mostRecentRunningRequest = { jqXHR: null, number: 0 };

  constructor(request, onDone, onFail, onAlways) {
    this.#request = request;
    this.#onDone = onDone;
    this.#onFail = onFail;
    this.#onAlways = onAlways;
  }

  isCurrent(request) {
    // Check if the request that is passed in is the same as the currently running one.
    return request.number === this.#mostRecentRunningRequest.number;
  }

  send() {
    // Start a new request.
    let newJqXHR = this.#request();
    let newRequestNumber = this.#mostRecentRunningRequest.number + 1;
    let newRequest = { jqXHR: newJqXHR, number: newRequestNumber };
    this.#mostRecentRunningRequest = _.cloneDeep(newRequest);
    newJqXHR.done((data, textStatus, jqXHR) => {
      if (this.isCurrent(newRequest) && this.#onDone) {
        this.#onDone(data, textStatus, jqXHR);
      }
    });
    newJqXHR.fail((jqXHR, textStatus, errorThrown) => {
      if (this.isCurrent(newRequest) && this.#onFail) {
        this.#onFail(jqXHR, textStatus, errorThrown);
      }
    });
    newJqXHR.always((dataOrJqXHR, textStatus, jqXHROrErrorThrown) => {
      if (this.isCurrent(newRequest) && this.#onAlways) {
        this.#onAlways(dataOrJqXHR, textStatus, jqXHROrErrorThrown);
      }
    });
    return newRequest;
  }
};

export {
  copyObject,
  cosineDeclinationTerm,
  decimalDecToSexigesimal,
  decimalRaToSexigesimal,
  defaultAladinScriptLocation,
  defaultAladinStyleLocation,
  defaultDatetimeFormat,
  defaultTooltipConfig,
  extractTopLevelErrors,
  formatDate,
  formatField,
  formatFloat,
  formatValue,
  generateDurationString,
  getFromObject,
  objAsString,
  offsetCoordinate,
  rotateCoordinate,
  round,
  mostRecentRequestManager,
  sexagesimalDecToDecimal,
  sexagesimalRaToDecimal,
  stateToBsClass,
  stateToIcon,
  timeFromNow
};
