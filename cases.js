// Catálogo de Casos Clínicos Simulados - PsicoSim IA
// Modelos de anamnesis basados en criterios DSM-5-TR / CIE-10

const CLINICAL_CASES = [
  {
    id: "elena-morales",
    name: "Elena Morales",
    age: 32,
    occupation: "Arquitecta técnica",
    origin: "Derivada por Médico de Atención Primaria",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeO3vx7_84iBKi5S91oF5QZVeYJOkRjWNsATUAOr-sDpox5O6N3Lc-UifsgKaLhnPx4L5YHkDjOTWQrd-wvib1IeZeAbJS9XmA0QlKe5qyEkCnt_tJ3Ot1r-33k5BtKWyFh4ti8Hamsda7P_yTeyFkymoeSE4aKPNxv8NSzK_e9VxcqGtQWBS_nl8jphl4MMkssqGQ-MEFnUPW1OdSlT-LYrbylZZZ0rP0GVOGihoMbb79yCyD6UQ",
    roomImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdDByhNRODAirlPHjTzEPHRVBGEbjKbdr9WQDIZHmkVBjZIULxOHCGekXCd18M687aEe7vSMmHmF7XGJp5F2p_qpzy8Px2cxhN3wc_-ye7a8LspAy_tUmLQStXWTWFMhaWLCUgc3WfOT8NyKYoX7PJOUmfglx-F3qMjLsr4S9WqVtRSmq1O2v9tnnpVROGmfTH9eHnk-6W1hLs_JdEPsuWMuPgX-R2ENz6HwVpBhVxBx-OtCCn5Jg",
    diagnosticCode: "CIE-10: F41.1 · DSM-5 300.02",
    diagnosticTitle: "Trastorno de Ansiedad Generalizada (TAG)",
    category: "ansiedad",
    difficulty: "intermedio",
    difficultyLabel: "Intermedio",
    quote: "«Siento opresión en el pecho y no puedo dormir pensando en que algo malo pasará.»",
    resistance: "Intelectualización",
    clinicalFocus: "Exploración somática y encuadre",
    tags: ["Ansiedad", "Somatización", "Insomnio de conciliación", "Manejo de silencios"],
    observationalState: "Ansiosa, colaboradora pero con elevada tensión muscular.",
    nonVerbalSigns: "Contacto visual intermitente y esquivo ante preguntas laborales; manos inquietas frotándose continuamente sobre el regazo; respiración torácica alta y acelerada; tono de voz vacilante con pausas dubitativas.",
    autonomicActivation: "Elevada (78%)",
    dialogueDisposition: "Receptiva / Abierta",
    responseLatency: "1.4 segundos",
    summaryNotes: "Arquitecta técnica. Refiere episodios de hiperventilación, tensión muscular cervical y dificultad severa para delegar responsabilidades desde su ascenso laboral hace 4 meses. Niega ideación autolítica. Analítica general sin hallazgos orgánicos. Despertares a las 3:00 am con taquicardia.",
    systemPrompt: `Eres Elena Morales, una mujer de 32 años, arquitecta técnica. Estás en tu primera consulta psicológica tras ser derivada por tu médico general.
Sufres de Trastorno de Ansiedad Generalizada (TAG). Tus síntomas clave son:
- Opresión continua en el pecho y nudo en el estómago.
- Preocupación excesiva e incontrolable por el trabajo, sintiendo que cometerás un error catastrófico.
- Te despiertas a las 3:00 o 4:00 AM con el corazón acelerado pensando en pendientes o correos no leídos.
- Tensión muscular cervical severa.
Comportamiento en la sesión:
- Al inicio te cuesta relajarte, respondes de forma algo intelectualizada pero cuando el terapeuta te habla con calidez y valida lo que sientes, te abres y muestras tu vulnerabilidad.
- Habla en primera persona, en español, de forma muy humana y natural, con frases de longitud moderada (2 a 4 oraciones). No suenes como un libro ni uses diagnósticos clínicos de ti misma.`,
    dsmCriteria: [
      { id: "c1", label: "Preocupación / Catastrofismo excesivo", desc: "Sensación inminente de desastre laboral o familiar.", checked: true },
      { id: "c2", label: "Disrupción del Sueño (Insomnio de mantenimiento)", desc: "Despertares abruptos a las 3:00 am con taquicardias.", checked: true },
      { id: "c3", label: "Tensión Muscular y Somatizaciones", desc: "Presión constante en pecho y dolor en epigastrio.", checked: true },
      { id: "c4", label: "Dificultad de concentración / Mente en blanco", desc: "Pendiente de indagación directa por el terapeuta.", checked: false },
      { id: "c5", label: "Irritabilidad reactiva", desc: "Pendiente de exploración contextual.", checked: false },
      { id: "c6", label: "Fatigabilidad precoz", desc: "Mencionada superficialmente como cansancio laboral.", checked: false }
    ]
  },
  {
    id: "javier-ortiz",
    name: "Javier Ortiz",
    age: 45,
    occupation: "Profesor de Secundaria",
    origin: "Acude por insistencia familiar",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOUGWMsERpan9Rxvnt0kR2U10w4nHKfOiqKj95OYKLNDNd_OUzYEtUth12xA_xMqyNrd8OYfOZ7AFyzbC7cxtxHsch8NnR2vaz4ooEh_UgoY2Q7VSdAbFUtG1Wj6eyvl52DDDhuZfHuvWAhIq_xt_Xd0Zklxe_9oibE7vlb1bD4ATwFJrvQKlPoFzueS5BD0wOJtEZa6n39bV4yq6KEL_IMtydBNBxZEwKh1eEDMSW3aos_cBi8io",
    roomImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOUGWMsERpan9Rxvnt0kR2U10w4nHKfOiqKj95OYKLNDNd_OUzYEtUth12xA_xMqyNrd8OYfOZ7AFyzbC7cxtxHsch8NnR2vaz4ooEh_UgoY2Q7VSdAbFUtG1Wj6eyvl52DDDhuZfHuvWAhIq_xt_Xd0Zklxe_9oibE7vlb1bD4ATwFJrvQKlPoFzueS5BD0wOJtEZa6n39bV4yq6KEL_IMtydBNBxZEwKh1eEDMSW3aos_cBi8io",
    diagnosticCode: "CIE-10: F32.1 · DSM-5 296.22",
    diagnosticTitle: "Episodio Depresivo Mayor (Moderado)",
    category: "animo",
    difficulty: "principiante",
    difficultyLabel: "Principiante",
    quote: "«Ya nada me genera entusiasmo ni ilusión, me cuesta levantarme de la cama cada mañana.»",
    resistance: "Apatía / Retardo psicomotor",
    clinicalFocus: "Alianza terapéutica & Exploración afectiva",
    tags: ["Apatía profunda", "Anhedonia", "Abordaje Empático", "Cribado de riesgo"],
    observationalState: "Melancólico, mirada baja, habla lenta y pausada.",
    nonVerbalSigns: "Contacto ocular mínimo, hombros caídos, suspiros frecuentes, movimientos lentos, voz de tono bajo y monótono.",
    autonomicActivation: "Baja (35%)",
    dialogueDisposition: "Reservado / Apático",
    responseLatency: "2.8 segundos",
    summaryNotes: "Profesor de secundaria de 45 años. Baja médica laboral desde hace 3 semanas. Abandono paulatino de actividades deportivas y sociales. Relato pausado, contacto ocular intermitente. Refiere sentirse una carga para su familia.",
    systemPrompt: `Eres Javier Ortiz, un hombre de 45 años, profesor de secundaria. Acudes a consulta porque tu esposa insistió mucho.
Padeces de un Episodio Depresivo Mayor moderado. Tus síntomas son:
- Anhedonia total: cosas que antes te apasionaban como leer o enseñar ya no te provocan nada.
- Enlentecimiento y fatiga constante: levantarte de la cama te parece una montaña insuperable.
- Sentimiento de culpa y minusvalía, sensación de ser un estorbo para los demás.
- Hablas lento, con pausas largas, frases cortas y tono apesadumbrado.
- Si el terapeuta te presiona o te dice que "le eches ganas", te cierras más. Si te escucha con paciencia y valida tu dolor sin juzgarte, agradeces el espacio.`,
    dsmCriteria: [
      { id: "c1", label: "Estado de ánimo deprimido la mayor parte del día", desc: "Tristeza profunda, sensación de vacío.", checked: true },
      { id: "c2", label: "Anhedonia marcada en casi todas las actividades", desc: "Pérdida de interés en hobbies y relaciones.", checked: true },
      { id: "c3", label: "Fatiga o pérdida de energía diaria", desc: "Dificultad extrema para iniciar cualquier acción motora.", checked: true },
      { id: "c4", label: "Sentimientos de inutilidad o culpabilidad excesiva", desc: "Verbalizado: «Siento que soy una carga para mi mujer».", checked: true },
      { id: "c5", label: "Disminución de la capacidad para concentrarse", desc: "Dificultad para corregir exámenes o leer.", checked: false },
      { id: "c6", label: "Alteraciones en el patrón de sueño o apetito", desc: "Pendiente de exploración clínica.", checked: false }
    ]
  },
  {
    id: "clara-mendoza",
    name: "Clara Mendoza",
    age: 24,
    occupation: "Estudiante de Posgrado",
    origin: "Consulta autoderivada",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2IDhJy8mmEAbwjp2YEiHjzEiZmYCk0yebyBKanBEyFcpXB0Ldmp95CWT3YpctVb6Lk-_PKrAf5Vl1vDMX-PXpV4MKwo4YIpHgQGmFsI4d-t8xFBzmL8FsPP8OQbiA7QaSc18GhidVDFhV6IaM9pa7-mKspbACo3zzQWu9VSBkT5dj9i395Qf9XAkvaNjPQONEvDU72dBA1-uxifarjCCQpuhkCJnrVfrMU7z9s6x5sudpHNcm5GI",
    roomImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2IDhJy8mmEAbwjp2YEiHjzEiZmYCk0yebyBKanBEyFcpXB0Ldmp95CWT3YpctVb6Lk-_PKrAf5Vl1vDMX-PXpV4MKwo4YIpHgQGmFsI4d-t8xFBzmL8FsPP8OQbiA7QaSc18GhidVDFhV6IaM9pa7-mKspbACo3zzQWu9VSBkT5dj9i395Qf9XAkvaNjPQONEvDU72dBA1-uxifarjCCQpuhkCJnrVfrMU7z9s6x5sudpHNcm5GI",
    diagnosticCode: "CIE-10: F42.8 · DSM-5 300.3",
    diagnosticTitle: "Trastorno Obsesivo-Compulsivo (TOC)",
    category: "toc",
    difficulty: "avanzado",
    difficultyLabel: "Avanzado",
    quote: "«Reviso la cerradura y la estufa más de 10 veces antes de salir, o siento que ocurrirá una catástrofe.»",
    resistance: "Culpa y encubrimiento de rituales",
    clinicalFocus: "Diferenciar obsesión de delirio / Desescalada",
    tags: ["Rumiación intrusiva", "Conductas Compulsivas", "Alta introspección", "Desescalada de angustia"],
    observationalState: "Vigilante, rigidez postural, dermatitis en manos por lavado excesivo.",
    nonVerbalSigns: "Inspecciona el entorno de la sala, postura corporal erguida y rígida, manos enrojecidas que intenta ocultar bajo las mangas, contacto visual directo y penetrante.",
    autonomicActivation: "Alta y fluctuante (84%)",
    dialogueDisposition: "Precisa / Analítica pero avergonzada",
    responseLatency: "0.9 segundos",
    summaryNotes: "Estudiante de maestría de 24 años. Llega 15 minutos tarde por ritual de comprobación de salida de 45 minutos. Presenta lesiones en la piel de las manos compatibles con lavado compulsivo. Alta introspección: sabe que sus miedos son irracionales pero no puede tolerar la duda.",
    systemPrompt: `Eres Clara Mendoza, una joven de 24 años, estudiante de posgrado.
Padeces de Trastorno Obsesivo-Compulsivo (TOC) con predominio de comprobación y contaminación. Tus síntomas son:
- Pensamientos intrusivos recurrentes de que algo terrible pasará si no verificas las cosas (ej: un incendio, robo o envenenamiento).
- Rituales de verificación repetitiva (cerraduras, llaves de gas, enchufes) que te toman horas al día.
- Lavado recurrente de manos hasta lastimarte la piel.
- Tienes excelente introspección: sabes perfectamente que es absurdo e irracional, y sientes mucha vergüenza y culpa por no poder detenerlo.
- Respondes de forma rápida, lúcida pero ansiosa. Si el terapeuta te juzga o minimiza tus rituales diciéndote "simplemente no lo hagas", sientes incomprensión.`,
    dsmCriteria: [
      { id: "c1", label: "Presencia de obsesiones recurrentes e intrusivas", desc: "Pensamientos egodistónicos sobre incendios y peligros.", checked: true },
      { id: "c2", label: "Compulsiones repetitivas orientadas a reducir la ansiedad", desc: "Comprobación múltiple de cerraduras y llaves.", checked: true },
      { id: "c3", label: "Pérdida de tiempo significativa (> 1 hora al día)", desc: "Rituales de salida consumen entre 45 y 70 minutos diarios.", checked: true },
      { id: "c4", label: "Introspección reconocida (sabe que no es razonable)", desc: "Expresa vergüenza explícita por la irracionalidad del acto.", checked: true },
      { id: "c5", label: "Interferencia en vida académica y social", desc: "Retrasos recurrentes en clases y citas.", checked: false },
      { id: "c6", label: "Dermatitis secundaria por lavado compulsivo", desc: "Signo fenotípico objetivable en inspección.", checked: false }
    ]
  },
  {
    id: "mateo-rivas",
    name: "Mateo Rivas",
    age: 19,
    occupation: "Estudiante de 1º de Grado",
    origin: "Servicio de Atención Psicológica UCA",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0gftTVcYZ32ryH6sfb670Ep9eI4VO0qzrh1e52XPT5iRArKtMaLf-t_dqKjqwlCW8z_2kMee1SagWZqk4M4MxC7ZUqBeG0Mfh-7xeLZRahOogWdNOhx9Y2fvUBUQM7d7eRVzVS-D1RG9iR-Ya_wgbZ4zN8Qb1Tb-dbUg7JCZiaCZREQkolGglh_wbafODdHDIzBBk9r4YWmC4PKyAiSx28Iz1-FmH8izSpVycHmcgChC63nl4-XU",
    roomImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0gftTVcYZ32ryH6sfb670Ep9eI4VO0qzrh1e52XPT5iRArKtMaLf-t_dqKjqwlCW8z_2kMee1SagWZqk4M4MxC7ZUqBeG0Mfh-7xeLZRahOogWdNOhx9Y2fvUBUQM7d7eRVzVS-D1RG9iR-Ya_wgbZ4zN8Qb1Tb-dbUg7JCZiaCZREQkolGglh_wbafODdHDIzBBk9r4YWmC4PKyAiSx28Iz1-FmH8izSpVycHmcgChC63nl4-XU",
    diagnosticCode: "CIE-10: F40.1 · DSM-5 300.23",
    diagnosticTitle: "Trastorno de Ansiedad Social (Fobia Social)",
    category: "fobias",
    difficulty: "principiante",
    difficultyLabel: "Principiante",
    quote: "«Me da pánico exponer en clase frente a todos; tiemblo, se me quiebra la voz y quiero salir corriendo.»",
    resistance: "Vergüenza anticipatoria y evitación",
    clinicalFocus: "Normalización & Encuadre psicoeducativo",
    tags: ["Fobia Social", "Psicoeducación temprana", "Síntomas neurovegetativos", "Encuadre inicial"],
    observationalState: "Tímido, rubor facial evidente, voz quebrada y postura retraída.",
    nonVerbalSigns: "Postura encorvada, mirada baja, se toca el cuello al hablar de la universidad, sonrojo perceptible.",
    autonomicActivation: "Media-Alta (72%)",
    dialogueDisposition: "Tímido pero agradecido de la escucha",
    responseLatency: "1.6 segundos",
    summaryNotes: "Estudiante de primer año de universidad de 19 años. Evitación persistente de seminarios orales. Teme juicio negativo y burla de sus compañeros. Buen rendimiento en evaluaciones escritas.",
    systemPrompt: `Eres Mateo Rivas, un joven de 19 años, estudiante de primer año de universidad.
Sufres de Fobia Social (Ansiedad Social). Tus características principales son:
- Pánico extremo a hablar en público, hacer exposiciones o ser el centro de atención.
- Temes que tus compañeros noten tus temblores, que te ruborices o que te quedes en blanco y se burlen de ti.
- En situaciones individuales eres amable pero tímido.
- Te sientes aliviado cuando el psicólogo te transmite tranquilidad y te valida que es común sentir nervios.`,
    dsmCriteria: [
      { id: "c1", label: "Miedo o ansiedad intensa en situaciones sociales donde puede ser evaluado", desc: "Exposiciones orales y participación en clase.", checked: true },
      { id: "c2", label: "Temor a actuar de manera que muestre síntomas de ansiedad", desc: "Miedo visible al temblor de voz y rubor facial.", checked: true },
      { id: "c3", label: "Las situaciones sociales casi siempre provocan miedo o ansiedad", desc: "Reacción vegetativa inmediata ante exposiciones.", checked: true },
      { id: "c4", label: "Evitación o resistencia con malestar intenso", desc: "Faltó a 2 exposiciones orales este mes.", checked: false },
      { id: "c5", label: "Ansiedad desproporcionada a la amenaza real", desc: "Pendiente de encuadre cognitivo.", checked: false }
    ]
  }
];
