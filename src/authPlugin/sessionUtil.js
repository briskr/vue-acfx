//sessionStorage
export const session = function(key, value) {
  if (value === void 0) {
    var lsVal = sessionStorage.getItem(key);
    if (lsVal && lsVal.indexOf('autostringify-') === 0) {
      return JSON.parse(lsVal.split('autostringify-')[1]);
    } else {
      return lsVal;
    }
  } else {
    if (typeof value === 'object' || Array.isArray(value)) {
      value = 'autostringify-' + JSON.stringify(value);
    }
    return sessionStorage.setItem(key, value);
  }
};
