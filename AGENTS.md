# Project Status Notes

## React WebView Project

Path: `C:\Projects\MyPazhonicMobileReact`

Status:
- Frontend lint passes with `npm.cmd run lint`.
- Frontend production build passes with `npm.cmd run build`.
- The app is designed for Android WebView use, with browser/dev mode supported through `src/utils/developmentBridge.ts`.
- Latest React build has been copied into the Android project assets.

Implemented frontend work:
- Mobile routes are under `/app`.
- WiFi panel flow is available at `/app/panel/connect/wifi/select-branch/...`.
- WiFi workspace has been redesigned for mobile app use instead of desktop-responsive tables.
- WiFi workspace shell now includes:
  - Top connection header
  - Panel summary block
  - Horizontal communication logs panel
  - Group tabs and page tabs for fast switching
  - Sticky bottom command bar
- Sticky bottom command bar includes:
  - Ping panel
  - Download all tab data
  - Upload all tab data
  - Exit to panel list
- WiFi flow includes these mobile pages/sections:
  - Panel details
  - Partitions
  - Inputs
  - Outputs
  - Users
  - Access
  - Events
  - Boss modules
  - Monitoring
  - Communication modules
  - Card
  - Remote
  - Reports
  - Debug
  - Settings
- First redesigned WiFi pages:
  - `مشخصات پنل`
    - Mobile cards for panel time/date
    - Panel model/version details
    - Network settings card
    - Receive panel details/network actions
    - Clock sync action
  - `پارتیشن ها`
    - Card-based mobile layout instead of wide table
    - Search by partition
    - Active/inactive filters
    - Summary metrics
    - Expandable partition cards with timing and sensor details
    - Receive/send partition actions
- React bridge wrappers exist for real Android WiFi operations:
  - `wifiSendData`
  - `wifiReceiveData`
  - `wifiSendCommand`

Important files:
- `src/pages/panel/WifiConnectionPage.tsx`
- `src/pages/panel/PanelConnectionPage.tsx`
- `src/utils/androidBridge.ts`
- `src/utils/developmentBridge.ts`
- `src/app/router.tsx`

## Android Project

Path: `C:\Users\ASUS\AndroidStudioProjects\MyPazhonicTest`

Status:
- Android debug build passes when using Android Studio JBR:
  - `JAVA_HOME=C:\Program Files\Android\Android Studio\jbr`
- Latest WebView assets are in:
  - `app\src\main\assets\reactapp`
- Latest pasted React asset names after WiFi redesign:
  - `assets/PanelConnectionPage-Tfsvo22Y.js`
  - `assets/index-D5Xm_Xsq.js`
  - `assets/index-BoviXJ-8.css`
- Debug APK output:
  - `app\build\outputs\apk\debug\app-debug.apk`

Implemented Android bridge/native work:
- Native WiFi TCP service added:
  - `app/src/main/java/com/example/mypazhonictest/panel/PanelWifiService.kt`
- WebView bridge exposes:
  - `wifiSendData`
  - `wifiReceiveData`
  - `wifiSendCommand`
- TCP client now reads panel responses ending with `;@`.
- Test processor id is hardcoded for hardware validation:
  - `BFEBFBFF000B0671`
- Serial request format now uses:
  - `userPC-BFEBFBFF000B0671-0-codeUD-GetSerialNumber;@`

Important Android files:
- `app/src/main/java/com/example/mypazhonictest/panel/PanelProtocol.kt`
- `app/src/main/java/com/example/mypazhonictest/panel/PanelTcpClient.kt`
- `app/src/main/java/com/example/mypazhonictest/panel/PanelWifiService.kt`
- `app/src/main/java/com/example/mypazhonictest/bridge/WebViewBridge.kt`
- `app/src/main/java/com/example/mypazhonictest/MainActivity.kt`
- `app/src/main/java/com/example/mypazhonictest/di/AppModule.kt`

## Reference Electron Project

Path: `C:\Projects\UDL-Clean-Electron`

Status:
- Used only as read-only reference for routes, command codes, TCP flow, and UI behavior.
- Do not modify this project unless explicitly requested.

Reference behavior copied conceptually:
- WiFi flow route structure under `select-branch`.
- TCP command patterns:
  - Send data: `userPC-pId-serialNumber-codeUD-code-tabCode;@`
  - Receive data: `userPC-pId-serialNumber-codeUD-code-tabCode-Get;@`
  - Serial number: `userPC-pId-0-codeUD-GetSerialNumber;@`
- Receive flow sends initial request, then repeatedly sends `Valid` to collect chunks until final response.

## Build Notes

React:
```powershell
npm.cmd run lint
npm.cmd run build
```

Copy React build to Android assets:
```powershell
$source = Resolve-Path 'C:\Projects\MyPazhonicMobileReact\dist'
$target = 'C:\Users\ASUS\AndroidStudioProjects\MyPazhonicTest\app\src\main\assets\reactapp'
Remove-Item -LiteralPath $target -Recurse -Force
New-Item -ItemType Directory -Path $target | Out-Null
Copy-Item -Path (Join-Path $source '*') -Destination $target -Recurse -Force
```

Android:
```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\gradlew.bat --no-daemon :app:assembleDebug
```
