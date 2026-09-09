import importlib.util
import io
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('hooks', ROOT / '.agents/hooks/agent_hooks.py')
hooks = importlib.util.module_from_spec(spec)
spec.loader.exec_module(hooks)


class HooksTest(unittest.TestCase):
    def test_보호_브랜치_직접_변경_차단(self):
        for branch in ('main', 'dev'):
            for command in ('rtk git commit -m 변경', 'git merge ALGOGO-73', 'git push'):
                with self.subTest(branch=branch, command=command), patch.object(hooks, 'git', return_value=branch):
                    with self.assertRaises(ValueError):
                        hooks.protect(command, ROOT)

    def test_이슈_브랜치의_일반_push_허용_보호_대상_refspec_차단(self):
        with patch.object(hooks, 'git', return_value='ALGOGO-73'):
            hooks.protect('rtk git push -u origin ALGOGO-73', ROOT)
            for command in ('git push origin HEAD:dev', 'git push origin HEAD:refs/heads/main', 'git push --mirror'):
                with self.assertRaises(ValueError):
                    hooks.protect(command, ROOT)

    def test_기본_체크아웃_브랜치_생성_차단_워크트리_허용(self):
        with patch.object(hooks, 'git', side_effect=['dev', '.git', '.git']):
            with self.assertRaises(ValueError):
                hooks.protect('git switch -c ALGOGO-73', ROOT)
        with patch.object(hooks, 'git', side_effect=['', '/tmp/repo/.git', '/tmp/repo/.git/worktrees/task']):
            hooks.protect('git switch -c ALGOGO-73', ROOT)

    def test_따옴표_내_구분자는_커밋_문자열로_처리(self):
        with patch.object(hooks, 'git', return_value='ALGOGO-73'):
            for title in ('A; B', 'A | B', 'A && B'):
                hooks.protect(f'rtk git commit -m "{title}"', ROOT)
            with self.assertRaises(ValueError):
                hooks.protect('git commit -m "A; B" && git push origin HEAD:main', ROOT)
            with self.assertRaises(ValueError):
                hooks.protect('git switch -c codex/ALGOGO-74', ROOT)
            with self.assertRaises(ValueError):
                hooks.protect('git switch -c codex/ALGOGO-74 ALGOGO-73', ROOT)

    def test_수정한_파일만_검사하고_실패_전파(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(hooks.subprocess, 'run') as run:
            hooks.post_edit('file.ts', directory)
            self.assertEqual([x.args[0][3] for x in run.call_args_list], ['eslint', 'prettier'])
            self.assertTrue(all(x.args[0][-1] == str(Path(directory).resolve() / 'file.ts') for x in run.call_args_list))
            run.reset_mock()
            run.side_effect = subprocess.CalledProcessError(1, 'eslint')
            with self.assertRaises(subprocess.CalledProcessError):
                hooks.post_edit('file.ts', directory)
            self.assertEqual(run.call_count, 1)
            with self.assertRaises(ValueError):
                hooks.post_edit('../outside.ts', directory)

    def test_JSON_연결과_공통_CLI_동일_입력(self):
        payload = {'cwd': str(ROOT), 'tool_input': {'command': 'git push origin ALGOGO-73'}}
        with patch.object(hooks, 'protect') as protect:
            with patch('sys.argv', ['hooks', 'protect-main']), patch('sys.stdin', io.StringIO(json.dumps(payload))):
                hooks.main()
            first = protect.call_args
            with patch('sys.argv', ['hooks', 'protect-main', '--cwd', str(ROOT), '--command', payload['tool_input']['command']]):
                hooks.main()
            self.assertEqual(first, protect.call_args)

    def test_Claude_링크와_직접_실행_결과_동일(self):
        args = ['--commit-output', '[ALGOGO-73 abc1234] 문서 변경']
        outputs = []
        for base in ('.agents/hooks', '.claude/hooks'):
            result = subprocess.run(['rtk', 'proxy', 'bash', str(ROOT / base / 'adr-check.sh'), *args], capture_output=True, text=True, check=True)
            outputs.append(result.stdout)
        self.assertEqual(outputs[0], outputs[1])
        self.assertIn('ADR', outputs[0])
        self.assertTrue((ROOT / 'CLAUDE.md').is_symlink())
        for path in (ROOT / '.claude').iterdir():
            self.assertTrue(path.is_symlink(), str(path))
            self.assertTrue(path.exists(), str(path))


if __name__ == '__main__':
    unittest.main()
