#!/usr/bin/env bash

# Remove test directories under vendor and packages/email-editor
# We are doing this to reduce the size of the plugin

PROJECT_PATH=$(pwd)

# Find all test directories under vendor
VENDOR_DIR="${PROJECT_PATH}/vendor"
find "$VENDOR_DIR" -type d \( -name "test" -o -name "tests" -o -name "Test" -o -name "Tests" \) | while read dir; do
  echo "Removing: $dir"
  rm -rf "$dir"
done
echo "Test directories removal complete."

# Check for email-editor directory and remove unnecessary files.
# This ensures we don't package the vendor and test directories with the plugin.
EMAIL_EDITOR_DIR="${PROJECT_PATH}/packages/email-editor"
if [ -d "$EMAIL_EDITOR_DIR" ]; then
    echo "Found email-editor directory. Removing contents except src folder..."
    # Find and remove all files and directories except src
    find "$EMAIL_EDITOR_DIR" -mindepth 1 -maxdepth 1 ! -name 'src' -exec rm -rf {} +
    echo "email-editor directory cleaned up successfully (src folder preserved)."
fi
