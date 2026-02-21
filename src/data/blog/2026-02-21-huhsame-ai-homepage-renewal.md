---
author: huhsame
pubDatetime: 2026-02-21T22:00:00+09:00
title: "Next.js 기본 템플릿을 '공부하는 공간'으로 바꾸기까지"
featured: true
draft: false
tags:
  - 바이브코딩
  - Next.js
  - Supabase
  - 풀스택
description: "수강생에게 웹사이트가 아니라 공부하는 공간이라는 느낌을 주고 싶었다. 디자인 시스템부터 칠판 다크모드까지, 바이브코딩으로 플랫폼을 통째로 갈아엎은 이야기."
---

## TL;DR

- 허세임 플랫폼(huhsame.com)을 "강의 판매 사이트"에서 "공부하는 공간"으로 전환했다
- Next.js 기본 디자인 그대로였던 사이트를, "손으로 그린 기술" 컨셉의 디자인 시스템 위에 블로그/튜토리얼/쇼케이스를 얹는 구조로 리뉴얼
- 라이트 모드는 강의 노트, 다크 모드는 칠판과 분필. 같은 레이아웃인데 분위기가 완전히 달라진다
- Claude Code로 Phase를 나눠서 바이브코딩. 디자인 시스템을 코드로 먼저 정의해두니까 이후 컴포넌트가 전부 일관성 있게 나왔다

---

## 왜 리뉴얼이 필요했는지

### Before: Next.js 기본 디자인 그 자체

솔직히 말하면, 기존 사이트는 Next.js 프로젝트를 `create-next-app`으로 만들고 거기에 콘텐츠만 얹은 수준이었다. 로그인 안 한 사람이 보는 화면은 Three.js 애니메이션 하나가 전부. 로그인하면 강의 3개와 교육 실적 로고 몇 개가 보이고, 그게 끝이었다.

문제는 이게 "웹사이트"라는 느낌이었다는 거다. 수강생 입장에서는 들어와서 강의 구매하고 나가는 쇼핑몰. 나는 그게 아니라, 들어오면 뭔가 배우고 싶어지는 공간을 만들고 싶었다.

> 수강생들에게 웹사이트가 아니라 공부하는 공간이라는 느낌으로 다가가고 싶었다.

그래서 방향을 바꿨다. 강의는 있되, 블로그로 생각을 기록하고, 튜토리얼로 실습 자료를 올리고, 수강생이 만든 결과물이 쇼케이스에 자동으로 올라가는 구조. 홈페이지도 그에 맞게 완전히 다시 만들어야 했다.

### 왜 바이브코딩으로 접근했는지

디자인 시스템부터 DB 설계, API, 프론트엔드까지 혼자 다 하는 건 현실적으로 몇 주짜리 작업이다. 그런데 바이브코딩이라는 방법이 있다. AI한테 의도를 설명하고, 코드를 생성하게 하고, 결과를 확인하면서 방향을 잡는 방식.

핵심은 Phase를 나누는 거였다. 한 번에 "다 만들어줘"라고 하면 방향이 흔들린다. 그 대신 이렇게 끊었다.

1. 디자인 시스템을 먼저 확립한다
2. 그 위에 홈페이지를 올린다
3. 블로그, 튜토리얼, 쇼케이스를 하나씩 붙인다
4. DB 연동해서 실제 데이터를 보여준다
5. 다크모드로 마무리한다

각 Phase가 끝날 때마다 결과를 확인하고, 다음 Phase에 피드백을 반영하는 식이다. 이게 바이브코딩에서 가장 중요한 부분이라고 생각한다. AI가 문맥을 잃지 않는 범위 안에서 작업을 쪼개는 것.

---

## "손으로 그린 기술" -- 디자인 시스템 이야기

리뉴얼의 출발점은 디자인이었다. 개발 교육 플랫폼이니까, "강의 노트에 형광펜으로 밑줄 치고, 빨간펜으로 중요한 부분을 표시한" 그런 느낌을 주고 싶었다. 이 컨셉을 코드로 정의하는 게 Phase 1이었다.

