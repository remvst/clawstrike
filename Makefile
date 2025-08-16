.PHONY: build

build: debug preprod prod

debug:
	npm run build:debug
	npm run build:debug:mangled

preprod:
	npm run build:preprod
	npm run zip:preprod

prod:
	npm run build:prod
	npm run zip:prod

install:
	brew install nvm || sudo apt-get install -y nodejs
	brew install advancecomp || sudo apt-get install -y advancecomp
	./install-ect.sh
