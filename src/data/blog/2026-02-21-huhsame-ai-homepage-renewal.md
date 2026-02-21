---
author: huhsame
pubDatetime: 2026-02-21T22:00:00+09:00
title: "허세임AI 홈페이지 전면 리뉴얼: 강의 플랫폼에서 콘텐츠 플랫폼으로"
featured: true
draft: false
tags:
  - 바이브코딩
  - Next.js
  - Supabase
  - 풀스택
description: "8개 커밋, Phase별로 설계부터 다크모드까지. 브랜드 디자인 시스템, 블로그, 튜토리얼, 쇼케이스, 캐릭터 일러스트까지 한 번에 갈아엎은 기록."
---

## TL;DR

- 허세임AI(huhsame-ai) 플랫폼을 강의 판매 중심에서 개인 브랜딩 + 콘텐츠 플랫폼으로 전환했다
- "손으로 그린 기술" 컨셉의 디자인 시스템부터 블로그, 튜토리얼, 쇼케이스, 다크모드 칠판 테마까지 8개 커밋으로 완성
- Gemini API로 로고 캐릭터 기반 일러스트를 직접 생성해서 빈 화면에 배치했다

## 배경

허세임AI 플랫폼이 처음에는 강의를 파는 LMS(학습 관리 시스템)로 시작했는데, 쓰다 보니 방향이 좀 달라야 한다는 느낌이 왔다. 강의만 있으면 "교육 쇼핑몰"처럼 보이는데, 나는 그보다는 내가 하는 작업과 생각을 쌓아가는 공간이 필요했다.

그래서 방향을 바꿨다. 강의는 있되, 블로그로 생각을 기록하고, 튜토리얼로 실습 자료를 올리고, 쇼케이스로 수강생 결과물을 모아두는 구조. 홈페이지도 그에 맞게 전면 개편이 필요했다.

Claude Code로 Phase를 나눠서 작업했다. 처음에 한 번에 "다 만들어줘"라고 하면 방향이 흔들리니까, 각 단계별로 명확하게 끊고 확인하면서 진행했다.

## 과정

### Phase 1: 브랜드 디자인 시스템

**프롬프트**:
> "손으로 그린 기술" 컨셉으로 브랜드 디자인 시스템을 구축해줘. 폰트는 Pretendard(본문) + Gaegu(손글씨 강조) + Geist Mono(코드). 브랜드 컬러와 Tailwind 유틸리티 클래스들 정의해줘.

**Claude가 한 일**:
- Tailwind CSS 4 설정에 커스텀 컬러 추가: `ink-black(#1a1a1a)`, `highlighter-yellow(#fff176)`, `red-pencil(#e53935)`, `cream(#faf8f4)`
- 유틸리티 클래스 정의: `.highlight`(형광펜 효과), `.red-strike`(빨간펜 취소선), `.hand-drawn-border`(불규칙 테두리), `.notebook-bg`(줄노트 배경)
- Google Fonts 연결 (`Gaegu`, `Geist Mono`)

이 단계가 나머지 모든 Phase의 기반이 됐다. 디자인 시스템을 먼저 잡고 나면, 이후 컴포넌트들이 일관된 스타일로 나온다.

```css
/* 형광펜 효과 */
.highlight {
  background: linear-gradient(transparent 60%, var(--color-highlighter-yellow) 60%);
}

/* 손으로 그린 느낌의 테두리 */
.hand-drawn-border {
  border-radius: 2px 8px 4px 6px / 6px 2px 8px 4px;
  border: 2px solid currentColor;
}
```

### Phase 2: 홈페이지 리뉴얼

**프롬프트**:
> 홈페이지를 7개 섹션으로 리뉴얼해줘. Hero(인트로), Intro(소개), Portfolio(포트폴리오), Course Preview(강의 미리보기), Blog Preview(블로그), Showcase Preview(쇼케이스), Newsletter(뉴스레터). Phase 1 디자인 시스템 적용.

**Claude가 한 일**:
- 7개 섹션 컴포넌트 생성
- 프로필 이미지에 `hand-drawn-border` 적용
- 섹션별로 `.highlight`와 `.red-strike` 적절히 배치
- Hero 섹션에 타이핑 애니메이션

![홈페이지 라이트 모드](../../assets/images/posts/2026-02-21/01-home-light.png)

