Unpublished
===========

  * update dependencies (onoff v6.0.0, async v3.2.0, jshint v2.11.0)
  * drop support for node.js 6, add support for node.js 14

3.0.0 - Sep 22 2019
===================

  * update dependencies (onoff v5.0.0)
  * drop support for node.js v4

2.0.6 - Sep 08 2019
===================

  * add node 12 to build
  * remove node 11 from build
  * update dependencies (onoff v4.1.4, async v3.1.0)

2.0.5 - Mar 17 2019
===================

  * update dependencies (onoff v4.1.1, async v2.6.2)
  * document node 12 support
  * lint with jshint
  * add badges
  * add travis build

2.0.4 - Oct 01 2018
===================

  * cleanup
  * remove old test
  * update dependencies (onoff v3.2.2)

2.0.3 - Apr 07 2018
===================

  * update dependencies (onoff v3.0.2)

2.0.2 - Mar 01 2018
===================

  * restore support for node 4

2.0.1 - Mar 01 2018
===================

  * take microsecond execution times into account
  * use native promises
  * implement Lcd as class

2.0.0 - Feb 27 2018
===================

  * document node 9 support
  * update dependencies (onoff v2.0.0, async v2.6.0)
  * drop support for node.js v0.10, v0.12, v5 and v7

1.1.5 - Oct 15 2017
===================

  * node v0.10 or higher required
  * update dependencies (onoff v1.1.8, q v1.5.0)
  * document supported node versions

1.1.4 - Jun 05 2016
===================

  * updated wiring for beaglebone examples
  * updated dependency: onoff 1.0.4 -> 1.1.1

1.1.3 - Mar 20 2016
===================

  * queue async operations and execute them sequentially

1.1.2 - Feb 07 2016
===================

  * Improved documentation and examples
  * Updated dependencies

1.1.1 - Mar 04 2015
===================

  * Got rid of the magic numbers and replaced them with a command map (by [nodebotanist](https://github.com/nodebotanist))
  * Added test harness and tests (by [nodebotanist](https://github.com/nodebotanist))

1.1.0 - Jan 10 2015
===================

  * Async methods now support callbacks

1.0.0 - Jan 10 2015
===================

  * Updated dependency: onoff 0.3.2 -> 1.0.0 (GPIO access without superuser privileges on Raspbian)
  * Updated dependency: q 1.0.1 -> 1.1.2

0.2.4 - May 08 2014
===================

  * Delay 1ms more than required [#8](https://github.com/fivdi/lcd/issues/8)

0.2.3 - May 01 2014
===================

  * Fallback to nextTick if setImmediate not available [#7](https://github.com/fivdi/lcd/issues/7)

0.2.2 - Apr 18 2014
===================

  * Fallback to setTimeout if setImmediate not available [#7](https://github.com/fivdi/lcd/issues/7)
  * Documented BeagleBone Ångström prerequisites [#8](https://github.com/fivdi/lcd/issues/8)
  * Updated dependency: onoff 0.3.1 -> 0.3.2

0.2.1 - Mar 28 2014
===================

  * v0.11.x process.nextTick compatibility [#5](https://github.com/fivdi/lcd/issues/5)
  * Example print-twice-20x4.js added
  * Updated dependency: onoff 0.3.0 -> 0.3.1
  * Updated dependency: q 0.9.7 -> 1.0.1

0.2.0 - Nov 23 2013
===================

  * Asynchronous print [#2](https://github.com/fivdi/lcd/issues/2)
  * Print optimization [#1](https://github.com/fivdi/lcd/issues/1)
  * Removed write8Bits method

0.1.0 - Nov 18 2013
===================

  * Updated dependencies: onoff 0.2.3 -> 0.3.0

0.0.4 - Nov 08 2013
===================

  * Use || rather than | where appropriate

0.0.3 - Nov 08 2013
===================

  * Example "Hello, World!" on an 8x1 display
  * Lcd constructor is now new-agnostic
  * API documentation

0.0.2 - Nov 07 2013
===================

  * Improved documentation
  * Improved performance-check-20x4

0.0.1 - Nov 07 2013
===================

  * Initial release

