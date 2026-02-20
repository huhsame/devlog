---
author: huhsame
pubDatetime: 2026-02-20T20:00:00+09:00
title: "맥북을 홈서버로 만들기 - 아이폰에서도 Claude Code 쓰기"
featured: true
draft: false
tags:
  - 바이브코딩
  - 홈서버
description: "맥미니 없이 맥북프로 하나로 홈서버 세팅. Cloudflare Tunnel + OpenClaw로 아이폰에서도 Claude Code 사용"
---

## TL;DR
- 맥북프로를 잠자기 방지 설정하고 Cloudflare Tunnel로 외부에서 SSH 접속 가능하게 만들었다
- OpenClaw(텔레그램 봇)을 설치해서 아이폰에서도 Claude Code를 쓸 수 있게 했다
- 맥미니 같은 별도 서버 없이 맥북 하나로 다 해결

## 배경

맥북프로를 항상 켜둔 서버로 쓰고 있는데, 이동이 잦아서 와이파이가 자주 바뀌는 환경이다. 고정 IP가 없으니까 외부에서 접속하려면 터널링이 필요했다.

그리고 Claude Code를 맥북 터미널에서만 쓸 수 있는 게 불편했다. 지하철에서, 카페에서, 아이폰으로도 Claude Code에 작업을 시키고 싶었다.

## 과정

### 1단계: 맥북 잠자기 방지 + 기본 세팅

**프롬프트**:
> 나 맥북프로를 홈서버로 쓸거야. 아래 작업들을 순서대로 해줘.
> [현재 상태] macOS, 잠자기 방지 설정 완료, pmset sleep 0, disablesleep 1...

**왜 이렇게 프롬프트를 짰나**:
현재 상태를 먼저 알려줬다. 이미 된 건 건너뛰고 안 된 것만 해달라는 의미다. 이렇게 하면 Claude가 불필요한 확인 질문을 안 한다.

**Claude가 한 일**:
- 잠자기 방지 설정 확인 (`pmset` 관련)
- 자동 업데이트 비활성화 (서버니까 갑자기 재부팅되면 안 됨)
- SSH 활성화 확인

### 2단계: Cloudflare Tunnel 설정

**프롬프트**에서 "Cloudflare Tunnel"이라고 기술 스택을 직접 지정했다. 이렇게 하면 Claude가 ngrok, Tailscale 같은 다른 대안을 추천하느라 시간 낭비하지 않는다.

**Claude가 한 일**:
- `cloudflared` 설치 및 터널 생성
- `~/.cloudflared/config.yml` 작성 (SSH 서비스 매핑)
- DNS 라우팅 설정 (`mbp.huhsame.com` → SSH)
- LaunchAgent(맥 부팅 시 자동 시작)로 등록

**결과**:
- 어디서든 `ssh mbp.huhsame.com`으로 맥북 접속 가능
- 와이파이가 바뀌어도 Cloudflare Tunnel이 자동 재연결

Cloudflare Tunnel은 무료인 데다 고정 IP 없이도 외부 접속이 가능해서 개인 홈서버에 딱이다.

### 3단계: OpenClaw 설치 (아이폰에서 Claude Code)

OpenClaw은 Claude Code를 텔레그램 봇으로 연결해주는 도구다. 맥북에서 돌아가는 Claude Code에 텔레그램으로 메시지를 보내면, 그대로 실행되고 결과를 돌려준다.

**프롬프트**:
> 클라우드플레어 터널설정 내 맥북에 해두었는데, 그러면 openclaw 잘 쓸 수 있어? 조사해서 알려줘.

**Claude가 한 일**:
- OpenClaw 설치 및 설정
- Cloudflare Tunnel에 OpenClaw 게이트웨이 추가 (`openclaw.huhsame.com`)
- 텔레그램 봇 연결 (@HuhsameClawBot)
- 아이폰에서 디바이스 페어링

## 삽질 & 해결

- **문제**: Node 22에서 텔레그램 API 호출 시 `EHOSTUNREACH` 에러
- **원인**: Node 22가 IPv6를 우선 시도하는데, 텔레그램 서버가 IPv6를 제대로 응답 안 함
- **해결**: OpenClaw 설정에서 `autoSelectFamily: false` 추가 + `NODE_OPTIONS="--dns-result-order=ipv4first"`를 `.zshrc`에 설정
- **프롬프트 팁**: 네트워크 에러가 나면 "IPv6 문제일 수 있다"고 Claude에게 힌트를 주면 훨씬 빠르게 해결된다. Node 22부터 IPv6 우선 정책이 바뀌어서 이런 문제가 자주 발생한다

## 프롬프트 회고

**잘 먹힌 프롬프트 패턴**:
- 현재 상태를 먼저 알려주기 → Claude가 불필요한 확인 질문을 안 함
- 기술 스택 직접 지정 → 대안 추천 없이 바로 구현

**아쉬웠던 점**:
- OpenClaw IPv6 문제를 미리 프롬프트에 언급했으면 삽질 안 했을 것. "Node 22 환경이고 IPv6 이슈가 있을 수 있다" 한 줄이면 충분했다

## 배운 것
- Cloudflare Tunnel은 고정 IP 없이 외부 접속을 가능하게 해주는 무료 서비스. 맥미니 같은 별도 서버 없이 맥북 하나로도 홈서버 운영이 가능하다
- LaunchAgent로 맥 부팅 시 자동 시작 등록하면 서버처럼 운영 가능
- Node 22부터 IPv6 우선 정책이 바뀌어서 네트워크 에러가 날 수 있다. `autoSelectFamily` 옵션으로 해결

## 사용한 Claude Code 기능

| 기능 | 설명 | 어떻게 썼나 |
|------|------|-------------|
| TodoWrite | 작업 목록 관리 | 홈서버 세팅 단계를 투두로 나눠서 체크 |
| 웹 검색 | 실시간 웹 검색 | Cloudflare Tunnel 최신 설정법, OpenClaw 문서 조사 |

## 도구 사용 통계

**홈서버 세팅 세션** (약 130분, 프롬프트 64개):
| 도구 | 횟수 | 용도 |
|------|------|------|
| Bash | 75 | 서버 설정, 패키지 설치, 서비스 관리 |
| Read | 7 | 설정 파일 확인 |
| Write | 3 | 설정 파일 생성 |
| Edit | 4 | 설정 수정 |
| WebSearch | 4 | Cloudflare, OpenClaw 문서 조회 |

## 링크
- **참고**: [Cloudflare Tunnel 문서](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/), [OpenClaw](https://github.com/nicepkg/openclaw)
