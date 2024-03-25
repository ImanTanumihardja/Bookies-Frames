# Bookies-Frames
Bookies is a decentralized, non-custiodal sports betting exchange where users can participant as a bettor or bookmaker. 

## Updates 

## Setup


## Notifications 

### DC
Login to Warpcast on a chrome browser profile. End chrome in task manager. 

#### CONNECT: Connect to a open remote debugging chrome browser
1. Open a remote debugging chrome browser with chrome account that is logged in to Warpcast
```sh
<CHROME_EXE_FILE_PATH> --remote-debugging-port=9222 --profile-directory=<CHROME_PROFILE>
```
2. Go to http://127.0.0.1:9222/json/version and copy webSocketDebuggerUrl and update that in the `config.json`

or

#### LAUNCH: Have puppeter open a browser with Warpcast profile
1. Get path location of chrome.exe, user data dir, and profile name (go to chrome://version).
2.  Update all this information in `config.json`


Once you a browser that is Logged in into a Warpcast account.
1. Update the message in the `config.json` file.
2. Run `direct_cast.js` script
```sh
node src\scripts\notifications\direct_cast.js 
```

###  Mention
1. Add the parent hash for the thread of notifications to confgi and run mention script
```sh
node src\scripts\notifications\mention.js
```