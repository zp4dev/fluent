/**
 * Vietnamese — the default locale, and the source of truth for the SHAPE of
 * every other dictionary: `Dictionary` in ./types is `typeof vi`, so adding a
 * key here makes TypeScript demand it in en/es/zh too.
 *
 * Placeholders are written as {name} and filled by `t()` / `tRich()`. Never
 * build a sentence by concatenating fragments at the call site — word order
 * differs across these four languages, and the pieces would not reorder.
 */
const vi = {
  meta: {
    homeTitle: "Fluent",
    homeDescription: "Biến mọi video YouTube thành bài học tiếng Anh",
    upgradeTitle: "Nâng cấp Pro — Fluent",
    upgradeDescription:
      "Nâng cấp Fluent Pro để mở khóa nghĩa mở rộng, cụm từ đi kèm và họ từ vựng cho mọi từ.",
    notebookTitle: "Sổ từ — Fluent",
    notebookDescription:
      "Lưu lại những từ quan trọng bạn gặp trong bài học và ôn lại bất cứ lúc nào.",
  },

  common: {
    back: "Quay lại",
    showMore: "Xem thêm",
    showLess: "Thu gọn",
    gotIt: "Đã hiểu",
    later: "Để sau",
    loading: "Đang tải...",
    copy: "Chép",
    copied: "Đã chép!",
    copiedCheck: "Đã chép ✓",
    copyValue: "Chép {value}",
    copyHint: "Nhấn để chép",
  },

  language: {
    label: "Ngôn ngữ",
    switcherAria: "Chọn ngôn ngữ",
    menuAria: "Danh sách ngôn ngữ",
  },

  theme: {
    toLight: "Chuyển sang chế độ sáng",
    toDark: "Chuyển sang chế độ tối",
    light: "Chế độ sáng",
    dark: "Chế độ tối",
  },

  maintenance: {
    title: "Fluent đang được nâng cấp 🚧",
    body: "Mình đang tạm dừng tạo bài học để cập nhật. Quay lại sau ít phút nhé!",
  },

  generator: {
    tagline: "Biến mọi video YouTube thành bài học tiếng Anh",
    devBadge: "🛠️ Dev mode — dữ liệu mẫu",
    urlLabel: "Liên kết YouTube",
    urlPlaceholder: "Dán link YouTube vào đây...",
    submit: "Bắt đầu",
    submitting: "Đang tạo bài học...",
    submitPaused: "Tạm dừng",
    hint: "Hoạt động tốt nhất với video có phụ đề tiếng Anh.",
    hintPaused:
      "Tính năng tạo bài học đang tạm dừng để nâng cấp. Quay lại sau ít phút nhé!",
    proBadge: "☕ Pro",
    trialBadge: "🎁 Dùng thử: còn {days} ngày",
    remaining: "Còn lại: {remaining}/{limit} lượt hôm nay",
    restoreIntro:
      "Nhập email bạn đã dùng khi thanh toán. Mình gửi mã xác thực để chắc chắn đúng là bạn.",
    restoreSubmit: "Mở khóa Pro",
    buyPro: "☕ Mua Fluent Pro",
    alreadyBought: "Đã mua Pro? Mở khóa tại đây",
    proDailyReached:
      "Hôm nay bạn đã tạo đủ bài học rồi. Ngày mai quay lại tiếp nhé — mình sẽ sẵn sàng! ☕",
    freeLimitReached:
      "Hôm nay bạn đã dùng hết {limit} lượt miễn phí. Nâng cấp Pro để tạo bài học thoải mái hơn, kèm nghĩa mở rộng, cụm từ đi kèm và họ từ vựng ☕",
    upgradeCta: "Nâng cấp Pro ☕",
    loadingTitle: "Đang tạo bài học...",
    loadingHint: "Thường mất khoảng 20–40 giây.",
  },

  saved: {
    title: "Bài học đã lưu ({count})",
    today: "Hôm nay",
    yesterday: "Hôm qua",
    daysAgo: "{count} ngày trước",
    vocabCount: "{count} từ vựng",
    deleteAria: "Xoá bài học: {title}",
    deleteTitle: "Xoá bài học",
  },

  backup: {
    title: "Sao lưu bài học",
    proTag: "✨ Pro",
    description:
      "Xuất toàn bộ bài học đã lưu ra một file JSON, hoặc nhập lại trên máy khác. Bài học chỉ nằm trong trình duyệt này, nên xoá dữ liệu trình duyệt là mất.",
    exportCta: "Xuất file JSON",
    importCta: "Nhập file JSON",
    statusEmpty: "Chưa có bài học nào để xuất.",
    statusExported: "Đã xuất {count} bài học.",
    statusImported: "Đã nhập {count} bài học.",
    statusSkipped: "Bỏ qua {count} bài đã có bản mới hơn.",
    statusDropped: "{count} mục trong file bị hỏng nên đã bỏ qua.",
    statusFailed: "{count} bài chưa lưu được vì bộ nhớ trình duyệt đã đầy.",
    errorInvalidJson: "Không đọc được file — đây không phải JSON hợp lệ.",
    errorNotBackup: "Đây không phải file sao lưu của LearnFluent.",
    errorWrongSchema:
      "File này được xuất từ phiên bản bài học cũ hơn nên không dùng lại được.",
    errorNoLessons: "Không có bài học hợp lệ nào trong file.",
    errorReadFailed: "Không mở được file. Hãy thử chọn lại.",
    upsellTitle: "Sao lưu là tính năng của gói Pro",
    upsellBody:
      "Bạn đang dùng gói miễn phí nên chưa xuất hoặc nhập được bài học. Nâng cấp Pro để mang toàn bộ bài học sang máy khác và giữ lại khi đổi trình duyệt.",
    upsellCta: "Nâng cấp Pro ☕",
  },

  notebook: {
    navLabel: "Sổ từ",
    defaultName: "Sổ từ của tôi",
    pageTitle: "Sổ từ của bạn",
    pageIntro:
      "Những từ bạn đánh dấu trong bài học được giữ lại ở đây. Tất cả nằm trong trình duyệt này.",
    backToLessons: "Về trang bài học",
    statusFree: "{words}/{limit} từ · gói miễn phí",
    statusPro: "{words} từ · {notebooks} sổ",
    emptyTitle: "Chưa có từ nào",
    emptyBody:
      "Mở một bài học, lật thẻ từ vựng rồi bấm dấu trang để lưu từ vào đây.",
    newNotebookCta: "Sổ mới",
    newNamePlaceholder: "Tên chủ đề",
    createCta: "Tạo",
    cancel: "Huỷ",
    renameCta: "Đổi tên",
    saveNameCta: "Lưu",
    deleteCta: "Xoá sổ",
    deleteTitle: "Xoá sổ từ này?",
    deleteBody:
      "Toàn bộ từ trong “{name}” sẽ mất và không khôi phục lại được.",
    deleteConfirmCta: "Xoá",
    removeAria: "Bỏ từ khỏi sổ: {word}",
    removeTitle: "Bỏ khỏi sổ",
    sourceVideo: "Xem video gốc",
    wordCount: "{count} từ",
    pickTitle: "Lưu “{word}” vào sổ nào?",
    saveTitle: "Lưu vào sổ từ",
    saveAria: "Lưu {word} vào sổ từ",
    savedTitle: "Đã lưu — bấm để bỏ",
    savedAria: "Bỏ {word} khỏi sổ từ",
    limitTitle: "Sổ từ miễn phí đã đầy",
    limitBody:
      "Gói miễn phí lưu được {limit} từ trong một sổ duy nhất. Nâng cấp Pro để lưu không giới hạn và chia thành nhiều sổ theo chủ đề.",
    limitCta: "Nâng cấp Pro ☕",
    notebookLimitTitle: "Nhiều sổ theo chủ đề là tính năng Pro",
    notebookLimitBody:
      "Gói miễn phí chỉ có một sổ. Nâng cấp Pro để tách từ vựng theo chủ đề — công việc, du lịch, thi cử — và chọn sổ mỗi khi lưu.",
  },

  notebookBackup: {
    title: "Sao lưu sổ từ",
    proTag: "✨ Pro",
    description:
      "Xuất toàn bộ sổ từ ra một file JSON, hoặc nhập lại trên máy khác. Sổ từ chỉ nằm trong trình duyệt này, nên xoá dữ liệu trình duyệt là mất.",
    exportCta: "Xuất file JSON",
    importCta: "Nhập file JSON",
    statusEmpty: "Chưa có sổ từ nào để xuất.",
    statusExported: "Đã xuất {words} từ trong {notebooks} sổ.",
    statusImported: "Đã nhập {words} từ, thêm {notebooks} sổ mới.",
    statusSkipped: "Bỏ qua {count} từ đã có sẵn.",
    statusDropped: "{count} mục trong file bị hỏng nên đã bỏ qua.",
    errorInvalidJson: "Không đọc được file — đây không phải JSON hợp lệ.",
    errorNotBackup: "Đây không phải file sao lưu sổ từ của LearnFluent.",
    errorWrongSchema:
      "File này được xuất từ phiên bản sổ từ cũ hơn nên không dùng lại được.",
    errorEmpty: "Không có sổ từ hợp lệ nào trong file.",
    errorReadFailed: "Không mở được file. Hãy thử chọn lại.",
    upsellTitle: "Sao lưu sổ từ là tính năng Pro",
    upsellBody:
      "Bạn đang dùng gói miễn phí nên chưa xuất hoặc nhập được sổ từ. Nâng cấp Pro để mang sổ từ sang máy khác và giữ lại khi đổi trình duyệt.",
    upsellCta: "Nâng cấp Pro ☕",
  },

  lesson: {
    ready: "Bài học của bạn đã sẵn sàng!",
    thumbnailAlt: "Ảnh thu nhỏ của video: {title}",
    watchOriginal: "Xem video gốc",
    tabsAria: "Các phần bài học",
    tabVocabulary: "Từ vựng",
    tabIdioms: "Thành ngữ",
    tabGrammar: "Ngữ pháp",
    tabQuiz: "Kiểm tra",
  },

  vocabulary: {
    tapToReveal: "Chạm để xem",
    proTag: "✨ Pro",
    meaningsAndExamples: "Nghĩa & ví dụ",
    collocations: "Cụm từ thường gặp",
    wordFamily: "Họ từ vựng",
    upsell: "Bản Pro mở khóa nghĩa mở rộng, cụm từ đi kèm và họ từ vựng cho {everyWord}. {cta}",
    upsellEveryWord: "mọi từ",
    upsellCta: "Nâng cấp Pro ☕",
  },

  cefr: {
    lessonLabel: "Trình độ",
    unknown: "—",
    unknownTitle: "Bài học này được lưu trước khi có nhãn trình độ",
    lessonAria: "Trình độ CEFR của bài học: {level}",
    wordAria: "Trình độ CEFR của từ: {level}",
    names: {
      A1: "Mới bắt đầu",
      A2: "Sơ cấp",
      B1: "Trung cấp",
      B2: "Trung cấp trên",
      C1: "Cao cấp",
      C2: "Thành thạo",
    },
  },

  idioms: {
    emptyTitle: "Không có thành ngữ hoặc tiếng lóng trong bài này",
    emptyBody: "Hãy thử video khác có nhiều cách nói tự nhiên hơn.",
  },

  grammar: {
    intro: "Học cách dùng các cụm từ quan trọng trong câu thực tế.",
    sentenceLabel: "Câu {index}",
  },

  quiz: {
    progress: "Câu {current} / {total}",
    correct: "Chính xác! 🎉",
    incorrect: "Chưa đúng — xem đáp án đúng ở trên nhé.",
    next: "Tiếp tục",
    seeResults: "Xem kết quả",
    score: "Bạn trả lời đúng {score}/{total}!",
    perfect: "Xuất sắc — bạn làm rất tốt!",
    good: "Làm tốt lắm — tiếp tục cố gắng nhé!",
    poor: "Hãy ôn lại từ vựng và thử lại nhé!",
    retry: "Làm lại",
  },

  speak: {
    aria: "Nghe phát âm: {text}",
    title: "Nghe phát âm",
  },

  pdf: {
    download: "Tải PDF",
    downloading: "Đang tạo PDF...",
    downloadFailed: "Không tải được PDF. Bạn thử lại nhé.",
    notPro: "Tính năng này chỉ dành cho Fluent Pro.",
    limitReached:
      "Bạn đã tải PDF 3 lần trong một giờ qua. Vui lòng thử lại sau ít phút nhé! ⏳",
    limitReachedTitle: "Đã hết lượt tải PDF",
    limitReachedBody:
      "Bạn đã tải PDF 3 lần trong một giờ qua. Lượt tải sẽ có lại sau ít phút, hẹn gặp lại nhé! ⏳",
    upsellTitle: "Tải PDF là tính năng Pro",
    upsellBody:
      "Nâng cấp Pro để tải bài học dưới dạng PDF đẹp mắt — dùng để in, ôn tập và luyện viết ngay trên giấy.",
    upsellCta: "Nâng cấp Pro ☕",
  },

  auth: {
    emailLabel: "Email của bạn",
    emailPlaceholder: "ban@email.com",
    emailHint: "Mình gửi một mã 6 số tới email này để xác nhận đúng là bạn.",
    signOut: "Đăng xuất",
    signOutFrom: "Đăng xuất ({email})",
    signIn: "Đăng nhập",
    signInTitle: "Đăng nhập vào Fluent",
    signInBody:
      "Bạn nhập email, mình gửi mã 6 số để đăng nhập. Không cần mật khẩu.",
    sendCode: "Gửi mã xác thực",
    sending: "Đang gửi...",
    verify: "Xác thực",
    verifying: "Đang kiểm tra...",
    codeLabel: "Mã xác thực",
    codePlaceholder: "000000",
    codeSentTo: "Mình đã gửi mã 6 số tới {email}. Mã có hiệu lực trong 10 phút.",
    changeEmail: "Đổi email hoặc gửi lại mã",
    invalidEmail: "Email chưa hợp lệ. Bạn kiểm tra lại giúp mình nhé.",
    sendFailed: "Chưa gửi được mã. Bạn thử lại sau nhé.",
    sendFailedNetwork: "Chưa gửi được mã. Bạn kiểm tra kết nối rồi thử lại nhé.",
    codeSentDefault: "Mã xác thực đã được gửi.",
    enterCode: "Bạn nhập mã trong email giúp mình nhé.",
    wrongCode: "Mã không đúng. Bạn thử lại nhé.",
    verifyFailedNetwork:
      "Chưa xác thực được. Bạn kiểm tra kết nối rồi thử lại nhé.",
    codeSentGeneric:
      "Nếu email hợp lệ, mã xác thực đã được gửi. Bạn kiểm tra hộp thư nhé.",
    tooManyCodeRequests: "Bạn đã yêu cầu mã quá nhiều lần. Thử lại sau một giờ nhé.",
    cannotSendNow: "Chưa gửi được mã lúc này. Bạn thử lại sau nhé.",
    tooManyAttempts: "Bạn thử quá nhiều lần. Thử lại sau một giờ nhé.",
    missingEmailOrCode: "Bạn nhập email và mã xác thực giúp mình nhé.",
    codeExpired: "Mã đã hết hạn hoặc không còn dùng được. Bạn yêu cầu mã mới nhé.",
    wrongCodeAttempts: "Mã không đúng. Bạn còn {attempts} lần thử.",
    cannotSignIn: "Chưa đăng nhập được lúc này. Bạn thử lại sau nhé.",
  },

  checkout: {
    title: "Nâng cấp Fluent Pro",
    subtitle:
      "Mở khóa nghĩa mở rộng, cụm từ đi kèm và họ từ vựng cho mọi từ trong mọi bài học.",
    planGroupAria: "Chọn gói Pro",
    scanTitle: "Quét mã để chuyển khoản",
    scanBody: "Mở app ngân hàng của bạn, chọn quét mã QR và quét mã bên dưới.",
    qrAlt: "Mã VietQR cho gói {plan} — {price}",
    accountPending: "Đang cập nhật",
    transferNote:
      "Chuyển đúng {amount} và ghi {yourEmail} vào nội dung chuyển khoản để mình đối chiếu nhé.",
    transferNoteYourEmail: "email của bạn",
    verifiedEmailLabel: "Email đã xác thực",
    verifyEmailSubmit: "Xác thực email",
    transferContentLabel: "Nội dung chuyển khoản",
    transferContentEmpty: "— xác thực email phía trên —",
    copyTransferContent: "Chép nội dung chuyển khoản",
    confirm: "Mình đã chuyển khoản",
    confirming: "Đang ghi nhận...",
    manualNote:
      "Mình kiểm tra thủ công nên Pro không kích hoạt ngay lập tức — thường trong vài giờ.",
    errorVerifyFirst: "Bạn xác thực email trước giúp mình nhé.",
    errorNotRecorded: "Không ghi nhận được yêu cầu.",
    errorNotRecordedRetry:
      "Không ghi nhận được yêu cầu. Bạn thử lại giúp mình nhé.",
    thanksTitle: "Cảm ơn bạn nhiều nhé!",
    thanksBody:
      "Pro sẽ được kích hoạt trong vài giờ sau khi mình xác nhận thanh toán. Bạn sẽ nhận được email xác nhận tại {email}.",
    planRow: "Gói",
    amountRow: "Số tiền",
    thanksFooter:
      "Nếu sau 24 giờ vẫn chưa thấy gì, bạn nhắn cho mình kèm email này để mình kiểm tra lại nhé.",
    backHome: "Về trang chủ",
  },

  plans: {
    annualName: "Pro 1 năm",
    annualPeriod: "/năm",
    annualPerMonth: "≈ {amount} mỗi tháng",
    annualBadge: "Tiết kiệm ~33%",
    monthlyName: "Pro 1 tháng",
    monthlyPeriod: "/tháng",
    trialName: "Dùng thử",
  },

  admin: {
    title: "Trang quản trị",
    subtitle: "Đăng nhập bằng email quản trị để tiếp tục.",
    signInSubmit: "Vào trang quản trị",
    notAdmin: "Email này không phải tài khoản quản trị.",
    signedInAs: "Đang đăng nhập với",
    pendingTitle: "Đơn chờ đối soát ({count})",
    pendingEmpty: "Không có đơn nào đang chờ. 🎉",
    colEmail: "Email",
    colPlan: "Gói",
    colAmount: "Số tiền",
    colCreated: "Tạo lúc",
    activate: "Kích hoạt Pro",
    activating: "Đang kích hoạt...",
    activateConfirm:
      "Xác nhận đã nhận được tiền của {email} và kích hoạt Pro?",
    activated: "Đã kích hoạt Pro cho {email} đến {expiresAt}.",
    activateFailed: "Kích hoạt thất bại.",
    refresh: "Tải lại",
    backToApp: "Về trang chính",
    usersTitle: "Người dùng Pro ({count})",
    usersEmpty: "Chưa có người dùng Pro nào.",
    colStatus: "Trạng thái",
    colLessons: "Bài học",
    colRemaining: "Còn lại",
    colLastLogin: "Đăng nhập lần cuối",
    statusActive: "Đang hoạt động",
    statusExpired: "Hết hạn",
    statusRevoked: "Đã huỷ",
    daysLeft: "{days} ngày",
    neverLoggedIn: "Chưa bao giờ",
    revoke: "Huỷ gói Pro",
    revoking: "Đang huỷ...",
    revokeConfirm: "Huỷ gói Pro của {email} ngay bây giờ? Họ sẽ mất quyền Pro lập tức.",
    revoked: "Đã huỷ gói Pro của {email}.",
    revokeFailed: "Huỷ gói thất bại.",
    createTitle: "Tạo người dùng Pro",
    createHint:
      "Cấp Pro trực tiếp, không gửi mã xác thực. Kiểm tra kỹ email — gõ sai là cấp nhầm cho người khác.",
    createEmailLabel: "Email người dùng",
    createPlanLabel: "Gói",
    createSubmit: "Cấp Pro",
    creating: "Đang cấp...",
    createConfirm: "Cấp {plan} cho {email}? Không cần xác nhận qua email.",
    created: "Đã cấp Pro cho {email} đến {expiresAt}.",
    createFailed: "Cấp Pro thất bại.",
    createTrialTitle: "Tạo người dùng dùng thử",
    createTrialHint:
      "Cấp gói dùng thử có giới hạn ngày, không gửi mã xác thực. Kiểm tra kỹ email — gõ sai là cấp nhầm cho người khác.",
    createTrialDurationLabel: "Số ngày dùng thử",
    createTrialSubmit: "Cấp dùng thử",
    createTrialConfirm:
      "Cấp dùng thử {days} ngày cho {email}? Không cần xác nhận qua email.",
    createdTrial: "Đã cấp dùng thử {days} ngày cho {email}, hết hạn {expiresAt}.",
    trackedSince:
      "Số bài học và IP đăng nhập chỉ được ghi lại từ khi tính năng này ra mắt — người dùng cũ sẽ hiển thị 0 cho tới lần dùng tiếp theo.",
  },

  adminDev: {
    title: "Bảng thử nghiệm",
    subtitle:
      "Chạy thẳng pipeline và in kết quả thô của từng chặng, không diễn giải lại.",
    costWarning:
      "Mỗi lần chạy là một lượt gọi Supadata và một lượt gọi AI thật — có tính phí.",
    urlLabel: "Link YouTube",
    run: "Chạy thử",
    running: "Đang chạy...",
    skipAi: "Bỏ qua bước AI (chỉ lấy transcript)",
    includeDepth: "Dùng prompt bản Pro (có nghĩa mở rộng)",
    localeLabel: "Ngôn ngữ bài học",
    stageSupadata: "1 — Supadata (thô)",
    stageTranscript: "Transcript đưa vào AI",
    transcriptSource: "Nguồn",
    sourceSupadata: "Supadata",
    sourceFallback: "Chuỗi dự phòng (Supadata không dùng được)",
    sourceNone: "Không lấy được",
    transcriptChars: "Độ dài",
    stageAi: "2 — AI (thô)",
    videoId: "Video ID",
    endpoint: "Endpoint",
    provider: "Provider",
    model: "Model",
    status: "HTTP status",
    stopReason: "Stop reason",
    usage: "Usage",
    rawBody: "Body thô",
    rawOutput: "Output thô",
    systemPrompt: "System prompt",
    parseOk: "JSON parse được thành bài học hợp lệ ✓",
    parseFailed: "JSON KHÔNG parse được:",
    notConfigured: "Chưa cấu hình:",
    skipped: "Đã bỏ qua:",
    requestFailed: "Cú gọi thất bại:",
    runFailed: "Chạy thử thất bại.",
    backupTitle: "Kiểm tra file JSON đã học",
    backupHint:
      "Chọn một file JSON xuất ra từ ứng dụng để xem đây là bài học đã lưu, sổ từ, hay không nhận diện được. Chỉ đọc để xem — không ghi gì cho tới khi bạn bấm nhập.",
    backupChoose: "Chọn file JSON...",
    backupReadFailed: "Không mở được file. Hãy thử chọn lại.",
    backupInvalidJson: "Không đọc được — đây không phải JSON hợp lệ.",
    backupKindLabel: "Loại phát hiện",
    backupKindLessons: "Bài học đã lưu (saved-lessons)",
    backupKindNotebooks: "Sổ từ (notebooks)",
    backupKindUnknown: "Không nhận diện được",
    backupEnvelopeApp: "app",
    backupEnvelopeFormatVersion: "formatVersion",
    backupEnvelopeSchemaVersion: "schemaVersion",
    backupEnvelopeExportedAt: "exportedAt",
    backupTopLevelKeys: "Các khoá cấp cao nhất",
    backupValidCount: "Hợp lệ: {count}",
    backupDroppedCount: "Bị bỏ qua: {count}",
    backupImportCta: "Nhập vào trình duyệt này (test)",
    backupImporting: "Đang nhập...",
    backupImportWarning:
      "⚠️ Ghi trực tiếp vào localStorage của trình duyệt hiện tại — dùng để test, không phải cho dữ liệu thật.",
    backupImportedLessons: "Đã nhập {count} bài học vào trình duyệt này.",
    backupImportedNotebooks:
      "Đã nhập {words} từ vào {notebooks} sổ trong trình duyệt này.",
  },

  email: {
    subject: "{code} là mã đăng nhập Fluent của bạn",
    heading: "Mã đăng nhập Fluent",
    intro: "Nhập mã dưới đây để mở khóa tài khoản của bạn:",
    textIntro: "Mã đăng nhập Fluent của bạn:",
    validFor: "Mã có hiệu lực trong {minutes} phút.",
    ignore: "Nếu bạn không yêu cầu mã này, bạn có thể bỏ qua email.",
  },

  orders: {
    tooManyRequests: "Bạn gửi hơi nhiều yêu cầu rồi. Thử lại sau ít phút nhé.",
    verifyFirst: "Bạn cần xác thực email trước khi đặt mua.",
    invalidPlan: "Gói nâng cấp không hợp lệ.",
  },

  api: {
    maintenance: "Fluent đang được nâng cấp. Vui lòng quay lại sau ít phút nhé! 🛠️",
    missingUrl: "Vui lòng nhập liên kết video YouTube.",
    invalidUrl: "Liên kết YouTube không hợp lệ.",
    rateLimited:
      "Bạn đã tạo quá nhiều bài học trong một giờ qua (tối đa 5 bài/giờ). Vui lòng thử lại sau ít phút nhé! ⏳",
    rateLimitedShort:
      "Bạn đã tạo quá nhiều bài học trong một giờ qua. Vui lòng thử lại sau ít phút nhé! ⏳",
    proDailyLimit:
      "Hôm nay bạn đã tạo đủ bài học rồi. Ngày mai quay lại tiếp nhé — mình sẽ sẵn sàng! ☕",
    generateFailed: "Đã xảy ra lỗi khi tạo bài học. Bạn thử lại giúp mình nhé.",
    generateFailedShort: "Không thể tạo bài học.",
    lessonTooLong: "Bài học dài quá mức cho phép. Bạn thử một video ngắn hơn nhé.",
    badLessonShape: "Claude trả về cấu trúc bài học không đầy đủ.",
    badExampleCount: "Claude trả về số câu ví dụ không hợp lệ.",
    badQuiz: "Claude trả về câu hỏi trắc nghiệm không hợp lệ.",
    refusedContent:
      "Nội dung video này không tạo được bài học. Bạn thử video khác nhé.",
    noTextContent: "Claude không trả về nội dung văn bản.",
    noSubtitles: "Video này không có phụ đề tiếng Anh.",
    emptySubtitles: "Phụ đề của video này trống.",
    noTranscriptMethod: "Không có phương thức lấy phụ đề nào được cấu hình.",
    transcriptFailed: "Không thể lấy phụ đề từ video này.",
    vercelBlocked:
      "YouTube chặn máy chủ Vercel nên không lấy được phụ đề trực tiếp.",
    deploymentHint:
      " Thêm SUPADATA_API_KEY (miễn phí 100 lượt/tháng tại supadata.ai) hoặc TRANSCRIPT_PROXY_URL vào biến môi trường Vercel.",
  },
};

export default vi;
