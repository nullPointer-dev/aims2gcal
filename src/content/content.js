import {
    getRegisteredCourses,
    getCourseTimetable
} from "../aims/api.js";

import { buildCourses } from "../aims/parser.js";
import { buildCalendarEvents } from "../calendar/eventBuilder.js";
import { getStudentId } from "../aims/session.js";

(async () => {

    console.log("AIMS2GCal started");
    console.log("Content script sees:", window.studentId);
    const studentId = getStudentId();
    console.log(`Student ID: ${studentId}`);

    // Fetch registered courses
    const history = await getRegisteredCourses(studentId);

    // Fetch every timetable in parallel
    const timetableResponses = await Promise.all(
        history.map(course =>
            getCourseTimetable(course.runningCourseId, studentId)
        )
    );

    // Flatten [[...], [...], [...]] -> [...]
    const timetable = timetableResponses.flat();

    // Build lookup map
    const timetableMap = new Map();

    timetable.forEach(entry => {
        timetableMap.set(String(entry.runningCourseId), entry);
    });

    // Normalize data
    const courses = buildCourses(history, timetableMap);

    // Build calendar events
    const events = buildCalendarEvents(courses);

    console.log("Courses:", courses);
    console.log("Events:", events);

    console.log(`Fetched ${courses.length} courses`);
    console.log(`Generated ${events.length} calendar events`);

})();