폰트는 Pretendard(본문), Gaegu(손글씨 강조), Geist Mono(코드). 브랜드 컬러는 잉크 블랙, 형광 노랑, 빨간펜, 크림색 종이.

그리고 이 컨셉을 CSS 유틸리티 클래스로 만들었다.

```css
/* 형광펜 밑줄 */
.highlight {
  background: linear-gradient(
    to bottom, transparent 55%,
    var(--highlighter-yellow) 55%,
    var(--highlighter-yellow) 90%,
    transparent 90%
  );
  display: inline;
  padding: 0 4px;
}

/* 손그림 테두리 */
.hand-drawn-border {
  border: 2px solid var(--ink-black);
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
}

/* 줄노트 배경 */
.notebook-bg {
  background-image: repeating-linear-gradient(
    transparent, transparent 31px,
    var(--sketch-gray) 31px, var(--sketch-gray) 32px
  );
}
```

`.hand-drawn-border`의 `border-radius` 값이 핵심이다. `255px 15px 225px 15px / 15px 225px 15px 255px` -- 이 비대칭 값이 사람이 자로 대지 않고 손으로 그린 듯한 불규칙한 테두리를 만든다. CSS만으로 이런 질감을 낼 수 있다는 게 재밌었다.

이 유틸리티 클래스들이 나머지 모든 Phase의 기반이 됐다. 디자인 시스템을 코드로 먼저 정의해두니까, 이후에 Claude가 컴포넌트를 만들 때마다 `.highlight`를 쓸 곳에는 형광펜을, `.hand-drawn-border`를 쓸 곳에는 손그림 테두리를 일관되게 적용했다. 말로 "이런 디자인으로 해줘"라고 하는 것과, 코드로 정의해서 "이 클래스를 써"라고 하는 건 결과물이 완전히 다르다.

---

## 콘텐츠가 살아 움직이는 공간 만들기

디자인 시스템이 잡히고 나면, 그 위에 실제 기능을 올릴 차례다. "공부하는 공간"이라는 느낌을 주려면, 단순히 예쁜 홈페이지가 아니라 콘텐츠가 흐르는 구조가 필요했다. 블로그로 생각을 기록하고, 튜토리얼로 실습하고, 그 결과물이 쇼케이스로 모이는 흐름.

### 블로그: 생각을 쌓는 곳

블로그는 Tiptap 에디터 기반이다. `blog_posts`, `blog_tags`, `blog_post_tags` 테이블을 Supabase에 만들고, RLS(Row Level Security)로 공개 글은 누구나, 작성/수정은 관리자만 가능하게 했다.

`content_type` 컬럼 하나를 추가해서 일반 글(`blog`)과 AI 용어사전(`glossary`)을 같은 테이블에 넣은 게 좋은 결정이었다. 나중에 용어사전 페이지를 추가할 때 별도 테이블 없이 WHERE 조건 하나만 바꾸면 됐다.

![블로그 목록 페이지](../../assets/images/posts/2026-02-21/03-blog-list.png)

### 튜토리얼: 읽고 끝이 아니라 직접 해보는 곳

튜토리얼은 가장 복잡한 부분이었다. 단순히 글을 읽는 게 아니라 "실습하고, 제출하고, 완료하면 쇼케이스에 자동 게시되는" 흐름이 필요했다. DB 테이블만 5개 -- `tutorials`, `tutorial_chapters`, `tutorial_exercises`, `tutorial_submissions`, `tutorial_progress`.

여기서 재밌는 설계가 하나 있다. 사람이 UI에서 직접 실습하는 것 말고, AI 에이전트가 API로 튜토리얼을 수행하는 것도 지원한다. Agent API는 Bearer token 인증 방식이다.

```typescript
async function authenticateAgent(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.slice(7);
  const admin = createAdminClient();
  const { data } = await admin
    .from("user_tokens")
    .select("user_id, expires_at")
    .eq("token", token)
    .single();

  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  return data.user_id;
}
```

