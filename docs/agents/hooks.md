# 공통 훅 사용법

원본은 `.agents/hooks/`이며 Python 3.9 이상과 RTK를 사용한다. lint/format에는 프로젝트 pnpm·ESLint·Prettier가 필요하다. Claude 없이도 아래 CLI로 실행할 수 있다. 작업 루트에서 실행하거나 `--cwd`로 해당 워크트리를 지정한다.

```sh
rtk proxy bash .agents/hooks/protect-main.sh --command 'rtk git push origin ALGOGO-73'
rtk proxy bash .agents/hooks/post-edit.sh --file src/main.ts
rtk proxy bash .agents/hooks/adr-check.sh --commit-output '[ALGOGO-73 abc1234] 변경 설명'
```

- `protect-main`: 명령을 실행하지 않고 main/dev 직접 push·커밋·로컬 머지 및 기본 체크아웃에서 이슈 브랜치 생성 패턴을 검사한다. 위반은 종료 코드 2다. 동적으로 생성되는 셸 명령과 별칭까지 보장하는 보안 장치가 아니며 GitHub 브랜치 보호를 대체하지 않는다.
- `post-edit`: 지정한 파일만 lint/format한다. 실제 도구 실패는 종료 코드 2로 전달하고 오류를 숨기지 않는다. 작업 루트 밖 파일은 거부한다.
- `adr-check`: 커밋 결과를 받아 ADR 검토 알림을 출력한다. 이슈 생성이나 문서 작성을 자동 수행하지 않는다.

직접 인자를 주지 않으면 표준 입력 JSON을 읽는다. `cwd`, `tool_input.command`, `tool_input.file_path`, `tool_result.stdout` 또는 `tool_response.stdout`을 지원한다. 일반 도구도 같은 입력 형식으로 연결할 수 있다. 공통 코드에는 `CLAUDE_PROJECT_DIR` 의존성이 없다.

Claude 연결은 `.agents/integrations/claude/settings.json`에서 공통 훅에 작업 디렉토리를 전달한다. `.claude/settings.json`은 이 설정의 링크다. `.claude/hooks`, `.claude/rules`, `.claude/commands`, `CLAUDE.md` 역시 공통 원본의 링크이며 독립적인 원본을 두지 않는다. Codex에는 지원 여부를 확인하지 않은 자동 훅 설정을 추가하지 않았다. Codex는 공통 지침에 따라 CLI를 호출한다.

검증:

```sh
rtk proxy env PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s .agents/tests -v
```
