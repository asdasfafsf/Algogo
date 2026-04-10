#!/bin/bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# main에 push하는 모든 패턴 차단
if echo "$COMMAND" | grep -qE 'git push.*(:main\b|:refs/heads/main\b)'; then
  echo "main에 직접 push할 수 없습니다. PR을 통해서만 머지 가능합니다." >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE 'git push\s+((-[a-zA-Z]+|--[a-z-]+)\s+)*(origin|upstream)\s+main(\s|$)'; then
  echo "main에 직접 push할 수 없습니다. PR을 통해서만 머지 가능합니다." >&2
  exit 2
fi

# main에서 모든 머지 차단 (PR을 통해서만 머지)
if echo "$COMMAND" | grep -qE 'git merge'; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  if [ "$BRANCH" = "main" ]; then
    echo "main에서 직접 머지할 수 없습니다. GitHub PR을 사용하세요." >&2
    exit 2
  fi
fi

# main에서 직접 커밋 차단
if echo "$COMMAND" | grep -qE 'git commit'; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  if [ "$BRANCH" = "main" ]; then
    echo "main에서 직접 커밋할 수 없습니다. 기능 브랜치에서 작업하세요." >&2
    exit 2
  fi
fi

exit 0
