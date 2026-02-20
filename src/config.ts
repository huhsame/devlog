export const SITE = {
  website: "https://huhsame.github.io/devlog/",
  author: "huhsame",
  profile: "https://github.com/huhsame",
  desc: "Claude Code와 함께하는 개발 기록. 바이브코딩, AI 자동화, 맥북 홈서버 등.",
  title: "huhsame devlog",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/huhsame/devlog/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "ko",
  timezone: "Asia/Seoul",
} as const;
