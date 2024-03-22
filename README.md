# Bookies-Frames
Bookies is a decentralized, non-custiodal sports betting exchange where users can participant as a bettor or bookmaker. 

## Updates 

## Setup


## Notifications 

### DC
1. Open a debugging chrome browser
```sh
<CHROME_EXE_FILE_PATH> --remote-debugging-port=9222 --profile-directory=<CHROME_PROFILE>
```
2. Go to http://127.0.0.1:9222/json/version and grab webSocketDebuggerUrl
3. Update the message in the `config.json` file.
4. Run direct cast script
```sh
node src\scripts\notifications\direct_cast.js
```

###  Mention
1. Run mention script
```sh
node src\scripts\notifications\mention.js
```