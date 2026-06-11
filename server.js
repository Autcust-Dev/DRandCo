// server.js
// This file acts as an entry point for hosting environments like IISNode on Windows Server.

// IISNode passes the port via the PORT environment variable.
// The @astrojs/node standalone server uses PORT and HOST environment variables.
process.env.PORT = process.env.PORT || 8080;
process.env.HOST = process.env.HOST || '0.0.0.0';

console.log(`Starting Astro server on ${process.env.HOST}:${process.env.PORT}...`);

// Start the Astro standalone server
import('./dist/server/entry.mjs').catch(err => {
    console.error("Failed to start Astro server. Make sure you have run 'npm run build' first.", err);
    process.exit(1);
});
