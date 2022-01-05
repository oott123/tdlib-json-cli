# TDLib JSON CLI

![TDLib v1.8.0](https://img.shields.io/badge/TDLib-v1.8.0-green.svg)
[![GitHub release](https://img.shields.io/github/release/oott123/tdlib-json-cli.svg)](https://github.com/oott123/tdlib-json-cli/releases)
[![TDLib Linux](https://github.com/oott123/tdlib-json-cli/actions/workflows/build.yml/badge.svg)](https://github.com/oott123/tdlib-json-cli/actions/workflows/build.yml)
![AGPL v3.0](https://img.shields.io/github/license/oott123/tdlib-json-cli.svg)
[![Twitter](https://img.shields.io/badge/Tweet!-Thanks!-green.svg?style=social)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Foott123%2Ftdlib-json-cli%2F)

## About

TDLib JSON CLI is a simple command line tool uses stdin & stdout as input & output of tdlib's [td_json_client][td-json].

You can use this to replace the buggy, weird [tg-cli](https://github.com/vysheng/tg) and it's json interface.

This project is licensed under AGPL v3.0, but you can distribute it separately so you are not required to make your project open source under AGPL compatible license.

## Usage

```bash
./bin/tdlib-json-cli [verbosity]
```
[verbosity] = 0123456789
Set TDLib's verbosity level at startup.
- 0 - fatal errors;
- 1 - errors; 
- 2 - warnings and debug warnings;
- 3 - informational;
- 4 - debug;
- 5 - verbose debug;
- greater than 5 and up to 1024 can be used to enable even more logging.

tdlib-json-cli will use stdin & stdout to process data.

Request will be send to tdlib line by line, so make sure you have your json string in one line.

Response will be recieve from tdlib to stdout line by line.

See [TDLib Documention][td-json] for more information.

### Commands

We provide 2 extra command to control tdlib-json-cli behaviors.

#### verbose [int]

Change the verbose level of the tdlib.

#### exit

exit the tdlib-json-cli.

### Events

We provide serveral events for you to know tdlib-json-cli status.

They are json strings which write to stdout like `{"@cli":{"event":"EVENT_ID"}}`.

#### client_created

This event will be trigged at td client created.

#### exited

This event will be trigged at tdlib-json-cli exited.

## Build

### macOS

```bash
brew install gperf cmake openssl readline
mkdir Release
cd Release
cmake -DOPENSSL_ROOT_DIR=/usr/local/opt/openssl/ -DREADLINE_INCLUDE_DIR=/usr/local/opt/readline/include -DREADLINE_LIBRARY=/usr/local/opt/readline/lib/libreadline.dylib -DCMAKE_BUILD_TYPE=Release ..
make -j4
```

### Linux

See [td/README.md](td/README.md)

### Windows

See [td/README.md](td/README.md)

## Generate Types File

You should have php, doxygen, node.js and npm installed.

Before generate types file, you **MUST** build successfully at least one time.
This because of some code of tdlib which used to generate docs and are generated at the build time.

```bash
cd td
doxygen
cd ../types-generator
npm i
cd ..
node ./types-generator/index.js
```

This will write `types.json` to the project root directory which contains types of all the objects and functions.

[td-json]: https://core.telegram.org/tdlib/docs/td__json__client_8h.html
