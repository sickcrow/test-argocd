module.exports = {
  "globDirectory": "build/",
  "globPatterns": [
    "**/*.{json,ico,html,png,js,txt,css,LICENSE,mjs}"
  ],
  "swDest": "./build/sw.js",
  "swSrc": "./src/sw.js",
  "injectionPointRegexp": /(const precacheManifest = )\[\](;)/
};