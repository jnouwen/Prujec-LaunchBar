/* 
Quit Applications (by Context) Action for LaunchBar
by Christian Bender (@ptujec)
2022-04-04

Copyright see: https://github.com/Ptujec/LaunchBar/blob/master/LICENSE
*/

String.prototype.localizationTable = 'default';

const textFilePath = Action.path + '/Contents/Resources/contexts.txt';

function run() {
  var firstrun = Action.preferences.firstrun;

  if (firstrun == undefined || LaunchBar.options.shiftKey) {
    // Open Text File on first run or when using the ⌥ (alt/option) key
    LaunchBar.hide();
    Action.preferences.firstrun = false;
    LaunchBar.openURL(File.fileURLForPath(textFilePath));
  } else {
    // Show Contexts
    var names = File.readText(textFilePath).split('\n');
    var result = [];
    names.forEach(function (item) {
      if (!item.startsWith('--') && item != '') {
        var contextTitle = item.split(':')[0];
        var icon = item.split(':')[1];
        if (icon == undefined) {
          icon = 'iconTemplate';
        } else {
          icon = icon.trim();
        }
        result.push({
          title: contextTitle.localize(),
          subtitle:
            'Quits applications not in "'.localize() +
            contextTitle.localize() +
            '". (Edit: ⇧⏎)'.localize(),
          icon: icon,
          action: 'main',
          actionArgument: contextTitle,
        });
      }
    });
    return result;
  }
}

function main(contextTitle) {
  var contextJSONFile = Action.supportPath + '/' + contextTitle + '.json';
  Action.preferences.contextJSONFile = contextJSONFile;

  if (LaunchBar.options.shiftKey || !File.exists(contextJSONFile)) {
    // Edit … when holding shift … or if context does not exist in preferences

    if (!File.exists(contextJSONFile)) {
      // Create
      var data = {
        title: contextTitle,
        apps: [],
      };
      File.writeJSON(data, contextJSONFile);
    }
    // Modifiy
    var output = showOptions();
    return output;
  } else {
    // Launch
    var contextJSON = File.readJSON(contextJSONFile);
    var showAlert = contextJSON.showAlert;
    var apps = contextJSON.apps;

    var exclusions = ['com.apple.finder', 'at.obdev.LaunchBar'];

    apps.forEach(function (item) {
      exclusions.push(item.id);
    });

    if (showAlert == true || showAlert == undefined) {
      alert(exclusions);
    } else {
      quitApplications(exclusions);
    }
  }
}

