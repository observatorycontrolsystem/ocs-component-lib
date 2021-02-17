import _ from 'lodash';

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

export { decimalDecToSexigesimal, decimalRaToSexigesimal, formatValue, formatField };
