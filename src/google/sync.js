import {
    listEvents,
    insertEvent,
    updateEvent,
    deleteEvent
} from "./events.js";

import { runPool } from "./pool.js";
import { withRetry } from "./retry.js";
import { buildGoogleEvent } from "./eventMapper.js";

function getAimsId(event) {

    return `${event.runningCourseId}-${event.rruleDay}-${event.startTime}`;

}

function sameDate(a, b) {
    return new Date(a).getTime() === new Date(b).getTime();
}

function normalizeRule(rule = "") {
    return rule
        .replace(/^RRULE:/, "")
        .split(";")
        .filter(Boolean)
        .sort()
        .join(";");
}

function eventsEqual(googleEvent, aimsEvent) {

    const mapped = buildGoogleEvent(aimsEvent);

    console.log(
        googleEvent.start.dateTime,
        mapped.start.dateTime
    );

    console.log(
        googleEvent.recurrence,
        mapped.recurrence
    );

    console.log(
        googleEvent.description,
        mapped.description
    );
    return (

        googleEvent.summary === mapped.summary &&

        googleEvent.description === mapped.description &&

        sameDate(googleEvent.start?.dateTime, mapped.start.dateTime) &&

        sameDate(googleEvent.end?.dateTime, mapped.end.dateTime) &&

        normalizeRule(mapped.recurrence?.[0] ?? "") === normalizeRule(googleEvent.recurrence?.[0] ?? "")

    );

}

export async function syncCalendar(
    calendarId,
    token,
    aimsEvents,
    onProgress = () => {}
) {
    console.log("AIMS Events:", aimsEvents.length);
    onProgress("Fetching Google Calendar...");
    const googleResponse =
        await listEvents(calendarId, token);

    const googleEvents =
        googleResponse.items ?? [];
    console.log("Google Events:", googleEvents.length);

    //
    // Build Google lookup
    //
    onProgress("Building event index...");
    const googleMap = new Map();

    for (const event of googleEvents) {

        const aimsId =
            event.extendedProperties
                ?.private
                ?.aimsId;

        if (aimsId) {

            googleMap.set(aimsId, event);

        }

    }

    //
    // Build AIMS lookup
    //
    onProgress("Comparing events...");
    const aimsMap = new Map();

    for (const event of aimsEvents) {

        const id = getAimsId(event);

        if (!aimsMap.has(id)) {
            aimsMap.set(id, event);
        }

    }

    console.log({
        aimsMap: aimsMap.size,
        googleMap: googleMap.size
    });

    let inserted = 0;
    let updated = 0;
    let deleted = 0;
    let skipped = 0;

    const tasks = [];

    //
    // INSERT / UPDATE / SKIP
    //

    for (const [aimsId, aimsEvent] of aimsMap) {

        const googleEvent =
            googleMap.get(aimsId);

        //
        // INSERT
        //

        if (!googleEvent) {

            tasks.push(async () => {
                await withRetry(() =>
                    insertEvent(
                        calendarId,
                        token,
                        buildGoogleEvent(aimsEvent)
                    )
                );

                inserted++;

            });

            continue;

        }

        //
        // SKIP
        //

        if (eventsEqual(
            googleEvent,
            aimsEvent
        )) {

            skipped++;

            continue;

        }

        //
        // UPDATE
        //

        tasks.push(async () => {

            await withRetry(() =>
                updateEvent(
                    calendarId,
                    googleEvent.id,
                    token,
                    buildGoogleEvent(aimsEvent)
                )
            );

            updated++;

        });

    }

    //
    // DELETE
    //

    for (const [aimsId, googleEvent] of googleMap) {

        if (aimsMap.has(aimsId)) {

            continue;

        }

        tasks.push(async () => {

            await withRetry(() =>
                deleteEvent(
                    calendarId,
                    googleEvent.id,
                    token
                )
            );

            deleted++;

        });

    }

    onProgress(`Applying ${tasks.length} change${tasks.length === 1 ? "" : "s"}...`);

    let completed = 0;

    const wrappedTasks = tasks.map(task => async () => {

        await task();

        completed++;

        onProgress(
            `Applying changes (${completed}/${tasks.length})...`
        );

    });
    await runPool(wrappedTasks, 5);
    console.log({
        inserted,
        updated,
        deleted,
        skipped,
        tasks: tasks.length
    });
    onProgress("Finalizing...");
    return {

        inserted,
        updated,
        deleted,
        skipped

    };

}