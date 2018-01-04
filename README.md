# tdlib-json-cli

## Build

### macOS

```bash
brew install gperf cmake openssl readline
mkdir build
cd build
cmake -DOPENSSL_ROOT_DIR=/usr/local/opt/openssl/ -DREADLINE_INCLUDE_DIR=/usr/local/opt/readline/include -DREADLINE_LIBRARY=/usr/local/opt/readline/lib/libreadline.dylib ..
make -j4
```

