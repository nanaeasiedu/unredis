TARGETS = linux-386 linux-amd64 linux-arm linux-arm64 darwin-amd64 windows-386 windows-amd64
COMMAND_NAME = unredis
PACKAGE_NAME = github.com/ngenerio/$(COMMAND_NAME)
LDFLAGS = -ldflags=-X=main.version=$(VERSION)
OBJECTS = $(patsubst $(COMMAND_NAME)-windows-amd64%,$(COMMAND_NAME)-windows-amd64%.exe, $(patsubst $(COMMAND_NAME)-windows-386%,$(COMMAND_NAME)-windows-386%.exe, $(patsubst %,$(COMMAND_NAME)-%-v$(VERSION), $(TARGETS))))

.PHONY: clean install release run

assets: build
	go-bindata -o bindata.go static/...

install:
	glide install

clean: check-env
	rm -fr static/js/*.bundle.js
	rm -fr ./bin

build:
	cd client && NODE_ENV=production npm run deploy

dev:
	cd client && NODE_ENV=development npm run build

release: clean check-env assets $(OBJECTS)

run:
	./unredis

test:
	go test --v

$(OBJECTS): $(wildcard *.go)
	env GOOS=`echo $@ | cut -d'-' -f2` GOARCH=`echo $@ | cut -d'-' -f3 | cut -d'.' -f 1` go build -o ./bin/$@ $(LDFLAGS) $(PACKAGE_NAME)

check-env:
ifndef VERSION
	$(error VERSION is undefined)
endif

