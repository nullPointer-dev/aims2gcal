function toISODate(date) {

    const [day, month, year] =
        date.split("-");

    return `${year}-${month}-${day}`;

}

function toUntil(date) {

    const match = date.match(
        /(\d{1,2})\s([A-Za-z]{3}),\s(\d{4})/
    );

    if (!match) {
        throw new Error(`Invalid endDate: ${date}`);
    }

    const [, day, monthName, year] = match;

    const months = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12"
    };

    return `${year}${months[monthName]}${day.padStart(2, "0")}T235959Z`;
}


function buildDateTime(date, time) {

    return `${toISODate(date)}T${time}:00`;

}

export function buildGoogleEvent(event) {

    const aimsId =
        `${event.runningCourseId}-${event.rruleDay}-${event.startTime}`;

    return {

        summary:
            event.title,

        description:
            `Instructor: ${event.instructor}`,

        start: {

            dateTime:
                buildDateTime(
                    event.startDate,
                    event.startTime
                ),

            timeZone:
                "Asia/Kolkata"

        },

        end: {

            dateTime:
                buildDateTime(
                    event.startDate,
                    event.endTime
                ),

            timeZone:
                "Asia/Kolkata"

        },

        recurrence: [

            `RRULE:FREQ=WEEKLY;BYDAY=${event.rruleDay};UNTIL=${toUntil(event.endDate)}`

        ],

        extendedProperties: {

            private: {

                aimsId

            }

        }

    };

}