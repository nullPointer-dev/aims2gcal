const DAY_MAP = {
    Monday: "MO",
    Tuesday: "TU",
    Wednesday: "WE",
    Thursday: "TH",
    Friday: "FR",
    Saturday: "SA",
    Sunday: "SU"
};

function parseSlot(slot) {

    const [day, start, end] =
        slot.slotPeriodCdDays
            .split("-")
            .map(part => part.trim());

    return {

        day,
        rruleDay: DAY_MAP[day],
        start,
        end,

        // Semester dates from AIMS
        startDate: slot.newFrmDt,
        endDate: slot.eftToDt

    };

}

export function buildCourses(history, timetable) {

    // runningCourseId -> slots[]
    const timetableMap = new Map();

    for (const slot of timetable) {
        const id = String(slot.runningCourseId);
        if (!timetableMap.has(id)) {
            timetableMap.set(id, []);
        }
        timetableMap.get(id).push(slot);
    }
    const coursesWithoutTimetable = history.filter(
        course => !timetableMap.has(String(course.runningCourseId))
    );

    if (coursesWithoutTimetable.length) {
        console.warn(
            "Courses without timetable:",
            coursesWithoutTimetable.map(course => ({
                code: course.courseCd,
                name: course.courseName
            }))
        );
    }

    return history.filter(course =>
            timetableMap.has(String(course.runningCourseId))
        ).map(course => {
            const slots =
                timetableMap
                    .get(String(course.runningCourseId))
                    .map(parseSlot);

            return {
                runningCourseId: String(course.runningCourseId),
                courseCode: course.courseCd,
                courseName: course.courseName,
                instructor: course.instructorName,
                credits: course.credits,
                semester: course.periodName,
                segment:
                    timetableMap
                        .get(String(course.runningCourseId))[0]
                        .segName,
                slots
            };

        });

}