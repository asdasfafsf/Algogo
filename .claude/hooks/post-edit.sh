#!/bin/bash

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# TypeScript/JavaScript 파일: lint + format
if [[ "$FILE_PATH" == *.ts || "$FILE_PATH" == *.tsx || "$FILE_PATH" == *.js || "$FILE_PATH" == *.jsx ]]; then
  cd "$CLAUDE_PROJECT_DIR"
  npx eslint --fix "$FILE_PATH" 2>/dev/null
  if [ $? -ne 0 ]; then
    echo "ESLint errors in $FILE_PATH" >&2
    exit 2
  fi
  npx prettier --write "$FILE_PATH" 2>/dev/null
fi

# JSON 파일: format
if [[ "$FILE_PATH" == *.json ]]; then
  cd "$CLAUDE_PROJECT_DIR"
  npx prettier --write "$FILE_PATH" 2>/dev/null
fi

# CSS/SCSS 파일: format
if [[ "$FILE_PATH" == *.css || "$FILE_PATH" == *.scss ]]; then
  cd "$CLAUDE_PROJECT_DIR"
  npx prettier --write "$FILE_PATH" 2>/dev/null
fi

exit 0
