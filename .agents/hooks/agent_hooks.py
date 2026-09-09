"""공통 CLI 및 연결 도구의 JSON 입력으로 실행하는 저장소 훅."""

import argparse
import json
from pathlib import Path
import re
import shlex
import subprocess
import sys


def git(cwd, *args):
    result = subprocess.run(
        ['rtk', 'proxy', 'git', '-C', str(cwd), *args],
        capture_output=True, text=True, check=True,
    )
    return result.stdout.strip()


def protect(command, cwd):
    # 셸 명령을 실행하지 않고 검사한다. 별칭·동적 셸 확장까지 보장하는 보안 경계는 아니다.
    lexer = shlex.shlex(command, posix=True, punctuation_chars=';&|\n')
    lexer.whitespace = ' \t\r'
    lexer.whitespace_split = True
    parts = [[]]
    try:
        for token in lexer:
            if token and set(token) <= set(';&|\n'):
                parts.append([])
            else:
                parts[-1].append(token)
    except ValueError:
        raise ValueError('명령을 해석할 수 없습니다.')
    for tokens in parts:
        if 'git' not in tokens:
            continue
        tokens = tokens[tokens.index('git') + 1:]
        repo = Path(cwd)
        while tokens and tokens[0].startswith('-'):
            option = tokens.pop(0)
            if option in ('-C', '-c', '--git-dir', '--work-tree'):
                if not tokens:
                    raise ValueError('Git 옵션 값이 없습니다.')
                value = tokens.pop(0)
                if option == '-C':
                    repo = repo / value
                elif option != '-c':
                    raise ValueError('보호 검사에서는 -C로 저장소를 지정하세요.')
            elif option.startswith(('--git-dir=', '--work-tree=')):
                raise ValueError('보호 검사에서는 -C로 저장소를 지정하세요.')
        if not tokens:
            continue
        operation, *args = tokens
        if operation not in ('push', 'merge', 'commit', 'checkout', 'switch', 'branch'):
            continue
        branch = git(repo, 'branch', '--show-current')
        if operation in ('commit', 'merge') and branch in ('main', 'dev'):
            raise ValueError('main/dev에서 직접 커밋·머지하지 마세요. 이슈 워크트리와 PR을 사용하세요.')
        if operation == 'push':
            refs = [arg for arg in args if not arg.startswith('-')]
            destinations = [ref.rsplit(':', 1)[-1].removeprefix('refs/heads/') for ref in refs]
            if (branch in ('main', 'dev') or any(ref in ('main', 'dev') for ref in destinations)
                    or any(arg in ('--all', '--mirror') for arg in args)
                    or any('*' in arg for arg in args)):
                raise ValueError('main/dev에 직접 push할 수 없습니다. PR을 사용하세요.')
        created_branch = None
        if operation in ('checkout', 'switch'):
            flags = ('-b', '-B') if operation == 'checkout' else ('-c', '-C', '--create', '--force-create')
            for index, arg in enumerate(args):
                if arg in flags:
                    if index + 1 >= len(args):
                        raise ValueError('새 브랜치 이름이 없습니다.')
                    created_branch = args[index + 1]
                    break
                for flag in flags:
                    if arg.startswith(flag + '='):
                        created_branch = arg[len(flag) + 1:]
                    elif len(flag) == 2 and arg.startswith(flag) and len(arg) > 2:
                        created_branch = arg[2:]
        elif operation == 'branch' and args and not args[0].startswith('-'):
            created_branch = args[0]
        if created_branch is not None:
            if not re.fullmatch(r'ALGOGO-\d+', created_branch):
                raise ValueError('작업 브랜치명은 ALGOGO-번호 형식을 사용하세요.')
            common = Path(git(repo, 'rev-parse', '--git-common-dir'))
            own = Path(git(repo, 'rev-parse', '--git-dir'))
            if (repo / common).resolve() == (repo / own).resolve():
                raise ValueError('기본 체크아웃에서 브랜치를 전환하지 마세요. git worktree add를 사용하세요.')


def post_edit(file_path, cwd):
    root = Path(cwd).resolve()
    path = Path(file_path)
    path = (root / path).resolve()
    if not path.is_relative_to(root):
        raise ValueError('수정 파일이 지정한 작업 디렉토리 밖에 있습니다.')
    commands = []
    if path.suffix in ('.ts', '.tsx', '.js', '.jsx'):
        commands.append(['rtk', 'pnpm', 'exec', 'eslint', '--fix', str(path)])
    if path.suffix in ('.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss'):
        commands.append(['rtk', 'pnpm', 'exec', 'prettier', '--write', str(path)])
    for command in commands:
        subprocess.run(command, cwd=root, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['protect-main', 'post-edit', 'adr-check'])
    parser.add_argument('--cwd')
    parser.add_argument('--command')
    parser.add_argument('--file')
    parser.add_argument('--commit-output')
    args = parser.parse_args()
    explicit = any(value is not None for value in (args.command, args.file, args.commit_output))
    payload = {} if explicit or sys.stdin.isatty() else json.load(sys.stdin)
    cwd = args.cwd or payload.get('cwd') or str(Path.cwd())
    tool_input = payload.get('tool_input') or {}
    if args.mode == 'protect-main':
        protect(args.command if args.command is not None else tool_input.get('command', ''), cwd)
    elif args.mode == 'post-edit':
        file_path = args.file if args.file is not None else tool_input.get('file_path')
        if file_path:
            post_edit(file_path, cwd)
    else:
        output = args.commit_output
        if output is None:
            output = (payload.get('tool_result') or payload.get('tool_response') or {}).get('stdout', '')
        if re.search(r'^\[.+ [a-f0-9]+\]', output, re.MULTILINE):
            print('[ADR 확인] 코드만으로 드러나지 않는 의사결정 이유가 있으면 docs/adr/에 기록하세요.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, subprocess.CalledProcessError, OSError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(2)
