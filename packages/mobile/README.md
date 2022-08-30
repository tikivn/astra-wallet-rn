# Astra Hub

## Prepare Environment 
set enviroment avaiable for these keys below:
### for CodePush
ASTRA_HUB_APP_CENTER_ANDROID_UAT
ASTRA_HUB_APP_CENTER_ANDROID_PROD
ASTRA_HUB_APP_CENTER_ANDROID_CONFIG_SECRET
### for release Android apk 
ASTRA_WALLET_ANDROID_KEY_FILE
ASTRA_WALLET_ANDROID_KEY_PASS_FILE

## Building
before build, run yarn setup (scripts/setup.sh) to generate serect file from enviroment variables
```sh
yarn setup
```

in local enviroment, if don't have the release key, 
set Env "CI=1" to run and build Android apk with the default keystore in android/keys/debug
            
when build RC/ UAT version for inhouse testing, 
set app/useCodePush = false to skip code push check amd use local bundle directly

### build Android apk:
from root project folder:
```sh
cd packages/mobile/android/
```

for UAT/RC:
```sh
./gradlew assembleReleaseUAT
```

for Release:
```sh
./gradlew assembleRelease
```

options for build apk: 
    - assembleReleaseUAT : build UAT/RC apk for in house test
    - assembleRelease : build release version to submit to GG Play
    - bundleReleaseUAT / bundleRelease : same as assemble.. options except that out put is the bundle format(prefered for GG Play Submit)

### Release Code Push
install and setup appcenter as the following link: [AppCenter Cli](https://docs.microsoft.com/en-us/appcenter/distribution/codepush/cli)

#### release codePush for Android
```sh
export APPCENTER_PROJECT=tiki.mobile.team-tiki.vn/Astra_Wallet_Android
```
Optional: List the deployment keys of project: 
```sh
appcenter codepush deployment list -a $APPCENTER_PROJECT -k
```

For UAT/RC
```sh
appcenter codepush release-react -a $APPCENTER_PROJECT -d UAT
```
For Store version:
```sh
appcenter codepush release-react -a $APPCENTER_PROJECT -d Prod
```
Read [Code Push releases](https://docs.microsoft.com/en-us/appcenter/distribution/codepush/rn-updates) for more details
