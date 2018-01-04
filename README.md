# tdlib-json-cli

## Build

### macOS

```bash
brew install gperf cmake openssl readline
mkdir Release
cd Release
cmake -DOPENSSL_ROOT_DIR=/usr/local/opt/openssl/ -DREADLINE_INCLUDE_DIR=/usr/local/opt/readline/include -DREADLINE_LIBRARY=/usr/local/opt/readline/lib/libreadline.dylib -DCMAKE_BUILD_TYPE=Release ..
make -j4
```

## Generate tsd

```bash
cd td
doxygen

```