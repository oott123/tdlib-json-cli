# tdlib-json-cli

## Usage

```bash
./bin/tdlib-json-cli
```

tdlib-json-cli will use stdin & stdout to process data.

Request will be send to tdlib line by line, so make sure you have your json string in one line.

Response will be recieve from tdlib to stdout line by line.

See [TDLib Documention](https://core.telegram.org/tdlib/docs/td__json__client_8h.html) for more information.

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
