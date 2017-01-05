LDFLAGS='-w'

.PHONY: clean install release run

install:
	glide install

clean:
	rm -fr unredis
	rm -fr static/js/*.bundle.js

build:
	cd client && NODE_ENV=development npm run build

release: clean
	cd client && NODE_ENV=production npm run deploy
	go build -ldflags $(LDFLAGS) -o unredis

run:
	./unredis

test:
	go test --v
