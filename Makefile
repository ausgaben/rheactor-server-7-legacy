.PHONY: dist

dist:
	rm -rf dist test-dist
	./node_modules/.bin/babel src -d dist
	./node_modules/.bin/babel test -d test-dist
