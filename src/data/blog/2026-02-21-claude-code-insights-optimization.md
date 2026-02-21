---
author: huhsame
pubDatetime: 2026-02-21T23:00:00+09:00
title: "Claude Code 인사이트로 워크플로우 최적화하기"
featured: false
draft: false
tags:
  - claude-code
  - productivity
  - developer-tools
  - ai
description: "136개 세션, 1,344개 메시지를 분석한 인사이트 리포트에서 발견한 마찰 포인트를 CLAUDE.md, 훅, 스킬, 커스텀 에이전트로 해결한 과정. 데이터 기반으로 AI 코딩 워크플로우를 개선하는 실전 가이드."
---

## TL;DR

- 136개 세션, 1,344개 메시지에 대한 `/insights` 리포트에서 잘못된 접근 38건, 버그 코드 30건, 요청 오해 19건 등 주요 마찰 포인트 발견
- CLAUDE.md에 8개 규칙 정의, tsc 훅으로 편집 즉시 타입 체크, preflight-deploy 스킬로 배포 전 검증을 자동화하는 바이브코딩 인프라 구축
- 커스텀 에이전트로 대량 탐색을 서브에이전트에 위임하여 메인 컨텍스트 보호, statusline으로 컨텍스트 사용량 실시간 모니터링
- "데이터에서 문제를 찾고, 설정으로 해결하고, 자동화로 재발을 막는" 개선 루프 확립

---

## 왜 이걸 했는지

Claude Code를 5주 동안 사용하면서 계속 같은 짜증이 반복됐습니다.

"아니 왜 또 상위 디렉토리에서 git을 실행해?" "그 API 키는 지난번에 줬잖아." "빌드가 깨지는 걸 왜 배포 시점에서야 알려주는 거야?"

감으로 짜증나는 건 알겠는데, 정확히 얼마나 자주, 어떤 유형으로 발생하는지는 몰랐습니다. 그래서 Claude Code의 `/insights` 명령을 실행했습니다.

이 명령은 지정한 기간 동안의 모든 세션 로그를 분석해서 사용 패턴, 마찰 포인트, 개선 제안을 담은 리포트를 생성합니다. 제 경우 136개 세션, 1,344개 메시지가 분석 대상이었습니다.

리포트를 읽고 나서 생각이 바뀌었습니다. "짜증나는 걸 참는 게 아니라, 설정으로 해결하면 되는 거였구나."

---

## 데이터가 보여준 것

### 숫자로 본 마찰 포인트

인사이트 리포트가 마찰 유형별로 건수를 집계해줍니다.

| 마찰 유형 | 발생 건수 | 의미 |
|-----------|-----------|------|
| 잘못된 접근 | 38건 | 잘못된 디렉토리, 도구, 범위로 시작 |
| 버그 코드 | 30건 | 빌드 실패가 배포 시점에서야 발견 |
| 요청 오해 | 19건 | 세션 간 컨텍스트 손실, 반복 설명 |
| 사용자 액션 거부 | 10건 | Claude가 시작한 작업을 중단시킴 |

가장 많은 38건이 "잘못된 접근"이었습니다. Claude가 랜딩 페이지만 수정하면 되는데 전체 사이트 리디자인을 시작한다거나, 제가 명시적으로 요청한 Gemini 이미지 생성 스킬 대신 MCP 도구를 사용한다거나 하는 경우입니다.

두 번째로 많은 30건은 "버그 코드"입니다. DB 컬럼이 NULL 대신 DEFAULT false로 되어 있어서 동의 플로우가 안 되거나, 연도가 2026이 아니라 2016으로 설정되거나, isomorphic-dompurify가 Vercel에서 500 에러를 일으키거나 -- 이런 것들이 배포 직전이 아니라 코드 편집 시점에서 잡혔어야 했습니다.

### 잘 되고 있던 것들

리포트가 마찰만 보여주는 건 아닙니다. 잘 되고 있는 것들도 나옵니다.

