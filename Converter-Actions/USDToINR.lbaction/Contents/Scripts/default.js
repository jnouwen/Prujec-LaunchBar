/* 
USD to INR Action for LaunchBar
by Christian Bender (@ptujec)
2023-04-02

Documentation
- https://exchangeratesapi.io/documentation/
- https://developer.obdev.at/launchbar-developer-documentation/#/javascript-http/

Copyright see: https://github.com/Ptujec/LaunchBar/blob/master/LICENSE
*/

const apiKey = Action.preferences.apiKey;
const localDataPath = Action.supportPath + '/localData.json';
const todayDate = new Date().toISOString().split('T')[0];

function run(argument) {
  // Check for valid API Access Key
  if (apiKey == undefined) {
    setApiKey();
    return;
  }

  if (argument.includes(',')) {
    argument = parseFloat(argument.replace(/,/g, '.'));
  }

  //   LaunchBar.alert(argument);

  if (argument != undefined) {
    if (argument.trim() == '' || isNaN(argument)) {
      return;
    }
  }

  // Check stored rates are from today to see if a new API call is needed
  var makeAPICall = true;

  if (File.exists(localDataPath)) {
    var localData = File.readJSON(localDataPath);
    var rateInfoDate = localData.data.date;

    if (todayDate == rateInfoDate) {
      makeAPICall = false;
    }
  }

  if (makeAPICall == true) {
    var ratesData = HTTP.getJSON(
      'http://api.exchangeratesapi.io/v1/latest?access_key=' +
        apiKey +
        '&symbols=USD,INR'
    );
    if (ratesData.response.status != 200) {
      LaunchBar.alert(
        ratesData.response.status + ': ' + ratesData.response.localizedStatus
      );
      return;
    }
    // Store data to reduce API calls
    File.writeJSON(ratesData, localDataPath);
  } else {
    var ratesData = localData;
  }

  // Using EUR as the base because of API restricitons
  var dollarToEuroRate = ratesData.data.rates.USD;
  var oneDollarInEuro = 1 / dollarToEuroRate;

  var inrToEuroRate = ratesData.data.rates.INR;
  var oneInrInEuro = 1 / inrToEuroRate;

  var usdToInr = oneDollarInEuro * inrToEuroRate;

  var inrToUsd = oneInrInEuro * dollarToEuroRate;

  var inputAsNumber = parseFloat(argument);

  var inrResult = (inputAsNumber * usdToInr).toFixed(2).toString();

  var usdResult = (inputAsNumber * inrToUsd).toFixed(3).toString();

  return [
    {
      title: inrResult,
      subtitle: argument + ' USD (Rate: ' + usdToInr.toFixed(2) + ')',
      icon: 'iconTemplate',
      badge: 'INR',
    },
    {
      title: usdResult.toString(),
      subtitle: argument + ' INR (Rate: ' + inrToUsd.toFixed(3) + ')',
      icon: 'icon2Template',
      badge: 'USD',
    },
  ];
}

function setApiKey() {
  var response = LaunchBar.alert(
    'API Access Key required',
    'You can get a free API Access Key at https://exchangeratesapi.io/pricing/. Copy the key to your clipboard, run the action again and choose »Set API-Token«',
    'Open Website',
    'Set API-Token',
    'Cancel'
  );
  switch (response) {
    case 0:
      LaunchBar.openURL('https://exchangeratesapi.io/pricing/');
      LaunchBar.hide();
      break;
    case 1:
      Action.preferences.apiKey = LaunchBar.getClipboardString().trim();
      LaunchBar.alert(
        'Success!',
        'API Access Key set to: ' + Action.preferences.apiKey
      );
      break;
    case 2:
      break;
  }
}