`createAdminClient()`는 Supabase의 서비스 롤 키를 사용해서 RLS를 우회하는 클라이언트다. 토큰 테이블은 관리자만 접근할 수 있어야 하니까 Admin 클라이언트로 조회한다. 토큰이 유효하고 만료되지 않았으면 `user_id`를 반환하는 단순한 구조인데, 이 패턴이 `/api/agent/progress`, `/api/agent/upload` 같은 모든 Agent API 엔드포인트에서 재사용된다.

![튜토리얼 페이지](../../assets/images/posts/2026-02-21/05-tutorials.png)

### 쇼케이스: 완료하면 자동으로 올라가는 결과물

쇼케이스의 핵심은 "자동 생성"이다. 수강생이 튜토리얼의 모든 챕터를 완료하면, 제출했던 스크린샷과 코드를 모아서 쇼케이스가 자동으로 만들어진다.

```typescript
async function checkAndCreateShowcase(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  tutorialId: string
) {
  const { count: total } = await admin
    .from("tutorial_chapters")
    .select("*", { count: "exact", head: true })
    .eq("tutorial_id", tutorialId);

  const { data: chapters } = await admin
    .from("tutorial_chapters")
    .select("id")
    .eq("tutorial_id", tutorialId);

  if (!chapters || !total) return;

  const chapterIds = chapters.map((c) => c.id);
  const { count: completed } = await admin
    .from("tutorial_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("chapter_id", chapterIds);

  if (!completed || completed < total) return;

  // 실습 스크린샷, 코드 수집
  const { data: submissions } = await admin
    .from("tutorial_submissions")
    .select("screenshot_urls, code_snippet")
    .eq("user_id", userId)
    .eq("status", "completed");

  const title = `${userName}님의 ${tutorialTitle} 완료`;

  await admin.from("showcases").upsert({
    user_id: userId,
    tutorial_id: tutorialId,
    title,
    screenshot_urls: screenshots,
    code_snippets: codeSnippets,
    completed_at: new Date().toISOString(),
  });
}
```

로직을 풀어보면 이렇다. 먼저 해당 튜토리얼의 전체 챕터 수를 센다. 그 다음 이 사용자가 완료한 챕터 수를 센다. 두 숫자가 같으면 -- 즉 전부 완료했으면 -- 제출물에서 스크린샷과 코드를 모아서 쇼케이스를 생성한다. `upsert`를 써서 이미 쇼케이스가 있으면 업데이트하고, 없으면 새로 만든다. 덕분에 같은 함수가 여러 번 호출돼도 중복 생성 걱정이 없다.

이 함수는 챕터 완료 API에서 호출되는데, 실패하면 다음 요청에서 다시 시도하는 구조다. 마지막 챕터를 완료하는 요청 안에서 쇼케이스까지 한 번에 만들면 트랜잭션이 너무 길어지니까, 완료 처리와 쇼케이스 생성을 분리하되 멱등성을 보장하는 방식을 택했다.

---

## 칠판과 분필 -- 다크모드 이야기

라이트 모드가 "강의 노트"라면, 다크 모드는 "칠판"이다. 단순히 배경을 어둡게 하는 게 아니라, 녹색 칠판에 분필로 쓴 느낌을 주고 싶었다.

```css
.dark {
  --ink-black: #e4ddd0;       /* 분필 텍스트 */
  --highlighter-yellow: #d4c44a;
  --red-pencil: #e8654a;
  --paper-white: #2d3a2d;     /* 칠판 녹색 */
  --cream: #344032;
  --background: #2d3a2d;
  --foreground: #e4ddd0;
}
```

`--paper-white`가 `#2d3a2d`(칠판 녹색)으로 바뀌고, `--ink-black`이 `#e4ddd0`(분필색)으로 바뀐다. 변수 이름은 그대로인데 값이 반전되는 구조다. 이렇게 하면 라이트 모드에서 `var(--paper-white)`를 배경으로 쓰던 컴포넌트가, 다크 모드에서는 자동으로 칠판 녹색 배경이 된다. 컴포넌트 코드를 하나도 안 고치고 테마만 바꿀 수 있다.

