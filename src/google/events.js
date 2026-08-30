async function googleRequest(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json();
}

export async function listEvents(calendarId, token) {
    const url =
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?singleEvents=false`;

    const result = await googleRequest(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    console.log(result);

    return result;

}

export async function insertEvent(calendarId, token, event) {

    const url =
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;

    const result = await googleRequest(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
    });

    console.log("Inserted:", result);

    return result;

}

export async function updateEvent(
    calendarId,
    eventId,
    token,
    event
) {

    const url =
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`;

    return googleRequest(url, {

        method: "PATCH",

        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },

        body: JSON.stringify(event)

    });

}

export async function deleteEvent(
    calendarId,
    eventId,
    token
) {

    const response = await fetch(

        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(await response.text());
    }

}