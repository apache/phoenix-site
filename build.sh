#!/bin/sh
echo "Generate Phoenix Website"
echo ""

echo "BUILDING LANGUAGE REFERENCE"
echo "==========================="
rm -rf ./site/publish/language
cd phoenix-docs
./build.sh docs
echo ""
echo "BUILDING SITE"
echo "==========================="
cd ../site/source/
mvn clean site

echo ""
echo "Removing temp directories"
echo "==========================="
cd ../../
rm -rf phoenix-docs/temp
rm -rf phoenix-docs/bin
rm -rf phoenix-docs/docs
