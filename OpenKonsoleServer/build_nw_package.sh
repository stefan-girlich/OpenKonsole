#!/bin/bash

# This script creates a node-webkit package to use as an argument to the "nw" command.

TMP_DIR="tmp_node-webkit-build"
OUTPUT_FILENAME="openKonsole_server_app.nw"
NW_PACKAGE_FILENAME="package.json.node-webkit.sample"

#REQUIRED_FILES="test_stick_position_api_async.html server.js main.js"

if [ -d $TMP_DIR ]; then
	echo "temporary build directory $TMP_DIR exists, please delete it."
	exit 1
fi

# create working directory one level higher to make "cp *"" possible
mkdir "../"$TMP_DIR
cp -R * "../"$TMP_DIR
mv "../"$TMP_DIR $TMP_DIR

# copy node-webkit package.json, wrap all in ZIP; clean up
cp $NW_PACKAGE_FILENAME $TMP_DIR"/package.json"
cd $TMP_DIR
zip -r $OUTPUT_FILENAME *
mv $OUTPUT_FILENAME ../
cd ..
rm -fR $TMP_DIR

exit 0