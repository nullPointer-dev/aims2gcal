let cachedStudentId = null;

export function getStudentId() {

    if (cachedStudentId) {
        return cachedStudentId;
    }

    for (const script of document.scripts) {

        const match = script.textContent.match(
            /var\s+studentId\s*=\s*"(\d+)"/
        );

        if (match) {
            cachedStudentId = match[1];
            return cachedStudentId;
        }
    }

    throw new Error("Unable to determine student ID.");
}