function showOptions() {
  var contextJSON = File.readJSON(Action.preferences.contextJSONFile);
  var contextTitle = contextJSON.title;
  var showAlert = contextJSON.showAlert;
  var keepCurrent = contextJSON.keepCurrent;

  // Alert
  var alert = [
    {
      title: 'Show Alert'.localize(),
      subtitle: 'Show alert before quitting.'.localize(),
      action: 'toggleAlert',
      icon: 'alertTemplate',
    },
  ];

  if (showAlert == true || showAlert == undefined) {
    // alert[0].label = '✔︎';
    alert[0].label = contextTitle.localize() + ': ✔︎';
  }

  // Currently Frontmost Application
  var current = [
    {
      title: 'Frontmost Application'.localize(),
      subtitle: "Don't quit the frontmost application.".localize(),
      action: 'toggleCurrent',
      icon: 'currentTemplate',
    },
  ];

  if (keepCurrent == true || keepCurrent == undefined) {
    current[0].label = contextTitle.localize() + ': ✔︎';
  }

  // Finder Windows
  var closeFinderWindowsOption = contextJSON.closeFinderWindowsOption;

  var finderWindows = [
    {
      title: 'Finder Windows'.localize(),
      subtitle: 'Close Finder Windows.'.localize(),
      action: 'toggleCloseFinderWindows',
      // icon: 'com.apple.finder',
      icon: 'windowStackTemplate',
    },
  ];

  if (closeFinderWindowsOption == true) {
    finderWindows[0].label = contextTitle.localize() + ': ✔︎';
  }

  // Excluded Applications
  var apps = contextJSON.apps;

  var resultEx = [];
  var exList = [];

  if (apps != undefined) {
    apps.forEach(function (item) {
      var title = File.displayName(item.path).replace('.app', '');
      resultEx.push({
        title: title,
        subtitle: title + ' will keep running'.localize(),
        path: item.path,
        icon: item.id,
        action: 'toggleExclude',
        actionArgument: item.path,
        label: contextTitle.localize() + ': ✔︎',
      });
      exList.push(item.path);
    });

    resultEx.sort(function (a, b) {
      return a.title > b.title;
    });
  }

  // System Applications
  var sysAppsPath = '/System/Applications/';
  var sysApps = File.getDirectoryContents(sysAppsPath);

  var result = [
    {
      title: 'Action Editor',
      path: '/Applications/LaunchBar.app/Contents/Resources/Action Editor.app',
      icon: 'at.obdev.LaunchBar.ActionEditor',
      action: 'toggleExclude',
      actionArgument:
        '/Applications/LaunchBar.app/Contents/Resources/Action Editor.app',
    },
  ];

  sysApps.forEach(function (item) {
    if (item.endsWith('.app')) {
      var path = sysAppsPath + item;
      var title = File.displayName(path).replace('.app', '');

      var infoPlistPath = path + '/Contents/Info.plist';
      var infoPlist = File.readPlist(infoPlistPath);

      var agentApp = infoPlist.LSUIElement;
      // var appType = infoPlist.LSApplicationCategoryType;
      var appID = infoPlist.CFBundleIdentifier;

      if (
        !exList.includes(path) &&
        title != 'LaunchBar' &&
        // appType != 'public.app-category.utilities' &&
        agentApp != true
      ) {
        result.push({
          title: title,
          path: path,
          icon: appID,
          action: 'toggleExclude',
          actionArgument: path,
        });
      }
    }
  });

  // Installed Applications
  var installedAppsPath = '/Applications/';
  var installedApps = File.getDirectoryContents(installedAppsPath);

  installedApps.forEach(function (item) {
    if (item.endsWith('.app')) {
      var path = installedAppsPath + item;
      var title = File.displayName(path).replace('.app', '');

      var infoPlistPath = path + '/Contents/Info.plist';

      if (!File.exists(infoPlistPath)) {
        path = installedAppsPath + item + '/Wrapper/' + item.replace(/\s/g, '');
        infoPlistPath = path + '/Info.plist';
      }

      var infoPlist = File.readPlist(infoPlistPath);

      var agentApp = infoPlist.LSUIElement;
      // var appType = infoPlist.LSApplicationCategoryType;
      var appID = infoPlist.CFBundleIdentifier;

      if (
        !exList.includes(path) &&
        title != 'LaunchBar' &&
        // appType != 'public.app-category.utilities' &&
        agentApp != true
      ) {
        result.push({
          title: title,
          path: path,
          icon: appID,
          action: 'toggleExclude',
          actionArgument: path,
        });
      }
    }
  });

  // Utility Applications
  var utilityAppsPath = '/System/Applications/Utilities/';
  var utilityApps = File.getDirectoryContents(utilityAppsPath);

  utilityApps.forEach(function (item) {
    if (item.endsWith('.app')) {
      var path = utilityAppsPath + item;
      var title = File.displayName(path).replace('.app', '');

      var infoPlistPath = path + '/Contents/Info.plist';

      var infoPlist = File.readPlist(infoPlistPath);

      var agentApp = infoPlist.LSUIElement;
      var appID = infoPlist.CFBundleIdentifier;

      if (!exList.includes(path) && title != 'LaunchBar' && agentApp != true) {
        result.push({
          title: title,
          path: path,
          icon: appID,
          action: 'toggleExclude',
          actionArgument: path,
        });
      }
    }
  });

  result.sort(function (a, b) {
    return a.title > b.title;
  });

  var resultAll = alert.concat(
    current.concat(finderWindows.concat(resultEx.concat(result)))
  );

  return resultAll;
}

function toggleAlert() {
  var contextJSON = File.readJSON(Action.preferences.contextJSONFile);
  var showAlert = contextJSON.showAlert;

  if (showAlert == true || showAlert == undefined) {
    contextJSON.showAlert = false;
  } else {
    contextJSON.showAlert = true;
  }

  File.writeJSON(contextJSON, Action.preferences.contextJSONFile);

  var output = showOptions();
  return output;
}

function toggleCurrent() {
  var contextJSON = File.readJSON(Action.preferences.contextJSONFile);
  var keepCurrent = contextJSON.keepCurrent;

  if (keepCurrent == true || keepCurrent == undefined) {
    contextJSON.keepCurrent = false;
  } else {
    contextJSON.keepCurrent = true;
  }

  File.writeJSON(contextJSON, Action.preferences.contextJSONFile);

  var output = showOptions();
  return output;
}

function toggleCloseFinderWindows(path) {
  var contextJSON = File.readJSON(Action.preferences.contextJSONFile);
  var closeFinderWindowsOption = contextJSON.closeFinderWindowsOption;

  if (closeFinderWindowsOption == true) {
    contextJSON.closeFinderWindowsOption = false;
  } else {
    contextJSON.closeFinderWindowsOption = true;
  }

  File.writeJSON(contextJSON, Action.preferences.contextJSONFile);

  var output = showOptions();
  return output;
}

function toggleExclude(path) {
  var contextJSON = File.readJSON(Action.preferences.contextJSONFile);
  var apps = contextJSON.apps;

  var excludeID = LaunchBar.executeAppleScript(
    'set appID to bundle identifier of (info for ("' + path + '"))'
  ).trim();

  var exclude = {
    path: path,
    id: excludeID,
  };

  for (var i = 0; i < apps.length; i++) {
    if (apps[i].id == exclude.id) {
      contextJSON.apps.splice(i, 1);
      var broke = true;
      break;
    }
  }
  if (broke != true) {
    contextJSON.apps.push(exclude);
  }

  File.writeJSON(contextJSON, Action.preferences.contextJSONFile);

  var output = showOptions();
  return output;
}