`next-themes` 라이브러리로 테마 전환을 구현했다. 헤더에 토글 버튼 하나. 그리고 `.highlight`, `.hand-drawn-border` 같은 유틸리티 클래스들도 다크 모드에서 자연스럽게 보이도록 색상 값을 조정했다. 형광 노랑은 좀 더 차분한 톤으로, 빨간펜은 좀 더 따뜻한 톤으로.

![홈페이지 라이트 모드](../../assets/images/posts/2026-02-21/01-home-light.png)

![홈페이지 다크 모드 (칠판 테마)](../../assets/images/posts/2026-02-21/02-home-dark.png)

같은 페이지다. 형광펜 밑줄, 손그림 테두리, 줄노트 배경 -- 전부 CSS 변수 값만 바뀌면서 "노트"에서 "칠판"으로 분위기가 전환된다.

---

## 삽질 기록

### 블로그 태그 필터 + 페이지네이션, 그 고전적인 실수

처음에 블로그 목록을 이렇게 만들었다. Supabase에서 글을 전부 가져온다. JavaScript로 태그 필터링을 한다. 그 결과에서 페이지네이션을 적용한다.

문제는 페이지네이션의 "전체 개수"가 필터링 전 기준이라는 거다. 예를 들어 전체 글이 50개이고 "Next.js" 태그를 필터링하면 8개인데, 페이지네이션은 50개 기준으로 5페이지를 보여준다. 2페이지를 누르면 텅 빈 화면.

해결은 간단하다. 필터링을 JS가 아니라 DB에서 한다. WHERE 절에 태그 조건을 넣고, COUNT도 같은 조건으로 가져온다. 자명한 건데, 빠르게 만들다 보면 이런 걸 놓친다.

### RLS 정책 -- "데이터가 왜 안 보이지?"

Supabase에서 테이블을 만들면 기본적으로 RLS가 켜진다. 정책을 안 만들면 아무 데이터도 안 보인다. 관리자 전용 기능(exercise 관리, submission 조회 등)에서 `createClient()`(RLS 적용)를 쓰면 정책에 따라 데이터가 안 나오는 경우가 많다.

패턴을 하나 정했다. 공개 데이터는 `createClient()`로, 관리자 기능은 `createAdminClient()`(서비스 롤 키, RLS 우회)로. 그리고 이 패턴을 프로젝트 메모리 파일(`MEMORY.md`)에 적어뒀다.

```typescript
// MEMORY.md에 정리해둔 Admin API 패턴
// check session user -> verify is_admin -> use admin client
async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return data?.is_admin ? user : null;
}
```

이렇게 메모리에 적어두니까, Claude가 새 API 라우트를 만들 때마다 이 패턴을 자동으로 따랐다. "관리자 전용 API 만들어줘"라고만 해도 `checkAdmin()` 호출부터 시작하는 코드가 나온다. 바이브코딩에서 이런 컨벤션 문서화가 은근히 중요하다.

### 자동 쇼케이스 생성 타이밍

마지막 챕터를 완료하는 API 요청 안에서 바로 쇼케이스를 만들면, 전체 챕터 수 조회 -> 완료 수 비교 -> 제출물 수집 -> 쇼케이스 생성까지 하나의 요청에서 다 처리해야 한다. 트랜잭션이 길어지면 타임아웃 위험이 있다.

그래서 `upsert`로 멱등성을 보장하는 방식을 택했다. 완료 처리 후에 쇼케이스 생성을 시도하되, 실패하면 다음 요청에서 다시 시도해도 똑같은 결과가 나온다. 쇼케이스가 이미 있으면 업데이트, 없으면 생성. 이 방식이면 중간에 실패해도 데이터가 꼬이지 않는다.

### Tiptap 에디터 이미지 업로드

Tiptap의 기본 이미지 노드는 URL만 받는다. Supabase Storage에 직접 올리려면 커스텀 처리가 필요하다. `onDrop`과 `onPaste` 이벤트에서 파일을 받아서 Storage에 업로드한 뒤, 반환된 URL을 에디터에 삽입하는 방식으로 해결했다. 이미지를 드래그 앤 드롭하거나 클립보드에서 붙여넣기하면 자동으로 업로드되니까, 글 쓸 때 흐름이 끊기지 않는다.

