#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const MANIFEST_PATH = resolve("public/manifest.json");

function main() {
    const args = process.argv.slice(2);
    const clientId = args[0];

    if (!clientId) {
        console.error("Usage: node setup.js <YOUR_CLIENT_ID>");
        console.error("Example: node setup.js 123456789-abcdefghijklmnop.apps.googleusercontent.com");
        process.exit(1);
    }

    if (!clientId.endsWith(".apps.googleusercontent.com")) {
        console.error("Error: Client ID must end with '.apps.googleusercontent.com'");
        process.exit(1);
    }

    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
    manifest.oauth2.client_id = clientId;
    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

    console.log(`Updated manifest.json with client_id: ${clientId}`);
    console.log("Run 'npm run build' then load 'dist/' as unpacked extension.");
}

main();