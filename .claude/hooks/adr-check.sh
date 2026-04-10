#!/bin/bash

# PostToolUse hook: 커밋 후 ADR 필요 여부 확인
# 커밋 타입이 아니라 "의사결정이 있었는가"를 기준으로 알림

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')
STDOUT=$(echo "$INPUT" | jq -r '.tool_result.stdout // empty')

if [ "$TOOL" != "Bash" ]; then
  exit 0
fi

# git commit 성공 감지 (커밋 해시와 메시지가 출력된 경우)
if echo "$STDOUT" | grep -qE '^\[.+ [a-f0-9]+\]'; then
  echo "[ADR 확인] 이 커밋에서 대안을 검토하고 하나를 선택한 의사결정이 있었나요? 있다면 docs/adr/에 작성하세요."
fi

exit 0
