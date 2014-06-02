#!/bin/bash
current_dir=$(cd $(dirname $0);pwd)
cd $current_dir
DOC_SRC="../../../../../phoenix-docs/docs/html"
SITE_TARGET="../../../../publish"
java -jar merge.jar $DOC_SRC/index.html $SITE_TARGET/language/index.html
java -jar merge.jar $DOC_SRC/functions.html $SITE_TARGET/language/functions.html
java -jar merge.jar $DOC_SRC/datatypes.html $SITE_TARGET/language/datatypes.html

cd $SITE_TARGET

ADL=""
if [[ "$(uname)" == "Darwin" ]]; then
ADL="del"
fi

find . -name "*.html" | xargs sed -i $ADL 's/class=\"nav-collapse\"/class=\"nav-collapse collapse\"/g'
find . -name "*.html" | xargs sed -i $ADL 's/<li ><a href=\"http:divider\" title=\"\"><\/a><\/li>/<li class=\"divider\"\/>/g'
find . -name "*.html" | xargs sed -i $ADL 's/dropdown active/dropdown/g'
find . -name '*del' | xargs rm 2> /dev/null
exit 0