---

## 바이브코딩에서 배운 것

이번 작업을 하면서 느낀, 바이브코딩을 잘 하기 위한 몇 가지.

**디자인 시스템을 코드로 먼저 정의하라.** "이런 느낌으로 해줘"라고 말로 하면 매번 다른 결과가 나온다. 그런데 `.highlight`, `.hand-drawn-border` 같은 유틸리티 클래스를 미리 만들어놓고 "이 클래스를 써"라고 하면, 컴포넌트가 10개든 20개든 일관성이 유지된다.

**Phase를 나눠서 작업하라.** 한 번에 "풀스택 플랫폼 만들어줘"라고 하면 높은 확률로 중간에 방향이 틀어진다. 디자인 시스템 -> 홈페이지 -> 블로그 -> 튜토리얼 -> DB 연동 -> 다크모드, 이렇게 나눠서 각 단계를 확인하면서 넘어가는 게 훨씬 안정적이다.

**컨벤션을 문서화하라.** `MEMORY.md`에 "Supabase 클라이언트는 이렇게 쓴다", "Admin API는 이 패턴을 따른다"를 적어두면, 세션이 바뀌어도 일관된 코드가 나온다. AI한테 매번 같은 설명을 반복하지 않아도 된다.

**DB 설계를 프롬프트에 포함하라.** "블로그 기능 만들어줘" 대신 "blog_posts, blog_tags 테이블로 블로그 만들어줘"라고 테이블 이름까지 지정하면 나중에 타입 충돌이 없다.

---

## 결과물

![강의 목록 페이지](../../assets/images/posts/2026-02-21/06-courses.png)

![기업교육 페이지](../../assets/images/posts/2026-02-21/08-enterprise.png)

강의 목록과 기업교육 페이지도 같은 디자인 시스템 위에 올라가 있다. 형광펜, 손글씨 폰트, 줄노트 배경 -- 어느 페이지를 가도 "허세임"이라는 브랜드가 느껴지는 게 목표였다.

![관리자 대시보드](../../assets/images/posts/2026-02-21/10-admin-dashboard.png)

![관리자 블로그 관리](../../assets/images/posts/2026-02-21/11-admin-blog.png)

관리자 대시보드에서 블로그 글, 튜토리얼, 강의, 수강생 제출물을 모두 관리할 수 있다. Tiptap 에디터로 바로 작성할 수 있어서 별도 CMS 없이도 운영이 된다.

---

## 다음 단계

리뉴얼은 끝났지만, "공부하는 공간"은 아직 시작이다. 앞으로 하고 싶은 것들:

- **튜토리얼 콘텐츠 확대**: 지금은 구조만 만들어둔 상태다. 실제 튜토리얼을 채워 넣어야 쇼케이스 자동 생성이 의미가 있다
- **커뮤니티 기능**: 수강생끼리 질문하고 답변하는 공간. 이미 보드 기능(Padlet 스타일)을 코스별로 만들어뒀는데, 이걸 더 확장할 계획이다
- **AI 튜터 연동**: Agent API 인프라가 있으니까, 튜토리얼 진행 중에 AI가 힌트를 주거나 코드 리뷰를 해주는 기능을 붙일 수 있다
- **성능 최적화**: 이미지 최적화, ISR(Incremental Static Regeneration) 적용 등. 콘텐츠가 쌓이면 빌드 시간과 로딩 속도가 이슈가 될 거다

바이브코딩으로 플랫폼 하나를 통째로 갈아엎을 수 있다는 걸 직접 해보면서 확인했다. 물론 AI가 다 해주는 건 아니다. "왜 이걸 만드는지", "사용자에게 어떤 느낌을 주고 싶은지"는 결국 사람이 정해야 한다. 그 방향만 명확하면, 실행 속도는 바이브코딩이 확실히 빠르다.

## 링크

- **서비스**: [huhsame.com](https://huhsame.com)
- **기술 스택**: Next.js 16 App Router, React 19, Supabase, Tailwind CSS 4, Tiptap, next-themes, Gemini API