- **멀티 파일 변경 36건 성공**: 12개 파일에 걸쳐 4개 관리자 기능을 한 세션에서 완성하는 식의 작업이 잘 되고 있었습니다
- **Task/TaskUpdate 370회 호출**: 복잡한 작업을 서브태스크로 쪼개서 병렬 처리하는 패턴이 자연스럽게 자리 잡았습니다
- **완전 달성률 50%, 대부분 달성 24%**: 전체의 74%가 목표에 근접하거나 완전히 달성

문제는 나머지 26%에서 시간이 과도하게 소모된다는 것이었습니다. 마찰을 줄이면 그 시간을 되찾을 수 있습니다.

---

## 글로벌 CLAUDE.md -- 세션이 바뀌어도 규칙은 유지되게

가장 먼저 한 건 `~/.claude/CLAUDE.md` 파일을 만든 것입니다. 이 파일은 모든 프로젝트, 모든 세션에서 Claude Code가 읽는 글로벌 규칙입니다. 프로젝트별 CLAUDE.md와 다릅니다 -- 프로젝트별 파일은 해당 프로젝트에서만 적용되지만, 글로벌 파일은 어디서든 적용됩니다.

인사이트 리포트의 마찰 유형과 1:1로 대응하는 규칙을 넣었습니다.

```markdown
# Global Conventions

## Scope Discipline
- Do NOT expand scope beyond what the user explicitly asks
- If the user says 'landing page', do not redesign the entire site
- If the user says 'fix the title', fix ALL instances including `<title>` tags, meta tags, and visible text
- Apply changes completely the first time — do not require the user to point out missed spots

## Project Structure Navigation
- Always check for nested subdirectories before running git commands or reading files
- Many projects are nested inside subdirectories (e.g., `project-root/app/`)
- Run `ls package.json` to confirm the correct working directory before proceeding
- Never run git commands from parent directory — always cd into the actual repo first

## Environment & Keys
- Never ask the user to re-provide API keys or environment variables
- Check Vercel (`vercel env ls`), `.env*` files, or the deployment platform first
```

이 세 섹션만으로도 마찰의 상당 부분이 사라졌습니다. "Scope Discipline"은 잘못된 접근 38건 중 범위 확장 문제를, "Project Structure Navigation"은 잘못된 디렉토리 문제를, "Environment & Keys"는 API 키 재요청 문제를 직접 겨냥합니다.

나머지 규칙들도 같은 방식으로 만들었습니다.

```markdown
## Build Verification
- After implementing features, always run `npm run build` to verify no errors before declaring completion

## Skills & Tools Priority
- When the user references a specific skill, always use that skill or agent
- Never fall back to MCP tools or alternative approaches unless the skill explicitly fails

## Sub-Agent Delegation
- When exploring 3+ files or doing broad codebase search, delegate to a Task sub-agent
- Sub-agent results come back summarized — main context stays clean

## Context Management
- When context usage reaches ~70%, proactively suggest `/compact` to the user
```

핵심은 "구체적인 상황 + 구체적인 행동"으로 규칙을 쓰는 것입니다. "코드를 잘 작성해주세요" 같은 모호한 규칙은 효과가 없습니다. "랜딩 페이지라고 하면 전체 사이트를 리디자인하지 마세요"처럼, 실제로 발생했던 문제를 기반으로 구체적으로 쓰면 Claude가 정확히 따릅니다.

---

## tsc 훅 -- 편집할 때마다 자동 타입 체크

버그 코드 30건 중 상당수는 TypeScript 타입 에러였습니다. 빌드를 돌려야 발견되는데, 기능을 다 만들고 나서야 빌드를 하니까 에러가 쌓여있는 겁니다.

Claude Code의 훅(Hook) 기능으로 이걸 해결했습니다. 훅은 특정 도구 사용 후에 셸 명령을 자동으로 실행하는 기능입니다. Edit이나 Write로 파일을 수정할 때마다 `npx tsc --noEmit`이 자동으로 돌아갑니다.

프로젝트 디렉토리의 `.claude/settings.json`에 설정합니다.

```json
{
  "hooks": {
    "postToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "cd /Users/huh/Workspace/huhsame/huhsame-ai && npx tsc --noEmit 2>&1 | head -20"
          }
        ]
      }
    ]
  }
}
```

