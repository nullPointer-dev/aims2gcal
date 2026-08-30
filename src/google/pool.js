export async function runPool(tasks, concurrency = 5) {

    let index = 0;

    async function worker() {

        while (index < tasks.length) {

            const current = index++;

            await tasks[current]();

        }

    }

    const workers = [];

    for (let i = 0; i < concurrency; i++) {

        workers.push(worker());

    }

    await Promise.all(workers);

}