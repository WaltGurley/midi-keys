# MidiKeys
> Uses WebMIDI to pipe MIDI messages into a browser

### NOTES:
Built to run in browser with global variable available via `<script>` load. Special setup as follows:
* Set entry to './src/midi-keys.js'
* Added output options (from: https://www.made-on-mars.com/blog/how-to-create-a-npm-module-that-works-on-browser-with-webpack-2/):
  * libraryTarget: 'umd'

# Built with Webpack Starter
> Starter template for web development without a framework

To use:
---
Run in development mode:
  ```
  npm start
  ```
  _Start a local development server at port 3000. Navigate to http://localhost:3000/ in your browser_

Build for production:
  ```
  npm run build
  ```
  _Build an optimized version for production_

Features
---
* Hot reloading in development
* SASS support
* ES6 support
* Autoprefixer for css
