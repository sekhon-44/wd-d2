// load needed functions from gulp library via object destructuring
const { src, dest, watch, series, parallel } = require('gulp');

// first gulp task
function helloGulp(cb){
  console.log('Hello, GulpWorld');
  cb();
}

// export our function so it can be loaded and used by gulp
exports.hello = helloGulp; 