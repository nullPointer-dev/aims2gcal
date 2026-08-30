const CALENDAR_NAME = "IITH Timetable";
const STORAGE_KEY = "calendarId";

function getStoredCalendarId() {
    return new Promise(resolve => {
        chrome.storage.local.get(STORAGE_KEY, result => {
            resolve(result[STORAGE_KEY] ?? null);
        });
    });
}

function storeCalendarId(calendarId) {
    return new Promise(resolve => {
        chrome.storage.local.set(
            { [STORAGE_KEY]: calendarId },
            resolve
        );
    });
}

function clearStoredCalendarId() {
    return new Promise(resolve => {
        chrome.storage.local.remove(STORAGE_KEY, resolve);
    });
}

async function calendarExists(calendarId, headers) {

    const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}`,
        {
            headers
        }
    );

    if (res.status === 404) {
        return false;
    }

    if (!res.ok) {
        throw new Error(await res.text());
    }
    return true;
}

export async function getOrCreateCalendar(token) {

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    // Try cached calendar first
    const cachedId = await getStoredCalendarId();
    console.log("Cached ID:", cachedId);
    if (cachedId) {

        const exists = await calendarExists(
            cachedId,
            headers
        );

        if (exists) {
            return cachedId;
        }

        await clearStoredCalendarId();
    }
    
    // Search existing calendars
    const listRes = await fetch(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        {
            headers
        }
    );

    if (!listRes.ok) {
        throw new Error(await listRes.text());
    }

    const { items } = await listRes.json();
    console.log(items);

    const existing = items.find(
        calendar => calendar.summary === CALENDAR_NAME
    );
    console.log("Existing calendar:", existing);
    console.log(items.map(c => ({
        id: c.id,
        summary: c.summary,
        deleted: c.deleted,
        hidden: c.hidden,
        accessRole: c.accessRole
    })));

    if (existing) {

        await storeCalendarId(existing.id);

        return existing.id;
    }

    // Create calendar
    console.log("Creating new calendar...");
    const createRes = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars",
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                summary: CALENDAR_NAME,
                description: "Automatically synced from IIT Hyderabad AIMS",
                timeZone: "Asia/Kolkata"
            })
        }
    );

    if (!createRes.ok) {
        throw new Error(await createRes.text());
    }

    const calendar = await createRes.json();

    await storeCalendarId(calendar.id);
    console.log(calendar);
    return calendar.id;
}