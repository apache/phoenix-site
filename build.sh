#!/bin/sh
echo "Generate Phoenix Website"
echo "Pre-req: On source repo run $ mvn install -DskipTests"
echo ""

echo "BUILDING LANGUAGE REFERENCE"
echo "==========================="
cd phoenix-docs
./build.sh docs
echo ""
echo "BUILDING SITE"
echo "==========================="
cd ../site/source/
mvn clean site
