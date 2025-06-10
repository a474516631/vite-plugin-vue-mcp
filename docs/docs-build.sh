#!/bin/bash
set -o errexit
MOD_NAME=${CI_PROJECT_NAME}
TAR="${MOD_NAME}.tar.gz"

npm i pnpm@8.15.3 -g
echo "install deps"
pnpm -v
pnpm install --registry=http://ued.zuoyebang.cc/npm
pnpm run docs:build


# artifact directory
rm -rf output

mkdir -p ./output/webroot/documents/${MOD_NAME}
cp -r ./.vitepress/dist/* ./output/webroot/documents/${MOD_NAME}

cd output
tar zcvf $TAR ./webroot
echo "build end"
