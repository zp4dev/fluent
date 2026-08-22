import type { Dictionary } from "./types";

const en: Dictionary = {
  meta: {
    homeTitle: "Fluent",
    homeDescription: "Turn any YouTube video into an English lesson",
    upgradeTitle: "Upgrade to Pro — Fluent",
    upgradeDescription:
      "Upgrade to Fluent Pro to unlock extended meanings, collocations and word families for every word.",
    notebookTitle: "Notebook — Fluent",
    notebookDescription:
      "Keep the words that matter from your lessons and review them any time.",
  },

  common: {
    back: "Back",
    showMore: "Show more",
    showLess: "Show less",
    gotIt: "Got it",
    later: "Maybe later",
    loading: "Loading...",
    copy: "Copy",
    copied: "Copied!",
    copiedCheck: "Copied ✓",
    copyValue: "Copy {value}",
    copyHint: "Click to copy",
  },

  language: {
    label: "Language",
    switcherAria: "Choose a language",
    menuAria: "Language list",
  },

  theme: {
    toLight: "Switch to light mode",
    toDark: "Switch to dark mode",
    light: "Light mode",
    dark: "Dark mode",
  },

  maintenance: {
    title: "Fluent is being upgraded 🚧",
    body: "Lesson generation is paused for an update. Please check back in a few minutes!",
  },

  generator: {
    tagline: "Turn any YouTube video into an English lesson",
    devBadge: "🛠️ Dev mode — sample data",
    urlLabel: "YouTube link",
    urlPlaceholder: "Paste a YouTube link here...",
    submit: "Start",
    submitting: "Building your lesson...",
    submitPaused: "Paused",
    hint: "Works best with videos that have English subtitles.",
    hintPaused:
      "Lesson generation is paused for an upgrade. Please check back in a few minutes!",
    proBadge: "☕ Pro",
    trialBadge: "🎁 Trial: {days} days left",
    remaining: "{remaining}/{limit} lessons left today",
    restoreIntro:
      "Enter the email you paid with. We'll send a verification code to make sure it's you.",
    restoreSubmit: "Unlock Pro",
    buyPro: "☕ Get Fluent Pro",
    alreadyBought: "Already bought Pro? Unlock it here",
    proDailyReached:
      "That's all the lessons for today. Come back tomorrow — we'll be ready! ☕",
    freeLimitReached:
      "You've used all {limit} free lessons for today. Upgrade to Pro for room to keep going, plus extended meanings, collocations and word families ☕",
    upgradeCta: "Upgrade to Pro ☕",
    loadingTitle: "Building your lesson...",
    loadingHint: "This usually takes 20–40 seconds.",
  },

  saved: {
    title: "Saved lessons ({count})",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "{count} days ago",
    vocabCount: "{count} words",
    deleteAria: "Delete lesson: {title}",
    deleteTitle: "Delete lesson",
  },

  backup: {
    title: "Lesson backup",
    proTag: "✨ Pro",
    description:
      "Export every saved lesson to a JSON file, or import one on another device. Lessons live in this browser only, so clearing its data loses them.",
    exportCta: "Export JSON",
    importCta: "Import JSON",
    statusEmpty: "There are no saved lessons to export yet.",
    statusExported: "Exported {count} lessons.",
    statusImported: "Imported {count} lessons.",
    statusSkipped: "Skipped {count} already here in a newer copy.",
    statusDropped: "{count} entries in the file were unreadable and skipped.",
    statusFailed: "{count} could not be saved — this browser's storage is full.",
    errorInvalidJson: "That file could not be read — it isn't valid JSON.",
    errorNotBackup: "That isn't a LearnFluent backup file.",
    errorWrongSchema:
      "This file was exported from an older lesson format and can no longer be restored.",
    errorNoLessons: "No usable lessons were found in that file.",
    errorReadFailed: "That file could not be opened. Try choosing it again.",
    upsellTitle: "Backup is a Pro feature",
    upsellBody:
      "You're on the free plan, so exporting and importing lessons isn't available yet. Upgrade to Pro to carry your lessons to another device and keep them when you switch browsers.",
    upsellCta: "Upgrade to Pro ☕",
  },

  notebook: {
    navLabel: "Notebook",
    defaultName: "My notebook",
    pageTitle: "Your notebook",
    pageIntro:
      "The words you bookmark in a lesson are kept here. All of it lives in this browser.",
    backToLessons: "Back to lessons",
    statusFree: "{words}/{limit} words · free plan",
    statusPro: "{words} words · {notebooks} notebooks",
    emptyTitle: "No words yet",
    emptyBody:
      "Open a lesson, flip a vocabulary card, and tap the bookmark to keep a word here.",
    newNotebookCta: "New notebook",
    newNamePlaceholder: "Topic name",
    createCta: "Create",
    cancel: "Cancel",
    renameCta: "Rename",
    saveNameCta: "Save",
    deleteCta: "Delete notebook",
    deleteTitle: "Delete this notebook?",
    deleteBody: "Every word in “{name}” goes with it, and it cannot be undone.",
    deleteConfirmCta: "Delete",
    removeAria: "Remove from notebook: {word}",
    removeTitle: "Remove from notebook",
    sourceVideo: "Watch the original video",
    wordCount: "{count} words",
    pickTitle: "Save “{word}” to which notebook?",
    saveTitle: "Save to notebook",
    saveAria: "Save {word} to your notebook",
    savedTitle: "Saved — tap to remove",
    savedAria: "Remove {word} from your notebook",
    limitTitle: "Your free notebook is full",
    limitBody:
      "The free plan keeps {limit} words in a single notebook. Upgrade to Pro for unlimited words split across as many topics as you like.",
    limitCta: "Upgrade to Pro ☕",
    notebookLimitTitle: "Topic notebooks are a Pro feature",
    notebookLimitBody:
      "The free plan has one notebook. Upgrade to Pro to split your words by topic — work, travel, exams — and choose where each one goes as you save it.",
  },

  notebookBackup: {
    title: "Notebook backup",
    proTag: "✨ Pro",
    description:
      "Export every notebook to a JSON file, or import one on another device. Notebooks live in this browser only, so clearing its data loses them.",
    exportCta: "Export JSON",
    importCta: "Import JSON",
    statusEmpty: "There are no notebooks to export yet.",
    statusExported: "Exported {words} words across {notebooks} notebooks.",
    statusImported: "Imported {words} words and {notebooks} new notebooks.",
    statusSkipped: "Skipped {count} words already here.",
    statusDropped: "{count} entries in the file were unreadable and skipped.",
    errorInvalidJson: "That file could not be read — it isn't valid JSON.",
    errorNotBackup: "That isn't a LearnFluent notebook backup.",
    errorWrongSchema:
      "This file was exported from an older notebook format and can no longer be restored.",
    errorEmpty: "No usable notebooks were found in that file.",
    errorReadFailed: "That file could not be opened. Try choosing it again.",
    upsellTitle: "Notebook backup is a Pro feature",
    upsellBody:
      "You're on the free plan, so exporting and importing notebooks isn't available yet. Upgrade to Pro to carry your words to another device and keep them when you switch browsers.",
    upsellCta: "Upgrade to Pro ☕",
  },

  lesson: {
    ready: "Your lesson is ready!",
    thumbnailAlt: "Video thumbnail: {title}",
    watchOriginal: "Watch the original video",
    tabsAria: "Lesson sections",
    tabVocabulary: "Vocabulary",
    tabIdioms: "Idioms",
    tabGrammar: "Grammar",
    tabQuiz: "Quiz",
  },

  vocabulary: {
    tapToReveal: "Tap to reveal",
    proTag: "✨ Pro",
    meaningsAndExamples: "Meanings & examples",
    collocations: "Common collocations",
    wordFamily: "Word family",
    upsell:
      "Pro unlocks extended meanings, collocations and word families for {everyWord}. {cta}",
    upsellEveryWord: "every word",
    upsellCta: "Upgrade to Pro ☕",
  },

  cefr: {
    lessonLabel: "Level",
    unknown: "—",
    unknownTitle: "This lesson was saved before levels existed",
    lessonAria: "CEFR level of this lesson: {level}",
    wordAria: "CEFR level of this word: {level}",
    names: {
      A1: "Beginner",
      A2: "Elementary",
      B1: "Intermediate",
      B2: "Upper intermediate",
      C1: "Advanced",
      C2: "Proficient",
    },
  },

  idioms: {
    emptyTitle: "No idioms or slang in this lesson",
    emptyBody: "Try another video with more natural, conversational speech.",
  },

  grammar: {
    intro: "Learn how key phrases are used in real sentences.",
    sentenceLabel: "Sentence {index}",
  },

  quiz: {
    progress: "Question {current} of {total}",
    correct: "Correct! 🎉",
    incorrect: "Not quite — the right answer is highlighted above.",
    next: "Continue",
    seeResults: "See results",
    score: "You got {score}/{total} right!",
    perfect: "Outstanding — you nailed it!",
    good: "Nice work — keep it up!",
    poor: "Review the vocabulary and give it another go!",
    retry: "Try again",
  },

  speak: {
    aria: "Hear pronunciation: {text}",
    title: "Hear pronunciation",
  },

  pdf: {
    download: "Download PDF",
    comingSoonTitle: "Coming soon!",
    comingSoonBody:
      "PDF download is still being polished. Thanks for waiting — it'll be here soon!",
    upsellTitle: "PDF download is a Pro feature",
    upsellBody:
      "Upgrade to Pro to download lessons as a clean PDF — for printing, reviewing and writing practice on paper.",
    upsellCta: "Upgrade to Pro ☕",
  },

  auth: {
    emailLabel: "Your email",
    emailPlaceholder: "you@email.com",
    emailHint: "We'll send a 6-digit code to this address to confirm it's you.",
    signOut: "Sign out",
    signOutFrom: "Sign out ({email})",
    sendCode: "Send verification code",
    sending: "Sending...",
    verify: "Verify",
    verifying: "Checking...",
    codeLabel: "Verification code",
    codePlaceholder: "000000",
    codeSentTo: "We sent a 6-digit code to {email}. It's valid for 10 minutes.",
    changeEmail: "Change email or resend the code",
    invalidEmail: "That email doesn't look right. Could you check it?",
    sendFailed: "Couldn't send the code. Please try again shortly.",
    sendFailedNetwork:
      "Couldn't send the code. Check your connection and try again.",
    codeSentDefault: "Verification code sent.",
    enterCode: "Please enter the code from the email.",
    wrongCode: "That code isn't right. Please try again.",
    verifyFailedNetwork:
      "Couldn't verify. Check your connection and try again.",
    codeSentGeneric:
      "If that email is valid, a verification code is on its way. Please check your inbox.",
    tooManyCodeRequests:
      "You've requested too many codes. Please try again in an hour.",
    cannotSendNow: "Couldn't send the code right now. Please try again later.",
    tooManyAttempts: "Too many attempts. Please try again in an hour.",
    missingEmailOrCode: "Please enter both your email and the verification code.",
    codeExpired: "That code has expired or is no longer usable. Request a new one.",
    wrongCodeAttempts: "That code isn't right. You have {attempts} attempts left.",
    cannotSignIn: "Couldn't sign you in right now. Please try again later.",
  },

  checkout: {
    title: "Upgrade to Fluent Pro",
    subtitle:
      "Unlock extended meanings, collocations and word families for every word in every lesson.",
    planGroupAria: "Choose a Pro plan",
    scanTitle: "Scan the code to pay",
    scanBody: "Open your banking app, choose scan QR, and scan the code below.",
    qrAlt: "VietQR code for the {plan} plan — {price}",
    accountPending: "Coming soon",
    transferNote:
      "Transfer exactly {amount} and put {yourEmail} in the transfer message so we can match it up.",
    transferNoteYourEmail: "your email",
    verifiedEmailLabel: "Verified email",
    verifyEmailSubmit: "Verify email",
    transferContentLabel: "Transfer message",
    transferContentEmpty: "— verify your email above —",
    copyTransferContent: "Copy transfer message",
    confirm: "I've made the transfer",
    confirming: "Recording...",
    manualNote:
      "Transfers are checked by hand, so Pro isn't activated instantly — usually within a few hours.",
    errorVerifyFirst: "Please verify your email first.",
    errorNotRecorded: "Couldn't record your request.",
    errorNotRecordedRetry: "Couldn't record your request. Please try again.",
    thanksTitle: "Thank you so much!",
    thanksBody:
      "Pro will be activated within a few hours of the payment being confirmed. You'll get a confirmation email at {email}.",
    planRow: "Plan",
    amountRow: "Amount",
    thanksFooter:
      "If nothing has arrived after 24 hours, message us with this email address and we'll look into it.",
    backHome: "Back to home",
  },

  plans: {
    annualName: "Pro — 1 year",
    annualPeriod: "/year",
    annualPerMonth: "≈ {amount} per month",
    annualBadge: "Save ~33%",
    monthlyName: "Pro — 1 month",
    monthlyPeriod: "/month",
    trialName: "Trial",
  },

  admin: {
    title: "Admin",
    subtitle: "Sign in with an admin address to continue.",
    signInSubmit: "Enter admin",
    notAdmin: "That address is not an admin account.",
    signedInAs: "Signed in as",
    pendingTitle: "Pending orders ({count})",
    pendingEmpty: "Nothing pending. 🎉",
    colEmail: "Email",
    colPlan: "Plan",
    colAmount: "Amount",
    colCreated: "Created",
    activate: "Activate Pro",
    activating: "Activating...",
    activateConfirm:
      "Confirm the transfer from {email} arrived and activate Pro?",
    activated: "Activated Pro for {email} until {expiresAt}.",
    activateFailed: "Activation failed.",
    refresh: "Refresh",
    backToApp: "Back to the app",
    usersTitle: "Pro users ({count})",
    usersEmpty: "No Pro users yet.",
    colStatus: "Status",
    colLessons: "Lessons",
    colRemaining: "Remaining",
    colLastLogin: "Last login",
    statusActive: "Active",
    statusExpired: "Expired",
    statusRevoked: "Revoked",
    daysLeft: "{days} days",
    neverLoggedIn: "Never",
    revoke: "Revoke Pro",
    revoking: "Revoking...",
    revokeConfirm:
      "Revoke Pro for {email} now? They lose access immediately.",
    revoked: "Revoked Pro for {email}.",
    revokeFailed: "Revoke failed.",
    createTitle: "Create a Pro user",
    createHint:
      "Grants Pro directly, with no verification code sent. Check the address carefully — a typo grants Pro to whoever owns it.",
    createEmailLabel: "User email",
    createPlanLabel: "Plan",
    createSubmit: "Grant Pro",
    creating: "Granting...",
    createConfirm: "Grant {plan} to {email}? No email confirmation is sent.",
    created: "Granted Pro to {email} until {expiresAt}.",
    createFailed: "Could not grant Pro.",
    createTrialTitle: "Create a trial user",
    createTrialHint:
      "Grants a time-limited trial, with no verification code sent. Check the address carefully — a typo grants it to whoever owns it.",
    createTrialDurationLabel: "Trial length",
    createTrialSubmit: "Grant trial",
    createTrialConfirm:
      "Grant a {days}-day trial to {email}? No email confirmation is sent.",
    createdTrial: "Granted a {days}-day trial to {email}, until {expiresAt}.",
    trackedSince:
      "Lesson counts and login IPs are only recorded from the moment this feature shipped — existing users read 0 until they next use the app.",
  },

  adminDev: {
    title: "Dev console",
    subtitle:
      "Runs the pipeline and prints each stage raw, with nothing reinterpreted.",
    costWarning:
      "Each run is one real Supadata call and one real AI call — both billed.",
    urlLabel: "YouTube link",
    run: "Run",
    running: "Running...",
    skipAi: "Skip the AI stage (transcript only)",
    includeDepth: "Use the Pro prompt (with extended meanings)",
    localeLabel: "Lesson language",
    stageSupadata: "1 — Supadata (raw)",
    stageTranscript: "Transcript fed to the AI",
    transcriptSource: "Source",
    sourceSupadata: "Supadata",
    sourceFallback: "Fallback chain (Supadata unavailable)",
    sourceNone: "None retrieved",
    transcriptChars: "Length",
    stageAi: "2 — AI (raw)",
    videoId: "Video ID",
    endpoint: "Endpoint",
    provider: "Provider",
    model: "Model",
    status: "HTTP status",
    stopReason: "Stop reason",
    usage: "Usage",
    rawBody: "Raw body",
    rawOutput: "Raw output",
    systemPrompt: "System prompt",
    parseOk: "JSON parsed into a valid lesson ✓",
    parseFailed: "JSON did NOT parse:",
    notConfigured: "Not configured:",
    skipped: "Skipped:",
    requestFailed: "The call failed:",
    runFailed: "The run failed.",
  },

  email: {
    subject: "{code} is your Fluent login code",
    heading: "Your Fluent login code",
    intro: "Enter the code below to unlock your account:",
    textIntro: "Your Fluent login code:",
    validFor: "The code is valid for {minutes} minutes.",
    ignore: "If you didn't request this code, you can ignore this email.",
  },

  orders: {
    tooManyRequests: "That's a few too many requests. Please try again shortly.",
    verifyFirst: "Please verify your email before ordering.",
    invalidPlan: "That upgrade plan isn't valid.",
  },

  api: {
    maintenance:
      "Fluent is being upgraded. Please check back in a few minutes! 🛠️",
    missingUrl: "Please enter a YouTube video link.",
    invalidUrl: "That YouTube link isn't valid.",
    rateLimited:
      "You've created too many lessons in the past hour (max 5 per hour). Please try again in a few minutes! ⏳",
    rateLimitedShort:
      "You've created too many lessons in the past hour. Please try again in a few minutes! ⏳",
    proDailyLimit:
      "That's all the lessons for today. Come back tomorrow — we'll be ready! ☕",
    generateFailed:
      "Something went wrong while building the lesson. Please try again.",
    generateFailedShort: "Couldn't build the lesson.",
    lessonTooLong: "This lesson ran too long. Please try a shorter video.",
    badLessonShape: "Claude returned an incomplete lesson structure.",
    badExampleCount: "Claude returned the wrong number of example sentences.",
    badQuiz: "Claude returned invalid quiz questions.",
    refusedContent:
      "A lesson can't be built from this video's content. Please try another one.",
    noTextContent: "Claude returned no text content.",
    noSubtitles: "This video has no English subtitles.",
    emptySubtitles: "This video's subtitles are empty.",
    noTranscriptMethod: "No transcript method is configured.",
    transcriptFailed: "Couldn't fetch the subtitles for this video.",
    vercelBlocked:
      "YouTube blocks Vercel's servers, so the subtitles couldn't be fetched directly.",
    deploymentHint:
      " Add SUPADATA_API_KEY (100 free requests/month at supadata.ai) or TRANSCRIPT_PROXY_URL to your Vercel environment variables.",
  },
};

export default en;
