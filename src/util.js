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

function formatFloat(value, precision) {
  /* Round a number and format it with the given precision */
  let valueAsNumber = Number(value);
  precision = precision || 0;
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
    durationString = duration.days() + ' days ' + durationString;
  }
  if (duration.hours() > 0) {
    durationString += duration.hours() + ' hrs ' + durationString;
  }
  durationString += duration.minutes() + ' min ' + duration.seconds() + ' sec';
  return durationString;
}

function getFromObject(obj, path, defaultValue) {
  return _.get(obj, path, defaultValue);
}

function round(value, decimalPlaces) {
  let factor = Math.pow(10, decimalPlaces);
  return Math.round(value * factor) / factor;
}

function objAsString(value) {
  let result = '';
  for (let key in value) {
    if (result) {
      result += `, ${key}: ${value[key]}`;
    } else {
      // This is the first key, value pair being printed
      result += `${key}: ${value[key]}`;
    }
  }
  return result;
}

export {
  copyObject,
  decimalDecToSexigesimal,
  decimalRaToSexigesimal,
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
  round,
  sexagesimalDecToDecimal,
  sexagesimalRaToDecimal,
  stateToBsClass,
  stateToIcon,
  timeFromNow
};