function alert(exclusions) {
  var contextJSON = File.readJSON(Action.preferences.contextJSONFile);
  var closeFinderWindowsOption = contextJSON.closeFinderWindowsOption;
  var keepCurrent = contextJSON.keepCurrent;

  var allAppsAS =
    'tell application "System Events" \n' +
    '  set allApps to bundle identifier of (every process whose background only is false) as list \n';

  var countWindowsAS =
    '  tell application process "Finder" to set windowCount to count windows\n';

  var currentAppAS =
    '  set currentApp to bundle identifier of (process 1 where frontmost is true)\n';

  var endTellSysEventsAS = 'end tell\n';

  var exclusionsAS = 'set exclusions to "' + exclusions + '"\n';

  var exclusionsPlusCurrentAS = 'set exclusions to exclusions & currentApp \n';

  var toQuitAS =
    'set toQuit to {}\n' +
    'repeat with thisApp in allApps\n' +
    '  set thisApp to thisApp as text\n' +
    '  if thisApp is not in exclusions then\n' +
    '     set end of toQuit to name of application id thisApp\n' +
    '  end if\n' +
    'end repeat\n';

  var returnAS = 'return toQuit';

  if (closeFinderWindowsOption == true) {
    allAppsAS = allAppsAS + countWindowsAS;
    returnAS = returnAS + ' & "\n" & windowCount';
  }

  if (keepCurrent == true || keepCurrent == undefined) {
    var appleScript =
      allAppsAS +
      currentAppAS +
      endTellSysEventsAS +
      exclusionsAS +
      exclusionsPlusCurrentAS +
      toQuitAS +
      returnAS;
  } else {
    var appleScript =
      allAppsAS + endTellSysEventsAS + exclusionsAS + toQuitAS + returnAS;
  }

  var appleScriptResult = LaunchBar.executeAppleScript(appleScript)
    .trim()
    .split(', \n');
  var toQuit = appleScriptResult[0];

  if (toQuit != '' || closeFinderWindowsOption == true) {
    if (closeFinderWindowsOption == true && toQuit != '') {
      var toClose = parseInt(appleScriptResult[1].replace(', ', ''));
      if (toClose > 0) {
        var dialog =
          'Quit '.localize() +
          toQuit +
          ' and close '.localize() +
          toClose +
          ' Finder windows.'.localize();
      } else {
        var dialog = toQuit;
      }
    } else if (closeFinderWindowsOption == false && toQuit != '') {
      var dialog = toQuit;
    } else {
      var toClose = parseInt(appleScriptResult[1].replace(', ', ''));
      if (toClose > 0) {
        var dialog = 'Close Finder Windows.'.localize();
      }
    }

    var response = LaunchBar.alert(
      'Quit Applications'.localize(),
      dialog,
      'Ok',
      'Cancel'
    );
    switch (response) {
      case 0:
        LaunchBar.hide();
        quitApplications(exclusions);
      case 1:
        // LaunchBar.hide();
        break;
    }
  } else {
    LaunchBar.hide();
  }
}

function quitApplications(exclusions) {
  LaunchBar.hide();

  var contextJSON = File.readJSON(Action.preferences.contextJSONFile);
  var closeFinderWindowsOption = contextJSON.closeFinderWindowsOption;
  var keepCurrent = contextJSON.keepCurrent;

  var closeFinderWindowsAS =
    'tell application "Finder" to close every window\n';

  var allAppsAS =
    'tell application "System Events" \n' +
    '  set allApps to bundle identifier of (every process whose background only is false) as list \n';

  var currentAppAS =
    '  set currentApp to bundle identifier of (process 1 where frontmost is true)\n';

  var endTellSysEventsAS = 'end tell\n';

  var exclusionsAS = 'set exclusions to "' + exclusions + '"\n';

  var exclusionsPlusCurrentAS = 'set exclusions to exclusions & currentApp \n';

  var quitAS =
    'repeat with thisApp in allApps\n' +
    '  set thisApp to thisApp as text\n' +
    '  if thisApp is not in exclusions then\n' +
    '    tell application id thisApp\n' +
    '      activate\n' +
    '      quit\n' +
    '    end tell\n' +
    '  end if\n' +
    'end repeat';

  if (keepCurrent == true || keepCurrent == undefined) {
    var appleScript =
      allAppsAS +
      currentAppAS +
      endTellSysEventsAS +
      exclusionsAS +
      exclusionsPlusCurrentAS +
      quitAS;
  } else {
    var appleScript = allAppsAS + endTellSysEventsAS + exclusionsAS + quitAS;
  }

  if (closeFinderWindowsOption == true) {
    appleScript = closeFinderWindowsAS + appleScript;
  }

  LaunchBar.executeAppleScript(appleScript);
}