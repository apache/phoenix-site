#!/usr/bin/env bash
set -e

REQUIRED_NODE_MAJOR=24
NVM_VERSION="v0.40.3"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

echo "Generate Phoenix Website"
echo ""

# ---------------------------------------------------------------------------
# Ensure Node.js / npm are available, installing via nvm if necessary
# ---------------------------------------------------------------------------
echo "CHECKING PREREQUISITES"
echo "==========================="

install_node() {
  if [ ! -f "$NVM_DIR/nvm.sh" ]; then
    echo "nvm not found — installing nvm ${NVM_VERSION}..."
    curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh" | bash
  fi

  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"

  echo "Installing Node.js ${REQUIRED_NODE_MAJOR} via nvm..."
  nvm install "${REQUIRED_NODE_MAJOR}"
  nvm use "${REQUIRED_NODE_MAJOR}"
}

if ! command -v node > /dev/null 2>&1 || ! command -v npm > /dev/null 2>&1; then
  echo "node/npm not found — bootstrapping via nvm..."
  install_node
elif [ -f "$NVM_DIR/nvm.sh" ]; then
  # nvm is present but may not be sourced in this shell
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
fi

echo "node $(node --version), npm $(npm --version) -- OK"
echo ""

# ---------------------------------------------------------------------------
echo "INSTALLING DEPENDENCIES (clean install)"
echo "==========================="
npm ci
echo ""

# ---------------------------------------------------------------------------
echo "RUNNING CI (lint, typecheck, build, sitemap, tests)"
echo "==========================="
npm run ci
echo ""

# ---------------------------------------------------------------------------
echo "PUBLISHING BUILD OUTPUT"
echo "==========================="
rm -rf ./output
mkdir -p ./output
cp -R ./build/client/. ./output/
echo "Copied build/client -> output"
