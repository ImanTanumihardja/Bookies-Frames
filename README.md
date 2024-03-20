# Bookies-Frames
Bookies is a decentralized, non-custiodal sports betting exchange where users can participant as a bettor or bookmaker. 

## Updates 

## Setup


## Notifications 

### DC
1. Open a debugging chrome browser
```sh
<CHROME_EXE_FILE_PATH> --debugging-remote-port=9222 --profile-directory=<CHROME_PROFILE>
```
2. Update the message in the `config.json` file.
3. Run direct cast script
```sh
node src\scripts\notifications\direct_cast.js
```

###  Mention
1. Run mention script
```sh
node src\scripts\notifications\mention.js
```