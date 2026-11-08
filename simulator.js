// Motor de Simulación Clínica con Inteligencia Artificial - PsicoSim IA
// Diseñado para prácticas supervisadas de entrevistas clínicas (DSM-5 / CIE-10)

const ClinicalSimulator = {

  // Estado conversacional de la sesión (evita repeticiones y rastrea etapas clínicas)
  _sessionContext: {
    patientId: null,
    usedResponseKeys: new Set(),
    intentCounts: {},
    lastIntent: null,
    turnCount: 0
  },

  // Reiniciar contexto conversacional al cambiar de paciente o iniciar nueva sesión
  resetSessionContext(patientId = null) {
    this._sessionContext = {
      patientId: patientId,
      usedResponseKeys: new Set(),
      intentCounts: {},
      lastIntent: null,
      turnCount: 0
    };
  },

  // Normalización lingüística para español clínico (remueve tildes, signos y exceso de espacios)
  normalizeSpanish(text) {
    if (!text) return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[¿?¡!.,;:()\[\]"']/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  },

  // ========================================================
  // 1. ANÁLISIS DE LA INTERVENCIÓN DEL ESTUDIANTE (TERAPEUTA)
  // ========================================================
  analyzeTraineeQuestion(text) {
    const rawClean = (text || "").toLowerCase().trim();
    // Limpiar signos invertidos iniciales para que la detección al inicio del string funcione
    const cleanLeading = rawClean.replace(/^[¿¡"'\s]+/, '').trim();
    const normalized = this.normalizeSpanish(rawClean);
    const normalizedLeading = this.normalizeSpanish(cleanLeading);

    // 1. Detección de preguntas cerradas / inductivas o con sesgo (Leading Questions)
    const isLeading = /(\bverdad\s+que\b|\bcierto\s+que\b|\bno\s+crees\s+que\b|\bseguro\s+que\s+no\b|\bacaso\s+no\b|\bno\s+te\s+parece\s+que\b|\bno\s+es\s+verdad\b|\bno\s+seria\s+que\b|\bseguramente\s+(sientes|te\s+pasa|ocurre)\b|\bobviamente\s+(sientes|crees|te\s+pasa)\b|\bno\s+piensas\s+que\b|\bno\s+sera\s+que\b)/i.test(normalized);

    // 2. Detección de preguntas abiertas exploratorias
    const isOpenRegex = /^(como|que|cuentame|describeme|de que manera|de que forma|explicame|a que te refieres|en que sentido|cual|cuales|hablame|podrias contarme|me gustaria saber|dime|por que razon|que te motiva|que sensaciones|que pensamientos)/i;
    const hasOpenKeywords = normalized.includes('como te') || 
                            normalized.includes('que sientes') || 
                            normalized.includes('cuentame') || 
                            normalized.includes('describeme') || 
                            normalized.includes('explicame') ||
                            normalized.includes('que piensas') ||
                            normalized.includes('en que te puedo');

    const isOpen = !isLeading && (isOpenRegex.test(normalizedLeading) || hasOpenKeywords);

    // 3. Detección de empatía y validación afectiva
    const isEmpathetic = /(\bentiendo\b|\bcomprendo\b|\bcomprensible\b|\bdificil\b|\bagotador\b|\bfrustrante\b|\bte escucho\b|\bdebe ser duro\b|\bnormal que sientas\b|\baqui estoy\b|\btomate tu tiempo\b|\bte acompano\b|\bcuenta conmigo\b|\bsiento mucho\b|\bvaloro tu esfuerzo\b|\bgracias por compartir\b|\bno estas solo\b|\bno estas sola\b|\bpaciencia\b)/i.test(normalized);

    // 4. Detección de paráfrasis o reflejo clínico
    const isParaphrase = /(\bsi entiendo bien\b|\blo que me dices es\b|\ben otras palabras\b|\bparece que\b|\bpor lo que comentas\b|\bme da la impresion\b|\bcorrigeme si me equivoco\b|\bsientes una presion constante\b|\bescucho que\b|\brecuerdo que\b)/i.test(normalized);

    let interventionType = "Pregunta Abierta Exploratoria";
    let rapportDelta = 3;

    if (isLeading) {
      interventionType = "Pregunta Inductiva (Sesgo Potencial)";
      rapportDelta = -4;
    } else if (isEmpathetic && isOpen) {
      interventionType = "Validación Afectiva + Pregunta Abierta";
      rapportDelta = 6;
    } else if (isEmpathetic) {
      interventionType = "Validación Afectiva / Escucha Activa";
      rapportDelta = 5;
    } else if (isParaphrase) {
      interventionType = "Paráfrasis / Reflejo Clínico";
      rapportDelta = 4;
    } else if (!isOpen && (rawClean.startsWith('¿') || rawClean.endsWith('?') || normalizedLeading.startsWith('es') || normalizedLeading.startsWith('tiene') || normalizedLeading.startsWith('tienes') || normalizedLeading.startsWith('ha'))) {
      interventionType = "Pregunta Cerrada";
      rapportDelta = 1;
    }

    return {
      isOpen,
      isLeading,
      isEmpathetic,
      isParaphrase,
      interventionType,
      rapportDelta,
      normalized
    };
  },

  // ========================================================
  // 2. DETECCIÓN SEMÁNTICA DE INTENCIONES CLÍNICAS
  // ========================================================
  detectClinicalIntent(normalizedText, analysis) {
    const t = normalizedText;

    // Prioridad 1: Cribado de riesgo autolítico / Suicidio (Mandatorio en evaluación clínica)
    if (t.includes('hacerte dano') || t.includes('quitarte la vida') || t.includes('suicidi') ||
        t.includes('ideas de muerte') || t.includes('no vale la pena vivir') || t.includes('desaparecer') ||
        t.includes('dormir y no despertar') || t.includes('morirte') || t.includes('morir') ||
        t.includes('acabar con todo') || t.includes('atentar contra tu vida') || t.includes('pensado en matarte')) {
      return 'suicide_risk';
    }

    // Prioridad 2: Cierre de sesión y despedida
    if (t.includes('terminar por hoy') || t.includes('dejamos por hoy') || t.includes('dejamos aqui') ||
        t.includes('hasta luego') || t.includes('proxima sesion') || t.includes('proxima semana') ||
        t.includes('nos vemos el') || t.includes('nos vemos la proxima') || t.includes('terminamos la consulta') ||
        t.includes('tiempo cumplido') || t.includes('adios') || t.includes('hasta pronto') || t.includes('por hoy terminamos')) {
      return 'farewell';
    }

    // Prioridad 3: Saludo combinado con exploración de motivo de consulta
    const hasGreetingWord = /(\bhola\b|\bbuenos dias\b|\bbuenas tardes\b|\bbuenas noches\b|\bbienvenido\b|\bbienvenida\b|\bque tal\b|\bcomo te va\b)/i.test(t);
    const hasReasonWord = /(\bmotivo\b|\bte trae\b|\bpor que vienes\b|\bque te pasa\b|\bque te ocurre\b|\bte ha motivado\b|\ben que puedo ayudarte\b|\bcomo te puedo ayudar\b|\bque te preocupa\b|\ben que te puedo colaborar\b)/i.test(t);

    if (hasGreetingWord && hasReasonWord) {
      return 'greeting_and_reason';
    }

    // Prioridad 4: Saludo puro / apertura cordial
    if (hasGreetingWord && t.split(' ').length <= 6) {
      return 'greeting';
    }

    // Prioridad 5: Motivo de consulta explícito
    if (hasReasonWord || t.includes('por que estas aqui') || t.includes('que te ha traido') || t.includes('cual es el problema')) {
      return 'reason_for_consultation';
    }

    // Prioridad 6: Pregunta Inductiva / Sesgada (reaccionar al sesgo)
    if (analysis.isLeading) {
      return 'leading_bias';
    }

    // Prioridad 7: Antecedentes médicos, psiquiátricos, sustancias, medicamentos, café
    if (t.includes('medicacion') || t.includes('medicamento') || t.includes('pastillas') || t.includes('farmaco') ||
        t.includes('ansiolitico') || t.includes('antidepresivo') || t.includes('lorazepam') || t.includes('escitalopram') ||
        t.includes('analitica') || t.includes('medico general') || t.includes('medico de cabecera') || t.includes('cardiologo') ||
        t.includes('cafe') || t.includes('cafeina') || t.includes('alcohol') || t.includes('cerveza') || t.includes('drogas') ||
        t.includes('antecedentes') || t.includes('alguien en tu familia')) {
      return 'medication_substances';
    }

    // Prioridad 8: Temporalidad y cronología
    if (t.includes('cuando empezo') || t.includes('hace cuanto') || t.includes('desde cuando') ||
        t.includes('cuanto tiempo') || t.includes('cuando comenzo') || t.includes('inicio de los sintomas') ||
        t.includes('primer episodio') || t.includes('detonante') || t.includes('desencadenante') ||
        t.includes('empeorado') || t.includes('cuantos meses') || t.includes('cuantos dias')) {
      return 'timeline';
    }

    // Prioridad 9: Sueño, descanso y alimentación
    if (t.includes('dormir') || t.includes('sueno') || t.includes('insomnio') || t.includes('despertar') ||
        t.includes('despiertas') || t.includes('pesadillas') || t.includes('descanso') ||
        t.includes('apetito') || t.includes('comida') || t.includes('comer') || t.includes('alimentacion') || t.includes('peso')) {
      return 'sleep_habits';
    }

    // Prioridad 10: Rituales y obsesiones específicas (TOC - Clara Mendoza)
    if (t.includes('lavar') || t.includes('lavarte') || t.includes('manos') || t.includes('jabon') ||
        t.includes('gas') || t.includes('estufa') || t.includes('cerradura') || t.includes('llave') ||
        t.includes('puerta') || t.includes('comprobar') || t.includes('verificar') || t.includes('ritual') ||
        t.includes('series de tres') || t.includes('enchufes') || t.includes('contaminacion') || t.includes('germenes')) {
      return 'rituals_checking';
    }

    // Prioridad 11: Situaciones de ansiedad social específicas (Fobia Social - Mateo Rivas)
    if (t.includes('exponer') || t.includes('hablar en publico') || t.includes('audiencia') ||
        t.includes('presentacion') || t.includes('atril') || t.includes('mirar') || t.includes('se burlen') ||
        t.includes('quedar en blanco') || t.includes('rojo') || t.includes('rubor') || t.includes('ridiculo')) {
      return 'social_anxiety_situations';
    }

    // Prioridad 12: Síntomas somáticos / físicos y neurovegetativos
    if (t.includes('cuerpo') || t.includes('sintomas fisicos') || t.includes('fisicamente') ||
        t.includes('pecho') || t.includes('opresion') || t.includes('taquicardia') || t.includes('palpitaciones') ||
        t.includes('corazon') || t.includes('respiracion') || t.includes('falta de aire') || t.includes('ahogo') ||
        t.includes('aire') || t.includes('estomago') || t.includes('nudo') || t.includes('mareos') ||
        t.includes('mareo') || t.includes('vertigo') || t.includes('tension muscular') || t.includes('cuello') ||
        t.includes('mandibula') || t.includes('temblor') || t.includes('sudor') || t.includes('sudoracion') || t.includes('sensaciones')) {
      return 'somatic_symptoms';
    }

    // Prioridad 13: Pensamientos automáticos, cognición y temores
    if (t.includes('que pensamientos') || t.includes('que pasa por tu mente') || t.includes('que pasa por tu cabeza') ||
        t.includes('que piensas') || t.includes('te dices a ti mism') || t.includes('catastrofe') ||
        t.includes('peor escenario') || t.includes('miedo a que') || t.includes('que temes') ||
        t.includes('duda') || t.includes('preocupaciones') || t.includes('crees que pasara')) {
      return 'cognition_thoughts';
    }

    // Prioridad 14: Estado de ánimo, afecto y emociones
    if (t.includes('animo') || t.includes('tristeza') || t.includes('triste') || t.includes('miedo') ||
        t.includes('angustia') || t.includes('vacio') || t.includes('desgana') || t.includes('culpa') ||
        t.includes('desesperanza') || t.includes('rabia') || t.includes('frustracion') || t.includes('soledad') ||
        t.includes('verguenza') || t.includes('como te sientes')) {
      return 'emotions_affect';
    }

    // Prioridad 15: Área laboral / académica
    if (t.includes('trabajo') || t.includes('laboral') || t.includes('oficina') || t.includes('profesion') ||
        t.includes('arquitecta') || t.includes('estudio') || t.includes('coordinadora') || t.includes('proyectos') ||
        t.includes('delegar') || t.includes('profesor') || t.includes('instituto') || t.includes('dar clase') ||
        t.includes('alumnos') || t.includes('posgrado') || t.includes('maestria') || t.includes('laboratorio') ||
        t.includes('tesis') || t.includes('universidad') || t.includes('carrera') || t.includes('grado') ||
        t.includes('facultad') || t.includes('clases') || t.includes('rendimiento')) {
      return 'work_academic';
    }

    // Prioridad 16: Área familiar, pareja y social
    if (t.includes('familia') || t.includes('pareja') || t.includes('novio') || t.includes('novia') ||
        t.includes('esposo') || t.includes('esposa') || t.includes('marido') || t.includes('mujer') ||
        t.includes('carmen') || t.includes('carlos') || t.includes('hijos') || t.includes('amigos') ||
        t.includes('companeros') || t.includes('padres') || t.includes('mama') || t.includes('papa') ||
        t.includes('vivir sola') || t.includes('vives sola') || t.includes('vives con') || t.includes('piso compartido') ||
        t.includes('aislamiento') || t.includes('vida social')) {
      return 'social_family';
    }

    // Prioridad 17: Datos demográficos cerrados (nombre, edad)
    if (t.includes('como te llamas') || t.includes('tu nombre') || t.includes('cuantos anos tienes') || t.includes('tu edad')) {
      return 'demographics_closed';
    }

    // Prioridad 18: Profundización o continuación pedagógica ("cuéntame más", "continúa", etc.)
    if (t.includes('cuentame mas') || t.includes('explicame mas') || t.includes('hablame mas') ||
        t.includes('continua') || t.includes('te escucho') || t.includes('profundiza') ||
        t.includes('dime mas') || t.includes('describeme con mas detalle')) {
      return 'deepening';
    }

    // Prioridad 19: Validación empática o paráfrasis pura
    if (analysis.isEmpathetic || analysis.isParaphrase) {
      return 'empathy_validation';
    }

    // Por defecto: Reflexión clínica general de caso
    return 'general_reflection';
  },

  // ========================================================
  // 3. BASE DE CONOCIMIENTO CLÍNICO Y DIÁLOGOS DE CASOS
  // ========================================================
  _PATIENT_DIALOGUES: {

    // ------------------------------------------------------
    // CASO 1: ELENA MORALES (TAG - CIE-10 F41.1 / DSM-5 300.02)
    // ------------------------------------------------------
    'elena-morales': {
      greeting_and_reason: [
        {
          reply: "Hola doctora, buenos días... Muchas gracias por recibirme. La verdad vengo un poco nerviosa... Estoy aquí porque mi médico de cabecera me insistió mucho. Desde que me nombraron coordinadora en el estudio de arquitectura hace cuatro meses siento una opresión brutal en el pecho y taquicardias que no me dejan dormir. Me dijo que mi corazón está sano y que necesito ayuda con la ansiedad.",
          signs: "Cruza las manos sobre el regazo frotándose los dedos continuamente, con respiración torácica alta y acelerada."
        },
        {
          reply: "Hola... Sí, doctora, aquí estoy. Como le decía, vengo buscando entender por qué mi cuerpo no puede apagar esta alarma continua. Me asusta mucho sentir que en cualquier momento voy a perder el control.",
          signs: "Asiente despacio, acomodándose en la silla con tensión evidente en el cuello."
        }
      ],
      greeting: [
        {
          reply: "Hola doctora, buenos días... Gracias por recibirme. Para serle sincera, me siento bastante tensa ahora mismo; nunca había estado en una consulta psicológica y no sé bien por dónde empezar.",
          signs: "Sonríe tímidamente con tensión en la mandíbula y desvía la mirada hacia el suelo."
        },
        {
          reply: "Buenos días... Sí, aquí estoy, tratando de calmarme un poco. En la sala de espera sentía el corazón acelerado, pero ya estoy un poco más tranquila.",
          signs: "Exhala despacio y apoya las manos sobre las rodillas."
        }
      ],
      reason_for_consultation: [
        {
          reply: "Vengo porque mi médico general me derivó. Me dijo que los mareos y la falta de aire no son un problema del corazón, sino pura ansiedad. Desde que me ascendieron en el trabajo siento una presión insoportable; no puedo dejar de pensar que algo catastrófico va a pasar y que todo se va a derrumbar por mi culpa.",
          signs: "Se lleva la mano al esternón, respirando de manera rápida y superficial."
        },
        {
          reply: "El motivo principal es que ya no puedo frenar las preocupaciones. Mi mente está siempre en el peor escenario posible y siento que si me descuido un segundo, voy a cometer un error irreparable en la oficina.",
          signs: "Tono de voz apresurado y vacilante."
        }
      ],
      timeline: [
        {
          reply: "Empezó hace unos cuatro meses, justo cuando me ascendieron a coordinadora de proyectos en el estudio de arquitectura. Al principio pensé que era estrés temporal por la nueva responsabilidad, pero con las semanas empeoró hasta convertirse en este estado de alarma permanente que no me deja ni los fines de semana.",
          signs: "Toca su cuello con la mano derecha, mostrando tensión en el trapecio."
        },
        {
          reply: "Al principio intentaba compensarlo quedándome más horas en el estudio, pero hace unas cinco semanas empezaron los despertares a las tres de la mañana con taquicardias y ahí me di cuenta de que esto se me escapó de las manos.",
          signs: "Frunce el ceño con angustia y aprieta los puños sobre el regazo."
        }
      ],
      somatic_symptoms: [
        {
          reply: "Siento como si tuviera un bloque de cemento encima del pecho que me impide respirar profundo. Además, tengo mareos frecuentes, contracturas en el cuello y la espalda, y aprieto tanto la mandíbula al dormir que amanezco con dolor de cabeza.",
          signs: "Presiona su pecho con la palma de la mano, inhalando de forma visiblemente forzada."
        },
        {
          reply: "Es una sensación continua de taquicardia y vacío en el estómago, como el sobresalto que sientes cuando vas a tener un accidente, pero sostenido durante horas sin motivo real.",
          signs: "Manos inquietas que se frotan continuamente contra el pantalón."
        }
      ],
      cognition_thoughts: [
        {
          reply: "Mi mente no para de imaginar los peores escenarios posibles. Si entrego un plano o un cálculo, me convenzo de que cometí un error garrafal, que la estructura va a fallar o que el cliente nos va a demandar. Sé racionalmente que soy competente, pero la duda catastrófica me devora.",
          signs: "Mirada fija y angustiada, ritmo de habla apresurado."
        },
        {
          reply: "Pienso constantemente en listas de catástrofes: '¿Y si mañana se cae el proyecto? ¿Y si me despiden? ¿Y si no doy la talla?'. Es una rumiación que no puedo silenciar ni un solo minuto del día.",
          signs: "Mueve la cabeza de un lado a otro con frustración contenida."
        }
      ],
      sleep_habits: [
        {
          reply: "Me acuesto agotada y me duermo relativamente rápido, pero invariablemente a las 3:00 o 3:30 de la madrugada me despierto en seco. El corazón me late a mil por hora y la cabeza empieza a girar con correos pendientes y temores. Ya no logro volver a conciliar el sueño.",
          signs: "Párpados cansados, mirada tensa y fija hacia adelante."
        },
        {
          reply: "En cuanto al apetito, casi no tengo hambre por las mañanas; el nudo en el estómago no me deja pasar bocado hasta bien entrada la tarde.",
          signs: "Se toca el epigastrio haciendo un gesto de incomodidad estomacal."
        }
      ],
      work_academic: [
        {
          reply: "Trabajo como arquitecta técnica y coordino un equipo de seis personas. Mi mayor dificultad es delegar: siento que si no superviso cada mínimo detalle yo misma tres veces, alguien cometerá un error fatal. Me quedo trabajando hasta las nueve de la noche revisando cosas que ya revisaron otros.",
          signs: "Postura erguida y rígida, gesticula con insistencia."
        },
        {
          reply: "En el estudio todos me ven como alguien muy resolutiva y perfeccionista, pero por dentro siento que soy un fraude y que en cualquier momento se darán cuenta de que no puedo con todo este peso.",
          signs: "Baja la vista con timidez y voz más apagada."
        }
      ],
      social_family: [
        {
          reply: "Vivo con Carlos, mi pareja desde hace cuatro años. Él intenta apoyarme, pero siento que ya lo estoy desgastando con mis quejas y mi mal humor continuo. Siempre me ve preocupada o irritable, y casi no tenemos momentos de descanso juntos.",
          signs: "Tono de voz apagado, baja la vista con sentimiento de culpa."
        },
        {
          reply: "Con mis amigos me he ido distanciando. Los fines de semana cancelo salidas porque siento que no puedo desconectar del trabajo o porque me siento demasiado exhausta para fingir que estoy bien.",
          signs: "Suspira con tristeza y cruza los brazos."
        }
      ],
      suicide_risk: [
        {
          reply: "No, doctora, para nada. La muerte me da muchísimo miedo y jamás atentaría contra mi vida. Lo único que quiero con desesperación es apagar esta alarma interna, dejar de sentir esta angustia en el cuerpo y volver a tener paz mental.",
          signs: "Niega con firmeza con la cabeza, manteniendo contacto ocular sincero y aliviado de aclararlo."
        }
      ],
      medication_substances: [
        {
          reply: "El médico de cabecera me mandó análisis completos, tiroides y electrocardiograma; todo salió normal. Me recetó lorazepam en caso de crisis, pero me da miedo crear adicción y casi no lo he tomado. Lo que sí tomo son 4 o 5 cafés al día para combatir el sueño, aunque sé que me acelera más.",
          signs: "Se acomoda la blusa y admite con cierto pudor lo del consumo excesivo de café."
        }
      ],
      leading_bias: [
        {
          reply: "Bueno... si usted lo dice así, supongo que sí... pero me hace sentir más nerviosa pensarlo de esa forma. Siento que todo se me va a escapar de las manos en cualquier momento.",
          signs: "Se remueve incómoda en la silla, cruza los brazos y desvía la mirada hacia el suelo."
        }
      ],
      empathy_validation: [
        {
          reply: "Gracias por decirme eso, doctora... La verdad es que casi nadie lo entiende; en mi casa me dicen que me relaje o que me tome una tila, pero la opresión en el pecho sigue ahí, como una alarma que nunca se apaga.",
          signs: "Exhala profundamente, afloja un poco los hombros y asiente con una expresión de alivio."
        },
        {
          reply: "Sentir que no me juzga me ayuda a respirar un poco más hondo. Es agotador fingir todo el día que tengo todo bajo control cuando por dentro siento que me derrumbo.",
          signs: "Relaja visiblemente la postura corporal y apoya la espalda en el respaldo."
        },
        {
          reply: "Agradezco mucho que me escuche con tanta calma. Es la primera vez en meses que puedo soltar esta carga sin sentir que estoy siendo una quejica.",
          signs: "Sonríe con gratitud y sus ojos se humedecen levemente."
        }
      ],
      farewell: [
        {
          reply: "Muchas gracias por escucharme hoy, doctora. La verdad es que me siento un poco más aliviada después de haber podido contar todo esto sin sentirme juzgada. Nos vemos en la próxima sesión.",
          signs: "Sonríe suavemente, relaja la postura corporal y asiente con gratitud."
        }
      ],
      demographics_closed: [
        {
          reply: "Tengo 32 años y soy arquitecta técnica, como le comentaba al inicio.",
          signs: "Contacto visual directo y breve asentimiento."
        }
      ],
      deepening: [
        {
          reply: "Es como si viviera en un simulacro de emergencia continuo... Sé que objetivamente mi vida está bien, pero mi cuerpo reacciona como si estuviéramos en peligro inminente. Me da pánico perder el control.",
          signs: "Abre las palmas de las manos en gesto de impotencia."
        }
      ],
      general_reflection: [
        {
          reply: "A veces intento convencerme de que exagero, pero es más fuerte que yo. No puedo parar de imaginar los peores escenarios posibles en cada proyecto que entrego.",
          signs: "Manos inquietas frotándose continuamente sobre el regazo."
        },
        {
          reply: "Lo que más me duele es no poder disfrutar de las cosas buenas que he logrado. Todo se siente como una amenaza latente.",
          signs: "Baja la mirada pensativa, mordiéndose levemente el labio."
        }
      ]
    },

    // ------------------------------------------------------
    // CASO 2: JAVIER ORTIZ (DEPRESIÓN MAYOR - CIE-10 F32.1 / DSM-5 296.22)
    // ------------------------------------------------------
    'javier-ortiz': {
      greeting_and_reason: [
        {
          reply: "Buenos días... disculpe si hablo despacio. Estoy aquí porque toqué fondo hace tres semanas. Iba a entrar al instituto a dar clase de historia, pero me quedé paralizado en el coche llorando sin poder moverme. Mi médico de familia me dio la baja y mi mujer me insistió en que no podía seguir hundiéndome en este pozo solo.",
          signs: "Entra arrastrando levemente los pies, se sienta pesadamente, hombros caídos y mirada fija en el suelo."
        },
        {
          reply: "Buenos días... sí, aquí estoy de nuevo. Como le decía, vengo buscando alguna forma de salir de esta pesadez porque siento que me he convertido en una sombra de lo que era.",
          signs: "Suspira hondo y mantiene la cabeza inclinada hacia abajo."
        }
      ],
      greeting: [
        {
          reply: "Buenos días... gracias. Me costó mucho reunir la energía para vestirme y salir de casa hoy... pero bueno, aquí estoy.",
          signs: "Voz baja y monótona, contacto visual mínimo de un par de segundos."
        },
        {
          reply: "Buenos días... si le soy sincero, no tengo mucha energía hoy, pero agradezco que me reciba.",
          signs: "Asiente lentamente con la cabeza gacha."
        }
      ],
      reason_for_consultation: [
        {
          reply: "Vengo porque ya no reconozco a la persona que veo en el espejo. Hace tres semanas no pude bajarme del coche para entrar a mi colegio; me quedé bloqueado, llorando como un niño sin saber por qué. No tengo energía, no tengo ganas de nada y siento que soy un estorbo para mi familia.",
          signs: "Apoya los codos en las rodillas y se frota la frente con cansancio extremo."
        },
        {
          reply: "Estoy aquí porque mi esposa Carmen ya no sabe qué hacer conmigo. Paso los días mirando el techo, sin ilusión por nada, y el médico me dijo que esto es una depresión severa.",
          signs: "Tono apesadumbrado y pausas largas entre palabras."
        }
      ],
      timeline: [
        {
          reply: "Esto empezó a gestarse hace unos seis meses, a mitad del curso escolar. Al principio pensé que solo era cansancio acumulado, pero con los meses la desgana se comió todo, hasta el colapso de hace tres semanas en el coche.",
          signs: "Pausa prolongada de silencio antes de responder, habla con lentitud."
        },
        {
          reply: "Antes disfrutaba preparando mis clases y leyendo. Desde hace un par de meses, cada mañana al abrir los ojos sentía que tenía que empujar una pared de hormigón solo para levantarme.",
          signs: "Baja los brazos a los lados de la silla con laxitud y pesadez motora."
        }
      ],
      somatic_symptoms: [
        {
          reply: "Siento una pesadez física tremenda, como si llevara una armadura de plomo sobre el cuerpo. Las piernas me pesan, me cuesta dar cada paso, y tengo una opresión sorda en el centro del pecho que no se me quita en todo el día.",
          signs: "Movimientos extremadamente lentos, respiración pausada y pesada."
        },
        {
          reply: "He perdido por completo el apetito; la comida no me sabe a nada, como si masticara cartón. He bajado casi cuatro kilos en este último mes sin proponérmelo.",
          signs: "Muestra su cinturón holgado con una leve mueca de desgana."
        }
      ],
      emotions_affect: [
        {
          reply: "No es solo tristeza, es una anestesia emocional total... No siento nada, es un vacío plano. Mis hijos me cuentan algo bueno que les pasó en la escuela y no logro alegrarme, y eso me hace sentir una culpa insoportable.",
          signs: "Se le humedecen los ojos pero contiene el llanto, tragando saliva con dificultad."
        },
        {
          reply: "Siento una desesperanza muy profunda. Tengo la convicción irracional de que esto no va a mejorar nunca, que ya se me apagó el motor y que solo estoy ocupando espacio.",
          signs: "Mirada perdida hacia el rincón de la sala."
        }
      ],
      sleep_habits: [
        {
          reply: "Duermo muy mal. Me meto en la cama a las nueve de la noche porque no quiero estar despierto, pero a las cuatro de la madrugada mis ojos se abren y empieza esa angustia fría en el pecho. Me quedo mirando el techo hasta el amanecer.",
          signs: "Ojeras muy pronunciadas y párpados caídos."
        },
        {
          reply: "Hay días en los que no salgo de la cama en 14 horas. Despertar y saber que tengo que enfrentar otro día entero se siente como escalar una montaña con los ojos vendados.",
          signs: "Niega lentamente con la cabeza, expresión facial hipomímica."
        }
      ],
      work_academic: [
        {
          reply: "Llevo 18 años siendo profesor de historia en secundaria. Me encantaba mi oficio, conectaba muy bien con los chicos... pero en estos últimos meses el ruido me taladraba la cabeza, no podía corregir un examen y sentía que les estaba arruinando la educación.",
          signs: "Aprieta las manos con culpa contenida."
        },
        {
          reply: "Actualmente estoy de baja médica por depresión mayor. Cada vez que pienso en volver al aula siento un vacío de pánico y vergüenza ante mis compañeros y directivos.",
          signs: "Suspira profundamente, agachando la cabeza."
        }
      ],
      social_family: [
        {
          reply: "Mi esposa Carmen es maravillosa y ha tenido una paciencia de santa, pero veo en sus ojos la preocupación y el desgaste. Siento que me he convertido en un peso muerto para ella; me ve sentado en el sofá mirando la pared durante horas.",
          signs: "Tono de voz quebrado al nombrar a su esposa."
        },
        {
          reply: "Con mis amigos he cortado todo contacto. No contesto llamadas ni mensajes de WhatsApp. No tengo ganas de fingir que estoy bien ni de escuchar consejos de que 'tengo que poner de mi parte'.",
          signs: "Encoge los hombros con apatía."
        }
      ],
      suicide_risk: [
        {
          reply: "No tengo un plan ni me haría daño activamente... por mis hijos y por Carmen jamás cometería una locura. Pero si le soy completamente sincero... a veces cuando me acuesto desearía no despertar mañana. Siento que sin mí tendrían una carga menos que soportar.",
          signs: "Baja la cabeza, habla en un susurro cargado de dolor y dolorosa sinceridad."
        }
      ],
      medication_substances: [
        {
          reply: "El médico de cabecera me recetó escitalopram de 10 mg hace dos semanas cuando me dio la baja. Me dijo que tardaría entre tres y cuatro semanas en hacer algún efecto. Por ahora solo noto náuseas leves y boca seca. No consumo alcohol ni ninguna otra cosa.",
          signs: "Saca un pañuelo arrugado del bolsillo y se seca las manos despacio."
        }
      ],
      leading_bias: [
        {
          reply: "...Supongo. Si le soy sincero, no tengo energía para discutirlo. Si usted cree que es así, qué más da... todo me da igual últimamente.",
          signs: "Suspira con lentitud, hombros completamente caídos, contacto visual nulo."
        }
      ],
      empathy_validation: [
        {
          reply: "Agradezco su paciencia... Mi familia me dice que 'ponga de mi parte', pero no entienden que no es falta de ganas, es que por dentro me siento completamente vacío, como si se me hubiera apagado el motor.",
          signs: "Levanta levemente la mirada, asiente con lentitud."
        },
        {
          reply: "Se agradece el tono con el que me habla... No suelo encontrar paciencia allá afuera. Estar aquí sentado ya es un esfuerzo enorme para mí.",
          signs: "Relaja levemente los hombros caídos."
        },
        {
          reply: "Me ayuda que me dé mi espacio sin exigirme que sonría o me anime. Por primera vez en mucho tiempo no me siento juzgado.",
          signs: "Asiente en silencio con un leve gesto de agradecimiento."
        }
      ],
      farewell: [
        {
          reply: "Gracias por su tiempo y por no apurarme a hablar... Se agradece poder estar en un sitio donde no me exigen que sonría. Volveré la semana próxima.",
          signs: "Se levanta con lentitud, estrecha la mano con timidez y asiente con respeto."
        }
      ],
      demographics_closed: [
        {
          reply: "Tengo 45 años y soy profesor de historia en secundaria.",
          signs: "Breve asentimiento con mirada cansada."
        }
      ],
      deepening: [
        {
          reply: "Es como si el mundo siguiera corriendo en colores y yo me hubiera quedado atrapado en una película en blanco y negro, sin sonido y sin combustible.",
          signs: "Permanece inmóvil en el asiento, con los brazos caídos."
        }
      ],
      general_reflection: [
        {
          reply: "Me cuesta levantarme de la cama cada mañana. Despertar y saber que tengo que enfrentar otro día entero se siente como escalar una montaña con una roca a cuestas.",
          signs: "Respiración pausada y pesada."
        },
        {
          reply: "No le encuentro sentido a las cosas que antes me daban vida. Siento que solo estoy dejando pasar las horas.",
          signs: "Mirada perdida hacia el suelo, manos inmóviles en las rodillas."
        }
      ]
    },

    // ------------------------------------------------------
    // CASO 3: CLARA MENDOZA (TOC - CIE-10 F42.8 / DSM-5 300.3)
    // ------------------------------------------------------
    'clara-mendoza': {
      greeting_and_reason: [
        {
          reply: "Hola, buenos días doctora... Disculpe si llego algo agitada. Tuve que regresar dos veces a verificar que la hornilla del gas y la cerradura estuvieran bien cerradas... Vengo porque ya no puedo más con esto; paso dos horas al día comprobando cosas y lavándome las manos, y siento que voy a perder mi posgrado.",
          signs: "Se sienta muy erguida, oculta sus manos agrietadas bajo las mangas de su abrigo y pestañea rápido."
        },
        {
          reply: "Hola... sí, aquí estoy. Como le decía, vengo buscando ayuda para frenar esta necesidad absurda de comprobar todo antes de que ocurra una catástrofe.",
          signs: "Ajusta la posición de su bolso con rigidez milimétrica."
        }
      ],
      greeting: [
        {
          reply: "Hola, buenos días... Gracias por recibirme. La verdad vengo un poco avergonzada de tener que hablar de estas cosas, pero sé que necesito ayuda.",
          signs: "Sonrisa tensa, mirada analítica que recorre la habitación y se fija en el escritorio."
        },
        {
          reply: "Buenos días... disculpe si parezco inquieta, todavía estoy bajando los nervios del trayecto.",
          signs: "Ajusta sus mangas con rapidez y postura corporal tensa."
        }
      ],
      reason_for_consultation: [
        {
          reply: "Estoy aquí porque mis rituales de comprobación y limpieza me están robando la vida. No puedo salir de casa sin verificar la cerradura, los enchufes y el gas en series de tres hasta llegar a nueve. Si algo me distrae, tengo que empezar de nuevo. Sé perfectamente que es absurdo, pero la duda me quema por dentro.",
          signs: "Articula con rapidez y lucidez, pero con evidente tensión motora."
        },
        {
          reply: "Vengo porque siento que estoy viviendo secuestrada por mi propia mente. Si no hago las comprobaciones, el nivel de angustia es tan insoportable que siento que voy a volverme loca.",
          signs: "Gesticula con precisión, mandíbula apretada."
        }
      ],
      timeline: [
        {
          reply: "De adolescente siempre fui perfeccionista y ordenada, pero desde que me mudé sola a hacer la maestría hace ocho meses, la presión se disparó. Hace dos meses las comprobaciones pasaron de ser de 10 minutos a consumir casi dos horas diarias.",
          signs: "Pasa los dedos sobre la costura de su pantalón de manera repetitiva."
        },
        {
          reply: "El punto de quiebre fue hace dos semanas: llegué una hora tarde a una presentación de mi tesis en el laboratorio porque tuve que volver desde la estación de metro a tocar la estufa para asegurarme de que no explotaría el edificio.",
          signs: "Se ruboriza de impotencia y aprieta los labios."
        }
      ],
      rituals_checking: [
        {
          reply: "Llego a lavarme las manos hasta que me sangran con agua hirviendo si toco algo que siento que está contaminado. Y con la puerta de casa, tengo que girar la llave en series de tres hasta llegar a nueve; si me desconcentro, tengo que empezar de nuevo.",
          signs: "Oculta las manos debajo de la mesa con evidente rubor y pudor."
        },
        {
          reply: "Con los enchufes y la llave del gas es igual: tengo que mirarlos, tocarlos y decir en voz alta 'está apagado, está apagado, está apagado' tres veces. Si no lo hago, la imagen de un incendio me asalta en la cabeza.",
          signs: "Pestañeo rápido y postura defensiva."
        }
      ],
      somatic_symptoms: [
        {
          reply: "Mire mis manos... las tengo enrojecidas, agrietadas y me arden porque me las lavo con jabón fuerte y agua casi hirviendo cada vez que siento que toqué algo contaminado. Y en el cuerpo siento una taquicardia brutal y sudor frío cada vez que me asalta la duda de si cerré bien la puerta.",
          signs: "Muestra brevemente el dorso de sus manos rojas y lastimadas antes de esconderlas de nuevo."
        },
        {
          reply: "Físicamente es agotador. Termino con dolor en los nudillos de tanto girar pomos de puertas e inspeccionar enchufes, y la cabeza me duele por la tensión constante de no cometer errores.",
          signs: "Sacude suavemente las manos con gesto de dolor en la piel."
        }
      ],
      cognition_thoughts: [
        {
          reply: "Lo peor es que mi parte racional sabe que es una locura: sé que apagué la estufa, sé que cerré con llave... Pero en cuanto pongo un pie en la calle, entra el pensamiento intrusivo: '¿Y si esta vez no lo hiciste? ¿Y si explota el edificio y mueren personas por tu culpa?'. Esa duda es intolerable.",
          signs: "Contacto visual muy intenso, enfatiza cada palabra con desesperación lúcida."
        },
        {
          reply: "Es como tener a un dictador en la cabeza que me amenaza con catástrofes gigantescas si no hago los rituales en múltiplos de tres. La culpa anticipatoria de ser responsable de una desgracia no me deja vivir.",
          signs: "Se lleva las manos a la cabeza con expresión de agobio."
        }
      ],
      sleep_habits: [
        {
          reply: "Duermo muy pocas horas. La rutina de irme a la cama me toma casi una hora porque tengo que verificar todos los grifos, las ventanas y las puertas. Y a mitad de la noche me despierto angustiada pensando si desconecté la cafetera y tengo que levantarme a revisar.",
          signs: "Párpados cansados y tensión periorbitaria."
        },
        {
          reply: "El apetito lo mantengo bien, pero cocinar me cuesta porque me obsesiona limpiar las encimeras tres veces antes y después de manipular alimentos.",
          signs: "Asiente con una media sonrisa amarga."
        }
      ],
      work_academic: [
        {
          reply: "Hago una maestría en biotecnología. En el laboratorio es un infierno porque gasto frascos enteros de alcohol desinfectando mis materiales por miedo a arruinar un cultivo. Mis compañeros ya me miran raro y mi director me llamó la atención por los retrasos.",
          signs: "Tono de voz angustiado al hablar de su carrera."
        },
        {
          reply: "Tengo un promedio excelente, pero me está costando el doble de tiempo terminar los informes porque releo cada página diez veces buscando errores que no existen.",
          signs: "Suspira frustrada, apretando la mandíbula."
        }
      ],
      social_family: [
        {
          reply: "Vivo con una compañera de piso y la convivencia se está volviendo insostenible. Le exijo que no deje nada fuera de lugar y que desinfecte las zonas comunes. Ella se siente controlada y tiene toda la razón, pero yo no puedo evitarlo.",
          signs: "Baja la mirada con vergüenza evidente."
        },
        {
          reply: "No tengo pareja y casi no salgo con amigos. Me daría pavor que alguien viniera a mi casa y viera cómo verifico las cerraduras o las marcas en mis manos. Prefiero aislarme para no pasar vergüenza.",
          signs: "Cruza las piernas y se repliega sobre sí misma."
        }
      ],
      suicide_risk: [
        {
          reply: "No, doctora, para nada. Jamás me haría daño a mí misma. Al contrario, mi mayor pánico es causar daño accidental a otras personas o ser responsable de una muerte por descuido. Quiero recuperar mi libertad mental, no quitarme la vida.",
          signs: "Niega categóricamente con la cabeza y mirada firme."
        }
      ],
      medication_substances: [
        {
          reply: "Solo uso una crema con corticoides que me recetó el dermatólogo para las lesiones de las manos. Nunca he tomado medicación psiquiátrica ni consumo alcohol o drogas. Mi padre siempre ha sido muy maniático con el orden de las herramientas, pero nunca fue diagnosticado de nada.",
          signs: "Se mira los dedos con disgusto por la dermatitis."
        }
      ],
      leading_bias: [
        {
          reply: "No es que crea que soy una loca... Sé perfectamente que la probabilidad es mínima, pero el pensamiento llega y la angustia me desborda. Si no lo compruebo, siento que la culpa de la catástrofe será mía.",
          signs: "Tono defensivo, postura corporal muy rígida, ajusta sus mangas."
        }
      ],
      empathy_validation: [
        {
          reply: "Me alivia escuchar que no me juzga. Me da mucha vergüenza contar esto... Mis compañeros de posgrado piensan que soy muy perfeccionista, pero no saben el infierno que es salir de casa y tener que regresar cuatro veces a tocar la estufa.",
          signs: "Relaja un poco la mandíbula, respira más pausadamente."
        },
        {
          reply: "Agradezco mucho que valide mi vergüenza. Es agotador saber con tu parte racional que no tiene lógica, y aun así sentir que el pánico te domina.",
          signs: "Asiente despacio, aliviada."
        },
        {
          reply: "Saber que esto es un trastorno estudiado y que no soy la única persona a la que le pasa me quita un peso enorme de encima.",
          signs: "Sonríe tímidamente, bajando la guardia defensiva."
        }
      ],
      farewell: [
        {
          reply: "Muchas gracias por la sesión. Me siento mucho más comprendida y con esperanza de que podamos trabajar en esto paso a paso. Nos vemos la próxima semana.",
          signs: "Se pone de pie de manera ordenada, toma su bolso y sonríe con alivio genuino."
        }
      ],
      demographics_closed: [
        {
          reply: "Tengo 24 años y soy estudiante de posgrado en biotecnología.",
          signs: "Postura erguida y asentimiento educado."
        }
      ],
      deepening: [
        {
          reply: "La gente cree que el TOC es querer que las cosas estén limpias o bonitas... pero no es eso. El TOC es vivir con un rehén en la cabeza que te obliga a hacer cosas ridículas para evitar tragedias imaginarias.",
          signs: "Ajusta su tono de voz con convicción profunda."
        }
      ],
      general_reflection: [
        {
          reply: "Sé que no tiene sentido lógico, pero en mi cabeza la duda es intolerable: ¿y si hoy sí quedó encendido el gas? ¿Y si explota el edificio por mi culpa?",
          signs: "Mirada fija y atenta, pestañeo rápido."
        },
        {
          reply: "Lo más frustrante es la pérdida de tiempo. Esas dos horas que paso comprobando puertas y grifos son horas de vida que no recupero.",
          signs: "Oculta las manos con gesto de cansancio mental."
        }
      ]
    },

    // ------------------------------------------------------
    // CASO 4: MATEO RIVAS (FOBIA SOCIAL - CIE-10 F40.1 / DSM-5 300.23)
    // ------------------------------------------------------
    'mateo-rivas': {
      greeting_and_reason: [
        {
          reply: "H-hola... buenas tardes doctora. Soy Mateo. La verdad vengo con bastante vergüenza... Me derivó el servicio de orientación de la universidad porque en las clases no doy más con los nervios. Cada vez que tengo que exponer o hablar frente a la gente me da un ataque de pánico y quiero salir corriendo.",
          signs: "Se sonroja ligeramente al sentarse, apoya las manos entre los muslos y evita el contacto visual directo."
        },
        {
          reply: "Hola... buenas tardes. Sí, aquí estoy... intentando no ponerme tan nervioso para poder explicarle lo que me pasa.",
          signs: "Sonríe tímidamente, se frota la nuca con la mano."
        }
      ],
      greeting: [
        {
          reply: "Hola... buenas tardes. Estoy un poco tembloroso, la verdad... me pone muy tenso hablar de mis problemas con alguien que no conozco, pero voy a intentar colaborar.",
          signs: "Voz baja y vacilante, mira hacia sus zapatillas."
        },
        {
          reply: "Hola... sí, aquí estoy. Gracias por recibirme.",
          signs: "Sonrojo facial perceptible, manos inquietas."
        }
      ],
      reason_for_consultation: [
        {
          reply: "Vengo porque la universidad se me vino encima. En secundaria me iba bien, pero aquí en las clases magnas cuando el profesor pide que intervengamos o cuando toca exponer un trabajo, se me seca la garganta, me tiemblan las manos y la voz se me quiebra. Me da terror que todos se rían de mí o piensen que soy un inútil.",
          signs: "Pasa saliva con dificultad y se acomoda el cuello de su camiseta."
        },
        {
          reply: "El orientador de la facultad me dijo que tenía que venir porque ya he faltado a dos exposiciones obligatorias fingiendo estar enfermo, solo por no pararme frente al aula.",
          signs: "Baja la cabeza con sentimiento de culpa evidente."
        }
      ],
      timeline: [
        {
          reply: "En el colegio siempre fui tímido, pero como éramos los mismos 25 de siempre lo sobrellevaba bien. El problema estalló hace seis meses al entrar a la facultad: ver a 80 personas desconocidas mirándome me paralizó por completo.",
          signs: "Juega nervioso con los cordones de su sudadera."
        },
        {
          reply: "Hace dos semanas toqué fondo: me tocaba presentar una diapositiva en grupo, me puse rojo como un tomate, me tembló la voz y me quedé en blanco durante diez segundos eternos. Tuve que salirme del aula y no he vuelto a esa clase.",
          signs: "Se sonroja al recordarlo, tapándose la boca con la mano."
        }
      ],
      social_anxiety_situations: [
        {
          reply: "Cuando el profesor dice que hay que presentar, se me seca la boca y el corazón se me sale por la garganta. La última vez se me quebró la voz, todos se callaron y quise salir corriendo.",
          signs: "Se pasa la mano por el cuello con timidez y rubor evidente."
        },
        {
          reply: "No es solo exponer... Incluso levantar la mano para hacer una pregunta me aterra. Siento que 80 cabezas van a girar a mirarme y que voy a decir una tontería que los haga reír.",
          signs: "Cruza los brazos encogiéndose en el asiento."
        }
      ],
      somatic_symptoms: [
        {
          reply: "En cuanto siento que la gente me mira, la cara me arde y se me pone roja de golpe. Me sudan las palmas de las manos, el corazón me late tan fuerte que lo oigo en las sienes, y la voz se me pone aguda y temblorosa, como si estuviera a punto de llorar.",
          signs: "Se toca las mejillas calientes y respira con el pecho agitado."
        },
        {
          reply: "Siento náuseas antes de ir a clase y una tensión muscular en los hombros como si tuviera que defenderme de un ataque. Se me seca la boca tanto que las palabras no me salen.",
          signs: "Muestra las palmas humedecidas en sus pantalones vaqueros."
        }
      ],
      cognition_thoughts: [
        {
          reply: "Mi mayor miedo es el ridículo... Pienso: 'Se van a dar cuenta de que estás temblando, van a pensar que eres patético, que no deberías estar en la universidad'. Siento que todos los ojos me juzgan y se burlan de mi debilidad.",
          signs: "Encoge los hombros hacia adelante en postura de repliegue defensivo."
        },
        {
          reply: "Incluso después de hablar, me paso tres días repasando en mi mente cada palabra que dije, convenciéndome de que quedé como un idiota frente a todos.",
          signs: "Niega con la cabeza, expresión de autoflagelación."
        }
      ],
      sleep_habits: [
        {
          reply: "Las noches anteriores a tener una clase con exposición o debate en grupo casi no duermo. Me paso horas dando vueltas en la cama anticipando los peores momentos posibles y deseando enfermarme para no ir.",
          signs: "Pestañea cansado y baja la mirada."
        },
        {
          reply: "El apetito se me cierra por completo las mañanas que tengo que ir a la universidad; solo de pensar en entrar a la cafetería se me revuelve el estómago.",
          signs: "Se encoge en el asiento con timidez."
        }
      ],
      work_academic: [
        {
          reply: "Estoy en primer año de Economía. En los exámenes escritos saco 8 y 9, estudio mucho y entiendo la materia... pero la nota de participación y las exposiciones orales me van a hacer perder el año si no lo resuelvo.",
          signs: "Tono de voz apesadumbrado y frustrado."
        },
        {
          reply: "El mes pasado falté a dos presentaciones obligatorias inventando que tenía gripe. Mis compañeros de grupo se molestaron conmigo y ahora me da el doble de vergüenza mirarlos a la cara.",
          signs: "Baja la cabeza con sentimiento de culpa evidente."
        }
      ],
      social_family: [
        {
          reply: "Vivo con mis padres. Ellos me dicen que 'son nervios normales' y que 'me lance al agua', pero no entienden que para mí es como caminar hacia un pelotón de fusilamiento. No tengo pareja.",
          signs: "Voz baja, desvía la mirada hacia la ventana."
        },
        {
          reply: "En los descansos entre clases me escondo en la biblioteca o me pongo los auriculares sin música para que nadie me hable. Me encantaría tener amigos y salir como los demás, pero el miedo a meter la pata me paraliza.",
          signs: "Mirada triste y solitaria."
        }
      ],
      suicide_risk: [
        {
          reply: "No, doctora, nunca he pensado en hacerme daño. A veces en clase desearía que la tierra se abriera y me tragara para no pasar esa vergüenza, o quedarme encerrado en mi cuarto... pero no quiero morir, solo quiero poder hablar sin sentir que me muero de pánico.",
          signs: "Niega con suavidad con la cabeza y mira a la terapeuta con agradecimiento por preguntar con respeto."
        }
      ],
      medication_substances: [
        {
          reply: "No tomo ningún medicamento. Cuando voy a alguna fiesta o cumpleaños a veces me tomo un par de cervezas rápido para ver si me quita la timidez, pero al día siguiente me da el triple de ansiedad pensando si hice el ridículo.",
          signs: "Sonríe tímidamente rascándose el brazo."
        }
      ],
      leading_bias: [
        {
          reply: "E-es que sí... si usted lo dice así supongo que es verdad. Me hace sentir más inseguro, siento que confirma lo patético que me veo cuando me bloqueo.",
          signs: "Se sonroja visiblemente, baja la cabeza y juega con los dedos."
        }
      ],
      empathy_validation: [
        {
          reply: "Muchas gracias por decirme eso... Pensé que me diría que soy un cobarde. En el colegio no me pasaba tanto, pero llegar a la universidad con 80 personas en el aula me sobrepasó por completo.",
          signs: "Sonríe tímidamente, contacto visual breve pero sincero."
        },
        {
          reply: "Es la primera vez que le cuento esto a alguien sin sentir que se está riendo por dentro. En serio, gracias por escucharme.",
          signs: "Relaja un poco la postura encorvada."
        },
        {
          reply: "Me alivia mucho notar que aquí en la consulta puedo hablar sin que me juzgue si me trabo o si titubeo.",
          signs: "Sonríe con calidez y alivio."
        }
      ],
      farewell: [
        {
          reply: "Muchas gracias por su ayuda hoy... Me sentí mucho más cómodo de lo que pensaba. Vendré la próxima semana a la misma hora.",
          signs: "Sonríe con alivio sincero, contacto visual más firme y asiente al despedirse."
        }
      ],
      demographics_closed: [
        {
          reply: "Tengo 19 años y estudio primer año de carrera en la universidad.",
          signs: "Breve asentimiento con timidez juvenil."
        }
      ],
      deepening: [
        {
          reply: "Es raro porque en el uno a uno, como con usted ahora, puedo hablar bien... El terror aparece cuando siento los ojos de un grupo sobre mí, como si estuviera en un escenario bajo un foco.",
          signs: "Gesticula tímidamente con las manos abriéndose un poco más."
        }
      ],
      general_reflection: [
        {
          reply: "No tengo problemas en hablar uno a uno como ahora... El problema es cuando siento los ojos de un grupo sobre mí. Me da terror quedarme en blanco y que se burlen.",
          signs: "Postura encorvada, habla en voz baja."
        },
        {
          reply: "A veces siento que mi juventud se me está escapando por culpa de este miedo ridículo a que me juzguen.",
          signs: "Suspira suavemente y mira al suelo."
        }
      ]
    }
  },

  // ========================================================
  // 4. GENERADOR AUTÓNOMO INTELIGENTE CON CONTEXTO
  // ========================================================
  generateAutonomousResponse(patient, userMessage, historyCount = 0) {
    const analysis = this.analyzeTraineeQuestion(userMessage);
    const pid = patient.id || 'elena-morales';
    const patientData = this._PATIENT_DIALOGUES[pid] || this._PATIENT_DIALOGUES['elena-morales'];

    // Si el paciente cambió, reiniciar el contexto de sesión
    if (this._sessionContext.patientId !== pid) {
      this.resetSessionContext(pid);
    }
    this._sessionContext.turnCount++;

    // Detectar intención clínica
    const intent = this.detectClinicalIntent(analysis.normalized, analysis);
    this._sessionContext.lastIntent = intent;
    this._sessionContext.intentCounts[intent] = (this._sessionContext.intentCounts[intent] || 0) + 1;

    // Obtener pool de respuestas según la intención
    let responsePool = patientData[intent] || patientData.general_reflection || [];
    if (responsePool.length === 0) {
      responsePool = patientData.general_reflection;
    }

    // Seleccionar una respuesta no utilizada recientemente para evitar repeticiones
    let chosenItem = null;
    for (let i = 0; i < responsePool.length; i++) {
      const candidateKey = `${pid}_${intent}_${i}`;
      if (!this._sessionContext.usedResponseKeys.has(candidateKey)) {
        chosenItem = responsePool[i];
        this._sessionContext.usedResponseKeys.add(candidateKey);
        break;
      }
    }

    // Si todas las de ese pool ya se usaron, seleccionar rotativamente la siguiente
    if (!chosenItem) {
      const idx = (this._sessionContext.intentCounts[intent] - 1) % responsePool.length;
      chosenItem = responsePool[idx];
    }

    return {
      reply: chosenItem.reply,
      signs: chosenItem.signs || patient.nonVerbalSigns,
      analysis: analysis,
      intentDetected: intent
    };
  },

  // ========================================================
  // 5. MOTOR GEMINI EN VIVO CON RESILIENCIA Y MANEJO DE CUOTA
  // ========================================================
  async generateGeminiResponse(patient, userMessage, conversationHistory, apiKey) {
    if (!apiKey || !apiKey.trim()) {
      throw new Error("Clave API de Gemini no proporcionada");
    }

    const cleanKey = apiKey.trim();
    // Probar modelos en orden de disponibilidad de cuota en Google AI Studio
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash'];

    const systemInstruction = `Eres ${patient.name}, una persona de ${patient.age} años participando en una sesión presencial de entrevista psicológica clínica.
Diagnóstico clínico: ${patient.diagnosticTitle} (${patient.diagnosticCode}).
Resumen del caso: ${patient.summaryNotes}
Estado anímico y corporal actual: ${patient.observationalState}

INSTRUCCIONES CLÍNICAS ESTRICTAS:
1. Responde DIRECTAMENTE y con máxima coherencia a lo que el terapeuta acaba de decir o preguntar.
2. Mantén la respuesta breve y natural (entre 2 y 4 oraciones), con lenguaje cotidiano en español.
3. Habla siempre en primera persona desde tu vivencia subjetiva. NUNCA digas que eres una inteligencia artificial ni uses términos diagnósticos técnicos de ti mismo.
4. Muestra tus síntomas y emociones (${patient.observationalState}) de forma humana.
5. Si el terapeuta es empático, muestra alivio y apertura; si es inductivo o juzgador, muestra incomodidad o cierre.`;

    // Preparar historial alternando estrictamente roles user/model requerido por Gemini
    const contents = [];
    if (Array.isArray(conversationHistory)) {
      conversationHistory.forEach(msg => {
        const role = msg.sender === 'trainee' ? 'user' : 'model';
        if (msg.text && msg.text.trim()) {
          // Evitar turnos consecutivos del mismo rol
          const lastMsg = contents[contents.length - 1];
          if (!lastMsg || lastMsg.role !== role) {
            contents.push({
              role: role,
              parts: [{ text: msg.text.trim() }]
            });
          }
        }
      });
    }

    // Asegurarse de que el primer mensaje sea 'user'
    if (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }

    // Agregar el mensaje actual del estudiante
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    let lastError = null;
    let candidateText = "";

    for (const model of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
      try {
        const payload = {
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250
          }
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.status === 429) {
          const quotaErr = new Error("Cuota agotada en tu clave de Gemini (RESOURCE_EXHAUSTED). PsicoSim activó el Motor Autónomo Inteligente.");
          quotaErr.isQuota = true;
          throw quotaErr;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || response.statusText;
          if (response.status === 429 || (errMsg && errMsg.toLowerCase().includes('quota'))) {
            const quotaErr = new Error("Cuota de Gemini excedida");
            quotaErr.isQuota = true;
            throw quotaErr;
          }
          throw new Error(`Error en API Gemini (${model}): ${errMsg}`);
        }

        const data = await response.json();
        candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          break; // Éxito con este modelo
        }
      } catch (err) {
        lastError = err;
        if (err.isQuota) throw err; // Si es cuota, retransmitir inmediatamente
      }
    }

    if (!candidateText) {
      throw lastError || new Error("No se obtuvo respuesta de Gemini");
    }

    const analysis = this.analyzeTraineeQuestion(userMessage);
    return {
      reply: candidateText.trim(),
      signs: patient.nonVerbalSigns,
      analysis: analysis,
      isGemini: true
    };
  },

  // Prueba de diagnóstico de conexión con Gemini
  async testGeminiKey(apiKey) {
    if (!apiKey || apiKey.trim().length < 8) {
      return { ok: false, error: "Ingresa una API Key válida." };
    }
    const cleanKey = apiKey.trim();
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];

    for (const model of models) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Hola' }] }]
          })
        });

        if (response.status === 429) {
          return { ok: false, isQuota: true, error: "⚠️ La cuota de esta clave está agotada (Resource Exhausted). Te recomendamos usar el Motor Autónomo Inteligente." };
        }

        if (response.ok) {
          return { ok: true, model: model, message: `✅ Clave verificada con éxito (${model}).` };
        }
      } catch (e) {
        // Continuar al siguiente modelo
      }
    }

    return { ok: false, error: "No se pudo conectar con Gemini. Verifica que la clave sea correcta o usa el Motor Autónomo." };
  },

  // ========================================================
  // 6. MOTOR DE SÍNTESIS DE VOZ ROBUSTO (MULTINAVEGADOR)
  // ========================================================
  _voices: [],
  _isSpeaking: false,
  _activeUtterance: null,
  _activeSpeechButton: null,
  _lastActiveButton: null,

  initVoices() {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      this._voices = window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  },

  getBestSpanishVoice(gender = 'female') {
    if (!('speechSynthesis' in window)) return null;
    if (!this._voices || this._voices.length === 0) {
      this._voices = window.speechSynthesis.getVoices();
    }

    // Filtrar voces en español disponibles en el sistema operativo
    const spanishVoices = this._voices.filter(v => 
      v.lang && (v.lang.toLowerCase().startsWith('es') || v.lang.toLowerCase().includes('spa'))
    );

    if (spanishVoices.length === 0) {
      return this._voices[0] || null;
    }

    // Identificar voces por género
    const femaleKeywords = ['sabina', 'helena', 'laura', 'monica', 'paulina', 'lucia', 'elena', 'female', 'mujer', 'zira', 'maria', 'penelope'];
    const maleKeywords = ['raul', 'pablo', 'jorge', 'carlos', 'diego', 'alonso', 'male', 'hombre', 'david', 'alvaro'];

    const targetKeywords = gender === 'female' ? femaleKeywords : maleKeywords;
    const matched = spanishVoices.find(v => {
      const name = v.name.toLowerCase();
      return targetKeywords.some(kw => name.includes(kw));
    });

    return matched || spanishVoices[0];
  },

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn("Error al cancelar locución:", e);
      }
      this._isSpeaking = false;
      this._activeUtterance = null;
      this._updateVoiceButtonUI(null, false);
      this._setVisualSpeakingState(false);
    }
  },

  speak(text, patient = null, btnElement = null) {
    if (!('speechSynthesis' in window)) {
      alert("Tu navegador no tiene activado el soporte de voz. Te recomendamos usar Google Chrome, Microsoft Edge o Safari.");
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Si se pulsa el mismo botón mientras está hablando, detenerlo
      if (this._isSpeaking && this._activeSpeechButton === btnElement) {
        this.stopSpeaking();
        return;
      }

      window.speechSynthesis.cancel();

      // Limpiar texto para lectura natural
      const spokenText = text.replace(/\[.*?\]|\(.*?\)/g, '').replace(/«|»/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(spokenText);
      this._activeUtterance = utterance;

      let gender = 'female';
      let pitch = 1.0;
      let rate = 0.95;

      const pId = patient?.id || (typeof AppState !== 'undefined' && AppState.activeCaseId) || '';

      if (pId === 'javier-ortiz') {
        gender = 'male';
        pitch = 0.85; // Grave
        rate = 0.88;  // Cadencia más pausada (depresión/retardo motor)
      } else if (pId === 'mateo-rivas') {
        gender = 'male';
        pitch = 0.98; // Tono joven
        rate = 0.94;  // Titubeante
      } else if (pId === 'clara-mendoza') {
        gender = 'female';
        pitch = 1.05; // Agudo
        rate = 1.02;  // Rápido (TOC / ansiedad)
      } else {
        gender = 'female'; // Elena Morales (TAG)
        pitch = 1.02;
        rate = 0.93;
      }

      const voice = this.getBestSpanishVoice(gender);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || 'es-ES';
      } else {
        utterance.lang = 'es-ES';
      }

      utterance.pitch = pitch;
      utterance.rate = rate;

      utterance.onstart = () => {
        this._isSpeaking = true;
        this._activeSpeechButton = btnElement;
        this._updateVoiceButtonUI(btnElement, true);
        this._setVisualSpeakingState(true);
      };

      utterance.onend = () => {
        this._isSpeaking = false;
        this._activeUtterance = null;
        this._updateVoiceButtonUI(btnElement, false);
        this._setVisualSpeakingState(false);
      };

      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error:", e);
        this._isSpeaking = false;
        this._activeUtterance = null;
        this._updateVoiceButtonUI(btnElement, false);
        this._setVisualSpeakingState(false);
      };

      setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn("Fallo en speak():", err);
          this._isSpeaking = false;
          this._updateVoiceButtonUI(btnElement, false);
          this._setVisualSpeakingState(false);
        }
      }, 60);

    } catch (e) {
      console.warn("Error en speak:", e);
      this._isSpeaking = false;
      this._updateVoiceButtonUI(btnElement, false);
      this._setVisualSpeakingState(false);
    }
  },

  _updateVoiceButtonUI(btn, isPlaying) {
    if (this._lastActiveButton && this._lastActiveButton !== btn) {
      this._lastActiveButton.classList.remove('bg-secondary', 'text-white');
      this._lastActiveButton.classList.add('text-secondary');
      this._lastActiveButton.innerHTML = `<span class="material-symbols-outlined text-[15px]">volume_up</span> <span class="text-[11px] font-medium hidden sm:inline">Voz</span>`;
    }

    if (btn) {
      this._lastActiveButton = btn;
      if (isPlaying) {
        btn.classList.add('bg-secondary', 'text-white', 'shadow-xs');
        btn.classList.remove('text-secondary');
        btn.innerHTML = `<span class="material-symbols-outlined text-[15px] animate-pulse">stop_circle</span> <span class="text-[11px] font-bold">Detener</span>`;
      } else {
        btn.classList.remove('bg-secondary', 'text-white', 'shadow-xs');
        btn.classList.add('text-secondary');
        btn.innerHTML = `<span class="material-symbols-outlined text-[15px]">volume_up</span> <span class="text-[11px] font-medium hidden sm:inline">Voz</span>`;
      }
    }
  },

  _setVisualSpeakingState(isSpeaking) {
    const waveEl = document.getElementById('consultationSpeakingWave');
    const badgeEl = document.getElementById('consultationVoiceStatusBadge');
    if (waveEl) {
      if (isSpeaking) {
        waveEl.classList.remove('opacity-0');
        waveEl.classList.add('opacity-100');
      } else {
        waveEl.classList.add('opacity-0');
        waveEl.classList.remove('opacity-100');
      }
    }
    if (badgeEl) {
      badgeEl.textContent = isSpeaking ? "Hablando..." : "Voz Lista";
      if (isSpeaking) {
        badgeEl.className = "px-space-xs py-0.5 rounded-full font-label-sm text-[10px] bg-secondary text-white font-bold animate-pulse";
      } else {
        badgeEl.className = "px-space-xs py-0.5 rounded-full font-label-sm text-[10px] bg-secondary-container text-on-secondary-container font-semibold";
      }
    }
  }

};

// Inicializar voces al cargar el script
if (typeof window !== 'undefined') {
  ClinicalSimulator.initVoices();
}
