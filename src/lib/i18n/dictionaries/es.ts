import type { Dictionary } from "./types";

const es: Dictionary = {
  meta: {
    homeTitle: "Fluent",
    homeDescription: "Convierte cualquier vídeo de YouTube en una lección de inglés",
    upgradeTitle: "Hazte Pro — Fluent",
    upgradeDescription:
      "Hazte Fluent Pro para desbloquear significados ampliados, colocaciones y familias de palabras para cada palabra.",
    notebookTitle: "Cuaderno — Fluent",
    notebookDescription:
      "Guarda las palabras importantes de tus lecciones y repásalas cuando quieras.",
  },

  common: {
    back: "Volver",
    showMore: "Ver más",
    showLess: "Ver menos",
    gotIt: "Entendido",
    later: "Más tarde",
    loading: "Cargando...",
    copy: "Copiar",
    copied: "¡Copiado!",
    copiedCheck: "Copiado ✓",
    copyValue: "Copiar {value}",
    copyHint: "Haz clic para copiar",
  },

  language: {
    label: "Idioma",
    switcherAria: "Elegir idioma",
    menuAria: "Lista de idiomas",
  },

  theme: {
    toLight: "Cambiar al modo claro",
    toDark: "Cambiar al modo oscuro",
    light: "Modo claro",
    dark: "Modo oscuro",
  },

  maintenance: {
    title: "Fluent se está actualizando 🚧",
    body: "Hemos pausado la creación de lecciones para actualizar. ¡Vuelve en unos minutos!",
  },

  generator: {
    tagline: "Convierte cualquier vídeo de YouTube en una lección de inglés",
    devBadge: "🛠️ Modo dev — datos de ejemplo",
    urlLabel: "Enlace de YouTube",
    urlPlaceholder: "Pega aquí un enlace de YouTube...",
    submit: "Empezar",
    submitting: "Creando tu lección...",
    submitPaused: "En pausa",
    hint: "Funciona mejor con vídeos que tienen subtítulos en inglés.",
    hintPaused:
      "La creación de lecciones está en pausa por una actualización. ¡Vuelve en unos minutos!",
    proBadge: "☕ Pro",
    trialBadge: "🎁 Prueba: quedan {days} días",
    remaining: "Te quedan {remaining}/{limit} lecciones hoy",
    restoreIntro:
      "Introduce el correo con el que pagaste. Te enviaremos un código de verificación para confirmar que eres tú.",
    restoreSubmit: "Desbloquear Pro",
    buyPro: "☕ Consigue Fluent Pro",
    alreadyBought: "¿Ya tienes Pro? Desbloquéalo aquí",
    proDailyReached:
      "Ya has creado todas las lecciones de hoy. ¡Vuelve mañana, aquí estaremos! ☕",
    freeLimitReached:
      "Has usado tus {limit} lecciones gratuitas de hoy. Hazte Pro para seguir sin límites, con significados ampliados, colocaciones y familias de palabras ☕",
    upgradeCta: "Hazte Pro ☕",
    loadingTitle: "Creando tu lección...",
    loadingHint: "Suele tardar entre 20 y 40 segundos.",
  },

  saved: {
    title: "Lecciones guardadas ({count})",
    today: "Hoy",
    yesterday: "Ayer",
    daysAgo: "Hace {count} días",
    vocabCount: "{count} palabras",
    deleteAria: "Eliminar lección: {title}",
    deleteTitle: "Eliminar lección",
  },

  backup: {
    title: "Copia de seguridad",
    proTag: "✨ Pro",
    description:
      "Exporta todas tus lecciones guardadas a un archivo JSON, o impórtalas en otro dispositivo. Las lecciones solo viven en este navegador: si borras sus datos, se pierden.",
    exportCta: "Exportar JSON",
    importCta: "Importar JSON",
    statusEmpty: "Todavía no hay lecciones guardadas para exportar.",
    statusExported: "Se exportaron {count} lecciones.",
    statusImported: "Se importaron {count} lecciones.",
    statusSkipped: "Se omitieron {count} que ya están aquí en una versión más reciente.",
    statusDropped: "{count} entradas del archivo estaban dañadas y se omitieron.",
    statusFailed:
      "{count} no se pudieron guardar: el almacenamiento del navegador está lleno.",
    errorInvalidJson: "No se pudo leer el archivo: no es un JSON válido.",
    errorNotBackup: "Ese no es un archivo de copia de seguridad de LearnFluent.",
    errorWrongSchema:
      "Este archivo se exportó con un formato de lección anterior y ya no se puede restaurar.",
    errorNoLessons: "No se encontró ninguna lección válida en el archivo.",
    errorReadFailed: "No se pudo abrir el archivo. Inténtalo de nuevo.",
    upsellTitle: "La copia de seguridad es una función Pro",
    upsellBody:
      "Estás en el plan gratuito, así que todavía no puedes exportar ni importar lecciones. Hazte Pro para llevarlas a otro dispositivo y conservarlas al cambiar de navegador.",
    upsellCta: "Hazte Pro ☕",
  },

  notebook: {
    navLabel: "Cuaderno",
    defaultName: "Mi cuaderno",
    pageTitle: "Tu cuaderno",
    pageIntro:
      "Las palabras que marcas en una lección se guardan aquí. Todo vive en este navegador.",
    backToLessons: "Volver a las lecciones",
    statusFree: "{words}/{limit} palabras · plan gratuito",
    statusPro: "{words} palabras · {notebooks} cuadernos",
    emptyTitle: "Todavía no hay palabras",
    emptyBody:
      "Abre una lección, gira una tarjeta de vocabulario y toca el marcador para guardar la palabra aquí.",
    newNotebookCta: "Nuevo cuaderno",
    newNamePlaceholder: "Nombre del tema",
    createCta: "Crear",
    cancel: "Cancelar",
    renameCta: "Renombrar",
    saveNameCta: "Guardar",
    deleteCta: "Eliminar cuaderno",
    deleteTitle: "¿Eliminar este cuaderno?",
    deleteBody:
      "Se irán todas las palabras de «{name}», y no se puede deshacer.",
    deleteConfirmCta: "Eliminar",
    removeAria: "Quitar del cuaderno: {word}",
    removeTitle: "Quitar del cuaderno",
    sourceVideo: "Ver el vídeo original",
    wordCount: "{count} palabras",
    pickTitle: "¿En qué cuaderno guardamos «{word}»?",
    saveTitle: "Guardar en el cuaderno",
    saveAria: "Guardar {word} en tu cuaderno",
    savedTitle: "Guardada — toca para quitar",
    savedAria: "Quitar {word} de tu cuaderno",
    limitTitle: "Tu cuaderno gratuito está lleno",
    limitBody:
      "El plan gratuito guarda {limit} palabras en un único cuaderno. Hazte Pro para tener palabras ilimitadas repartidas en todos los temas que quieras.",
    limitCta: "Hazte Pro ☕",
    notebookLimitTitle: "Los cuadernos por tema son una función Pro",
    notebookLimitBody:
      "El plan gratuito tiene un solo cuaderno. Hazte Pro para separar tus palabras por tema — trabajo, viajes, exámenes — y elegir dónde va cada una al guardarla.",
  },

  notebookBackup: {
    title: "Copia del cuaderno",
    proTag: "✨ Pro",
    description:
      "Exporta todos tus cuadernos a un archivo JSON, o impórtalos en otro dispositivo. Los cuadernos solo viven en este navegador: si borras sus datos, se pierden.",
    exportCta: "Exportar JSON",
    importCta: "Importar JSON",
    statusEmpty: "Todavía no hay cuadernos para exportar.",
    statusExported: "Se exportaron {words} palabras en {notebooks} cuadernos.",
    statusImported: "Se importaron {words} palabras y {notebooks} cuadernos nuevos.",
    statusSkipped: "Se omitieron {count} palabras que ya estaban aquí.",
    statusDropped: "{count} entradas del archivo estaban dañadas y se omitieron.",
    errorInvalidJson: "No se pudo leer el archivo: no es un JSON válido.",
    errorNotBackup: "Ese no es un archivo de copia de cuadernos de LearnFluent.",
    errorWrongSchema:
      "Este archivo se exportó con un formato de cuaderno anterior y ya no se puede restaurar.",
    errorEmpty: "No se encontró ningún cuaderno válido en el archivo.",
    errorReadFailed: "No se pudo abrir el archivo. Inténtalo de nuevo.",
    upsellTitle: "La copia del cuaderno es una función Pro",
    upsellBody:
      "Estás en el plan gratuito, así que todavía no puedes exportar ni importar cuadernos. Hazte Pro para llevar tus palabras a otro dispositivo y conservarlas al cambiar de navegador.",
    upsellCta: "Hazte Pro ☕",
  },

  lesson: {
    ready: "¡Tu lección está lista!",
    thumbnailAlt: "Miniatura del vídeo: {title}",
    watchOriginal: "Ver el vídeo original",
    tabsAria: "Secciones de la lección",
    tabVocabulary: "Vocabulario",
    tabIdioms: "Modismos",
    tabGrammar: "Gramática",
    tabQuiz: "Test",
    tabPractice: "Práctica",
  },

  vocabulary: {
    tapToReveal: "Toca para ver",
    proTag: "✨ Pro",
    meaningsAndExamples: "Significados y ejemplos",
    collocations: "Colocaciones frecuentes",
    wordFamily: "Familia de palabras",
    upsell:
      "Pro desbloquea significados ampliados, colocaciones y familias de palabras para {everyWord}. {cta}",
    upsellEveryWord: "cada palabra",
    upsellCta: "Hazte Pro ☕",
  },

  cefr: {
    lessonLabel: "Nivel",
    unknown: "—",
    unknownTitle: "Esta lección se guardó antes de que existieran los niveles",
    lessonAria: "Nivel MCER de la lección: {level}",
    wordAria: "Nivel MCER de la palabra: {level}",
    names: {
      A1: "Principiante",
      A2: "Básico",
      B1: "Intermedio",
      B2: "Intermedio alto",
      C1: "Avanzado",
      C2: "Dominio",
    },
  },

  idioms: {
    emptyTitle: "No hay modismos ni expresiones coloquiales en esta lección",
    emptyBody: "Prueba con otro vídeo con un lenguaje más natural y conversacional.",
  },

  grammar: {
    intro: "Aprende cómo se usan las frases clave en oraciones reales.",
    sentenceLabel: "Oración {index}",
  },

  quiz: {
    progress: "Pregunta {current} de {total}",
    correct: "¡Correcto! 🎉",
    incorrect: "Casi — la respuesta correcta está marcada arriba.",
    next: "Continuar",
    seeResults: "Ver resultados",
    score: "¡Acertaste {score}/{total}!",
    perfect: "¡Excelente, lo has bordado!",
    good: "¡Buen trabajo, sigue así!",
    poor: "Repasa el vocabulario y vuelve a intentarlo.",
    retry: "Volver a intentar",
  },

  practice: {
    intro:
      "Practica con las mismas frases y palabras que ya tiene la lección: no gasta generaciones nuevas.",
    pickFormat: "Elige un ejercicio",
    backToFormats: "← Elegir otro ejercicio",
    progress: "Pregunta {current} de {total}",
    check: "Comprobar",
    next: "Continuar",
    finish: "Ver resultados",
    retry: "Intentar de nuevo",
    correct: "¡Correcto! 🎉",
    incorrect: "No es exacto.",
    answerWas: "Respuesta: {answer}",
    score: "¡Acertaste {score}/{total}!",
    scorePerfect: "Impecable: ¡excelente trabajo!",
    scoreGood: "¡Bien! Un poco más de práctica y lo tienes.",
    scorePoor: "Repasa el vocabulario y vuelve a intentarlo.",
    clue: "Significado",
    showClue: "Ver significado",
    kindFillBlank: "Completar huecos",
    kindFillBlankHint: "Escribe la expresión que falta en la frase.",
    kindMatching: "Relacionar",
    kindMatchingHint: "Une cada palabra en inglés con su significado.",
    kindDictation: "Dictado",
    kindDictationHint: "Escucha la frase y escríbela igual.",
    kindWordOrder: "Ordenar la frase",
    kindWordOrderHint: "Coloca las palabras en el orden correcto.",
    fillPlaceholder: "Completa el hueco…",
    fillHint: "Pista",
    fillHintUsed: "Empieza por «{hint}» ({count} letras)",
    dictationPlay: "Escuchar",
    dictationSlow: "Escuchar despacio",
    dictationPlaceholder: "Escribe lo que oyes…",
    dictationUnsupported:
      "Este navegador no puede leer en inglés. Aun así puedes tocar «Ver significado» y escribir la frase a partir de ahí.",
    dictationReveal: "La frase era:",
    orderIntro: "Toca las palabras en el orden correcto.",
    orderClear: "Borrar",
    orderUndo: "Quitar la última",
    orderEmpty: "Toca una palabra de abajo para empezar.",
    matchingIntro: "Toca una palabra en inglés y luego su significado.",
    matchingRound: "Ronda {current} de {total}",
    matchingRemaining: "Quedan {count} parejas",
    matchingMistakes: "Errores de emparejamiento: {count}",
    matchingDone: "¡Ronda completada! 🎉",
    emptyTitle: "Esta lección no tiene material suficiente para practicar",
    emptyBody: "Prueba con otro vídeo con más frases de ejemplo y vocabulario.",
  },

  speak: {
    aria: "Escuchar la pronunciación: {text}",
    title: "Escuchar la pronunciación",
  },

  pdf: {
    download: "Descargar PDF",
    downloading: "Generando el PDF...",
    downloadFailed: "No se pudo descargar el PDF. Inténtalo de nuevo.",
    notPro: "Esta función es solo para Fluent Pro.",
    limitReached:
      "Has descargado un PDF 3 veces en la última hora. Inténtalo de nuevo en unos minutos! ⏳",
    limitReachedTitle: "Sin descargas de PDF disponibles",
    limitReachedBody:
      "Has descargado un PDF 3 veces en la última hora. Podrás volver a hacerlo en unos minutos, ¡hasta pronto! ⏳",
    upsellTitle: "La descarga en PDF es una función Pro",
    upsellBody:
      "Hazte Pro para descargar las lecciones en un PDF cuidado — para imprimir, repasar y practicar la escritura en papel.",
    upsellCta: "Hazte Pro ☕",
  },

  auth: {
    emailLabel: "Tu correo electrónico",
    emailPlaceholder: "tu@correo.com",
    emailHint:
      "Te enviaremos un código de 6 dígitos a esta dirección para confirmar que eres tú.",
    signOut: "Cerrar sesión",
    signOutFrom: "Cerrar sesión ({email})",
    signIn: "Iniciar sesión",
    signInTitle: "Inicia sesión en Fluent",
    signInBody:
      "Escribe tu correo y te enviaremos un código de 6 dígitos. Sin contraseña.",
    sendCode: "Enviar código de verificación",
    sending: "Enviando...",
    verify: "Verificar",
    verifying: "Comprobando...",
    codeLabel: "Código de verificación",
    codePlaceholder: "000000",
    codeSentTo:
      "Hemos enviado un código de 6 dígitos a {email}. Es válido durante 10 minutos.",
    changeEmail: "Cambiar de correo o reenviar el código",
    invalidEmail: "Ese correo no parece válido. ¿Puedes revisarlo?",
    sendFailed: "No se pudo enviar el código. Inténtalo de nuevo en un momento.",
    sendFailedNetwork:
      "No se pudo enviar el código. Revisa tu conexión e inténtalo de nuevo.",
    codeSentDefault: "Código de verificación enviado.",
    enterCode: "Introduce el código que te hemos enviado por correo.",
    wrongCode: "Ese código no es correcto. Inténtalo de nuevo.",
    verifyFailedNetwork:
      "No se pudo verificar. Revisa tu conexión e inténtalo de nuevo.",
    codeSentGeneric:
      "Si ese correo es válido, ya te hemos enviado un código de verificación. Revisa tu bandeja de entrada.",
    tooManyCodeRequests:
      "Has pedido demasiados códigos. Inténtalo de nuevo dentro de una hora.",
    cannotSendNow: "No se pudo enviar el código ahora mismo. Inténtalo más tarde.",
    tooManyAttempts: "Demasiados intentos. Inténtalo de nuevo dentro de una hora.",
    missingEmailOrCode:
      "Introduce tu correo electrónico y el código de verificación.",
    codeExpired:
      "Ese código ha caducado o ya no es válido. Solicita uno nuevo.",
    wrongCodeAttempts:
      "Ese código no es correcto. Te quedan {attempts} intentos.",
    cannotSignIn:
      "No se pudo iniciar sesión ahora mismo. Inténtalo más tarde.",
  },

  checkout: {
    title: "Hazte Fluent Pro",
    subtitle:
      "Desbloquea significados ampliados, colocaciones y familias de palabras para cada palabra de cada lección.",
    planGroupAria: "Elegir un plan Pro",
    scanTitle: "Escanea el código para pagar",
    scanBody:
      "Abre tu app bancaria, elige escanear código QR y escanea el código de abajo.",
    qrAlt: "Código VietQR del plan {plan} — {price}",
    accountPending: "Próximamente",
    transferNote:
      "Transfiere exactamente {amount} e incluye {yourEmail} en el concepto para que podamos identificarlo.",
    transferNoteYourEmail: "tu correo electrónico",
    verifiedEmailLabel: "Correo verificado",
    verifyEmailSubmit: "Verificar correo",
    transferContentLabel: "Concepto de la transferencia",
    transferContentEmpty: "— verifica tu correo arriba —",
    copyTransferContent: "Copiar el concepto de la transferencia",
    confirm: "Ya he hecho la transferencia",
    confirming: "Registrando...",
    manualNote:
      "Revisamos las transferencias a mano, así que Pro no se activa al instante — normalmente en unas horas.",
    errorVerifyFirst: "Primero verifica tu correo electrónico.",
    errorNotRecorded: "No se pudo registrar tu solicitud.",
    errorNotRecordedRetry:
      "No se pudo registrar tu solicitud. Inténtalo de nuevo.",
    thanksTitle: "¡Muchísimas gracias!",
    thanksBody:
      "Pro se activará en unas horas, en cuanto confirmemos el pago. Recibirás un correo de confirmación en {email}.",
    planRow: "Plan",
    amountRow: "Importe",
    thanksFooter:
      "Si pasadas 24 horas no has recibido nada, escríbenos con este correo y lo revisamos.",
    backHome: "Volver al inicio",
  },

  plans: {
    annualName: "Pro — 1 año",
    annualPeriod: "/año",
    annualPerMonth: "≈ {amount} al mes",
    annualBadge: "Ahorra ~33%",
    monthlyName: "Pro — 1 mes",
    monthlyPeriod: "/mes",
    trialName: "Prueba",
  },

  admin: {
    title: "Administración",
    subtitle: "Inicia sesión con una dirección de administrador para continuar.",
    signInSubmit: "Entrar al panel",
    notAdmin: "Esa dirección no es una cuenta de administrador.",
    signedInAs: "Sesión iniciada como",
    pendingTitle: "Pedidos pendientes ({count})",
    pendingEmpty: "No hay nada pendiente. 🎉",
    colEmail: "Correo",
    colPlan: "Plan",
    colAmount: "Importe",
    colCreated: "Creado",
    activate: "Activar Pro",
    activating: "Activando...",
    activateConfirm:
      "¿Confirmas que llegó la transferencia de {email} y activas Pro?",
    activated: "Pro activado para {email} hasta {expiresAt}.",
    activateFailed: "La activación ha fallado.",
    refresh: "Actualizar",
    backToApp: "Volver a la app",
    usersTitle: "Usuarios Pro ({count})",
    usersEmpty: "Todavía no hay usuarios Pro.",
    colStatus: "Estado",
    colLessons: "Lecciones",
    colRemaining: "Restante",
    colLastLogin: "Último acceso",
    statusActive: "Activo",
    statusExpired: "Caducado",
    statusRevoked: "Revocado",
    daysLeft: "{days} días",
    neverLoggedIn: "Nunca",
    revoke: "Revocar Pro",
    revoking: "Revocando...",
    revokeConfirm:
      "¿Revocar Pro de {email} ahora? Perderá el acceso de inmediato.",
    revoked: "Pro revocado para {email}.",
    revokeFailed: "La revocación ha fallado.",
    createTitle: "Crear un usuario Pro",
    createHint:
      "Concede Pro directamente, sin enviar código de verificación. Revisa bien la dirección: un error se lo concede a quien la tenga.",
    createEmailLabel: "Correo del usuario",
    createPlanLabel: "Plan",
    createSubmit: "Conceder Pro",
    creating: "Concediendo...",
    createConfirm:
      "¿Conceder {plan} a {email}? No se envía ninguna confirmación por correo.",
    created: "Pro concedido a {email} hasta {expiresAt}.",
    createFailed: "No se ha podido conceder Pro.",
    createTrialTitle: "Crear un usuario de prueba",
    createTrialHint:
      "Concede una prueba con duración limitada, sin enviar código de verificación. Revisa bien la dirección: un error se lo concede a quien la tenga.",
    createTrialDurationLabel: "Duración de la prueba",
    createTrialSubmit: "Conceder prueba",
    createTrialConfirm:
      "¿Conceder una prueba de {days} días a {email}? No se envía ninguna confirmación por correo.",
    createdTrial:
      "Prueba de {days} días concedida a {email}, hasta {expiresAt}.",
    trackedSince:
      "Las lecciones y las IP de acceso solo se registran desde que se lanzó esta función; los usuarios existentes muestran 0 hasta que vuelvan a usar la app.",
  },

  adminDev: {
    title: "Consola de pruebas",
    subtitle:
      "Ejecuta el proceso e imprime cada etapa en bruto, sin reinterpretar nada.",
    costWarning:
      "Cada ejecución es una llamada real a Supadata y otra a la IA — ambas se facturan.",
    urlLabel: "Enlace de YouTube",
    run: "Ejecutar",
    running: "Ejecutando...",
    skipAi: "Omitir la etapa de IA (solo transcripción)",
    includeDepth: "Usar el prompt Pro (con significados ampliados)",
    localeLabel: "Idioma de la lección",
    stageSupadata: "1 — Supadata (en bruto)",
    stageTranscript: "Transcripción enviada a la IA",
    transcriptSource: "Origen",
    sourceSupadata: "Supadata",
    sourceFallback: "Cadena alternativa (Supadata no disponible)",
    sourceNone: "No se ha obtenido ninguna",
    transcriptChars: "Longitud",
    stageAi: "2 — IA (en bruto)",
    videoId: "ID del vídeo",
    endpoint: "Endpoint",
    provider: "Proveedor",
    model: "Modelo",
    status: "Estado HTTP",
    stopReason: "Motivo de parada",
    usage: "Uso",
    rawBody: "Cuerpo en bruto",
    rawOutput: "Salida en bruto",
    systemPrompt: "System prompt",
    parseOk: "El JSON se ha parseado como una lección válida ✓",
    parseFailed: "El JSON NO se ha parseado:",
    notConfigured: "Sin configurar:",
    skipped: "Omitido:",
    requestFailed: "La llamada ha fallado:",
    runFailed: "La ejecución ha fallado.",
    backupTitle: "Inspeccionar un archivo JSON de contenido aprendido",
    backupHint:
      "Elige un archivo JSON exportado desde la app para ver si es una copia de lecciones guardadas, de cuadernos, o si no se reconoce. Solo lectura hasta que pulses importar.",
    backupChoose: "Elegir archivo JSON...",
    backupReadFailed: "No se pudo abrir el archivo. Inténtalo de nuevo.",
    backupInvalidJson: "No se pudo leer — esto no es JSON válido.",
    backupKindLabel: "Tipo detectado",
    backupKindLessons: "Lecciones guardadas (saved-lessons)",
    backupKindNotebooks: "Cuadernos (notebooks)",
    backupKindUnknown: "No reconocido",
    backupEnvelopeApp: "app",
    backupEnvelopeFormatVersion: "formatVersion",
    backupEnvelopeSchemaVersion: "schemaVersion",
    backupEnvelopeExportedAt: "exportedAt",
    backupTopLevelKeys: "Claves de nivel superior",
    backupValidCount: "Válidos: {count}",
    backupDroppedCount: "Descartados: {count}",
    backupImportCta: "Importar en este navegador (prueba)",
    backupImporting: "Importando...",
    backupImportWarning:
      "⚠️ Escribe directamente en el localStorage de este navegador — para pruebas, no para datos reales.",
    backupImportedLessons: "Se importaron {count} lección(es) en este navegador.",
    backupImportedNotebooks:
      "Se importaron {words} palabra(s) en {notebooks} cuaderno(s) de este navegador.",
  },

  email: {
    subject: "{code} es tu código de acceso de Fluent",
    heading: "Tu código de acceso de Fluent",
    intro: "Introduce el código de abajo para desbloquear tu cuenta:",
    textIntro: "Tu código de acceso de Fluent:",
    validFor: "El código es válido durante {minutes} minutos.",
    ignore: "Si no has solicitado este código, puedes ignorar este correo.",
  },

  orders: {
    tooManyRequests:
      "Has enviado demasiadas solicitudes. Inténtalo de nuevo en unos minutos.",
    verifyFirst: "Verifica tu correo electrónico antes de hacer el pedido.",
    invalidPlan: "Ese plan de mejora no es válido.",
  },

  api: {
    maintenance: "Fluent se está actualizando. ¡Vuelve en unos minutos! 🛠️",
    missingUrl: "Introduce un enlace de vídeo de YouTube.",
    invalidUrl: "Ese enlace de YouTube no es válido.",
    rateLimited:
      "Has creado demasiadas lecciones en la última hora (máximo 5 por hora). ¡Inténtalo de nuevo en unos minutos! ⏳",
    rateLimitedShort:
      "Has creado demasiadas lecciones en la última hora. ¡Inténtalo de nuevo en unos minutos! ⏳",
    proDailyLimit:
      "Ya has creado todas las lecciones de hoy. ¡Vuelve mañana, aquí estaremos! ☕",
    generateFailed: "Algo ha fallado al crear la lección. Inténtalo de nuevo.",
    generateFailedShort: "No se pudo crear la lección.",
    lessonTooLong: "Esta lección era demasiado larga. Prueba con un vídeo más corto.",
    badLessonShape: "Claude devolvió una estructura de lección incompleta.",
    badExampleCount: "Claude devolvió un número incorrecto de oraciones de ejemplo.",
    badQuiz: "Claude devolvió preguntas de test no válidas.",
    refusedContent:
      "No se puede crear una lección con el contenido de este vídeo. Prueba con otro.",
    noTextContent: "Claude no devolvió contenido de texto.",
    noSubtitles: "Este vídeo no tiene subtítulos en inglés.",
    emptySubtitles: "Los subtítulos de este vídeo están vacíos.",
    noTranscriptMethod: "No hay ningún método de transcripción configurado.",
    transcriptFailed: "No se pudieron obtener los subtítulos de este vídeo.",
    vercelBlocked:
      "YouTube bloquea los servidores de Vercel, así que no se pudieron obtener los subtítulos directamente.",
    deploymentHint:
      " Añade SUPADATA_API_KEY (100 solicitudes gratis al mes en supadata.ai) o TRANSCRIPT_PROXY_URL a las variables de entorno de Vercel.",
  },
};

export default es;
