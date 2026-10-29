// Motor de Simulación Clínica con Inteligencia Artificial - PsicoSim IA

const ClinicalSimulator = {
  
  // Analizar intervención del estudiante (Terapeuta)
  analyzeTraineeQuestion(text) {
    const clean = text.toLowerCase().trim();
    
    // Detección de preguntas cerradas / inductivas (sesgo)
    const isLeading = /verdad que|cierto que|no crees que|seguro que no|acaso no|no te parece que/.test(clean);
    
    // Detección de preguntas abiertas vs cerradas
    const isOpen = /^(cómo|qué|cuéntame|descríbeme|de qué manera|explícame|a qué te refieres|en qué sentido|cuál|cuáles)/i.test(clean) ||
                   clean.includes('cómo te') || clean.includes('qué sientes') || clean.includes('cuéntame');
    
    // Detección de empatía y validación
    const isEmpathetic = /entiendo|comprendo|comprensible|difícil|agotador|frustrante|te escucho|debe ser duro|normal que sientas|aquí estoy|tómate tu tiempo/.test(clean);
    
    // Detección de paráfrasis o reflejo
    const isParaphrase = /si entiendo bien|lo que me dices es|en otras palabras|parece que|por lo que comentas/.test(clean);

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
    } else if (!isOpen && (clean.startsWith('¿') || clean.endsWith('?'))) {
      interventionType = "Pregunta Cerrada";
      rapportDelta = 1;
    }

    return {
      isOpen,
      isLeading,
      isEmpathetic,
      isParaphrase,
      interventionType,
      rapportDelta
    };
  },

  // Generación autónoma inteligente de respuestas según el caso
  generateAutonomousResponse(patient, userMessage, historyCount) {
    const text = userMessage.toLowerCase();
    const pid = patient.id;
    const analysis = this.analyzeTraineeQuestion(userMessage);

    let reply = "";
    let signs = "";

    // Casos específicos:
    if (pid === 'elena-morales') {
      // Elena Morales: TAG
      if (analysis.isLeading) {
        reply = "Bueno... si usted lo dice así, supongo que sí... pero me hace sentir más nerviosa pensarlo de esa forma. Siento que todo se me va a escapar de las manos en cualquier momento.";
        signs = "Se remueve incómoda en la silla, cruza los brazos y desvía la mirada hacia el suelo.";
      } else if (analysis.isEmpathetic) {
        reply = "Gracias por decirme eso, doctora... La verdad es que casi nadie lo entiende; en mi casa me dicen que me relaje o que me tome una tila, pero la opresión en el pecho sigue ahí, como una alarma que nunca se apaga.";
        signs = "Exhala profundamente, afloja un poco los hombros y asiente con una expresión de alivio.";
      } else if (text.includes('cuándo') || text.includes('tiempo') || text.includes('empezó') || text.includes('meses') || text.includes('días')) {
        reply = "Fue hace unos cuatro meses, justo cuando me nombraron coordinadora del estudio de arquitectura. Al principio pensé que solo era cansancio por las horas extras, pero luego empezaron los despertares a las 3:00 am con taquicardia y ya no se me quitó.";
        signs = "Toca su cuello con la mano derecha, mostrando tensión en el trapecio.";
      } else if (text.includes('sientes') || text.includes('pecho') || text.includes('cuerpo') || text.includes('físico') || text.includes('síntoma') || text.includes('estómago')) {
        reply = "Es como si tuviera un peso enorme en el pecho que no me deja respirar hondo. También me dan mareos y tengo la mandíbula apretada todo el día. Ya fui al cardiólogo y me dijo que mi corazón está bien, que era ansiedad.";
        signs = "Se lleva la mano al esternón, respirando de manera rápida y superficial.";
      } else if (text.includes('dormir') || text.includes('sueño') || text.includes('noche') || text.includes('despertar') || text.includes('pesadillas')) {
        reply = "Me duermo rápido porque caigo rendida, pero a las tres o cuatro de la madrugada me despierto en seco. La cabeza me empieza a dar vueltas con listas de pendientes, correos que debo enviar y la sensación de que algo catastrófico va a pasar.";
        signs = "Párpados cansados, mirada tensa y fija.";
      } else if (text.includes('familia') || text.includes('pareja') || text.includes('amigos') || text.includes('casa')) {
        reply = "Mi pareja intenta apoyarme, pero siento que ya lo estoy cansando. Siempre me ve de mal humor o preocupada. He dejado de salir con mis amigos los fines de semana porque siento que no puedo desconectar del trabajo.";
        signs = "Tono de voz apagado, baja la vista con culpa.";
      } else {
        reply = "A veces intento convencerme de que exagero, pero es más fuerte que yo. No puedo parar de imaginar los peores escenarios posibles en cada proyecto que entrego.";
        signs = "Manos inquietas frotándose continuamente sobre el regazo.";
      }

    } else if (pid === 'javier-ortiz') {
      // Javier Ortiz: Depresión Mayor
      if (analysis.isLeading) {
        reply = "...Supongo. Si le soy sincero, no tengo energía para discutirlo. Todo me da igual últimamente.";
        signs = "Suspira con lentitud, hombros completamente caídos, contacto visual nulo.";
      } else if (analysis.isEmpathetic) {
        reply = "Agradezco su paciencia... Mi familia me dice que 'ponga de mi parte', pero no entienden que no es falta de ganas, es que por dentro me siento completamente vacío, como si se me hubiera apagado el motor.";
        signs = "Levanta levemente la mirada, asiente con lentitud.";
      } else if (text.includes('cuándo') || text.includes('tiempo') || text.includes('empezó')) {
        reply = "Lleva gestándose meses, pero hace tres semanas toqué fondo. No pude entrar al instituto a dar clase; me quedé en el coche paralizado llorando sin saber por qué. Mi médico me dio la baja.";
        signs = "Voz apagada, pausas prolongadas entre frases.";
      } else if (text.includes('ánimo') || text.includes('sientes') || text.includes('tristeza') || text.includes('vacío') || text.includes('ilusión')) {
        reply = "Es una desgana absoluta. Antes me encantaba leer sobre historia y salir a caminar. Ahora puedo pasarme cinco horas mirando el techo sin mover un dedo. Siento que soy una carga para mi esposa.";
        signs = "Mirada perdida hacia el suelo, manos inmóviles en las rodillas.";
      } else {
        reply = "Me cuesta levantarme de la cama cada mañana. Despertar y saber que tengo que enfrentar otro día entero se siente como escalar una montaña con una roca a cuestas.";
        signs = "Respiración pausada y pesada.";
      }

    } else if (pid === 'clara-mendoza') {
      // Clara Mendoza: TOC
      if (analysis.isLeading) {
        reply = "No es que crea que soy una loca... Sé perfectamente que la probabilidad es mínima, pero el pensamiento llega y la angustia me desborda. Si no lo compruebo, siento que la culpa de la catástrofe será mía.";
        signs = "Tono defensivo, postura corporal muy rígida, ajusta sus mangas.";
      } else if (analysis.isEmpathetic) {
        reply = "Me alivia escuchar que no me juzga. Me da mucha vergüenza contar esto... Mis compañeros de posgrado piensan que soy muy perfeccionista, pero no saben el infierno que es salir de casa y tener que regresar cuatro veces a tocar la estufa.";
        signs = "Relaja un poco la mandíbula, respira más pausadamente.";
      } else if (text.includes('manos') || text.includes('lavar') || text.includes('piel') || text.includes('cerradura') || text.includes('ritual') || text.includes('comprobar')) {
        reply = "Llego a lavarme las manos hasta que me sangran con agua hirviendo si toco algo que siento que está contaminado. Y con la puerta de casa, tengo que girar la llave en series de tres hasta llegar a nueve; si me desconcentro, tengo que empezar de nuevo.";
        signs = "Oculta las manos debajo de la mesa con evidente rubor y pudor.";
      } else {
        reply = "Sé que no tiene sentido lógico, pero en mi cabeza la duda es intolerable: ¿y si hoy sí quedó encendido el gas? ¿Y si explota el edificio por mi culpa?";
        signs = "Mirada fija y atenta, pestañeo rápido.";
      }

    } else {
      // Mateo Rivas: Fobia Social
      if (analysis.isLeading) {
        reply = "E-es que sí... siento que todos en el aula me están mirando y juzgando cada error que cometo. Me siento ridículo.";
        signs = "Se sonroja visiblemente, baja la cabeza y juega con los dedos.";
      } else if (analysis.isEmpathetic) {
        reply = "Muchas gracias... Pensé que me diría que soy un cobarde. En el colegio no me pasaba tanto, pero llegar a la universidad con 80 personas en el aula me sobrepasó por completo.";
        signs = "Sonríe tímidamente, contacto visual breve pero sincero.";
      } else if (text.includes('exponer') || text.includes('clase') || text.includes('público') || text.includes('compañeros')) {
        reply = "Cuando el profesor dice que hay que presentar, se me seca la boca y el corazón se me sale por la garganta. La última vez se me quebró la voz, todos se callaron y quise salir corriendo.";
        signs = "Se pasa la mano por el cuello con timidez.";
      } else {
        reply = "No tengo problemas en hablar uno a uno como ahora... El problema es cuando siento los ojos de un grupo sobre mí. Me da terror quedarme en blanco y que se burlen.";
        signs = "Postura encorvada, habla en voz baja.";
      }
    }

    return {
      reply,
      signs,
      analysis
    };
  },

  // Llamada a la API de Google Gemini en vivo (opcional si el usuario configuró su clave)
  async generateGeminiResponse(patient, userMessage, conversationHistory, apiKey) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Preparar historial en formato de Gemini
    const contents = [];
    
    // Prompt del sistema como contexto inicial
    const systemInstruction = `${patient.systemPrompt}\n\nInstrucciones estrictas de rol:
- Mantén siempre tu papel de paciente ficticio.
- Responde con naturalidad, en 2 a 4 oraciones.
- Muestra el estado emocional del paciente: ${patient.observationalState}.
- No te diagnostiques a ti mismo ni uses jerga médica formal.
- Responde directamente al psicólogo como en una consulta presencial.`;

    // Incluir mensajes anteriores si existen
    conversationHistory.forEach(msg => {
      contents.push({
        role: msg.sender === 'trainee' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });

    // Agregar el mensaje actual del estudiante
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
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

    if (!response.ok) {
      throw new Error(`Error en API Gemini: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Respuesta vacía de Gemini');
    }

    const analysis = this.analyzeTraineeQuestion(userMessage);
    return {
      reply: candidateText.trim(),
      signs: patient.nonVerbalSigns,
      analysis
    };
  },

  // Síntesis de voz del navegador (Lectura de audio del paciente)
  speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Cancelar locución previa
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
    }
  }

};
