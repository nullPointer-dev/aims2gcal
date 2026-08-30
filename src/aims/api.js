const HISTORY_URL =
  "/aims/courseReg/loadMyCoursesHistroy";

const TIMETABLE_URL =
  "/aims/courseReg/getStdntRngCrsTimeTableDtlsForViewCrs";

  const BATCH_TIMETABLE_URL =
    "/aims/courseReg/getStdntRngCrsTimeTableDtls";

export async function getRegisteredCourses(studentId) {
  const url =
    `${HISTORY_URL}?studentId=${studentId}` +
    "&courseCd=" +
    "&courseName=" +
    "&orderBy=1" +
    "&degreeIds=" +
    "&acadPeriodIds=" +
    "&regTypeIds=" +
    "&gradeIds=" +
    "&resultIds=" +
    "&isGradeIds=";

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    }
  });

  return res.json();
}

export async function getCourseTimetable(runningCourseId, studentId) {
  const body = new URLSearchParams({
    dataObj: JSON.stringify({
      runningCourseId,
      studentId
    })
  });

  const res = await fetch(TIMETABLE_URL, {
    method: "POST",
    credentials: "include",

    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded; charset=UTF-8",

      "X-Requested-With": "XMLHttpRequest"
    },

    body
  });

  return res.json();
}

export async function getBatchTimetable(
    runningCourseIds,
    studentId
) {

    const body = new URLSearchParams({

        dataObj: JSON.stringify({

            runningCourseIds:
                runningCourseIds.join(","),

            studentId

        })

    });

    const res = await fetch(

        BATCH_TIMETABLE_URL,

        {

            method: "POST",

            credentials: "include",

            headers: {

                "Content-Type":
                    "application/x-www-form-urlencoded; charset=UTF-8",

                "X-Requested-With":
                    "XMLHttpRequest"

            },

            body

        }

    );

    return res.json();

}