형광펜 하이라이트와 빨간펜 취소선이 "손으로 쓴 강의 노트" 같은 느낌을 준다. 디자인 컨셉을 먼저 문서화했던 게 여기서 빛났다. Claude가 섹션마다 일관되게 유틸리티 클래스를 골라서 썼다.

### Phase 3: 블로그 시스템

**프롬프트**:
> 블로그 기능을 만들어줘. blog_posts, blog_tags 테이블. Tiptap 에디터. content_type은 blog(일반 글)와 glossary(AI 용어사전) 2가지. 태그 필터, 페이지네이션, Admin CRUD.

**Claude가 한 일**:
- Supabase 마이그레이션: `blog_posts`, `blog_tags`, `blog_post_tags` 테이블 + RLS 정책
- Tiptap 에디터 설치 및 커스텀 설정 (이미지 업로드, 코드블록 하이라이팅)
- 태그 필터 + 페이지네이션 UI
- `/admin/blog` 페이지 CRUD

블로그와 용어사전을 같은 테이블(`content_type` 컬럼으로 구분)에 넣은 게 좋은 결정이었다. 나중에 용어사전 페이지를 추가할 때 별도 테이블 없이 필터 하나만 추가하면 됐다.

![블로그 목록 페이지](../../assets/images/posts/2026-02-21/03-blog-list.png)

### Phase 4: 튜토리얼 + 실습 + 쇼케이스

가장 복잡한 단계였다. 단순히 글을 읽는 게 아니라 "실습하고 제출하고 쇼케이스에 자동 게시되는" 흐름이 필요했다.

**프롬프트**:
> 튜토리얼 시스템을 만들어줘. tutorials, chapters, exercises(실습 과제), submissions(제출물), showcases 테이블. GitBook 스타일 레이아웃. Agent API(Bearer token 인증)로 AI 에이전트가 결과물을 업로드할 수 있게. 전 챕터 완료 시 자동 쇼케이스 생성.

**Claude가 한 일**:
- DB 5개 테이블 설계 + 마이그레이션
- GitBook 스타일 사이드바 + 본문 레이아웃
- `/api/agent/*` 엔드포인트: Bearer token 인증, 진행 상황 업데이트, 결과물 업로드
- 전 챕터 완료 체크 로직 → 자동 쇼케이스 생성

**핵심 설계**: AI 에이전트가 튜토리얼을 수행하면서 API로 진행 상황을 보고하는 구조다. 사람이 직접 UI에서 클릭하는 것과 에이전트가 API로 호출하는 것, 두 가지를 모두 지원하게 만들었다.

```typescript
// Agent API - Bearer token으로 인증
// POST /api/agent/progress
// POST /api/agent/upload
// 에이전트가 챕터를 완료하면 자동으로 쇼케이스 생성 트리거
```

![튜토리얼 페이지](../../assets/images/posts/2026-02-21/05-tutorials.png)

### Phase 5: 네비게이션 + DB 연동

**프롬프트**:
> NAV_ITEMS 업데이트하고, 홈페이지 각 섹션(Blog Preview, Showcase Preview 등)을 실제 DB 데이터로 연결해줘. 뉴스레터 구독 API도 추가.

**Claude가 한 일**:
- `NAV_ITEMS` 배열 업데이트 (블로그, 튜토리얼, 쇼케이스 추가)
- 각 섹션 컴포넌트에서 Supabase 데이터 fetching
- 뉴스레터 구독 API (`/api/newsletter`)

이 단계까지 오면 홈페이지가 실제 데이터를 보여주기 시작한다. Phase 2에서 하드코딩으로 만들었던 섹션들이 실제 블로그 글, 실제 쇼케이스로 채워진다.

### 캐릭터 일러스트

빈 상태(empty state) 화면이 텍스트만 있으면 썰렁하다. 로고 캐릭터 기반 일러스트를 넣으면 좋겠다 싶었다.

**프롬프트**:
> Gemini API로 허세임 로고 캐릭터 기반 드로잉 3개 생성해줘. "손으로 그린 기술" 컨셉에 맞게. 소개 섹션, 뉴스레터, 튜토리얼 빈 상태 화면에 배치.

**Claude가 한 일**:
- Gemini API (`gemini-2.0-flash-exp-image-generation`) 호출로 일러스트 3종 생성
- Next.js public 폴더에 저장
- 각 섹션 컴포넌트에 `<Image>` 태그로 배치