`matcher`가 `Edit|Write`이니까 파일을 수정하거나 새로 만들 때마다 타입 체크가 실행됩니다. `head -20`으로 출력을 20줄로 제한한 건, 에러가 많을 때 컨텍스트가 타입 에러 메시지로 넘치는 걸 방지하기 위해서입니다.

이 훅의 효과는 즉각적입니다. Claude가 파일을 수정하면 바로 다음 줄에 타입 에러가 표시되니까, Claude가 스스로 에러를 보고 고칩니다. "빌드 돌려봐" 같은 말을 할 필요가 없어졌습니다.

---

## preflight-deploy 스킬 -- 배포 전 체크를 한 번에

그래도 배포 전에는 타입 체크보다 더 많은 검증이 필요합니다. 올바른 디렉토리인지 확인, 빌드 검증, console.log 잔재 확인, 하드코딩된 localhost URL 검출, 환경변수 누락 체크, 커밋, 푸시 -- 이걸 매번 수동으로 하는 건 현실적이지 않습니다.

`/preflight-deploy`라는 커스텀 스킬을 만들었습니다. Claude Code에서 `/preflight-deploy`라고 입력하면 아래 단계가 순차적으로 실행됩니다.

```markdown
# Preflight Deploy

배포 전 점검 및 배포를 자동으로 수행하는 스킬.

## 실행 단계

### 1. 프로젝트 구조 확인
- `find . -name '.git' -maxdepth 3`으로 올바른 git 루트 디렉토리 찾기
- `ls package.json`으로 올바른 프로젝트 디렉토리인지 확인

### 2. 빌드 검증
- `npm run build` 실행
- 실패 시 에러를 분석하고 수정
- 깨끗하게 빌드될 때까지 반복

### 3. 코드 품질 스캔
- 프로덕션 코드에 `console.log` 문이 남아있는지 확인
- 하드코딩된 `localhost` URL이 없는지 확인
- `.env.local` 키와 코드에서 참조된 `process.env.*`를 대조

### 4. 커밋 & 푸시
- 변경사항 스테이징 → 커밋 메시지 생성 → git push origin main
```

스킬 파일은 `~/.claude/skills/preflight-deploy/SKILL.md`에 저장됩니다. 마크다운으로 작성된 이 파일이 곧 프롬프트입니다. Claude Code가 이 파일을 읽고 각 단계를 자율적으로 실행합니다.

각 단계를 거치면 최종적으로 결과 테이블이 나옵니다.

| 단계 | 상태 |
|------|------|
| 프로젝트 확인 | 통과/실패 |
| 빌드 검증 | 통과/실패 |
| 코드 품질 | 통과/실패 |
| 커밋 & 푸시 | 통과/실패 |

"기능 구현 → 배포"까지의 과정에서 빠뜨리기 쉬운 단계들을 자동으로 챙겨주니까, 배포 후에 "아, console.log 안 지웠다" 같은 일이 줄었습니다.

---

## codebase-researcher 에이전트 -- 컨텍스트를 지키는 파수꾼

Claude Code를 쓰다 보면 컨텍스트 창(Context Window)이 금방 찹니다. 특히 대규모 코드 검색을 하면 검색 결과가 컨텍스트를 크게 차지합니다. "이 함수가 어디서 쓰이는지 찾아줘"라고 하면 20개 파일의 코드가 컨텍스트에 올라오고, 그러면 앞에서 논의했던 맥락이 밀려나가죠.

커스텀 에이전트(Custom Agent)를 만들어서 이 문제를 해결했습니다.

```markdown
---
name: codebase-researcher
description: Codebase exploration and analysis specialist. Use PROACTIVELY when searching across 3+ files.
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a codebase research specialist. Your job is to explore code and return concise, actionable summaries.

## Rules
1. Search thoroughly but report concisely
2. Always include file paths and line numbers in results
3. Group findings by category (files, functions, patterns)
4. Maximum 50 lines in your final summary
5. If you find more than 20 matches, summarize patterns instead of listing all
```

