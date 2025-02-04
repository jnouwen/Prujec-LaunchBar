# LaunchBar Action: Send iMessage to Contact

You can tell LaunchBar to open Messages for a phone number out of the box. This action is an alternative way to do it. With this action all you need to do is select a contact and send it to the action. The number is picked automatically. 

<img src="01.gif" width="780"/>

Or you can select the action and type the contacts name.  

## Note about Swift scripts
Swift scripts run faster when compiled. Unfortunately I can't share the action with a compiled script. For security reasons Apple adds a `com.apple.quarantine` attribute to every downloaded file. (You can check that in Terminal with `‌xattr` plus the path to the file.) 

This is not a problem yet. The problem starts when the main script file is an executable. If you want to run that you will get a malware alert.

You can compile `default.swift` file yourself with `swiftc -O default.swift`. You will need Command Line Tools for that. [But it's a fairly easy and small install](https://www.maketecheasier.com/install-command-line-tools-without-xcode/). Obviously you also need to change the `LBScriptName` key in `info.plist`, pointing it to the executable. 

Now you have the compiled executable and you know it matches the source file, because you compiled it yourself. But the action still won't run. This is because of the attribute on every other file of the action bundle. You can remove the attribute with LaunchBars built in `Open Anyways` action. Just be aware that this will remove the attribute from all files in that bundle. Potentially there could be other executables that the main script refers to. So check the whole bundle before you do this. And only do it if you trust the source. 

**I know, that sounds like a lot. That is why I built [an action to make that process easier](https://github.com/Ptujec/LaunchBar/tree/master/Compile-Swift-Action#readme).** 

## Download
[Click here](https://github.com/Ptujec/LaunchBar/archive/refs/heads/master.zip) to download this LaunchBar action along with all the others. Or [clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) this repository.

## Updates

Use [Local Action Updates](https://github.com/Ptujec/LaunchBar/tree/master/Local-Action-Updates#launchbar-action-local-action-updates) to keep track of new versions of all my actions and discover new ones at the same time. 

This action also supports [Action Updates](https://renaghan.com/launchbar/action-updates/) by Padraic Renaghan.