# A-Frame w/ TypeScript template

This is a boilerplate for developing [A-Frame](http://aframe.io/) VR Applications. 
It features a complete development environment including

* [A-Frame](https://aframe.io)
* [TypeScript](https://www.typescriptlang.org/)
* [Dojo 2](http://dojotoolkit.org/community/roadmap/)
* [Intern](http://theintern.github.io/)
* [Grunt](http://gruntjs.com/)

We hope this is a useful starting place to begin your project <3.

## Quick Start

* `npm install`
* `typings install`
* `grunt`
* launch http://localhost/_build/index.html

## TODOs

* Fix TypeScript/Dojo core build issues
* Add server + proxy
* Test/Ensure Vive support
* Improve Gruntfile neatness
* Improve dist step: add test task, improve vendor'd node_modules (why is there so many still?)

## Grunt Commands

* `grunt` - compiles files
* `grunt watch` - watches files for changes and rebuilds
* `grunt lint` - validates style rules
* `grunt test` - runs intern's node client
* `grunt test-local` - runs intern's runner with local configuration
* `grunt test-proxy` - starts intern's testing proxy
* `grunt test-runner` - runs intern's runner
* `grunt ci` - runs tests in a continuous integration environment
* `grunt clean` - cleans development work
* `grunt dist` - builds a distribution ready to be published
* `grunt publish` - builds a dist and publishes it to Github Pages
