# [0.4.0](https://github.com/rafamel/exits/compare/v0.3.0...v0.4.0) (2019-02-03)


### Bug Fixes

* **bin:** fixes arguments parsing ([6e6d15e](https://github.com/rafamel/exits/commit/6e6d15e))


### Code Refactoring

* **bin:** changes bin api, commands are now passed within quotes instead of after -- ([427f697](https://github.com/rafamel/exits/commit/427f697))


### Features

* **bin:** adds --fail flag to exit with code 1 when seconds command fails ([9d0bec1](https://github.com/rafamel/exits/commit/9d0bec1))
* **bin:** exits with code 1 when it has failed to parse arguments and help is shown ([d5aee99](https://github.com/rafamel/exits/commit/d5aee99))


### BREAKING CHANGES

* **bin:** bin exits with code 1 at arguments parsing failure
* **bin:** bin takes commands to execute as a single quoted argument
* **bin:** mainCmd on bin must now follow "--"



# [0.3.0](https://github.com/rafamel/exits/compare/v0.2.1...v0.3.0) (2019-01-30)


### Features

* **on:** on callbacks receive state() & are waited for ([da2ef89](https://github.com/rafamel/exits/commit/da2ef89))


### BREAKING CHANGES

* **on:** on() now receives state() for convenience to recover the updated state if needed
instead of different arguments depending on event.



## [0.2.1](https://github.com/rafamel/exits/compare/v0.2.0...v0.2.1) (2019-01-29)


### Bug Fixes

* **resolver:** includes type agnostic overload to allow for options.resolver to resolver calls ([4643959](https://github.com/rafamel/exits/commit/4643959))



# [0.2.0](https://github.com/rafamel/exits/compare/v0.1.4...v0.2.0) (2019-01-29)


### Features

* **terminate:** renames exit to terminate (it now works for any type/reason) ([76d48ea](https://github.com/rafamel/exits/commit/76d48ea))


### BREAKING CHANGES

* **terminate:** exit() has been renamed to terminate(). it now takes two arguments, the first being
the termination type, and the second its argument (previously, it only took one: the exit code
number).



## [0.1.4](https://github.com/rafamel/exits/compare/v0.1.3...v0.1.4) (2019-01-29)


### Bug Fixes

* **type declarations:** fixes type declarations broken paths via ttypescript (2) ([2b9a08a](https://github.com/rafamel/exits/commit/2b9a08a))



## [0.1.3](https://github.com/rafamel/exits/compare/v0.1.2...v0.1.3) (2019-01-29)


### Bug Fixes

* **type declarations:** updates setup (fixes type declarations broken paths) ([6a6dbb0](https://github.com/rafamel/exits/commit/6a6dbb0))



## [0.1.2](https://github.com/rafamel/exits/compare/v0.1.1...v0.1.2) (2019-01-28)


### Bug Fixes

* fixes package.json dependency for bin ([dcf75d6](https://github.com/rafamel/exits/commit/dcf75d6))



## [0.1.1](https://github.com/rafamel/exits/compare/v0.1.0...v0.1.1) (2019-01-28)


### Bug Fixes

* fixes chalk dependency on bin ([4d257ff](https://github.com/rafamel/exits/commit/4d257ff))



# 0.1.0 (2019-01-28)



