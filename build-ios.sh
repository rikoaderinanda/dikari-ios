#!/bin/bash
set -e

# =========================
# KONFIGURASI DASAR
# =========================
PROJECT_PATH="/media/cho/Repo/Repository/DIKARI/appacd/AppACD.csproj"
WEB_DIR="wwwroot"
BUILD_OUTPUT="publish"
APP_NAME="AC Dikari"
PACKAGE_ID="com.acdikari.app"

# =========================
# OPSI MODE BUILD
# =========================
MODE=${1:-production} # Gunakan "dev" untuk mode development, default: production

# =========================
# 1️⃣ Publish .NET Web App
# =========================
echo "🚀 Publishing .NET app..."
dotnet publish "$PROJECT_PATH" -c Release -o "$BUILD_OUTPUT"

# =========================
# 2️⃣ Sinkronisasi Web Assets
# =========================
echo "📦 Syncing web assets..."
rm -rf "$WEB_DIR"/*
cp -r "$BUILD_OUTPUT/wwwroot/"* "$WEB_DIR"/

# =========================
# 3️⃣ Update server.url di capacitor.config.json
# =========================
if [ "$MODE" = "dev" ]; then
  echo "🌐 Switching to LOCAL development server..."
  jq '.server.url = "http://localhost:5000" | .server.cleartext = true' capacitor.config.json > capacitor.tmp.json
else
  echo "🌐 Using PRODUCTION server (https://customer.dikariapp.com)..."
  jq '.server.url = "https://customer.dikariapp.com" | .server.cleartext = true' capacitor.config.json > capacitor.tmp.json
fi
mv capacitor.tmp.json capacitor.config.json

# =========================
# 4️⃣ Pastikan index.html ada
# =========================
if [ ! -f "$WEB_DIR/index.html" ]; then
  echo "❌ Error: Tidak ditemukan index.html di $WEB_DIR"
  exit 1
fi

# =========================
# 5️⃣ Inisialisasi EAS Build (jika belum)
# =========================
if [ ! -f "eas.json" ]; then
  echo "⚙️ Membuat konfigurasi EAS default..."
  eas init --non-interactive || {
    echo "⚠️ EAS init gagal otomatis, membuat file eas.json manual..."
    cat <<EOF > eas.json
{
  "cli": {
    "version": ">= 3.16.0",
    "appVersionSource": "remote"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "simulator": false
      }
    }
  }
}
EOF
  }
fi

# =========================
# 6️⃣ Pastikan Xcode Scheme ada (otomatis)
# =========================
SCHEME_PATH="ios/App/App.xcodeproj/xcshareddata/xcschemes"
SCHEME_FILE="$SCHEME_PATH/App.xcscheme"

if [ ! -f "$SCHEME_FILE" ]; then
  echo "🧩 Creating shared Xcode scheme..."
  mkdir -p "$SCHEME_PATH"
  cat <<EOF > "$SCHEME_FILE"
<?xml version="1.0" encoding="UTF-8"?>
<Scheme
   LastUpgradeVersion = "1430"
   version = "1.3">
   <BuildAction
      parallelizeBuildables = "YES"
      buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry
            buildForTesting = "YES"
            buildForRunning = "YES"
            buildForProfiling = "YES"
            buildForArchiving = "YES"
            buildForAnalyzing = "YES">
            <BuildableReference
               BuildableIdentifier = "primary"
               BlueprintName = "App"
               BuildableName = "App.app"
               ReferencedContainer = "container:App.xcodeproj">
            </BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <LaunchAction
      buildConfiguration = "Release"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB">
      <BuildableProductRunnable>
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintName = "App"
            BuildableName = "App.app"
            ReferencedContainer = "container:App.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </LaunchAction>
</Scheme>
EOF
fi

# =========================
# 7️⃣ Sync Capacitor iOS
# =========================
echo "⚡ Syncing Capacitor iOS project..."
npx cap sync ios

# =========================
# 8️⃣ Build .ipa via EAS Cloud
# =========================
echo "📱 Building iOS .ipa via EAS Cloud..."
eas build -p ios --profile preview --non-interactive

echo "✅ Build process completed!"
echo "👉 Cek hasil build di: https://expo.dev/accounts/<username>/projects/$APP_NAME/builds"
