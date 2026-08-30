    import {
        getRegisteredCourses,
        getBatchTimetable
    } from "../aims/api.js";

    import { buildCourses } from "../aims/parser.js";
    import { buildCalendarEvents } from "../calendar/eventBuilder.js";
    import { getStudentId } from "../aims/session.js";

    let generatedEvents = [];

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

        if (message.type === "GET_EVENTS") {
            sendResponse({
                events: generatedEvents
            });
        }

        return true;
    });

    (async () => {

        console.log("AIMS2GCal started");
        console.log("Content script sees:", window.studentId);

        const studentId = getStudentId();

        console.log(`Student ID: ${studentId}`);

        // Fetch course history
        const history = await getRegisteredCourses(studentId);

        // Determine the latest semester
        const latestSemester = history
            .map(course => course.periodName)
            .sort()
            .at(-1);

        console.log(`Current semester: ${latestSemester}`);

        // Keep only current semester courses
        const currentHistory = history.filter(
            course => course.periodName === latestSemester
        );

        const runningCourseIds =
            currentHistory.map(
                course => course.runningCourseId
            );

        const timetable =
            await getBatchTimetable(
                runningCourseIds,
                studentId
            );
        console.log("Timetable length:", timetable.length);
        console.log("First timetable object:", timetable[0]);

        // Normalize courses
        const courses = buildCourses(currentHistory, timetable);

        // Build calendar events
        generatedEvents = buildCalendarEvents(courses);

        console.log("Courses:", courses);
        console.log("Events:", generatedEvents);

        console.log(`Fetched ${courses.length} courses`);
        console.log(`Generated ${generatedEvents.length} calendar events`);

    })();