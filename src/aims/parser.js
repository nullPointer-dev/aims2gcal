const DAY_MAP = {
    Monday: "MO",
    Tuesday: "TU",
    Wednesday: "WE",
    Thursday: "TH",
    Friday: "FR",
    Saturday: "SA",
    Sunday: "SU"
};

function parseSlot(slotString) {
    return slotString.split(",").map(entry => {
        const [day, time] = entry.split("-");

        const [start, end] = time.split("-");

        return {
            day,
            rruleDay: DAY_MAP[day],
            start,
            end
        };
    });
}

export function buildCourses(history, timetableMap) {

    return history
        .filter(course => timetableMap.has(course.runningCourseId))
        .map(course => {

            const timetable = timetableMap.get(course.runningCourseId);

            return {
                runningCourseId: course.runningCourseId,
                courseCode: course.courseCd,
                courseName: course.courseName,
                instructor: course.instructorName,
                credits: course.credits,
                semester: course.periodName,
                segment: timetable.runningCourseSegmentName,
                slots: parseSlot(timetable.slotPeriodCd)
            };

        });

}