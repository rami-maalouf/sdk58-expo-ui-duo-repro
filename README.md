# @expo/ui 58.0.18: ArrangementView and onHingeChange do nothing on the iPhone Duo (SDK 58)

A minimal repro: the SDK 58 default template (`npx create-expo-app@latest --template default@sdk-58`,
expo 58.0.11, @expo/ui 58.0.18, react-native 0.88.0) with one changed file, `src/app/index.tsx`.
The home screen shows an `ArrangementView` with `arrangementViewStyle('split')` (a PRIMARY and a
SECONDARY panel) and counts `onHingeChange` events. Checked on October 15, 2026 on the iPhone Duo
simulator (iOS 27.1), built with Xcode 27.1.

| Branch | Setup | Result |
|---|---|---|
| `main` | the default: precompiled `@expo/ui` | the panels stay stacked, `onHingeChange` counts 0 events |
| `build-expo-ui-from-source` | `expo.autolinking.ios.buildFromSource: ["@expo/ui"]` | the panels sit side by side when the Duo is open, `onHingeChange` counts every fold |

## Steps

```bash
npm install
npx expo prebuild --platform ios --clean
DEVELOPER_DIR=/Applications/Xcode-27.1.app/Contents/Developer npx expo run:ios -d "iPhone Duo"
```

Then fold and unfold the simulator. I used the `hinge` command of serve-sim, which comes with
`expo-device-hub` 0.15.3: `serve-sim hinge half -d <simulator udid>`, then `unfold` and `fold`.

On `main`: PRIMARY stays above SECONDARY, open, half open, or folded, and the counter stays at
`onHingeChange events: 0`. The app does not show an error, Metro prints no warning, and the app's
system log has no message from Expo about `ArrangementView` or the hinge.

On `build-expo-ui-from-source` (run the same steps): open, the panels sit side by side, and every fold
adds an event, such as `180° fullyOpen`, `90° partiallyOpen`, and `0° closed`.

## Cause

- The iPhone Duo code in `@expo/ui` compiles only with the iOS 27.1 SDK:
  - `ios/ArrangementViewView.swift` and `ios/Modifiers/ArrangementModifiers.swift`:
    `#if canImport(SwiftUICore, _version: 8.0.85)`
  - `ios/Modifiers/HingeObservationModifiers.swift` (`onHingeChange`):
    `#if canImport(SwiftUI, _version: 8.0.85) // iOS 27.1 SDK`
  - SwiftUI and SwiftUICore are version 8.0.84 in the iOS 27.0 SDK (Xcode 27.0) and 8.0.85 in the
    iOS 27.1 SDK (Xcode 27.1).
- The precompiled `ExpoUI` framework in the `main` build was built with the iOS 26.4 SDK:
  `vtool -show-build <app>/Frameworks/ExpoUI.framework/ExpoUI` prints `sdk 26.4`. So that code is
  not in it.
- expo/expo's EAS precompile workflow for iOS,
  `apps/expo-workflow-testing/.eas/workflows/changesets-precompile-ios.yml`, uses the image
  `macos-tahoe-26.4-xcode-26.4`.

## Workaround

```json
{
  "expo": {
    "autolinking": {
      "ios": { "buildFromSource": ["@expo/ui"] }
    }
  }
}
```

Then `npx expo prebuild --platform ios --clean` and build with Xcode 27.1.
