#!/bin/bash

brew install cmake || sudo apt-get install -y cmake

git clone --recursive https://github.com/fhanau/Efficient-Compression-Tool.git
pushd Efficient-Compression-Tool
    git reset --hard 9aabc2
    mkdir -p build
    cd build
    cmake ../src
    make
popd