핵심은 두 가지입니다. 첫째, `model: sonnet`으로 Sonnet 모델을 사용합니다. 코드 검색은 복잡한 추론이 필요 없으니 빠르고 저렴한 모델로 충분합니다. 둘째, "Maximum 50 lines in your final summary"라는 규칙이 있습니다. 서브에이전트가 100개 파일을 뒤져도, 메인 컨텍스트에 돌아오는 건 50줄 이내의 요약입니다.

CLAUDE.md의 "Sub-Agent Delegation" 규칙과 짝을 이룹니다. "3개 이상 파일을 탐색할 때는 서브에이전트에 위임하라"는 규칙이 있으니, Claude가 알아서 codebase-researcher를 호출합니다.

---

## statusline -- 컨텍스트 사용량을 눈으로 확인

컨텍스트 관리가 중요하다는 걸 알면서도, 지금 몇 %를 쓰고 있는지 보이지 않으면 관리가 안 됩니다. Claude Code의 statusline 기능으로 하단에 실시간 정보를 표시하게 설정했습니다.

```bash
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name // "?"')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')

if [ "$PCT" -ge 80 ]; then
  COLOR='\033[31m'  # Red
elif [ "$PCT" -ge 60 ]; then
  COLOR='\033[33m'  # Yellow
else
  COLOR='\033[32m'  # Green
fi

FILLED=$((PCT / 10))
EMPTY=$((10 - FILLED))
BAR=$(printf "%${FILLED}s" | tr ' ' '#')$(printf "%${EMPTY}s" | tr ' ' '-')
RESET='\033[0m'

echo -e "${MODEL} | ${COLOR}[${BAR}] ${PCT}%${RESET} | \$${COST}"
```

이 스크립트를 `~/.claude/statusline.sh`에 저장하고, 글로벌 settings.json에 등록합니다.

