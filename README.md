# AIMS2GCal

Sync your IIT Hyderabad AIMS timetable with Google Calendar.

## Features

- Fetches registered courses and timetable from AIMS
- Creates recurring Google Calendar events with proper RRULE
- Incremental sync (insert/update/delete/skip unchanged)
- Automatic calendar creation/reuse
- Rate-limit aware with exponential backoff

## Prerequisites

- Node.js 18+
- Google Cloud project with Calendar API enabled
- OAuth 2.0 Client ID (Chrome Extension type)

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd aims2gcal
npm install

# 2. Configure OAuth client ID
npm run setup YOUR_CLIENT_ID.apps.googleusercontent.com

# 3. Build extension
npm run build

# 4. Load in Chrome
# - Open chrome://extensions
# - Enable "Developer mode"
# - Click "Load unpacked" → select the `dist/` folder

# 5. Get your Extension ID
# - Find "AIMS Timetable to Google Calendar" in extensions list
# - Copy the Extension ID (32-char string)

# 6. Add redirect URI in Google Cloud Console
# - Go to APIs & Services → Credentials → Your OAuth Client ID
# - Add authorized redirect URI:
#   https://<YOUR_EXTENSION_ID>.chromiumapp.org/
# - Save

# 7. Use the extension
# - Click extension icon → "Sign in with Google"
# - Open AIMS Course History page
# - Click "Sync Timetable"
```

## Detailed Setup

### 1. Google Cloud Project

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google Calendar API**: APIs & Services → Library → Google Calendar API → Enable
4. Configure **OAuth Consent Screen**:
   - User Type: External
   - App name: "AIMS Timetable Sync"
   - Add scopes: `.../auth/calendar`, `.../auth/userinfo.email`
   - Add test users (your email)
5. Create **OAuth 2.0 Client ID**:
   - Application type: Chrome Extension
   - Name: "AIMS2GCal"
   - Extension ID: Leave blank for now (fill after step 4)
   - Copy the generated Client ID

### 2. Configure Extension

```bash
npm run setup 123456789-abcdefghijklmnop.apps.googleusercontent.com
```

This updates `public/manifest.json` with your Client ID.

### 3. Build & Load

```bash
npm run build
# Load `dist/` folder as unpacked extension in chrome://extensions
```

### 4. Complete OAuth Setup

After loading, copy the **Extension ID** from `chrome://extensions` (32 lowercase letters).

In Google Cloud Console → Credentials → Your OAuth Client ID → **Authorized redirect URIs**, add:

```
https://<YOUR_EXTENSION_ID>.chromiumapp.org/
```

Save. Reload the extension.

### 5. Sync Timetable

1. Click extension icon → "Sign in with Google"
2. Open [AIMS Course History](https://aims.iith.ac.in/aims/courseReg/viewMyCourseHistory)
3. Click "Sync Timetable" in extension popup

## How It Works

1. **Content script** runs on AIMS pages, extracts student ID from page
2. Fetches course history and batch timetable via AIMS internal APIs
3. Filters to current semester, builds normalized course/slot data
4. **Popup** handles OAuth, calendar creation, and sync orchestration
5. **Background** service worker (minimal, mostly for message passing)
6. **Sync engine** diffs AIMS events vs Google Calendar events using `extendedProperties.private.aimsId`
7. Applies changes with concurrency control and retry logic

## Project Structure

```
src/
├── aims/           # AIMS API & parsing
│   ├── api.js      # Fetch course history & timetable
│   ├── parser.js   # Normalize AIMS response
│   └── session.js  # Extract student ID from page
├── calendar/       # Event building
│   └── eventBuilder.js
├── content/        # Content script (runs on AIMS pages)
│   └── content.js
├── google/         # Google Calendar integration
│   ├── auth.js         # OAuth token
│   ├── calendar.js     # Get/create calendar
│   ├── events.js       # Calendar API wrappers
│   ├── eventMapper.js  # AIMS event → Google event
│   ├── pool.js         # Concurrency pool
│   ├── profile.js      # User profile
│   ├── retry.js        # Exponential backoff
│   └── sync.js         # Diff & sync logic
├── popup/          # Extension popup UI
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
└── background/     # Service worker
    └── background.js
```

## Development

```bash
# Watch mode (rebuilds on change)
npm run dev

# Production build
npm run build
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Open your AIMS Course History page first" | Navigate to `https://aims.iith.ac.in/aims/courseReg/viewMyCourseHistory` before syncing |
| OAuth redirect_uri_mismatch | Verify Extension ID in GCP matches loaded extension |
| Rate limit errors | Built-in retry with backoff; wait and retry |
| No events generated | Check console (F12) on AIMS page for errors |
| Calendar not found | Extension creates "IITH Timetable" calendar automatically |

## License

MIT