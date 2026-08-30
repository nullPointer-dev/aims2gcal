console.log("Background started");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received:", message);

    sendResponse({
        ok: true
    });

    return true;
});