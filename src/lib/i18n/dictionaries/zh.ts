import type { Dictionary } from "./types";

const zh: Dictionary = {
  meta: {
    homeTitle: "Fluent",
    homeDescription: "把任何 YouTube 视频变成一堂英语课",
    upgradeTitle: "升级 Pro — Fluent",
    upgradeDescription:
      "升级 Fluent Pro，解锁每个单词的扩展释义、常用搭配和词族。",
  },

  common: {
    back: "返回",
    showMore: "展开",
    showLess: "收起",
    gotIt: "知道了",
    later: "以后再说",
    loading: "加载中...",
    copy: "复制",
    copied: "已复制！",
    copiedCheck: "已复制 ✓",
    copyValue: "复制{value}",
    copyHint: "点击复制",
  },

  language: {
    label: "语言",
    switcherAria: "选择语言",
    menuAria: "语言列表",
  },

  theme: {
    toLight: "切换到浅色模式",
    toDark: "切换到深色模式",
    light: "浅色模式",
    dark: "深色模式",
  },

  maintenance: {
    title: "Fluent 正在升级 🚧",
    body: "我们暂停了课程生成来做更新，请过几分钟再回来看看！",
  },

  generator: {
    tagline: "把任何 YouTube 视频变成一堂英语课",
    devBadge: "🛠️ 开发模式 — 示例数据",
    urlLabel: "YouTube 链接",
    urlPlaceholder: "在这里粘贴 YouTube 链接...",
    submit: "开始",
    submitting: "正在生成课程...",
    submitPaused: "已暂停",
    hint: "带英文字幕的视频效果最好。",
    hintPaused: "课程生成正在升级中暂停，请过几分钟再回来！",
    proBadge: "☕ Pro",
    remaining: "今天还剩 {remaining}/{limit} 次",
    restoreIntro:
      "请输入你付款时使用的邮箱。我们会发送验证码来确认是你本人。",
    restoreSubmit: "解锁 Pro",
    buyPro: "☕ 购买 Fluent Pro",
    alreadyBought: "已购买 Pro？在这里解锁",
    proDailyReached: "今天的课程已经生成完了，明天再来吧，我们随时恭候！☕",
    freeLimitReached:
      "今天的 {limit} 次免费额度已用完。升级 Pro 可以尽情生成课程，还能获得扩展释义、常用搭配和词族 ☕",
    upgradeCta: "升级 Pro ☕",
    loadingTitle: "正在生成课程...",
    loadingHint: "通常需要 20–40 秒。",
  },

  saved: {
    title: "已保存的课程（{count}）",
    today: "今天",
    yesterday: "昨天",
    daysAgo: "{count} 天前",
    vocabCount: "{count} 个单词",
    deleteAria: "删除课程：{title}",
    deleteTitle: "删除课程",
  },

  lesson: {
    ready: "你的课程已经准备好了！",
    thumbnailAlt: "视频缩略图：{title}",
    watchOriginal: "观看原视频",
    tabsAria: "课程板块",
    tabVocabulary: "词汇",
    tabIdioms: "习语",
    tabGrammar: "语法",
    tabQuiz: "测验",
  },

  vocabulary: {
    tapToReveal: "点击查看",
    proTag: "✨ Pro",
    meaningsAndExamples: "释义与例句",
    collocations: "常用搭配",
    wordFamily: "词族",
    upsell: "Pro 版为{everyWord}解锁扩展释义、常用搭配和词族。{cta}",
    upsellEveryWord: "每一个单词",
    upsellCta: "升级 Pro ☕",
  },

  idioms: {
    emptyTitle: "本课没有出现习语或俚语",
    emptyBody: "换一个口语表达更丰富的视频试试吧。",
  },

  grammar: {
    intro: "学习关键短语在真实句子中的用法。",
    sentenceLabel: "第 {index} 句",
  },

  quiz: {
    progress: "第 {current} 题 / 共 {total} 题",
    correct: "答对了！🎉",
    incorrect: "还差一点 — 正确答案已在上方标出。",
    next: "继续",
    seeResults: "查看结果",
    score: "你答对了 {score}/{total} 题！",
    perfect: "太棒了 — 全对！",
    good: "做得不错 — 继续加油！",
    poor: "复习一下词汇再来一次吧！",
    retry: "再做一次",
  },

  speak: {
    aria: "听发音：{text}",
    title: "听发音",
  },

  pdf: {
    download: "下载 PDF",
    comingSoonTitle: "即将推出！",
    comingSoonBody: "PDF 下载功能还在打磨中。谢谢你的等待 — 很快就会上线！",
    upsellTitle: "PDF 下载是 Pro 功能",
    upsellBody:
      "升级 Pro 即可把课程下载成精美的 PDF — 方便打印、复习，以及在纸上练习写作。",
    upsellCta: "升级 Pro ☕",
  },

  auth: {
    emailLabel: "你的邮箱",
    emailPlaceholder: "you@email.com",
    emailHint: "我们会向这个邮箱发送一个 6 位数验证码，以确认是你本人。",
    sendCode: "发送验证码",
    sending: "发送中...",
    verify: "验证",
    verifying: "验证中...",
    codeLabel: "验证码",
    codePlaceholder: "000000",
    codeSentTo: "我们已向 {email} 发送了 6 位数验证码，有效期为 10 分钟。",
    changeEmail: "更换邮箱或重新发送验证码",
    invalidEmail: "这个邮箱地址似乎不正确，请检查一下。",
    sendFailed: "验证码发送失败，请稍后再试。",
    sendFailedNetwork: "验证码发送失败。请检查网络连接后重试。",
    codeSentDefault: "验证码已发送。",
    enterCode: "请输入邮件中的验证码。",
    wrongCode: "验证码不正确，请重试。",
    verifyFailedNetwork: "验证失败。请检查网络连接后重试。",
    codeSentGeneric: "如果这个邮箱有效，验证码已经发送，请查收邮件。",
    tooManyCodeRequests: "你请求验证码的次数过多，请一小时后再试。",
    cannotSendNow: "当前无法发送验证码，请稍后再试。",
    tooManyAttempts: "尝试次数过多，请一小时后再试。",
    missingEmailOrCode: "请输入邮箱和验证码。",
    codeExpired: "验证码已过期或不再有效，请重新获取。",
    wrongCodeAttempts: "验证码不正确，你还有 {attempts} 次机会。",
    cannotSignIn: "当前无法登录，请稍后再试。",
  },

  checkout: {
    title: "升级 Fluent Pro",
    subtitle: "解锁每节课中每个单词的扩展释义、常用搭配和词族。",
    planGroupAria: "选择 Pro 套餐",
    scanTitle: "扫码付款",
    scanBody: "打开你的银行 App，选择扫描二维码，然后扫描下方的二维码。",
    qrAlt: "{plan}套餐的 VietQR 二维码 — {price}",
    accountPending: "即将更新",
    transferNote: "请准确转账 {amount}，并在转账备注中填写{yourEmail}，方便我们核对。",
    transferNoteYourEmail: "你的邮箱",
    verifiedEmailLabel: "已验证邮箱",
    verifyEmailSubmit: "验证邮箱",
    transferContentLabel: "转账备注",
    transferContentEmpty: "— 请先在上方验证邮箱 —",
    copyTransferContent: "复制转账备注",
    confirm: "我已完成转账",
    confirming: "正在记录...",
    manualNote: "我们人工核对转账，因此 Pro 不会立即开通 — 通常在几小时内。",
    errorVerifyFirst: "请先验证你的邮箱。",
    errorNotRecorded: "未能记录你的请求。",
    errorNotRecordedRetry: "未能记录你的请求，请重试。",
    thanksTitle: "非常感谢你！",
    thanksBody:
      "确认收款后的几小时内，Pro 就会开通。你会在 {email} 收到确认邮件。",
    planRow: "套餐",
    amountRow: "金额",
    thanksFooter: "如果 24 小时后仍未收到，请用这个邮箱联系我们，我们会帮你查看。",
    backHome: "返回首页",
  },

  plans: {
    annualName: "Pro 年付",
    annualPeriod: "/年",
    annualPerMonth: "≈ 每月 {amount}",
    annualBadge: "省约 33%",
    monthlyName: "Pro 月付",
    monthlyPeriod: "/月",
  },

  email: {
    subject: "{code} 是你的 Fluent 登录验证码",
    heading: "你的 Fluent 登录验证码",
    intro: "请输入下面的验证码来解锁你的账户：",
    textIntro: "你的 Fluent 登录验证码：",
    validFor: "验证码有效期为 {minutes} 分钟。",
    ignore: "如果这不是你本人的操作，可以忽略这封邮件。",
  },

  orders: {
    tooManyRequests: "你的请求有点多，请过几分钟再试。",
    verifyFirst: "下单前请先验证邮箱。",
    invalidPlan: "该升级套餐无效。",
  },

  api: {
    maintenance: "Fluent 正在升级，请过几分钟再回来！🛠️",
    missingUrl: "请输入 YouTube 视频链接。",
    invalidUrl: "这个 YouTube 链接无效。",
    rateLimited: "你在过去一小时内生成的课程太多了（每小时最多 5 节）。请过几分钟再试！⏳",
    rateLimitedShort: "你在过去一小时内生成的课程太多了。请过几分钟再试！⏳",
    proDailyLimit: "今天的课程已经生成完了，明天再来吧，我们随时恭候！☕",
    generateFailed: "生成课程时出错了，请重试。",
    generateFailedShort: "无法生成课程。",
    lessonTooLong: "这节课内容过长，请换一个更短的视频试试。",
    badLessonShape: "Claude 返回的课程结构不完整。",
    badExampleCount: "Claude 返回的例句数量不正确。",
    badQuiz: "Claude 返回的测验题目无效。",
    refusedContent: "无法用这个视频的内容生成课程，请换一个视频试试。",
    noTextContent: "Claude 没有返回文本内容。",
    noSubtitles: "这个视频没有英文字幕。",
    emptySubtitles: "这个视频的字幕是空的。",
    noTranscriptMethod: "没有配置任何字幕获取方式。",
    transcriptFailed: "无法获取这个视频的字幕。",
    vercelBlocked: "YouTube 屏蔽了 Vercel 的服务器，因此无法直接获取字幕。",
    deploymentHint:
      " 请在 Vercel 环境变量中添加 SUPADATA_API_KEY（supadata.ai 每月 100 次免费额度）或 TRANSCRIPT_PROXY_URL。",
  },
};

export default zh;
