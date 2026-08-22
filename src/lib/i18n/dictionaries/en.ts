import type { Dictionary } from "./types";

const en: Dictionary = {
  meta: {
    homeTitle: "Fluent",
    homeDescription: "Turn any YouTube video into an English lesson",
    upgradeTitle: "Upgrade to Pro — Fluent",
    upgradeDescription:
      "Upgrade to Fluent Pro to unlock extended meanings, collocations and word families for every word.",
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
  },

  admin: {
    title: "Admin",
    subtitle: "Sign in with an admin address to continue.",
    signInSubmit: "Enter admin",
    notAdmin: "That address is not an admin account.",
    signedInAs: "Signed in as",
    signOut: "Sign out",
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
    trackedSince:
      "Lesson counts and login IPs are only recorded from the moment this feature shipped — existing users read 0 until they next use the app.",
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