```json
{
  "cleanupPeriodDays": 99999,
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

터미널 하단에 항상 `Opus | [######----] 60% | $2.34` 같은 형태로 모델명, 컨텍스트 사용률, 비용이 표시됩니다. 60% 이상이면 노란색, 80% 이상이면 빨간색으로 바뀝니다.

`cleanupPeriodDays: 99999`도 같이 설정했습니다. Claude Code는 기본적으로 세션 로그를 30일 후에 삭제하는데, 이 값을 99999로 바꾸면 사실상 무기한 보존됩니다. 세션 로그는 이 글 같은 개발노트의 소스이기도 하고, 나중에 `/insights`를 다시 실행할 때도 필요하니까요.

---

## 토큰과 컨텍스트를 관리하는 실전 팁

statusline으로 컨텍스트 사용량이 보이면, 그 다음은 관리입니다. 실전에서 쓰는 명령어들을 정리합니다.

**`/compact`** -- 대화 압축 명령입니다. 지금까지의 대화를 요약해서 컨텍스트를 줄입니다. 70-75% 정도에서 수동으로 실행하는 게 좋습니다. 80%를 넘기면 Claude의 응답 품질이 눈에 띄게 떨어집니다.

**`/clear`** -- 컨텍스트 완전 초기화입니다. 새 대화를 시작하는 것과 같습니다. 중요한 건 이걸 해도 JSONL 로그는 디스크에 남는다는 것입니다. 세션 기록이 사라지는 게 아닙니다.

**`/context`** -- 현재 토큰 사용량을 카테고리별로 보여줍니다. 어떤 파일이 컨텍스트를 얼마나 차지하고 있는지 확인할 수 있습니다.

**모델 전환** -- `Shift+Tab`으로 Sonnet과 Opus를 전환할 수 있습니다. 일상적인 코드 수정은 Sonnet으로 충분하고, 복잡한 아키텍처 설계나 버그 추적은 Opus가 나습니다. 비용도 차이가 크고요.

이 명령어들을 조합하면 하나의 패턴이 됩니다. "작업 시작 → statusline으로 컨텍스트 확인 → 70%에서 /compact → 대규모 검색은 서브에이전트에 위임 → 작업 전환 시 /clear"

---

## 배운 것

### 바이브코딩 관점

**데이터 기반으로 개선하세요.** "AI가 삽질한다"는 막연한 불만으로는 개선할 수 없습니다. `/insights`로 마찰 유형과 건수를 뽑아보면, "잘못된 접근이 38건으로 가장 많고, 그 중 디렉토리 문제가 절반이다"처럼 구체적인 개선 포인트가 나옵니다. 그걸 CLAUDE.md 규칙으로 바꾸면 됩니다.

**CLAUDE.md는 설정 파일이지 README가 아닙니다.** "이 프로젝트는 Next.js를 사용합니다" 같은 설명이 아니라, "git 명령 실행 전에 `ls package.json`으로 디렉토리를 확인하세요" 같은 행동 지침을 써야 합니다. 실제로 발생했던 마찰을 기반으로 규칙을 만들면 효과가 큽니다.

**자동화의 계층을 만드세요.** 훅은 가장 빈번한 검증(타입 체크)을, 스킬은 중간 빈도의 워크플로우(배포)를, 에이전트는 상황에 따라 다른 복잡한 작업(코드 탐색)을 담당합니다. 전부 CLAUDE.md에 규칙으로 적는 것보다, 적절한 레벨에서 자동화하는 게 효과적입니다.

### 개발 관점

**세션 로그는 소중한 데이터입니다.** `cleanupPeriodDays: 99999`로 로그 삭제를 막아두면, 나중에 패턴 분석, 블로그 소스, 교육 자료로 활용할 수 있습니다. `/clear`를 해도 JSONL 파일은 디스크에 남습니다.

**컨텍스트 관리는 성능 관리입니다.** 컨텍스트 창이 80%를 넘어가면 Claude의 응답 품질이 떨어집니다. 새로운 정보를 제대로 처리하지 못하고, 앞에서 정한 규칙을 잊기도 합니다. statusline으로 실시간 모니터링하고, 70%에서 /compact를 실행하는 습관이 중요합니다.

**서브에이전트 위임으로 컨텍스트를 보호하세요.** "이 함수가 어디서 쓰이는지 찾아줘"라고 메인 세션에서 실행하면 검색 결과가 컨텍스트를 크게 차지합니다. 대신 서브에이전트(예: codebase-researcher)에 위임하면 50줄 이내의 요약만 돌아오니까 메인 컨텍스트가 깨끗하게 유지됩니다.

---

## 다음 단계

이번에 만든 설정들의 효과를 체감하고 있지만, 아직 개선할 부분이 남아 있습니다.

- **테스트 자동화**: 지금은 타입 체크만 훅으로 걸어두었는데, 유닛 테스트도 커밋 전에 자동 실행되도록 확장할 계획입니다
- **인사이트 정기 실행**: 한 달에 한 번 `/insights`를 돌려서 마찰 패턴의 변화를 추적하려고 합니다. 이전 리포트와 비교하면 개선 효과를 정량적으로 확인할 수 있습니다
- **프로젝트별 CLAUDE.md 고도화**: 글로벌 규칙 외에, 프로젝트별로 자주 발생하는 마찰을 프로젝트 CLAUDE.md에 추가하는 작업을 계속할 예정입니다

"작게 쪼개고, 디렉토리 알려주고, 빌드 확인하기" -- 이 세 가지가 가장 큰 효과를 낸 규칙이었습니다. AI 코딩 도구가 더 똑똑해져도 이 기본 원칙은 변하지 않을 것 같습니다. 결국 도구를 잘 쓰는 건, 도구의 약점을 데이터로 파악하고 체계적으로 보완하는 것이니까요.

## 링크

- **인사이트 리포트**: Claude Code `/insights` 명령으로 생성
- **글로벌 CLAUDE.md**: `~/.claude/CLAUDE.md`
- **프로젝트 훅 설정**: `프로젝트/.claude/settings.json`
- **preflight-deploy 스킬**: `~/.claude/skills/preflight-deploy/SKILL.md`
- **codebase-researcher 에이전트**: `~/.claude/agents/codebase-researcher.md`
- **statusline 스크립트**: `~/.claude/statusline.sh`