Gemini가 생성한 이미지를 그대로 쓴 게 아니라, 로고 캐릭터의 특징(둥근 머리, 안경)을 프롬프트에 구체적으로 기술했더니 일관성 있는 드로잉이 나왔다.

### Phase 7: 버그 수정 + 누락 기능

구현하면서 놓친 것들을 한 번에 잡는 단계.

**주요 수정사항**:
- `tutorial_submissions` UNIQUE 제약 추가 (같은 챕터를 두 번 제출하는 버그)
- 블로그 태그 필터 페이지네이션 버그: JS 레벨 필터링을 DB 레벨로 내림
- 마이페이지에 토큰/튜토리얼/쇼케이스 탭 추가
- 관리자 exercise CRUD
- 블로그 TOC(목차) 사이드바 (IntersectionObserver로 현재 섹션 하이라이팅)
- Members-only 콘텐츠 게이트

**블로그 태그 필터 버그**는 전형적인 실수였다. 처음에 모든 글을 가져와서 JS로 필터링했는데, 페이지네이션이 전체 글 기준이 아니라 필터된 글 기준으로 계산되어야 하는 걸 JS 레벨에서는 못 하는 거다. WHERE 절로 DB에서 필터링하고, COUNT도 같은 조건으로 가져오니까 해결됐다.

### Phase 8: 다크모드 칠판 테마

마지막으로 다크모드. 단순히 배경을 어둡게 하는 게 아니라, "칠판과 분필" 컨셉으로 전환하고 싶었다.

