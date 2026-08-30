export function buildCalendarEvents(courses) {

    const events = [];

    for (const course of courses) {

        for (const slot of course.slots) {

            events.push({
                title: `${course.courseCode} - ${course.courseName}`,
                instructor: course.instructor,

                day: slot.day,
                rruleDay: slot.rruleDay,

                startTime: slot.start,
                endTime: slot.end,

                semester: course.semester,
                segment: course.segment
            });

        }

    }

    return events;

}