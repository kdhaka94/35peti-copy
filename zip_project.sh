#!/bin/bash

# Define the output zip file name
OUTPUT_FILE="35peti-project.zip"

echo "Zipping project to $OUTPUT_FILE..."

# Zip the current directory, excluding node_modules, build directories, and version control
zip -r "$OUTPUT_FILE" . \
  -x "*/node_modules/*" \
  -x "*/dist/*" \
  -x "*/build/*" \
  -x "*/.next/*" \
  -x "*/coverage/*" \
  -x "*/.git/*" \
  -x "*.zip" \
  -x "*/__pycache__/*" \
  -x "*/.env" \
  -x "*/.env.*"

echo "Done! Archive saved as $OUTPUT_FILE"
