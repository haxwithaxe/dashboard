# Running tests
Run `tests/test-content-server.py -c <path to test config>` then go to ``http://localhost:8000`` in the target browser.

``tests/config-kitchen-sink.js`` is an assortment of test cases that use `test-content-server.py`.

The images and iframes provided by `test-content-server.py` show the time they were most recently fetched and the previous time they were fetched. Comparing those times shows how long the last refresh or rotate cycle was. There are comments in `tests/config-kitchen-sink.js` describing what each tile is testing or the expected behavior.

# Requirements
`test-content-server.py` requires the `pillow` python package to be installed. You probably already have it installed if you have image processing tools installed.
