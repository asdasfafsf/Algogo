#!/bin/bash

# PostToolUse hook: feat/refactor 커밋 후 ADR 필요 여부 확인
# Bash 도구에서 git commit이 성공한 경우에만 실행

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')
STDOUT=$(echo "$INPUT" | jq -r '.tool_result.stdout // empty')

# Bash 도구에서 git commit이 성공한 경우만 처리
if [ "$TOOL" != "Bash" ]; then
  exit 0
fi

# commit 메시지에서 feat 또는 refactor 타입 감지
if echo "$STDOUT" | grep -qE '\] (feat|refactor):'; then
  echo "[ADR 확인] feat/refactor 커밋이 감지되었습니다. 이 커밋에 ADR로 기록할 의사결정이 있었는지 확인하세요. 있다면 docs/adr/에 작성하세요."
fi

exit 0
