const apiKey = Action.preferences.apiKey;
const ratesDataPath = Action.cachePath + '/localRatesData.json';
const cLocale = LaunchBar.currentLocale;

const minMaxFractionDefault = {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
};
const minMaxFractionRate = {
  maximumFractionDigits: 4,
  minimumFractionDigits: 2,
};

const currencyListData = File.readJSON(
  Action.path + '/Contents/Resources/currencyList.json'
);

if (LaunchBar.currentLocale == 'de') {
  var currencyList = currencyListData.currencies_de;
} else {
  var currencyList = currencyListData.currencies;
}

// SETTING VARIABLES
var base = Action.preferences.base;

if (base == undefined) {
  base = 'USD';
}

var baseSetting = {
  title: 'Choose base currency'.localize(),
  icon: 'settings',
  badge: 'USD',
  // children: baseCurrencyList(),
  action: 'baseCurrencyList',
};

if (base != undefined) {
  baseSetting.badge = base;
}

var targetsSetting = {
  title: 'Choose target currencies'.localize(),
  icon: 'settings',
  // children: targetCurrencyList(),
  action: 'targetCurrencyList',
};

var targetCurrencies = Action.preferences.targetCurrencies;
if (targetCurrencies == undefined) {
  targetCurrencies = [];
}

if (targetCurrencies != '') {
  targetsSetting.badge = targetCurrencies.join(', ');
}