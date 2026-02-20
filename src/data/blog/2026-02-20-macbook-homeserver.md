---
author: huhsame
pubDatetime: 2026-02-20T20:00:00+09:00
title: "맥북을 항상 켜둔 홈서버로 만들기 - Cloudflare Tunnel, OpenClaw, 크론 대시보드"
featured: true
draft: false
tags:
  - 바이브코딩
  - 홈서버
  - 자동화
description: "맥북프로를 홈서버로 세팅하고, 외부 접속부터 크론 대시보드까지 한 방에 구축한 기록"
---

## TL;DR
- 맥북프로를 잠자기 방지 설정하고 Cloudflare Tunnel로 외부에서 SSH 접속 가능하게 만들었다
- OpenClaw(Claude Code용 텔레그램 봇)을 설치해서 아이폰에서도 Claude Code를 쓸 수 있게 했다
- crontab에 등록된 자동화 작업들을 한눈에 보는 크론 대시보드를 만들었다

## 배경

맥북프로를 항상 켜둔 서버로 쓰고 있는데, 이동이 잦아서 와이파이가 자주 바뀌는 환경이다. 고정 IP가 없으니까 외부에서 접속하려면 뭔가 터널링이 필요했다. 그리고 Claude Code를 맥북 터미널에서만 쓸 수 있는 게 불편해서, 아이폰에서도 텔레그램으로 Claude Code를 조작하고 싶었다.

## 과정

### 1단계: 맥북 잠자기 방지 + Cloudflare Tunnel 설정

**프롬프트**:
> 나 맥북프로를 홈서버로 쓸거야. 아래 작업들을 순서대로 해줘.
> [현재 상태] macOS, 잠자기 방지 설정 완료, pmset sleep 0, disablesleep 1...
> Cloudflare Tunnel로 SSH 접속 열어줘.

**왜 이렇게 프롬프트를 짰나**:
현재 상태를 먼저 알려주고, 구체적으로 "Cloudflare Tunnel"이라고 기술 스택을 지정했다. 이렇게 하면 Claude가 다른 대안(ngrok, Tailscale 등)을 추천하느라 시간 낭비하지 않는다.

**Claude가 한 일**:
- `cloudflared` 설치 및 터널 생성
- `~/.cloudflared/config.yml` 작성 (SSH 서비스 매핑)
- DNS 라우팅 설정 (`mbp.huhsame.com` → SSH)
- LaunchAgent로 자동 시작 등록

**결과**:
- 어디서든 `ssh mbp.huhsame.com`으로 맥북 접속 가능
- 와이파이가 바뀌어도 Cloudflare Tunnel이 자동 재연결

### 2단계: OpenClaw 설치 (텔레그램에서 Claude Code)

**프롬프트**:
> OpenClaw 설치해서 텔레그램 봇으로 Claude Code 연결해줘.

**Claude가 한 일**:
- OpenClaw 설치 및 설정 (`~/.openclaw/openclaw.json`)
- Cloudflare Tunnel에 OpenClaw 게이트웨이 추가 (`openclaw.huhsame.com`)
- 텔레그램 봇 연결 (@HuhsameClawBot)

**삽질 & 해결**:
- **문제**: Node 22에서 텔레그램 API 호출 시 `EHOSTUNREACH` 에러
- **원인**: Node 22가 IPv6를 우선 시도하는데, 텔레그램 서버가 IPv6를 제대로 응답 안 함
- **해결**: OpenClaw 설정에서 `autoSelectFamily: false` 추가 + `NODE_OPTIONS="--dns-result-order=ipv4first"`를 `.zshrc`에 설정
- **프롬프트 팁**: 네트워크 에러가 나면 "IPv6 문제일 수 있다"고 Claude에게 힌트를 주면 훨씬 빠르게 해결된다

### 3단계: 크론 대시보드 구축

**프롬프트**:
> 크론 대시보드 프로젝트 전달 사항
> 목적: 맥에 설정된 crontab 크론 작업을 웹 브라우저에서 조회할 수 있는 로컬 대시보드.
> 요구사항: 조회 전용, Flask 단일 파일, 다크 테마...

**왜 이렇게 프롬프트를 짰나**:
"전달 사항" 형식으로 목적, 요구사항, 기술 스택을 구조화해서 적었다. 이렇게 브리핑 문서 형태로 주면 Claude가 정확하게 원하는 걸 만들어준다.

**Claude가 한 일**:
- Flask 단일 파일 앱 (`app.py` 약 450줄)
- crontab 파싱 + 다음 실행 시간 계산 (croniter)
- 로그 파일 뷰어
- Threads 포스팅 큐/히스토리 표시
- Playwright MCP(브라우저 자동화 도구)로 직접 결과물 확인

**결과**:

![크론 대시보드 실행 화면](../../assets/images/posts/2026-02-20/cron-dashboard.png)

크론 작업 3개가 한눈에 보인다. 아침/점심/저녁 Threads 자동 포스팅 스케줄이 잘 등록되어 있다.

## 프롬프트 회고

**잘 먹힌 프롬프트 패턴**:
- "전달 사항" 형식의 구조화된 브리핑 → 한 번에 원하는 결과물이 나옴
- 현재 상태를 먼저 알려주기 → Claude가 불필요한 확인 질문을 안 함
- 기술 스택 직접 지정 → 대안 추천 없이 바로 구현

**아쉬웠던 점**:
- OpenClaw IPv6 문제를 미리 프롬프트에 언급했으면 삽질 안 했을 것. "Node 22 환경이고 IPv6 이슈가 있을 수 있다" 한 줄이면 충분했다

## 배운 것
- Cloudflare Tunnel은 고정 IP 없이도 외부 접속을 가능하게 해주는 무료 서비스. 개인 홈서버에 딱이다
- Node 22부터 IPv6 우선 정책이 바뀌어서 네트워크 에러가 날 수 있다. `autoSelectFamily` 옵션으로 해결
- LaunchAgent로 맥 부팅 시 자동 시작 등록하면 서버처럼 운영 가능

## 사용한 Claude Code 기능

| 기능 | 설명 | 어떻게 썼나 |
|------|------|-------------|
| MCP (Playwright) | 외부 도구 연결 - 브라우저를 코드로 조작 | 크론 대시보드 완성 후 브라우저로 직접 접속해서 확인 |
| TodoWrite | 작업 목록 관리. 진행 상황 추적 | 홈서버 세팅 단계를 투두로 나눠서 하나씩 체크 |
| 웹 검색 | 실시간 웹 검색 | Cloudflare Tunnel 최신 설정법, Tailscale 비교 조사 |

## 도구 사용 통계
| 도구 | 횟수 | 용도 |
|------|------|------|
| Bash | 111 | 서버 설정, 패키지 설치, 서비스 관리 |
| Read | 7 | 설정 파일 확인 |
| Write | 4 | 설정 파일, 대시보드 앱 생성 |
| Edit | 4 | 설정 수정 |
| WebSearch | 4 | Cloudflare, Tailscale 문서 조회 |

## 링크
- **GitHub**: [cron-dashboard](https://github.com/huhsame/cron-dashboard)
- **참고**: [Cloudflare Tunnel 문서](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/), [OpenClaw](https://github.com/openclaw/openclaw)