**프롬프트**:
> next-themes 기반으로 다크모드를 추가해줘. 어두운 녹색 배경(#2d3a2d)에 분필 텍스트(#e4ddd0)로 칠판 느낌. 브랜드 유틸리티 클래스들(.highlight, .red-strike 등)도 다크모드에서 다르게 보이게.

**Claude가 한 일**:
- `next-themes` 설치 및 ThemeProvider 설정
- CSS 변수를 다크모드 전용으로 오버라이드
- `.highlight`는 어두운 노란색 계열로, `.red-strike`는 더 진한 빨간색으로
- 헤더에 테마 토글 버튼

![홈페이지 다크 모드 (칠판 테마)](../../assets/images/posts/2026-02-21/02-home-dark.png)

라이트 모드는 "강의 노트", 다크 모드는 "칠판"이다. 같은 레이아웃인데 분위기가 완전히 달라진다.

## 삽질 & 해결

**RLS(Row Level Security) 정책 설계**

Supabase에서 테이블마다 RLS를 켜두면, 의도치 않게 데이터가 안 보이는 상황이 자주 생긴다. 관리자 전용 테이블(exercises, submissions 관리 등)은 `createAdminClient()`(서비스 롤 키)로, 일반 데이터는 `createClient()`(RLS 적용)로 분리해서 처리했다.

프로젝트 메모리(`MEMORY.md`)에 이 패턴을 정리해뒀더니, Claude가 새 API 라우트를 만들 때마다 자동으로 같은 패턴을 따라왔다.

**Tiptap 에디터 이미지 업로드**

Tiptap의 기본 이미지 노드는 URL만 받는다. Supabase Storage에 직접 올리려면 커스텀 확장이 필요했다. `onDrop`과 `onPaste` 이벤트에서 파일을 받아서 Storage에 업로드한 뒤 URL로 삽입하는 방식으로 해결했다.

**자동 쇼케이스 생성 타이밍**

"전 챕터 완료 시 자동 쇼케이스 생성"을 구현할 때, 마지막 챕터를 완료하는 API 요청 안에서 바로 쇼케이스를 만들면 트랜잭션이 너무 길어진다. 그래서 완료 처리 → 완료 여부 체크 → 쇼케이스 생성을 순서대로 처리하되, 실패하면 다음 요청에서 다시 시도하는 구조로 만들었다.

## 관리자 화면

![관리자 대시보드](../../assets/images/posts/2026-02-21/10-admin-dashboard.png)

![관리자 블로그 관리](../../assets/images/posts/2026-02-21/11-admin-blog.png)

관리자 대시보드에서 블로그 글, 튜토리얼, 강의, 수강생 제출물을 모두 관리할 수 있다. 특히 블로그는 Tiptap 에디터로 바로 작성할 수 있어서, 별도 CMS 없이도 운영이 된다.

## 프롬프트 회고

**잘 먹힌 프롬프트 패턴**:
- Phase 단위 분리: 한 번에 "다 만들어줘"보다 Phase 1, 2, 3... 순서로 나눠서 각 단계를 완료하고 넘어가는 방식이 훨씬 안정적이다. Claude가 문맥을 잃지 않는다.
- 디자인 시스템 먼저: 컬러, 폰트, 유틸리티 클래스를 Phase 1에서 확립하고 나면, 이후 컴포넌트들이 일관성 있게 나온다.
- MEMORY.md 활용: 프로젝트의 패턴(Supabase 클라이언트 사용법, TypeScript 타입 위치 등)을 MEMORY.md에 정리해뒀더니, 세션이 바뀌어도 일관된 코드가 나왔다.
- DB 설계를 프롬프트에 포함: "blog_posts, blog_tags 테이블"처럼 테이블 이름을 직접 지정하면 나중에 타입 충돌이 없다.

**아쉬웠던 점**:
- 블로그 태그 필터 페이지네이션 버그는 처음에 좀 더 생각하고 설계했으면 안 생겼을 버그다. "JS로 필터링"과 "DB 페이지네이션"의 조합이 동작 안 한다는 건 자명한데, 빠르게 만들다 보니 나중에 잡게 됐다.
- 스크린샷을 미리 찍어두지 않아서 작업 중간 상태를 기록 못 했다.

## 배운 것

- Next.js App Router에서 서버 컴포넌트와 클라이언트 컴포넌트 경계를 잘 나눠야 한다. 특히 Tiptap 같은 브라우저 전용 라이브러리는 `"use client"` 컴포넌트 안에서만 써야 한다.
- Supabase RLS는 강력하지만, 초반에 정책을 잘 설계하지 않으면 "데이터가 왜 안 보이지?" 디버깅에 시간을 많이 쓴다. Admin/일반 클라이언트 분리 패턴을 프로젝트 초반에 확립하는 것이 중요하다.
- 디자인 시스템을 코드로 정의해두면 (Tailwind 유틸리티 클래스), AI가 컴포넌트를 만들 때 일관성 있게 적용한다. 말로만 "이런 디자인으로 해줘"보다 훨씬 정확하다.
- Gemini API 이미지 생성을 인라인으로 쓸 수 있다는 게 편하다. 별도 Figma 작업 없이 프로토타입 일러스트를 빠르게 만들 수 있다.

## 사용한 Claude Code 기능

| 기능 | 설명 | 어떻게 썼나 |
|------|------|-------------|
| Plan 모드 | 코드 수정 전에 계획만 먼저 세우는 모드 | Phase 4(튜토리얼) 같은 복잡한 단계에서 DB 스키마와 API 구조를 먼저 검토 |
| MEMORY.md | 프로젝트 패턴을 기억하는 파일 | Supabase 클라이언트 사용 패턴, TypeScript 타입 위치 등을 저장해서 일관성 유지 |
| TodoWrite | 작업 목록 관리 | 각 Phase 내 세부 작업을 투두로 추적 |
| Bash | 터미널 명령 실행 | Supabase 마이그레이션 적용, npm install, 빌드 확인 |
| WebFetch | 웹 페이지 조회 | Tiptap 문서, next-themes 설정 방법 확인 |

## 도구 사용 통계

8개 커밋, 약 3-4일 작업:

| 도구 | 예상 횟수 | 주요 용도 |
|------|----------|-----------|
| Edit | 300+ | 컴포넌트 수정, 스타일 조정 |
| Write | 80+ | 새 컴포넌트, API 라우트, 마이그레이션 파일 |
| Bash | 150+ | 마이그레이션 적용, 빌드 확인, 패키지 설치 |
| Read | 200+ | 기존 코드 파악, 타입 확인 |
| TodoWrite | 40+ | Phase별 세부 작업 추적 |

## 결과물

![강의 목록 페이지](../../assets/images/posts/2026-02-21/06-courses.png)

![기업교육 페이지](../../assets/images/posts/2026-02-21/08-enterprise.png)

강의 목록과 기업교육 페이지도 새 디자인 시스템으로 통일됐다. 형광펜 하이라이트와 손글씨 폰트가 "강의 노트"스러운 분위기를 만들어준다.

## 링크

- **서비스**: [huhsame.com](https://huhsame.com)
- **기술 스택**: Next.js 16 App Router, Supabase, Tailwind CSS 4, Tiptap, next-themes, Gemini API
