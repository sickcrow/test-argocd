importScripts("workbox-v4.3.1/workbox-sw.js");

workbox.setConfig({modulePathPrefix: "workbox-v4.3.1/"})

const precacheManifest = [];

workbox.precaching.suppresWarnings();
workbox.precaching.precacheAndRoute(precacheManifest);
