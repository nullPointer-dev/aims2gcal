function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withRetry(fn, retries = 5) {

    let delay = 1000;

    for (let attempt = 0; attempt <= retries; attempt++) {

        try {

            return await fn();

        } catch (err) {

            const message = String(err);

            const retryable =
                message.includes("Rate Limit") ||
                message.includes("rateLimitExceeded") ||
                message.includes("403") ||
                message.includes("429");

            if (!retryable || attempt === retries) {
                throw err;
            }

            console.warn(
                `Retry ${attempt + 1}/${retries} in ${delay} ms`
            );

            await sleep(delay);

            delay *= 2;

        }

    }

}