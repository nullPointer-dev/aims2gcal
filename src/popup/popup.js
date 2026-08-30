import { getAccessToken } from "../google/auth.js";
import { getOrCreateCalendar } from "../google/calendar.js";
import { getProfile } from "../google/profile.js";
import { syncCalendar } from "../google/sync.js";

const button = document.getElementById("actionBtn");
const message = document.getElementById("message");
const email = document.getElementById("email");
const logoutBtn = document.getElementById("logoutBtn");

initialize();

async function initialize() {

    chrome.identity.getAuthToken(
        {
            interactive: false
        },
        async (token) => {

            if (chrome.runtime.lastError || !token) {

                email.textContent = "Not signed in";

                logoutBtn.style.display = "none";

                button.textContent = "Sign in with Google";
                button.disabled = false;
                button.onclick = signIn;

                return;
            }

            try {

                const profile = await getProfile(token);

                email.textContent = profile.email;

            } catch {

                email.textContent = "Signed in";
            }

            logoutBtn.style.display = "block";
            logoutBtn.onclick = logout;

            button.textContent = "Sync Timetable";
            button.disabled = false;
            button.onclick = syncTimetable;
        }
    );
}

async function signIn() {

    try {

        button.disabled = true;
        button.textContent = "Signing in...";

        await getAccessToken();

        initialize();

    } catch (err) {

        console.error(err);

        message.textContent = err.message;

        button.disabled = false;
        button.textContent = "Sign in with Google";
    }
}

async function syncTimetable() {

    try {

        button.disabled = true;
        button.textContent = "Syncing...";
        message.textContent =
            "Fetching timetable...";

        const token = await getAccessToken();
        message.textContent = "Connecting to Google Calendar...";
        const calendarId = await getOrCreateCalendar(token);
        message.textContent = "Reading timetable...";
        console.log("Calendar ID:", calendarId);
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        const response = await chrome.tabs.sendMessage(
            tab.id,
            {
                type: "GET_EVENTS"
            }
        );
        console.log(response);
        console.log(response?.events?.length);
        message.textContent = "Preparing synchronization...";
        if (!response || response.events.length === 0) {
            throw new Error("Open your AIMS Course History page first.");
        }

        const result = await syncCalendar(
            calendarId,
            token,
            response.events,
            progress => {

                message.textContent = progress;

            }
        );
        message.textContent =
        `✓ Sync Complete

        Inserted: ${result.inserted}
        Updated: ${result.updated}
        Deleted: ${result.deleted}
        Unchanged: ${result.skipped}`;
        
    } catch (err) {

        console.error(err);
        message.textContent = err.message;

    } finally {

        button.disabled = false;
        button.textContent = "Sync Timetable";
    }
}

async function logout() {

    chrome.identity.getAuthToken(
        {
            interactive: false
        },
        async (token) => {

            if (token) {

                chrome.identity.removeCachedAuthToken({
                    token
                });

                try {

                    await fetch(
                        `https://accounts.google.com/o/oauth2/revoke?token=${token}`
                    );

                } catch {}

            }

            location.reload();
        }
    );
}