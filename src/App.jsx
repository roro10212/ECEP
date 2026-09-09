import Timer from './components/Timer';
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Home, Shuffle, Flag, Star, Download, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Reemplazo local de window.storage (solo existe en el entorno de artifacts de Claude).
// Usa localStorage del navegador, con la misma forma de API (get/set/delete devuelven Promises).
const storage = {
  async get(key) {
    const v = localStorage.getItem(key);
    if (v === null) throw new Error("not found");
    return { key, value: v };
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key) {
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
};

// ================================================================
//  QUIZ ECEP - EDUCACIÓN DIFERENCIAL
//  TODAS LAS PREGUNTAS (2017-2024)
// ================================================================

const quizData = {
  2017: {
    color: "#2563eb",
    label: "2017",
    questions: [
      { q: "La escritura de Agustín, de 3° Básico, presenta caligrafía legible pero errores en ligamiento y uniformidad. Se confunde: 'caos' por 'caso', 'barto' por 'barato'. ¿Qué dificultad se advierte?", opts: ["Dislexia", "Errores específicos de escritura", "Escritura en espejo", "Disortografía"], answer: "B", exp: "Los errores específicos se caracterizan por confusiones puntuales manteniendo caligrafía legible.", area: "Evaluación" },
      { q: "Darío, de 6° Básico, maneja tablas de multiplicar pero tiene desafíos con multiplicaciones de múltiples dígitos. ¿En qué ámbito requiere apoyo?", opts: ["Algoritmo matemático", "Series numéricas", "Concepto de número", "Resolución de problemas"], answer: "A", exp: "El algoritmo se refiere a los procedimientos sistemáticos paso a paso para ejecutar operaciones.", area: "Matemática" },
      { q: "María, de 2° Básico, experimenta desafíos en decodificación. El docente trabaja separar sílabas, golpes de voz y reconocer sonidos. ¿Qué habilidad desarrolla?", opts: ["Atención selectiva", "Conciencia fonológica", "Discriminación auditiva", "Categorización semántica"], answer: "B", exp: "La conciencia fonológica es la habilidad metalingüística para reconocer y manipular los sonidos del habla.", area: "Lenguaje" },
      { q: "¿En cuál frase de dictado de 3° Básico se evidencian errores de sustitución?", opts: ["El niño fue al cine", "Kamila para al dedo", "Mi mamá guyra con la tetara", "El mereño tiniñi sun problema"], answer: "B", exp: "Los errores de sustitución implican reemplazar un fonema o grafema por otro similar.", area: "Evaluación" },
      { q: "Docente planifica: textos con cantos familiares, libros predecibles, biblioteca en aula. ¿Qué modelo de lectoescritura utiliza?", opts: ["Modelo holístico", "Modelo integrado", "Modelo de destrezas", "Modelo transaccional"], answer: "A", exp: "El modelo holístico enfatiza el aprendizaje desde textos completos y significativos.", area: "Lenguaje" },
      { q: "Según el Decreto 170, ¿cuál es el criterio para diagnosticar una Dificultad Específica del Aprendizaje (DEA)?", opts: ["Rendimiento académico bajo en todas las asignaturas", "Discrepancia entre capacidad intelectual y rendimiento en áreas específicas", "Presencia de déficit atencional asociado", "Historial de repitencia escolar"], answer: "D", exp: "El Decreto 170 establece que la DEA se caracteriza por una discrepancia significativa entre el potencial de aprendizaje y el rendimiento.", area: "Marco Normativo" },
      { q: "En el contexto del PIE, ¿cuál es la función principal del Educador Diferencial en el trabajo colaborativo con el docente de aula?", opts: ["Retirar al estudiante con NEE para trabajar fuera del aula", "Diseñar y ejecutar estrategias de apoyo dentro del aula común", "Evaluar solo a los estudiantes con diagnóstico", "Gestionar la documentación del PIE"], answer: "C", exp: "El modelo de trabajo colaborativo del PIE prioriza el apoyo dentro del aula común.", area: "PIE" },
      { q: "¿Cuál de las siguientes estrategias corresponde a una adaptación de acceso para un estudiante con DEA en lectura?", opts: ["Reducir la cantidad de contenidos del currículo", "Proporcionar textos en formato audio o con letra ampliada", "Evaluar con criterios distintos al resto del curso", "Trabajar solo objetivos del nivel anterior"], answer: "B", exp: "Las adaptaciones de acceso modifican el formato o medio de presentación sin alterar el objetivo.", area: "Estrategias" },
      { q: "Un estudiante de 4° Básico presenta omisiones, inversiones y confusiones de letras al leer. ¿Qué tipo de dificultad presenta?", opts: ["Digrafía", "Dislexia fonológica", "Discalculia", "Disfasia"], answer: "A", exp: "La dislexia fonológica se caracteriza por dificultades en la ruta fonológica de la lectura.", area: "Evaluación" },
      { q: "Según el DUA (Diseño Universal para el Aprendizaje), ¿cuál es el principio relacionado con 'múltiples formas de representación'?", opts: ["Proporcionar múltiples medios de acción y expresión", "Proporcionar múltiples medios de representación del qué del aprendizaje", "Proporcionar múltiples medios de motivación y compromiso", "Proporcionar múltiples medios de evaluación"], answer: "B", exp: "El principio de múltiples medios de representación refiere al 'qué' del aprendizaje.", area: "DUA" },
      { q: "¿Cuál instrumento es más adecuado para evaluar conciencia fonológica en NT2?", opts: ["EVALÚA-0", "Test de Habilidades Metalingüísticas (THM)", "Prueba de Funciones Básicas", "Batería Woodcock"], answer: "B", exp: "El THM evalúa específicamente las habilidades metalingüísticas y de conciencia fonológica.", area: "Evaluación" },
      { q: "En el marco del Decreto 83, ¿qué implica la diversificación curricular?", opts: ["Reducir objetivos de aprendizaje para estudiantes con NEE", "Adaptar la enseñanza respetando los objetivos del currículo nacional", "Crear un currículo paralelo para estudiantes con discapacidad", "Eximir a los estudiantes de ciertas asignaturas"], answer: "B", exp: "El Decreto 83 promueve la diversificación de la enseñanza manteniendo los objetivos del currículo.", area: "Marco Normativo" },
      { q: "¿Cuál es la diferencia principal entre NEE transitorias y permanentes según el Decreto 170?", opts: ["Las transitorias son más graves que las permanentes", "Las transitorias pueden superarse con apoyo pedagógico oportuno", "Las permanentes siempre requieren escuela especial", "Las transitorias no tienen derecho a apoyo PIE"], answer: "B", exp: "Las NEE transitorias son aquellas que el estudiante puede superar con apoyos pedagógicos oportunos.", area: "Marco Normativo" },
      { q: "Un estudiante con FIL (Funcionamiento Intelectual Limítrofe) presenta CI entre:", opts: ["55-69", "70-79", "80-84", "85-89"], answer: "B", exp: "El FIL corresponde a un CI entre 70-79 puntos.", area: "Evaluación" },
      { q: "¿Cuál es el propósito del Informe de Evaluación Psicopedagógica (IEP) según el Decreto 170?", opts: ["Diagnosticar una patología clínica", "Fundamentar la incorporación al PIE y orientar el plan de apoyo", "Derivar al estudiante a tratamiento médico", "Determinar si el estudiante repite de curso"], answer: "B", exp: "El IEP tiene como propósito fundamentar la necesidad de apoyo especializado.", area: "PIE" },
      { q: "¿Qué establece el Decreto 83 respecto a los medios de ejecución y expresión?", opts: ["Los estudiantes deben expresarse solo en forma escrita", "Se deben ofrecer múltiples formas para que los estudiantes demuestren sus aprendizajes", "La evaluación debe ser igual para todos", "Solo los estudiantes con NEE tienen adaptaciones en la expresión"], answer: "B", exp: "El Decreto 83 establece que se deben ofrecer múltiples medios de acción y expresión.", area: "Marco Normativo" },
      { q: "¿Cuál es la función de la evaluación formativa en el contexto del PIE?", opts: ["Determinar el diagnóstico final del estudiante", "Recoger información continua para ajustar la enseñanza", "Calificar el desempeño del estudiante periódicamente", "Documentar el progreso para el IEP"], answer: "B", exp: "La evaluación formativa permite al docente ajustar sus estrategias de enseñanza.", area: "Evaluación" },
      { q: "¿Qué se entiende por 'barreras para el aprendizaje y la participación' en educación inclusiva?", opts: ["Las dificultades propias del estudiante con NEE", "Los obstáculos del entorno que limitan el acceso y participación", "El bajo rendimiento académico del estudiante", "La falta de diagnóstico formal del estudiante"], answer: "B", exp: "Las barreras son los obstáculos del contexto que limitan el aprendizaje y participación.", area: "Estrategias" },
      { q: "Según el modelo de Respuesta a la Intervención (RTI), ¿qué caracteriza el Nivel 2?", opts: ["Enseñanza universal para todos los estudiantes", "Intervención focalizada para estudiantes en riesgo", "Intervención intensiva para estudiantes con NEE severa", "Evaluación diagnóstica especializada"], answer: "B", exp: "El Nivel 2 del RTI corresponde a intervenciones focalizadas en grupos pequeños.", area: "Estrategias" },
      { q: "¿Cuál es el propósito del Plan de Apoyo Individual (PAI) en el contexto del PIE?", opts: ["Reemplazar el currículo ordinario del estudiante", "Organizar los apoyos especializados para alcanzar objetivos del currículo", "Diagnosticar las NEE del estudiante", "Documentar las faltas de asistencia del estudiante"], answer: "B", exp: "El PAI organiza y planifica los apoyos especializados necesarios.", area: "PIE" },
      { q: "¿Qué instrumento es adecuado para evaluar la comprensión lectora en estudiantes de 5° a 8° Básico?", opts: ["THM (Test de Habilidades Metalingüísticas)", "CLP Formas Paralelas", "PROLEC-R", "Test ABC"], answer: "B", exp: "Las Pruebas CLP son pertinentes para evaluar comprensión lectora.", area: "Evaluación" },
      { q: "En el marco del Decreto 67, ¿qué se entiende por evaluación diferenciada?", opts: ["Una evaluación con menor exigencia para estudiantes con NEE", "Ajustes en la forma de evaluar respetando los objetivos de aprendizaje", "Una evaluación aplicada solo por el educador diferencial", "La exención de evaluaciones para estudiantes con discapacidad"], answer: "B", exp: "El Decreto 67 establece que la evaluación diferenciada implica ajustes en los medios e instrumentos.", area: "Marco Normativo" },
      { q: "¿Cuál es la principal diferencia entre discalculia y dificultad matemática general?", opts: ["La discalculia afecta solo la suma y resta", "La discalculia es específica del procesamiento numérico con base neurológica", "La dificultad general tiene base neurológica y la discalculia no", "No hay diferencia entre ambos términos"], answer: "B", exp: "La discalculia es un trastorno específico del aprendizaje con base neurológica.", area: "Evaluación" },
      { q: "Según el enfoque inclusivo, ¿cuál es el rol del educador diferencial en relación con todos los estudiantes?", opts: ["Atender solo a los estudiantes con diagnóstico PIE", "Asesorar y apoyar a la comunidad educativa para responder a la diversidad", "Retirarse con grupos pequeños fuera del aula", "Gestionar exclusivamente la documentación PIE"], answer: "B", exp: "El educador diferencial es un agente de cambio que asesora a toda la comunidad educativa.", area: "Estrategias" },
      { q: "¿Cuál de las siguientes es una característica del FIL?", opts: ["CI inferior a 55 puntos", "CI entre 70-79 con dificultades adaptativas", "CI entre 85-90 con dificultades específicas", "CI normal con dificultades emocionales"], answer: "B", exp: "El FIL se caracteriza por un CI entre 70-79 puntos.", area: "Evaluación" },
      { q: "¿Qué establece el artículo 23 del Decreto 170 respecto a la permanencia en el PIE?", opts: ["Los estudiantes permanecen en el PIE de por vida", "La permanencia se revisa anualmente según evolución y necesidades", "Los estudiantes solo pueden estar 2 años en el PIE", "La permanencia la decide el apoderado exclusivamente"], answer: "B", exp: "El Decreto 170 establece que la permanencia en el PIE debe revisarse periódicamente.", area: "Marco Normativo" },
      { q: "¿Cuál estrategia de intervención es más efectiva para trabajar conciencia fonológica en 1° Básico?", opts: ["Dictados diarios de palabras largas", "Juegos con rimas, aliteraciones y segmentación silábica", "Lectura silenciosa de textos complejos", "Copia de oraciones del pizarrón"], answer: "B", exp: "Los juegos lingüísticos son estrategias lúdicas y efectivas para desarrollar conciencia fonológica.", area: "Estrategias" },
      { q: "¿Qué se entiende por 'ajustes razonables' en el contexto de la educación inclusiva?", opts: ["Reducir todos los objetivos curriculares para estudiantes con NEE", "Modificaciones necesarias para garantizar acceso en igualdad de condiciones", "Cambiar completamente el currículo del estudiante", "Eximir al estudiante de participar en actividades grupales"], answer: "B", exp: "Los ajustes razonables garantizan el acceso y participación en igualdad de condiciones.", area: "Estrategias" },
      { q: "En el contexto del PIE, ¿cuál es la frecuencia mínima recomendada para las reuniones del equipo de aula?", opts: ["Mensual", "Quincenal", "Semanal", "Semestral"], answer: "C", exp: "Se recomienda que el equipo de aula se reúna semanalmente.", area: "PIE" },
      { q: "¿Cuál es la principal función de la Vineland Adaptive Behavior Scale en la evaluación psicopedagógica?", opts: ["Evaluar el coeficiente intelectual", "Evaluar la conducta adaptativa en la vida diaria", "Evaluar la velocidad lectora", "Evaluar la memoria de trabajo"], answer: "B", exp: "La Vineland evalúa la conducta adaptativa en comunicación, vida diaria y socialización.", area: "Evaluación" },
      { q: "¿Cuál de las siguientes opciones corresponde a la definición de 'Discapacidad' desde el Enfoque Biopsicosocial?", opts: ["Es una situación que presenta múltiples desventajas para una persona determinada", "Es la condición en que se encuentra una persona producida por una enfermedad", "Es un fenómeno que principalmente tiene un origen social", "Es un fenómeno multidimensional con interacción entre persona y contexto"], answer: "D", exp: "El enfoque biopsicosocial concibe la discapacidad como un fenómeno multidimensional.", area: "Estrategias" },
      { q: "Según la Ley 21.545 sobre TEA, ¿cuál es uno de los derechos garantizados para personas con TEA en el ámbito educacional?", opts: ["Acceso exclusivo a escuelas especiales", "Derecho a educación inclusiva con los apoyos necesarios", "Evaluación psiquiátrica obligatoria", "Reducción automática del currículo"], answer: "A", exp: "La Ley 21.545 garantiza el derecho a la educación inclusiva con los apoyos necesarios.", area: "Marco Normativo" },
      { q: "¿Cuál es el propósito principal del Decreto 67 en relación con la evaluación escolar?", opts: ["Eliminar las calificaciones en educación básica", "Promover una evaluación formativa, integral y no punitiva", "Establecer pruebas estandarizadas nacionales", "Eximir a los estudiantes con NEE de toda evaluación"], answer: "C", exp: "El Decreto 67 promueve una cultura evaluativa formativa y centrada en el aprendizaje.", area: "Marco Normativo" },
      { q: "¿Cuál de las siguientes estrategias corresponde al principio de 'Múltiples Medios de Implicación' del DUA?", opts: ["Presentar información en formato visual y auditivo", "Ofrecer opciones para mantener el esfuerzo y la persistencia", "Proporcionar plantillas para organizar la escritura", "Usar rúbricas claras para la evaluación"], answer: "C", exp: "El principio de Múltiples Medios de Implicación busca estimular el interés y la motivación.", area: "DUA" },
      { q: "En el marco del trabajo colaborativo del PIE, ¿qué implica la 'planificación universal'?", opts: ["Planificar solo para estudiantes con NEE", "Diseñar desde el inicio experiencias accesibles para todos", "Adaptar la planificación después de detectar dificultades", "Crear planificaciones separadas para cada grupo"], answer: "B", exp: "La planificación universal diseña desde el inicio considerando la diversidad.", area: "Estrategias" },
      { q: "¿Cuál de las siguientes baterías evalúa el procesamiento fonológico de manera integral?", opts: ["WISC-V", "CELF-5", "PROLEC-R", "ITPA"], answer: "C", exp: "El PROLEC-R evalúa los procesos fonológicos, léxicos, sintácticos y semánticos de la lectura.", area: "Evaluación" },
      { q: "¿Cuál es la principal diferencia entre el modelo médico y el modelo social de discapacidad?", opts: ["El modelo médico enfatiza la participación social", "El modelo social localiza el problema en las barreras del entorno", "El modelo médico es más inclusivo que el social", "No hay diferencia sustancial entre ambos modelos"], answer: "B", exp: "El modelo social localiza el problema en las barreras del entorno y la sociedad.", area: "Estrategias" },
      { q: "¿Qué establece el Decreto 170 respecto al número máximo de estudiantes con NEE permanentes en un curso?", opts: ["2 estudiantes por curso", "3 estudiantes por curso", "4 estudiantes por curso", "5 estudiantes por curso"], answer: "B", exp: "El Decreto 170 establece un máximo de 2 estudiantes con NEE permanentes por curso.", area: "Marco Normativo" },
      { q: "¿Cuál es la función de la evaluación diagnóstica en el contexto del PIE?", opts: ["Clasificar a los estudiantes por nivel de rendimiento", "Identificar NEE y orientar la planificación del apoyo especializado", "Determinar si el estudiante necesita escuela especial", "Calificar el desempeño inicial del año escolar"], answer: "B", exp: "La evaluación diagnóstica identifica las NEE y orienta los apoyos especializados.", area: "PIE" },
      { q: "¿Qué es la 'zona de desarrollo próximo' según Vygotsky y cómo se aplica en el PIE?", opts: ["El nivel actual de desarrollo independiente del estudiante", "La distancia entre lo que el estudiante puede hacer solo y con apoyo", "El máximo nivel que puede alcanzar el estudiante", "El nivel promedio del curso"], answer: "B", exp: "La ZDP es la distancia entre el desarrollo real y el potencial con andamiaje.", area: "Estrategias" },
      { q: "¿Cuál de las siguientes características define la disgrafía?", opts: ["Dificultad específica en comprensión lectora", "Dificultad en la producción gráfica de la escritura", "Dificultad en el procesamiento matemático", "Dificultad en la expresión oral"], answer: "B", exp: "La disgrafía afecta la calidad gráfica de la escritura.", area: "Evaluación" },
      { q: "En el marco de la educación inclusiva, ¿cuál es el rol del apoderado en el proceso PIE?", opts: ["Observador pasivo del proceso educativo", "Participante activo en la planificación y seguimiento del apoyo", "Responsable exclusivo de las terapias externas", "Receptor de informes al final de cada semestre"], answer: "B", exp: "El apoderado es un participante activo y esencial en el proceso PIE.", area: "PIE" },
      { q: "¿Qué instrumento permite evaluar el nivel de madurez neuropsicológica para el aprendizaje escolar?", opts: ["WISC-V", "Test de Bender Gestáltico", "Prueba de Funciones Básicas (PFB)", "THM"], answer: "C", exp: "La Prueba de Funciones Básicas evalúa habilidades psicomotoras, perceptivas y lingüísticas.", area: "Evaluación" },
      { q: "¿Cuál es el principio fundamental de la educación inclusiva según la Declaración de Salamanca (UNESCO, 1994)?", opts: ["La segregación es necesaria para atender la diversidad", "Todas las escuelas deben acoger a todos los niños", "Solo las escuelas especiales pueden atender NEE severas", "La inclusión aplica solo a estudiantes con discapacidad física"], answer: "B", exp: "La Declaración de Salamanca establece que las escuelas deben acoger a todos los niños.", area: "Estrategias" },
      { q: "¿Cuál es la diferencia entre 'integración' e 'inclusión' en educación?", opts: ["Son sinónimos en el contexto educativo chileno", "La integración adapta al estudiante al sistema; la inclusión transforma el sistema", "La inclusión es para estudiantes con discapacidad leve y la integración para severa", "La integración es el modelo actual en Chile"], answer: "B", exp: "La integración exige que el estudiante se adapte; la inclusión transforma el sistema.", area: "Estrategias" },
      { q: "¿Qué es la evaluación psicopedagógica y cuál es su propósito en el contexto del PIE?", opts: ["Diagnosticar trastornos neurológicos", "Identificar NEE y orientar apoyos", "Medir coeficiente intelectual", "Evaluar solo el rendimiento académico"], answer: "B", exp: "La evaluación psicopedagógica identifica NEE y orienta los apoyos educativos.", area: "Evaluación" },
      { q: "¿Cuál de los siguientes es un principio del Diseño Universal para el Aprendizaje (DUA)?", opts: ["Un único método para todos", "Múltiples formas de representación, acción y expresión, e implicación", "Separar a los estudiantes por habilidad", "Enfoque exclusivo en lo académico"], answer: "B", exp: "El DUA se basa en tres principios: representación, acción/expresión e implicación.", area: "DUA" },
      { q: "¿Qué es una adecuación curricular de acceso?", opts: ["Cambiar los objetivos de aprendizaje", "Modificar los medios y recursos para que el estudiante acceda al currículo", "Reducir la cantidad de contenido", "Eliminar asignaturas del plan de estudio"], answer: "B", exp: "Las adecuaciones de acceso modifican los medios sin alterar los objetivos de aprendizaje.", area: "Estrategias" },
      { q: "¿Cuál es la función del educador diferencial en el PIE?", opts: ["Atender solo a estudiantes con discapacidad", "Diseñar y ejecutar apoyos educativos especializados dentro y fuera del aula", "Reemplazar al profesor de aula", "Administrar los recursos del PIE"], answer: "B", exp: "El educador diferencial diseña y ejecuta apoyos especializados para estudiantes con NEE.", area: "PIE" },
      { q: "¿Qué establece el Decreto 83/2015 sobre la diversificación curricular?", opts: ["Obliga a todos los estudiantes a seguir el mismo currículo", "Permite flexibilizar y diversificar el currículo para responder a la diversidad", "Crea un currículo paralelo para estudiantes con NEE", "Elimina la evaluación para estudiantes con discapacidad"], answer: "B", exp: "El Decreto 83 promueve la flexibilización y diversificación curricular para atender la diversidad.", area: "Marco Normativo" },
      { q: "¿Qué es la conciencia fonológica?", opts: ["Capacidad de reconocer letras", "Habilidad para manipular los sonidos del habla", "Capacidad de leer fluidamente", "Habilidad para escribir correctamente"], answer: "B", exp: "La conciencia fonológica es la habilidad metalingüística para reconocer y manipular los sonidos del habla.", area: "Lenguaje" },
      { q: "¿Cuál es la diferencia entre dislexia y disortografía?", opts: ["La dislexia afecta la lectura; la disortografía afecta la escritura", "La dislexia afecta la escritura; la disortografía afecta la lectura", "Ambas afectan solo la lectura", "Ambas afectan solo la escritura"], answer: "A", exp: "La dislexia es un trastorno de la lectura; la disortografía afecta la escritura.", area: "Evaluación" },
      { q: "¿Qué es el FIL (Funcionamiento Intelectual Limítrofe)?", opts: ["CI entre 55-69", "CI entre 70-79", "CI entre 80-84", "CI entre 85-89"], answer: "B", exp: "El FIL corresponde a un CI entre 70-79 puntos.", area: "Evaluación" },
      { q: "¿Qué es el TEL (Trastorno Específico del Lenguaje)?", opts: ["Dificultad en la adquisición del lenguaje sin causa neurológica, sensorial o intelectual", "Dificultad en la lectura", "Dificultad en el cálculo", "Dificultad en la escritura"], answer: "A", exp: "El TEL es un trastorno del lenguaje sin causa neurológica, sensorial o intelectual.", area: "Evaluación" },
      { q: "¿Cuál es la función de la familia en el proceso PIE?", opts: ["Observar pasivamente", "Participar activamente en la planificación y seguimiento del apoyo", "Solo firmar documentos", "No tener participación"], answer: "B", exp: "La familia es un participante activo y esencial en el proceso PIE.", area: "PIE" },
      { q: "¿Qué es la evaluación formativa?", opts: ["Evaluación al final del período", "Evaluación continua para ajustar la enseñanza", "Evaluación estandarizada", "Evaluación de diagnóstico inicial"], answer: "B", exp: "La evaluación formativa permite ajustar las estrategias de enseñanza en función del progreso del estudiante.", area: "Evaluación" },
      { q: "¿Qué es la discalculia?", opts: ["Dificultad en la lectura", "Dificultad en el procesamiento numérico con base neurológica", "Dificultad en la escritura", "Dificultad en la expresión oral"], answer: "B", exp: "La discalculia es un trastorno específico del aprendizaje con base neurológica que afecta el procesamiento numérico.", area: "Evaluación" },
      { q: "¿Qué establece la Ley 20.422 sobre discapacidad?", opts: ["Crea escuelas especiales", "Establece normas sobre igualdad de oportunidades e inclusión social de personas con discapacidad", "Elimina la educación inclusiva", "Obliga a la segregación"], answer: "B", exp: "La Ley 20.422 establece normas sobre igualdad de oportunidades e inclusión social de personas con discapacidad.", area: "Marco Normativo" },
      { q: "¿Qué es el PACI (Plan de Apoyo Curricular Individual)?", opts: ["Plan que reemplaza el currículo nacional", "Plan que organiza los apoyos especializados para estudiantes con NEE", "Plan para todos los estudiantes del curso", "Plan de gestión administrativa"], answer: "B", exp: "El PACI organiza los apoyos especializados para estudiantes con NEE.", area: "PIE" },
      { q: "¿Cuál es la función del fonoaudiólogo en el PIE?", opts: ["Aplicar pruebas psicológicas", "Evaluar y tratar trastornos del lenguaje y la comunicación", "Enseñar matemáticas", "Administrar el establecimiento"], answer: "B", exp: "El fonoaudiólogo evalúa y trata trastornos del lenguaje y la comunicación.", area: "PIE" }
    ]
  },
  2018: {
    color: "#16a34a",
    label: "2018",
    questions: [
      { q: "Desde un enfoque ecológico, ¿por qué es importante conocer la información del entorno de los estudiantes para realizar una evaluación integral?", opts: ["Porque permite recoger evidencias sobre los avances del aprendizaje de los estudiantes para realizar ajustes en el proceso de aprendizaje, en conjunto con la familia.", "Porque permite potenciar el desarrollo de los estudiantes desde contextos significativos e integrar el ambiente escolar con ambientes extraescolares.", "Porque ayuda a la selección de métodos adecuados y relevantes para la evaluación de las competencias de los estudiantes de manera integrada, usando una base de evidencia amplia.", "Porque facilita la creación de un ambiente escolar que considere las necesidades, habilidades e intereses de los estudiantes, incluyendo en su planificación todas las áreas de desarrollo."], answer: "B", exp: "El enfoque ecológico integra el ambiente escolar con ambientes extraescolares.", area: "Evaluación" },
      { q: "Según las Orientaciones Técnicas para PIE (MINEDUC, 2013), ¿cuál es el principal propósito de la evaluación de salud en la evaluación diagnóstica integral?", opts: ["Detectar de manera oportuna eventuales trastornos del neurodesarrollo que puedan generar comportamientos adaptativos disminuidos.", "Determinar aquellas situaciones en que existe un bajo desempeño escolar por factores de salud que no corresponden propiamente a necesidades educativas.", "Verificar la existencia de patologías de base que deriven en una DEA o la necesidad de tratamientos médicos complementarios.", "Evaluar la presencia de patologías físicas o psicológicas que desencadenan la aparición de un cuadro de DEA."], answer: "B", exp: "La evaluación de salud busca descartar factores médicos que expliquen el bajo rendimiento sin constituir una NEE.", area: "PIE" },
      { q: "Para conocer factores socioemocionales asociados a bajo interés académico y ajustar la enseñanza, ¿qué instrumentos se deberían emplear?", opts: ["TAE y VAK.", "CLP-T y test de Conners.", "EVALÚA y Escala de Inteligencia.", "Cuestionario de entrevista infantil y Escalas Magallanes TDA-H."], answer: "A", exp: "TAE y VAK evalúan factores socioemocionales y estilos de aprendizaje.", area: "Evaluación" },
      { q: "¿Cuál es el principal objetivo de la prueba CLP (Comprensión Lectora de Complejidad Lingüística Progresiva)?", opts: ["Conocer el nivel de destrezas referidas a hablar, leer y escuchar en los diferentes niveles escolares.", "Identificar el grado de dominio de la lectura desde el aprendizaje inicial hasta el logro en forma independiente.", "Identificar el nivel de manejo tanto de la lengua como de los componentes del lenguaje en una etapa inicial.", "Conocer el grado de dominio de elementos gramaticales tanto a nivel oral como escrito."], answer: "B", exp: "La prueba CLP evalúa el dominio de la lectura desde el aprendizaje inicial hasta el logro independiente.", area: "Evaluación" },
      { q: "En 7° Básico, estudiantes no logran formular y justificar puntos de vista articulados entre sí. ¿Cuál es la principal barrera para el aprendizaje?", opts: ["No visualizan la competencia lingüística en el idioma de enseñanza.", "No contemplan factores emocionales y motivacionales en las actividades.", "No incluyen diversas formas de representación y expresión en las actividades.", "No consideran el objetivo de aprendizaje de la asignatura propuesto para la clase."], answer: "C", exp: "La principal barrera es la falta de diversas formas de representación y expresión.", area: "Estrategias" },
      { q: "Agustín, 3° Básico, escribe 'caos' por 'caso' y 'barro' por 'barato'. ¿Qué tipo de dificultad se advierte?", opts: ["Dislexia.", "Errores específicos.", "Escritura en espejo.", "Disortografía."], answer: "B", exp: "Los errores específicos se caracterizan por confusiones puntuales manteniendo caligrafía legible.", area: "Evaluación" },
      { q: "Bartolomé, 4° Básico con DEA: en actividad 3 escribe menos de un tercio de palabras solicitadas; en actividad 4 identifica la mayoría sin agregar. ¿Qué proceso de memoria requiere fortalecer?", opts: ["Retención.", "Adquisición.", "Recuperación.", "Reconocimiento."], answer: "C", exp: "Tiene dificultad para recuperar información de manera libre pero reconoce bien.", area: "Evaluación" },
      { q: "Para mejorar comprensión lectora en 4° Básico con texto informativo, ¿qué estrategia metalingüística usar durante la lectura grupal?", opts: ["Solicitar visualizar detalladamente el contenido y luego dibujarlo.", "Presentar la portada y pedir imaginar de qué se tratará.", "Solicitar identificar el tipo de texto, formato y estructura.", "Pedir comentar en grupo los objetivos al leer un texto."], answer: "A", exp: "La estrategia de visualizar y dibujar ayuda a la comprensión durante la lectura.", area: "Lenguaje" },
      { q: "Docente de 2° Básico usa textos con cantos familiares, libros predecibles, biblioteca en aula. ¿Qué modelo de adquisición de lectoescritura usa?", opts: ["Holístico.", "Integrado.", "De destrezas.", "Transaccional."], answer: "A", exp: "El modelo holístico enfatiza el aprendizaje desde textos completos y significativos.", area: "Lenguaje" },
      { q: "5° Básico completa un mapa conceptual sobre características de su casa. ¿Qué habilidad psicolingüística se estimula?", opts: ["Integración gramatical.", "Comprensión visual.", "Abstracción verbal.", "Memoria secuencial."], answer: "C", exp: "Completar un mapa conceptual requiere abstraer y organizar verbalmente la información.", area: "Lenguaje" },
      { q: "1° Básico: docente muestra título, tipos de letra y portada para predecir la lectura. ¿Qué estrategia de comprensión lectora utiliza?", opts: ["Superestructura.", "Interrogación de textos.", "Destrezas básicas.", "Apreciación del texto."], answer: "A", exp: "La superestructura se refiere a la organización global del texto.", area: "Lenguaje" },
      { q: "Manuel lee oraciones progresivamente más complejas sobre una mariposa. ¿Por qué desarrolla fluidez y velocidad lectora?", opts: ["Porque estimula el uso de estructuras sintácticas.", "Porque fomenta la prolongación en la producción de textos.", "Porque desarrolla el aprendizaje y comprensión de nuevas palabras.", "Porque promueve la extensión de las sílabas que componen las palabras."], answer: "A", exp: "La lectura de oraciones cada vez más complejas estimula estructuras sintácticas.", area: "Lenguaje" },
      { q: "Tatiana, 6° Básico, presenta desafíos en planificar textos y reglas gramaticales. Equipo implementa escritura interactiva. ¿Por qué es pertinente?", opts: ["Porque permite asociar nuevos conceptos a ideas globales del texto.", "Porque permite acceder al referente concreto y verbal de palabras desconocidas.", "Porque permite aprender cómo funcionan las palabras y sus combinaciones.", "Porque permite escuchar los sonidos de las letras y asociarlos a su grafema."], answer: "C", exp: "La escritura interactiva permite aprender cómo funcionan las palabras y sus combinaciones.", area: "Lenguaje" },
      { q: "Estudiante lee 'trébol' como 'terbol', 'prado' como 'pardo'. Docente incorpora actividades con estructura CVC vs CCV. ¿Qué argumento justifica esto?", opts: ["Favorecen la comprensión y aplicación del sintagma nominal.", "Permiten unir y relacionar palabras y expresar conceptos coherentemente.", "Permiten conocer y familiarizarse progresivamente con estructuras más complejas.", "Facilitan la comprensión del propósito de una unidad en la estructura gramatical."], answer: "C", exp: "La comparación entre estructuras CVC y CCV permite familiarizarse progresivamente con estructuras más complejas.", area: "Lenguaje" },
      { q: "6° Básico crea un club literario para abordar desinterés por la lectura. ¿Por qué esto permite abordar el problema?", opts: ["Porque se diversifican las formas de presentar el contenido.", "Porque se implementa gradualidad en el nivel de complejidad.", "Porque se entregan nuevos medios de participación y compromiso.", "Porque se proporcionan diversas formas de ejecución y acción."], answer: "C", exp: "El club literario organizado por los estudiantes entrega nuevos medios de participación y compromiso (DUA).", area: "DUA" },
      { q: "Darío, 6° Básico, maneja tablas de multiplicar pero no multiplicaciones de múltiples dígitos. ¿En qué ámbito matemático requiere apoyo?", opts: ["Algoritmo.", "Series numéricas.", "Concepto de número.", "Resolución de problemas."], answer: "A", exp: "Darío necesita apoyo en el algoritmo de la multiplicación.", area: "Matemática" },
      { q: "Camila maneja las 4 operaciones básicas pero organiza operatoria combinada aleatoriamente. ¿Qué estrategia es pertinente?", opts: ["Incorporar paréntesis para reforzar priorización y luego eliminarlos gradualmente.", "Modelar resolución de izquierda a derecha como regla general.", "Establecer agrupación de operaciones equivalentes.", "Reforzar secuencia: primero suma, luego multiplicación y división, luego resta."], answer: "A", exp: "Incorporar paréntesis ayuda a priorizar operaciones, reforzando la jerarquía.", area: "Matemática" },
      { q: "Claudia, 3° Básico, no ha desarrollado clasificación y seriación. ¿Qué recurso es apropiado?", opts: ["Ábaco.", "Multibase.", "Caja Mackinder.", "Bloques lógicos."], answer: "D", exp: "Los bloques lógicos desarrollan clasificación y seriación.", area: "Matemática" },
      { q: "Pedro resuelve mal un problema de resta con dulces. ¿En qué debe centrarse el apoyo?", opts: ["En la encolumnación para el cálculo.", "En la adquisición de la noción de cantidad.", "En la selección de la operación a partir de claves semánticas del problema.", "En la identificación de la representación simbólica del número."], answer: "C", exp: "Pedro debe aprender a seleccionar la operación correcta a partir de claves semánticas.", area: "Matemática" },
      { q: "Orlando requiere apoyo en matemática con conteo de fichas. ¿Qué acción pedagógica es pertinente?", opts: ["Desordenar conjuntos para que el estudiante los ordene por formas.", "Mostrar fichas, contarlas, agregar/quitar y volver a contar buscando el resultado.", "Entregar bolitas para contar y asociar con dados.", "Entregar piezas de lego, contarlas, hacer figuras y comparar con cantidad inicial."], answer: "D", exp: "Manipular materiales y comparar cantidades desarrolla la conservación de la cantidad.", area: "Matemática" },
      { q: "Genaro identifica datos y operaciones correctamente pero se equivoca al calcular. ¿Qué acción es pertinente sin disminuir el ámbito numérico?", opts: ["Implementar el uso de calculadora.", "Establecer el subrayado de palabras clave.", "Incrementar el tiempo de resolución.", "Presentar material audiovisual con organización de datos."], answer: "A", exp: "Usar calculadora ayuda a corregir errores de cálculo sin disminuir el ámbito numérico.", area: "Matemática" },
      { q: "Martín resuelve operaciones básicas pero no asocia una operación al lenguaje algebraico. ¿Qué acción pedagógica es adecuada?", opts: ["Facilitar el reconocimiento de cada término numérico.", "Favorecer operaciones aritméticas de menor complejidad.", "Mediar operaciones con cantidades numéricas y literales.", "Elaborar un glosario con claves lingüísticas para resolver este tipo de ejercicios."], answer: "D", exp: "Un glosario con claves lingüísticas ayuda a traducir el lenguaje natural a expresiones algebraicas.", area: "Matemática" },
      { q: "Reparto de 20 gomitas y 10 pastillas de menta, se pregunta el total de dulces. ¿Qué noción pre-lógica se trabaja?", opts: ["Seriación.", "Cardinalidad.", "Conservación.", "Inclusión de clase."], answer: "D", exp: "Contar subconjuntos y luego el total trabaja la noción de inclusión de clase.", area: "Matemática" },
      { q: "2° Básico compara conjuntos, reconoce representaciones numéricas y agrupa por atributos. ¿Qué contenido matemático está a la base?", opts: ["Valor posicional.", "Operatoria básica.", "Concepto de número.", "Secuencias numéricas."], answer: "C", exp: "Las actividades de comparación y agrupación desarrollan el concepto de número.", area: "Matemática" },
      { q: "Agustín trabaja producir, cuantificar y comparar colecciones con 'más que - menos que'. ¿Qué noción trabaja la docente?", opts: ["Abstracción.", "Ordinalidad.", "Cardinalidad.", "Clasificación."], answer: "C", exp: "Cuantificar colecciones y compararlas desarrolla la noción de cardinalidad.", area: "Matemática" },
      { q: "1° Básico manipula porotos, palos y autos: agrupar, ordenar, clasificar; luego dibujan conjuntos asociados a números. ¿Qué OA se trabaja?", opts: ["Comprender el concepto de número.", "Identificar figuras con material concreto.", "Resolver ejercicios de operatoria simbólica.", "Realizar composición de números desde su representación."], answer: "A", exp: "Las actividades de manipulación y asociación a números desarrollan el concepto de número.", area: "Matemática" },
      { q: "Formar el menor y mayor número posible con tarjetas. ¿Qué concepto matemático se trabaja?", opts: ["Antecesor - sucesor.", "Secuencia numérica.", "Composición - descomposición.", "Valor posicional."], answer: "D", exp: "Formar el mayor y menor número con tarjetas trabaja el valor posicional.", area: "Matemática" },
      { q: "Camilo comete errores repetidos en cuadrado de binomio. ¿Qué procedimiento matemático implementar?", opts: ["Fomentar memorización de la fórmula de suma por diferencia.", "Facilitar reconocimiento de polinomios.", "Promover ejercitación de multiplicación asociada a operatoria combinada.", "Favorecer reconocimiento de la regla de signos de adición y sustracción."], answer: "C", exp: "Camilo necesita ejercitar la multiplicación y operatoria combinada.", area: "Matemática" },
      { q: "2° Básico inicia multiplicación pero aún tiene dificultades con la adición. ¿Qué adecuación curricular contribuye?", opts: ["Extender la temporalización de objetivos de multiplicación.", "Enriquecer objetivos con mecánica operatoria de multiplicación.", "Priorizar objetivos básicos para adquisición de nuevos contenidos.", "Suprimir objetivos de multiplicación y enfocarse en adición."], answer: "C", exp: "Priorizar objetivos básicos permite consolidar la adición antes de la multiplicación.", area: "Matemática" },
      { q: "Estudiantes no logran extraer información para identificar la operación en problemas de adición/sustracción. ¿Qué adecuación de acceso ayuda?", opts: ["Ofrecer ejercicios de operatoria reducida a dos cifras.", "Otorgar inicialmente ejercicios que solo impliquen adición.", "Entregar la formulación u operatoria matemática por resolver.", "Dar un listado de palabras clave de expresiones matemáticas."], answer: "D", exp: "Entregar palabras clave ayuda a identificar la operación a realizar.", area: "Matemática" },
      { q: "Julián clasifica animales y cuerpos geométricos con dificultad. ¿Qué adecuación contribuye a que progrese?", opts: ["Modificar el OA y/o las habilidades cognitivas exigidas.", "Priorizar conceptos motivantes para consolidar aprendizajes.", "Flexibilizar la temporalización con tiempo adicional decreciente.", "Graduar actividades partiendo de categorías familiares hacia nuevas."], answer: "D", exp: "Graduar actividades partiendo de categorías familiares para luego introducir otras es pertinente.", area: "Estrategias" },
      { q: "Estudiante resuelve mal un ejercicio de fracciones; profesora sugiere detallar pasos y expresarlo pictóricamente. ¿Por qué es pertinente?", opts: ["Permitirá simplificación y amplificación de denominadores simbólicamente.", "Permitirá descomponer factorialmente y obtener el mínimo común múltiplo.", "Permitirá visualizar el error a través de distintas representaciones.", "Facilitará identificar numerador, denominador y signos."], answer: "C", exp: "Expresar el procedimiento pictóricamente permite visualizar el error en la operatoria.", area: "Matemática" },
      { q: "6° Básico trabaja adición de fracciones con distinto denominador usando guías con distintos niveles de dificultad. ¿Por qué es adecuada?", opts: ["Porque permite entregar diversas formas de representación a todos.", "Porque facilita mantener un nivel de desafío constante y aumentar la eficacia.", "Porque favorece el trabajo con quienes muestran dificultades.", "Porque permite trabajar el contenido en diversos periodos de tiempo."], answer: "B", exp: "Guías con distintos niveles mantienen un desafío constante y aumentan la sensación de eficacia.", area: "Matemática" },
      { q: "3° Medio: crisis económica de 1930 y salitreras. ¿Qué acción pedagógica diversifica la enseñanza de este contenido?", opts: ["Proponer espacios de expresión oral, disertaciones o representaciones.", "Entregar mapas, gráficos, documentales e imágenes.", "Facilitar el uso de distintos tipos de texto o guías.", "Proponer un ensayo sobre el impacto de la crisis."], answer: "B", exp: "Entregar mapas, gráficos, documentales e imágenes diversifica la presentación de información.", area: "Estrategias" },
      { q: "¿Qué recomendación es pertinente para que un estudiante con TDA logre focalizar la atención en el aula?", opts: ["Reforzar positivamente actitudes beneficiosas.", "Informar el objetivo específico y tiempos de ejecución en cada actividad.", "Establecer una rutina de trabajo anticipada y estable.", "Definir reglas de convivencia alcanzables con consecuencias claras."], answer: "C", exp: "Una rutina de trabajo estable y anticipada ayuda a focalizar la atención.", area: "Estrategias" },
      { q: "Equipo de aula y apoderados diseñan tabla de compromiso semanal. ¿Qué objetivo se ve favorecido?", opts: ["Fomentar autoconcepto frente a los deberes.", "Favorecer hábitos de estudio.", "Fortalecer las funciones ejecutivas.", "Propiciar la persistencia en la tarea."], answer: "C", exp: "El plan de compromiso semanal fortalece las funciones ejecutivas.", area: "Estrategias" },
      { q: "Benjamín interrumpe, conversa durante instrucciones y se levanta frecuentemente. ¿Qué aspecto trabajar?", opts: ["Autorregulación.", "Fortalecimiento de la autoestima.", "Procesamiento de la información.", "Focalización de la atención ante un estímulo."], answer: "A", exp: "Benjamín requiere desarrollar autorregulación para controlar sus impulsos.", area: "Estrategias" },
      { q: "¿Cuál opción sintetiza el concepto de aprendizaje de Piaget?", opts: ["Es un proceso de desarrollo de habilidades y competencias.", "Es el resultado de la vinculación entre conocimientos previos y nuevos.", "Es una adaptación con equilibrio entre asimilación y acomodación.", "Es una acumulación de experiencias que surge espontáneamente."], answer: "C", exp: "Piaget concibe el aprendizaje como una adaptación con equilibrio entre asimilación y acomodación.", area: "Evaluación" },
      { q: "Desde el enfoque biopsicosocial (CIF), ¿qué refleja la interacción entre sus componentes?", opts: ["La interacción entre factores contextuales y estructuras corporales limita la participación.", "La relación entre factores contextuales y participación determina la asimilación de la condición de salud.", "La relación entre actividades y participación determina la condición de salud y el funcionamiento.", "La interacción entre factores contextuales y la condición de salud modifica el funcionamiento."], answer: "D", exp: "La CIF considera que la interacción entre factores contextuales y condición de salud modifica el funcionamiento.", area: "Evaluación" },
      { q: "¿Cuál es el principal beneficio del modelo biopsicosocial para un estudiante con discapacidad?", opts: ["Participar en propuestas que respondan a barreras derivadas de la discapacidad.", "Participar de un sistema que focaliza en el funcionamiento de la persona.", "Desarrollar aprendizajes acordes a edad mental y grado de discapacidad.", "Participar en contextos facilitadores que promuevan su calidad de vida."], answer: "D", exp: "El modelo biopsicosocial busca contextos educativos facilitadores que promuevan la calidad de vida.", area: "Estrategias" },
      { q: "Equipo considera que la discapacidad de un estudiante es innata e irreversible, afectando su autopercepción. ¿Qué acción priorizar desde el biopsicosocial?", opts: ["Identificar indicadores de autoestima con pruebas psicológicas.", "Identificar la interacción dinámica entre condición de salud y factores contextuales.", "Reformular actividades fuera del aula donde el estudiante tenga éxito.", "Determinar características físicas y funcionales para atención individual."], answer: "B", exp: "Es prioritario identificar la interacción entre condición de salud y factores contextuales.", area: "Estrategias" },
      { q: "¿Cuál opción corresponde a una característica de la Educación Inclusiva?", opts: ["Se centra en igualar los desempeños de la diversidad de estudiantes.", "Se preocupa por facilitar el acceso a la educación de estudiantes con discapacidad.", "Se preocupa por la participación de los estudiantes con mayores dificultades.", "Se enfoca en la interacción entre estudiantes y características del contexto educativo."], answer: "D", exp: "La educación inclusiva se enfoca en la interacción entre estudiantes y contexto educativo.", area: "Estrategias" },
      { q: "Según el Índice de Inclusión (UNESCO), ¿qué enunciado se enmarca en un enfoque inclusivo?", opts: ["Personalizar las experiencias de aprendizaje.", "Participación de todos los alumnos.", "Facilitar el proceso de aprendizaje.", "La incorporación de los profesores de apoyo."], answer: "B", exp: "La participación de todos los alumnos es el eje del enfoque inclusivo.", area: "Estrategias" },
      { q: "1° Básico incorpora gestos, señas, pictogramas para que todos comprendan. ¿Qué concepto refleja esta decisión?", opts: ["Estrategia de diversificación.", "Adecuación curricular de acceso.", "Estrategia de adaptación significativa.", "Adecuación curricular de Objetivos de Aprendizaje."], answer: "B", exp: "Incorporar distintas formas de comunicación es una adecuación curricular de acceso.", area: "Estrategias" },
      { q: "¿Qué decreto estableció los criterios para asignar la subvención de educación especial a estudiantes con NEE?", opts: ["Decreto Supremo N° 332/2011.", "Decreto N° 01/1998.", "Decreto Exento N° 83/2015.", "Decreto Supremo N° 170/2009."], answer: "D", exp: "El Decreto Supremo N° 170/2009 establece los criterios para la subvención de educación especial.", area: "Marco Normativo" },
      { q: "Juan recibe atención en aula hospitalaria. ¿Qué normativa respalda su derecho a educación más allá de su condición de salud?", opts: ["Ley N°20.845/2015.", "Ley N°20.422/2010.", "Ley N°20.370/2009.", "Decreto Exento N°83/2015."], answer: "A", exp: "La Ley de Inclusión Escolar (20.845) garantiza el derecho a educación de todos los estudiantes.", area: "Marco Normativo" },
      { q: "¿Qué normativa promueve un sistema escolar que respeta proyectos educativos, culturas y religiones de las familias?", opts: ["Decreto Exento N°83/2015.", "Ley N°20.370/2009.", "Ley N°20.845/2015.", "Ley N°20.422/2010."], answer: "C", exp: "La Ley de Inclusión Escolar (20.845) promueve el respeto a distintos proyectos educativos y culturas.", area: "Marco Normativo" },
      { q: "Macarena obtiene 78 puntos en WISC III. Según el Decreto N°170, ¿con qué diagnóstico se asocia?", opts: ["Dificultad Específica del Aprendizaje (DEA).", "Disfasia Mixta.", "Funcionamiento Intelectual Rango Límite (FIL).", "Discapacidad Intelectual Leve (DI)."], answer: "C", exp: "Un CI de 78 se encuentra en el rango de FIL (70-79).", area: "Evaluación" },
      { q: "¿Cuál situación corresponde a una DEA en lectura según el Decreto N°170?", opts: ["Vocabulario descendido, dificultades de memorización y errores gramaticales.", "Dificultades para retener y comprender información global, sin planificar estrategias.", "Bajo desempeño en varias disciplinas por no centrarse en tareas escolares.", "Dificultades en memorización, retención e integración de fonemas."], answer: "D", exp: "La DEA en lectura afecta procesos fonológicos: memorización, retención e integración de fonemas.", area: "Evaluación" },
      { q: "Según el Decreto N°170, ¿con qué procedimiento comienza el ingreso de un estudiante con NEE al PIE?", opts: ["Firma de autorización.", "Entrevista de anamnesis.", "Evaluación diagnóstica.", "Aplicación de pruebas estandarizadas."], answer: "A", exp: "El ingreso al PIE comienza con la firma de autorización de los padres.", area: "PIE" },
      { q: "¿Cuál es el aporte del Decreto N°83 a la gestión curricular?", opts: ["Propone criterios y orientaciones para la diversificación de la enseñanza.", "Determina procedimientos para el desarrollo de Programas de Integración Escolar.", "Establece normas para el diagnóstico de NEE.", "Entrega normas técnico-pedagógicas para atender NEE asociadas a discapacidad."], answer: "A", exp: "El Decreto 83 propone criterios y orientaciones para la diversificación de la enseñanza.", area: "Marco Normativo" },
      { q: "Según la Ley N°20.422 (Diseño Universal), ¿qué representa una aplicación en el proceso educativo?", opts: ["Proponer planes específicos según posibilidades de aprendizaje.", "Generar adecuaciones curriculares para NEE.", "Proponer estrategias con variadas formas de presentación, ejecución y compromiso.", "Otorgar recursos especializados según requerimientos."], answer: "C", exp: "El Diseño Universal se aplica con estrategias de presentación, ejecución y compromiso variadas.", area: "DUA" },
      { q: "Según el Decreto N°83, ¿en qué situación se aplica una adecuación curricular de los OA?", opts: ["Cuando presenten NEE de carácter permanente.", "Cuando obtengan resultados bajo lo esperado en test estandarizados.", "Cuando no logren progresar pese a estrategias diversificadas.", "Cuando no obtengan resultados para la promoción del nivel."], answer: "C", exp: "Se aplican adecuaciones de OA cuando no hay progreso pese a estrategias diversificadas.", area: "Marco Normativo" },
      { q: "Eusebio no logra resolver problemas matemáticos esperados. Se organiza un PACI con talleres de organización de datos. ¿Qué criterio se consideró?", opts: ["Graduación de complejidad de un contenido sobre otro.", "Selección y priorización de OA fundamentales y conocidos.", "Flexibilización de los tiempos de aprendizaje.", "Enriquecimiento y complementariedad con aprendizajes específicos."], answer: "D", exp: "El PACI organiza talleres de reforzamiento como enriquecimiento del currículum.", area: "PIE" },
      { q: "Planificación incorpora transmitir mensajes gráficos con múltiples formas. ¿Qué criterio de adecuación se realizó?", opts: ["Graduación del nivel de complejidad.", "Priorización de objetivos y contenido.", "Enriquecimiento con objetivos no previstos en las Bases Curriculares.", "Eliminación de objetivos de aprendizaje."], answer: "C", exp: "La planificación incorpora objetivos no previstos, es decir enriquecimiento curricular.", area: "Marco Normativo" },
      { q: "Lucas requiere sistema alternativo de comunicación para alcanzar aprendizajes del nivel. ¿Qué criterio se consideró?", opts: ["Presentación de la información.", "Enriquecimiento del currículum.", "Graduación del nivel de complejidad.", "Priorización de objetivos y contenidos."], answer: "A", exp: "El sistema alternativo de comunicación es una adecuación en la presentación de la información.", area: "Estrategias" },
      { q: "Según el Decreto N°83, ¿cuál es el aporte de las Bases Curriculares para elaborar un PACI?", opts: ["Establecer estrategias de atención a la diversidad.", "Detallar contenidos mínimos obligatorios.", "Delimitar orientaciones para adecuaciones curriculares.", "Determinar los aprendizajes básicos imprescindibles."], answer: "D", exp: "Las Bases Curriculares determinan los aprendizajes básicos imprescindibles para el PACI.", area: "PIE" }
    ]
  },

  2019: {
    color: "#7c3aed",
    label: "2019",
    questions: [
      { q: "Grupo multigrado con dificultades en componentes simbólicos, operatorias y resolución de problemas matemáticos. ¿Qué batería es más pertinente?", opts: ["Prueba de Longeot", "Prueba Yo y las Matemáticas", "Prueba de Retención Numérica", "Prueba de Comportamiento Matemático"], answer: "D", exp: "La PCM evalúa componentes simbólicos, operatorias y resolución de problemas.", area: "Evaluación" },
      { q: "Camilo, 3° Básico, lee con ritmo y entonación un poema confundiendo 'río' por 'frío'. ¿Qué proceso cognitivo interviene?", opts: ["Memoria visual", "Discriminación visual", "Organización espacial", "Coordinación óculo-manual"], answer: "B", exp: "La confusión de palabras similares evidencia dificultades de discriminación visual.", area: "Evaluación" },
      { q: "Isidora resuelve mal el porcentaje de una pared pintada, sin ordenar factores en regla de tres. ¿Cuál es su requerimiento de apoyo?", opts: ["Conocer estrategias de proporcionalidad para determinar relevancia de factores.", "Comprender procedimientos de la regla de tres directa y ordenar factores.", "Identificar fases de resolución del problema.", "Aplicar regla de tres inversa con magnitudes inversamente proporcionales."], answer: "B", exp: "Isidora no ordena correctamente los factores en la regla de tres.", area: "Matemática" },
      { q: "Carlos, 4° Básico, agrega letras o sílabas que no corresponden en su escritura. ¿Qué tipo de desafío se observa?", opts: ["Inversiones", "Inserciones", "Transposiciones", "Hiposegmentaciones"], answer: "B", exp: "Carlos agrega letras o sílabas que no corresponden, lo que indica inserciones.", area: "Lenguaje" },
      { q: "Carla, 2° Básico, produce hiposegmentaciones de palabras en escritura espontánea. ¿Qué objetivo es prioritario?", opts: ["Desarrollar aspectos funcionales de la dimensión motriz y simbólica.", "Modelar posición de mano, muñeca y papel según lateralidad.", "Enriquecer vocabulario con adjetivos exactos y sustantivos precisos.", "Fortalecer habilidades semánticas para sentido global de frases."], answer: "C", exp: "La hiposegmentación se aborda fortaleciendo conciencia de palabra y vocabulario.", area: "Lenguaje" },
      { q: "Fernanda responde con tema no relacionado a una pregunta sobre serpientes ('tengo un perro'). ¿En qué nivel del lenguaje requiere apoyo?", opts: ["Nivel Sintáctico", "Nivel Semántico", "Nivel Pragmático", "Nivel Morfológico"], answer: "C", exp: "No responder a la pregunta y cambiar de tema muestra dificultad pragmática.", area: "Lenguaje" },
      { q: "Pilar, 3° Básico, presenta trazos irregulares al escribir oraciones desde imágenes. ¿Cuál es su principal desafío?", opts: ["Eficiencia motriz", "Organización espacial", "Coordinación dinámica", "Disociación de movimiento"], answer: "C", exp: "Presenta dificultades en la coordinación dinámica de la escritura.", area: "Lenguaje" },
      { q: "Docente de 2° Básico usa cantos familiares, libros predecibles y biblioteca en aula. ¿Qué modelo de lectoescritura usa?", opts: ["Holístico", "Integrado", "De destrezas", "Transaccional"], answer: "A", exp: "El modelo holístico parte de textos completos y significativos.", area: "Lenguaje" },
      { q: "Carlos al dictado invierte y rota grafemas con baja fluidez. ¿Cuál es su principal desafío en escritura?", opts: ["Omisiones, traslaciones de grafemas y trazo grueso.", "Hiposegmentaciones de palabras y trazos poco uniformes.", "Inversiones, rotaciones de grafemas y dificultades en fluidez.", "Mezclas y agregados de grafemas."], answer: "C", exp: "Invierte y rota grafemas, además de baja fluidez, típico de DEA en escritura.", area: "Lenguaje" },
      { q: "1° Básico: docente muestra título, tipos de letra y portada para predecir. ¿Qué estrategia usa?", opts: ["Superestructura", "Interrogación de textos", "Destrezas básicas", "Apreciación del texto"], answer: "A", exp: "La superestructura se refiere a la organización global del texto.", area: "Lenguaje" },
      { q: "5° Básico completa un mapa conceptual sobre su casa. ¿Qué habilidad psicolingüística se estimula?", opts: ["Integración gramatical", "Comprensión visual", "Abstracción verbal", "Memoria secuencial"], answer: "C", exp: "Completar un mapa conceptual requiere abstraer y organizar verbalmente la información.", area: "Lenguaje" },
      { q: "Proceso cognitivo que discrimina, segmenta, modifica e integra secuencias de palabras. ¿A qué proceso alude?", opts: ["Decodificación", "Asociación visual", "Conciencia fonológica", "Categorización verbal"], answer: "C", exp: "La definición describe la conciencia fonológica.", area: "Evaluación" },
      { q: "Ignacio no recuerda enunciados simples ni deletrea palabras cotidianas. Educadora usa láminas cuadriculadas para pintar según modelo. ¿Qué proceso se aborda?", opts: ["Memoria visual", "Memoria verbal", "Percepción visual", "Discriminación visual"], answer: "A", exp: "Recordar y reproducir un patrón visual trabaja la memoria visual.", area: "Evaluación" },
      { q: "Blanca no sabe ordenar sus ideas al construir oraciones con palabras móviles. ¿Cuál es su requerimiento de apoyo?", opts: ["Mejorar el seguimiento de instrucciones.", "Aumentar el vocabulario activo y pasivo.", "Favorecer la legibilidad tipográfica.", "Identificar combinaciones de palabras para organizar unidades."], answer: "D", exp: "Blanca necesita apoyo para organizar palabras en oraciones con estructura gramatical.", area: "Lenguaje" },
      { q: "Manuel lee oraciones progresivamente más complejas. ¿Por qué desarrolla fluidez y velocidad lectora?", opts: ["Porque estimula el uso de estructuras sintácticas.", "Porque fomenta la prolongación en producción de textos.", "Porque desarrolla comprensión de nuevas palabras.", "Porque promueve la extensión de sílabas."], answer: "A", exp: "La lectura de oraciones progresivamente complejas estimula estructuras sintácticas.", area: "Lenguaje" },
      { q: "Docente pregunta '¿por qué creen?' durante lectura compartida de 'El Gorila Razán'. ¿Cuál es el propósito principal?", opts: ["Realizar conjeturas a partir de lo leído.", "Focalizar la atención de los estudiantes.", "Reconocer la idea global del texto.", "Favorecer el modelamiento de la lectura."], answer: "A", exp: "La docente busca que los estudiantes realicen conjeturas a partir de lo leído.", area: "Lenguaje" },
      { q: "Darío maneja tablas de multiplicar pero no multiplicaciones de múltiples dígitos. ¿En qué ámbito requiere apoyo?", opts: ["Algoritmo", "Series numéricas", "Concepto de número", "Resolución de problemas"], answer: "A", exp: "Darío necesita apoyo en el algoritmo de la multiplicación.", area: "Matemática" },
      { q: "4° Básico tiene dificultades para extraer información y otorgar sentido a la lectura sobre contaminación en Chiloé. ¿Qué estrategia del modelo integrado ayuda?", opts: ["Implementar lectura compartida para formular hipótesis y predicciones.", "Entregar un cuadro organizativo con estrategias de comprensión.", "Realizar parafraseo visual de palabras que van escuchando.", "Trabajar lecturas predecibles con patrones repetitivos."], answer: "B", exp: "El modelo integrado combina destrezas y significado; un cuadro de estrategias apoya la comprensión.", area: "Lenguaje" },
      { q: "Claudia, 3° Básico, no ha desarrollado clasificación y seriación. ¿Qué recurso es apropiado?", opts: ["Ábaco", "Multibase", "Caja Mackinder", "Bloques lógicos"], answer: "D", exp: "Los bloques lógicos desarrollan clasificación y seriación.", area: "Matemática" },
      { q: "4° Básico distingue datos relevantes con dificultad. Equipo usa el 'Método de cuatro pasos de Polya'. ¿Por qué es adecuado?", opts: ["Desarrolla relación entre lenguaje y matemática afianzando destrezas lingüísticas.", "Fomenta el proceso de descubrimiento de la reflexión lógica.", "Favorece la comprensión con contextos relacionados a su entorno.", "Posibilita la comprensión de algoritmos aplicados."], answer: "B", exp: "El método de Polya fomenta la reflexión lógica y el descubrimiento en la solución de problemas.", area: "Matemática" },
      { q: "2° Básico: pareja tiene desafíos al reconstruir la historia de un cuento con imágenes. ¿Qué objetivo es prioritario?", opts: ["Realizar juegos con patrones para organizar elementos.", "Establecer agrupaciones por semejanzas y diferencias.", "Facilitar guía recortable para justificar criterio de agrupación.", "Entregar numerales y solicitar dibujar la cantidad."], answer: "A", exp: "La secuencia temporal se aborda mediante juegos de organización de patrones.", area: "Matemática" },
      { q: "Martín resuelve las 4 operaciones pero no asocia una operación al lenguaje algebraico. ¿Qué acción pedagógica ayuda?", opts: ["Facilitar reconocimiento de términos numéricos.", "Favorecer operaciones aritméticas de menor complejidad.", "Mediar en ejercicios de operatoria con cantidades numéricas y literales.", "Elaborar un glosario con claves lingüísticas."], answer: "D", exp: "Un glosario con claves lingüísticas ayuda a traducir el lenguaje natural a expresiones algebraicas.", area: "Matemática" },
      { q: "7° Básico tiene desafíos con amplificación y tablas de multiplicar en fracciones. Profesora modela el método MCM. ¿Por qué es adecuado?", opts: ["Enfatiza importancia de operaciones básicas.", "Favorece reconocimiento de multiplicación de términos.", "Apoya el procedimiento del algoritmo mediante reducción a denominador universal.", "Estimula memoria visual del algoritmo de multiplicación."], answer: "C", exp: "El método MCM apoya el algoritmo de reducción de fracciones a denominador común.", area: "Matemática" },
      { q: "Rafael no reconoce números grandes al escribirlos con palabras. ¿Qué estrategia es más apropiada?", opts: ["Ejercitar sistema decimal con cubos multibase.", "Elaborar análisis y síntesis con tablero posicional.", "Trabajar valor de números con bloques lógicos.", "Identificar posición de un elemento con bingo numeral."], answer: "B", exp: "El tablero posicional ayuda a comprender la composición simbólica de números grandes.", area: "Matemática" },
      { q: "1° Medio tiene desafíos identificando ideas globales de 'Hamlet'. ¿Qué actividad facilita la comprensión?", opts: ["Leer un acto seleccionando palabras clave.", "Construir un organizador gráfico con personajes, acciones, ambientes y tiempo.", "Resolver interrogantes previas identificando de quién se habla.", "Elaborar una síntesis con lenguaje cercano por acto."], answer: "B", exp: "Un organizador gráfico ayuda a identificar la estructura global de la obra.", area: "Lenguaje" },
      { q: "Camilo comete errores repetidos en cuadrado de binomio. ¿Qué procedimiento implementar?", opts: ["Fomentar memorización de la fórmula de suma por diferencia.", "Facilitar reconocimiento de polinomios.", "Promover ejercitación de multiplicación asociada a operatoria combinada.", "Favorecer regla de signos de adición y sustracción."], answer: "C", exp: "Camilo necesita ejercitar la multiplicación y operatoria combinada.", area: "Matemática" },
      { q: "2° Básico inicia multiplicación con dificultades aún en adición. ¿Qué adecuación contribuye?", opts: ["Extender temporalización de objetivos de multiplicación.", "Enriquecer objetivos con mecánica de multiplicación.", "Priorizar objetivos básicos para adquisición de nuevos contenidos.", "Suprimir objetivos de multiplicación."], answer: "C", exp: "Priorizar objetivos básicos permite consolidar la adición antes de la multiplicación.", area: "Matemática" },
      { q: "Rafael no reconoce números tan grandes en pizarra. ¿Qué estrategia es apropiada para su participación?", opts: ["Ejercitar sistema decimal con cubos multibase para descomposición.", "Elaborar análisis y síntesis con tablero posicional.", "Trabajar valor de números con bloques lógicos.", "Identificar posición de elementos con bingo numeral."], answer: "B", exp: "El tablero posicional ayuda a comprender la composición simbólica de números grandes.", area: "Matemática" },
      { q: "Carolina, 10 años, DEA en cálculo. Equipo implementa adecuación de formas de respuesta para valor posicional. ¿Cuál representa esta adecuación?", opts: ["Mostrar video sobre composición y descomposición.", "Entregar un tablero posicional para apoyar composición hasta la milésima.", "Brindar cubos multibase para descomposición hasta 1.000.", "Integrar el contenido con investigación histórica."], answer: "B", exp: "El tablero posicional es una adecuación de forma de respuesta.", area: "Matemática" },
      { q: "Docente de 3° Básico inicia clase con historia personal y carta escondida bajo las mesas. ¿Por qué responde al DUA?", opts: ["Ofrece apoyos a habilidades cognitivas de baja exigencia.", "Personaliza la presentación con formatos flexibles.", "Crea clima de apoyo reduciendo incertidumbre.", "Dispone de vías alternativas para captar el interés."], answer: "D", exp: "El inicio de clase capta el interés y responde a diferencias intra e interindividuales.", area: "DUA" },
      { q: "Pedro, con preferencia kinésica, tiene desafíos comprendiendo recursos expresivos de poemas. ¿Qué adecuación de acceso es pertinente?", opts: ["Seleccionar contenidos básicos para aprendizajes posteriores.", "Flexibilizar el tiempo establecido en el currículum.", "Secuenciar metas más pequeñas o amplias.", "Acceder a modos alternativos de presentar información."], answer: "D", exp: "Una adecuación de acceso debe ofrecer modos alternativos de presentación kinésica.", area: "Estrategias" },
      { q: "Docente busca implicar estudiantes, potenciar planeación y ofrecer múltiples formas de expresión sobre efectos del cigarrillo. ¿Qué estrategia cumple esto?", opts: ["Escoger cómo trabajar, con listado de acciones previo a ejecutar.", "Escoger contenido para maqueta y autoevaluarse.", "Dar información con video, lectura y mapa conceptual.", "Realizar video explicativo con preguntas de metacognición."], answer: "A", exp: "Permite implicación (elección), planeación (listado) y múltiples formas de acción y expresión.", area: "Estrategias" },
      { q: "1° Medio: estudiantes no distinguen lo esencial de lo irrelevante en investigación histórica. ¿Qué estrategia es pertinente?", opts: ["Desarrollar un cuadro entre factores de cambio con ilustraciones.", "Establecer vínculos con imágenes claves.", "Identificar conceptos clave relacionándolos con términos comunes.", "Elaborar esquemas u organizadores gráficos que destaquen hechos."], answer: "D", exp: "Los organizadores gráficos ayudan a distinguir lo esencial de lo irrelevante.", area: "Estrategias" },
      { q: "Santa, estudiante migrante, tiene dificultades con historia de Chile a pesar de estrategias diversificadas. ¿Qué adecuación es pertinente?", opts: ["Seleccionar objetivos prioritarios de historia de Chile.", "Establecer comparaciones con la historia de su país de origen.", "Mostrar canales visual, auditivo y kinestésico.", "Determinar objetivos no relevantes según sus características."], answer: "B", exp: "Comparar con la historia de su país de origen hace el contenido más significativo.", area: "Estrategias" },
      { q: "Carla, altas capacidades, se aburre y distrae a otros. Equipo sugiere investigaciones y tutorías. ¿Qué justificación es coherente?", opts: ["Desarrolla habilidades de autorreflexión.", "Entrega la posibilidad de enfrentar diversos niveles de desafío.", "Posibilita afianzar estructuras internas para memoria de trabajo.", "Proporciona planificar el aprendizaje a través del trabajo colaborativo."], answer: "B", exp: "Las altas capacidades requieren desafíos adicionales que ofrecen investigaciones y tutorías.", area: "Estrategias" },
      { q: "Tania se desorienta al llegar a clases. Equipo incorpora adecuaciones de tiempo y horario. ¿Qué estrategia incorpora a la familia?", opts: ["Incorporar imágenes con pasos de la rutina de llegada.", "Invitar a un familiar a ayudarla en la sala.", "Apoyar practicar rutinas del colegio en el hogar.", "Acordar llegada anticipada para recibir orientaciones."], answer: "C", exp: "Practicar las rutinas en el hogar con la familia facilita la adaptación.", area: "PIE" },
      { q: "Desde el enfoque biopsicosocial (CIF), ¿qué refleja la interacción entre sus componentes?", opts: ["La interacción entre factores contextuales y estructuras corporales limita la participación.", "La relación entre factores contextuales y participación determina la asimilación de la salud.", "La relación entre actividades y participación determina la salud y funcionamiento.", "La interacción entre factores contextuales y condición de salud modifica el funcionamiento."], answer: "D", exp: "La CIF considera que la interacción entre factores contextuales y salud modifica el funcionamiento.", area: "Evaluación" },
      { q: "2° Básico con DEA: equipo selecciona rutinas de resolución de problemas fomentando autorregulación y participación en contextos diversos. ¿Qué estrategia responde?", opts: ["Juego centralizador.", "Experiencias educativas de transición.", "Circuitos comunitarios de aprendizaje.", "Modelado o aprendizaje observacional."], answer: "C", exp: "Los circuitos comunitarios de aprendizaje integran contextos de participación y resolución de problemas.", area: "Estrategias" },
      { q: "José, DEA en lectura/escritura, quiere ser youtuber y graba entrevistas. Desde la neurodiversidad, ¿qué estrategia es pertinente?", opts: ["Incorporarlo al taller de escritura y reemplazar lectura independiente por compartida.", "Entregar resumen escrito e incorporar lecturas en duplas.", "Incluir uso de tecnología: escribir digital e incorporar audiolibros.", "Asignar más tiempo para escritura independiente."], answer: "C", exp: "La neurodiversidad valora las fortalezas; usar tecnología y audiolibros es pertinente para José.", area: "Estrategias" },
      { q: "7° Básico tiene dificultades con vocabulario y conectores en inglés. Equipo implementa actividades progresivas. ¿A qué concepto corresponde?", opts: ["Adecuación curricular.", "Necesidades de apoyo.", "Barreras al aprendizaje.", "Diversificación de la enseñanza."], answer: "D", exp: "Implementar actividades progresivas es una forma de diversificar la enseñanza.", area: "Estrategias" },
      { q: "Según el Índice de Inclusión (UNESCO), ¿qué enunciado se enmarca en un enfoque inclusivo?", opts: ["Personalizar las experiencias de aprendizaje.", "Participación de todos los alumnos.", "Facilitar el proceso de aprendizaje.", "La incorporación de los profesores de apoyo."], answer: "B", exp: "La participación de todos los alumnos es el eje del enfoque inclusivo.", area: "Estrategias" },
      { q: "Juan recibe atención en aula hospitalaria. ¿Qué normativa respalda su derecho a educación más allá de su condición de salud?", opts: ["Ley N°20.845/2015.", "Ley N°20.422/2010.", "Ley N°20.370/2009.", "Decreto Exento N°83/2015."], answer: "A", exp: "La Ley de Inclusión Escolar (20.845) garantiza el derecho a educación de todos los estudiantes.", area: "Marco Normativo" },
      { q: "Macarena obtiene 78 puntos en WISC III. ¿Con qué diagnóstico se asocia según el Decreto N°170?", opts: ["Dificultad Específica del Aprendizaje (DEA).", "Disfasia Mixta.", "Funcionamiento Intelectual Rango Límite (FIL).", "Discapacidad Intelectual Leve (DI)."], answer: "C", exp: "Un CI de 78 se encuentra en el rango de FIL (70-79).", area: "Evaluación" },
      { q: "¿Cuál situación corresponde a una DEA en lectura según el Decreto N°170?", opts: ["Vocabulario descendido con errores gramaticales.", "Dificultades para retener y comprender información global.", "Bajo desempeño por no centrarse en tareas escolares.", "Dificultades en memorización, retención e integración de fonemas."], answer: "D", exp: "La DEA en lectura afecta procesos fonológicos de memorización, retención e integración de fonemas.", area: "Evaluación" },
      { q: "Benjamín y Felipe, DEA, reciben retroalimentación para promover metacognición. ¿Qué tipo de evaluación se aplica según Decreto N°83?", opts: ["Autoevaluación.", "Evaluación sumativa.", "Evaluación formativa.", "Evaluación diferenciada."], answer: "C", exp: "La retroalimentación continua y metacognición son propias de la evaluación formativa.", area: "Evaluación" },
      { q: "María José, DEA, tras evaluación diagnóstica individual, ¿qué acción debe realizar el equipo de aula después según Decreto N°83?", opts: ["Identificar estilo y ritmo de aprendizaje para definir apoyos.", "Definir OA y contenidos que se eliminarán.", "Definir tipos de adecuaciones curriculares requeridas.", "Registrar el plan de adecuaciones señalando estrategias."], answer: "C", exp: "Después de la evaluación diagnóstica se deben definir las adecuaciones curriculares necesarias.", area: "PIE" },
      { q: "6° Básico compañerista tiene dos estudiantes con desafíos en comprensión oral de instrucciones. ¿Qué alternativa es más pertinente?", opts: ["Trabajar con tutoría entre pares y grupos de trabajo.", "Ofrecer diferentes presentaciones y estrategias metacognitivas.", "Un profesional comprueba comprensión ante cada indicación.", "Educador diferencial a cargo exclusivo de estos estudiantes."], answer: "A", exp: "Aprovechar el compañerismo del curso para implementar tutoría entre pares es una práctica inclusiva.", area: "Estrategias" },
      { q: "¿Qué principio orienta la toma de decisiones de las adecuaciones curriculares según Criterios y Orientaciones (MINEDUC, 2015)?", opts: ["Igualdad de oportunidades.", "Calidad educativa con equidad.", "Flexibilidad en la respuesta educativa.", "Inclusión educativa y valoración de la diversidad."], answer: "C", exp: "La flexibilidad en la respuesta educativa permite que el currículo sea relevante y pertinente.", area: "Marco Normativo" },
      { q: "Según el Decreto N°83, ¿qué información sobre el contexto familiar es fundamental en la evaluación diagnóstica individual?", opts: ["Reconocer métodos que usa el estudiante como resultado de condiciones personales.", "Conocer condiciones personales y obstáculos del contexto.", "Identificar logros y aprendizajes previos como puntos de apoyo.", "Considerar factores socioeconómicos, culturales y psicoafectivos."], answer: "D", exp: "La evaluación diagnóstica debe considerar factores socioeconómicos, culturales y psicoafectivos del contexto familiar.", area: "Evaluación" },
      { q: "Javiera demora más tiempo y no termina pruebas. Equipo parcela evaluaciones y usa técnicas de respiración. ¿A qué adecuación corresponde?", opts: ["Temporalización.", "Enriquecimiento del currículum.", "Organización de tiempo y horario.", "Graduación del nivel de complejidad."], answer: "C", exp: "Parcelar evaluaciones y usar técnicas de respiración corresponde a organización del tiempo y horario.", area: "Estrategias" },
      { q: "¿A qué se refiere la toma de decisiones del cuarto nivel de concreción curricular según Decreto N°83?", opts: ["Elaborar planificaciones diversificadas para el curso.", "Seleccionar instrumentos curriculares oficiales para cursos y niveles.", "Propiciar condiciones para el proyecto educativo de atención a la diversidad.", "Implementar adecuaciones curriculares individualizadas para NEE."], answer: "D", exp: "El cuarto nivel de concreción curricular corresponde a las adecuaciones individualizadas para NEE.", area: "Marco Normativo" },
      { q: "Javier, DEA, con dificultades de autorregulación, lectoescritura inicial y solo adiciones con apoyo. ¿Qué considerar antes de adecuar los OA?", opts: ["Que exista una programación diversificada de aula efectiva.", "Que el estudiante presente efectivamente una NEE transitoria.", "Que el estudiante posea un PACI.", "Haber eliminado los OA prescindibles."], answer: "A", exp: "Antes de adecuaciones individuales, debe haber una programación diversificada de aula efectiva.", area: "PIE" },
      { q: "Paulina maneja hasta la unidad de mil; su profesora trabajará con calculadora en ámbitos superiores a 10.000. ¿Qué criterio de adecuación aplicar?", opts: ["Temporalización.", "Enriquecimiento del currículum.", "Graduación del nivel de complejidad.", "Priorización de objetivos y contenidos."], answer: "C", exp: "Paulina requiere graduación del nivel de complejidad, ya que maneja hasta la unidad de mil.", area: "Matemática" }
    ]
  },

  2020: {
    color: "#dc2626",
    label: "2020",
    questions: [
      { q: "¿Cuál corresponde a la definición de 'Discapacidad' desde el Enfoque Biopsicosocial?", opts: ["Es una situación de múltiples desventajas por deficiencias que restringen un rol normal según edad, sexo y contexto.", "Es la condición producida por enfermedad o trauma que necesita cuidados médicos/tratamiento.", "Es un fenómeno de origen social enfocado en la integración plena en sociedad.", "Es un fenómeno multidimensional con interacción entre persona y contexto socioambiental."], answer: "D", exp: "El enfoque biopsicosocial entiende la discapacidad como la interacción entre la persona y su entorno.", area: "Evaluación" },
      { q: "¿Qué acción es necesaria para implementar el Enfoque Ecológico Funcional en la elaboración del PACI?", opts: ["Fortalecer aprendizajes básicos según el impacto en el proyecto de vida.", "Priorizar OA transversales que potencien habilidades sociales.", "Establecer trabajo de habilidades de vida diaria según expectativas familiares.", "Eliminar objetivos de habilidades lingüísticas más complejas."], answer: "A", exp: "El enfoque ecológico funcional prioriza aprendizajes con impacto en el proyecto de vida.", area: "Evaluación" },
      { q: "¿Qué principio sustenta los modelos basados en la diversidad y la inclusión?", opts: ["El desarrollo de métodos de evaluación permite caracterizar mejor las discapacidades.", "La calidad de aprendizaje depende directamente de las características de desarrollo.", "Los factores ambientales y la respuesta educativa son fundamentales.", "Conocer la etiología de los requerimientos permite establecer apoyos adecuados."], answer: "C", exp: "Los modelos inclusivos consideran los factores ambientales y la respuesta educativa como claves.", area: "Estrategias" },
      { q: "¿Cuál medida responde al Enfoque de derecho en la incorporación de principios inclusivos?", opts: ["La incorporación de la subvención especial diferencial.", "La creación de grupos diferenciales en escuelas regulares.", "El establecimiento de medidas contra la discriminación arbitraria.", "El desarrollo de un currículum predeterminado para NEE."], answer: "C", exp: "El enfoque de derecho se refleja en medidas contra la discriminación arbitraria.", area: "Marco Normativo" },
      { q: "¿Por qué la educación inclusiva asume un 'modelo social' para atender la diversidad?", opts: ["Porque la inserción crea una sociedad más justa.", "Porque las personas con discapacidad han sido las más marginadas.", "Porque el sistema educativo desprovee de apoyos para la inserción.", "Porque la sociedad excluye a las personas con discapacidad de escuelas regulares."], answer: "C", exp: "El modelo social enfatiza que la exclusión es causada por la falta de apoyos del sistema.", area: "Estrategias" },
      { q: "Sobre neuroplasticidad: en primera infancia se establecen bases para todo aprendizaje posterior. ¿Qué premisa lo explica?", opts: ["Crecimiento de estructuras cerebrales y craneales.", "Procesos de migración neuronal y especialización.", "Crecimiento de dendritas y aumento de conexiones neuronales.", "Sinaptogénesis o poda neuronal en zonas necesarias."], answer: "C", exp: "En primera infancia se produce un crecimiento exponencial de dendritas y conexiones sinápticas.", area: "Evaluación" },
      { q: "¿Cuál es el principal aporte del Decreto N°67/2018 a los procesos de evaluación?", opts: ["Asegurar el monitoreo constante mediante retroalimentación.", "Procurar diversas formas de evaluación según características e intereses.", "Promover participación activa de estudiantes en la evaluación.", "Permitir eximición de asignaturas si persisten dificultades."], answer: "B", exp: "El Decreto 67 promueve una evaluación diversificada que atienda a la diversidad.", area: "Marco Normativo" },
      { q: "¿Qué normativa establece exigencias de accesibilidad, ajustes necesarios y prevención de discriminación para personas con discapacidad?", opts: ["Ley N°20.845/15", "Ley N°20.422/10", "Decreto Exento N°83/15", "Decreto Supremo N°170/09"], answer: "B", exp: "La Ley 20.422 establece normas sobre igualdad de oportunidades e inclusión social.", area: "Marco Normativo" },
      { q: "Según el Decreto N°170/2009, ¿qué debe hacer el profesor de educación regular en sus 3 horas semanales de PIE?", opts: ["Participar en capacitaciones sobre NEET.", "Planificar adecuaciones curriculares pertinentes.", "Gestionar adquisición de recursos de apoyo.", "Realizar reuniones con apoderados sobre conducta."], answer: "B", exp: "El profesor regular debe planificar adecuaciones curriculares en las horas asignadas al PIE.", area: "PIE" },
      { q: "¿Qué procedimiento está contemplado en el proceso de detección y derivación al PIE según Decreto N°170?", opts: ["Evaluación fonoaudiológica con pruebas validadas nacionalmente.", "Evaluación psicopedagógica que determine NEE y apoyos.", "Examen de salud descartando problemas de audición o visión.", "Observación directa del comportamiento en el aula."], answer: "B", exp: "La evaluación psicopedagógica es el procedimiento clave para determinar NEE y apoyos.", area: "PIE" },
      { q: "¿Qué condiciones debe cumplir el instrumento psicopedagógico según Decreto N°170?", opts: ["Validado y pertinente con la cultura del estudiante.", "Integrado y pertinente con los intereses del estudiante.", "Adaptado y pertinente con aprendizajes previos.", "Individualizado y pertinente con estilo de aprendizaje."], answer: "A", exp: "El instrumento debe ser validado y culturalmente pertinente.", area: "Evaluación" },
      { q: "¿Qué documento se elabora en el proceso de reevaluación según Decreto N°170?", opts: ["Informe de familia.", "Informe de ingreso.", "Informe fonoaudiológico.", "Informe psicopedagógico."], answer: "A", exp: "En la reevaluación se elabora un informe de familia, entre otros.", area: "PIE" },
      { q: "¿Qué situación expresa mejor el Enfoque de Derechos según Bases Curriculares de Educación Parvularia?", opts: ["Notifican a padres que hay cupos PIE para matricular a su hija.", "Reducen jornada por baja disposición en último periodo de la mañana.", "Julián ingresa tarde por condición de salud; equipo brinda apoyos a sus desafíos.", "El Centro de Padres gestiona terapeuta ocupacional externo."], answer: "C", exp: "El enfoque de derechos se cumple cuando el establecimiento brinda apoyos oportunos sin condicionamientos.", area: "Marco Normativo" },
      { q: "3° Básico evalúa formativamente la multiplicación con estaciones rotativas de material concreto, pictórico y simbólico. ¿Qué principio refleja?", opts: ["Estaciones rotativas con material concreto, pictórico y simbólico.", "Guía contextualizada con apoyos gráficos y modelado.", "Proyección de problema con estrategia del 'palito preguntón'.", "Situaciones de compraventa con graduación según estudiante con mayor desafío."], answer: "A", exp: "Las estaciones con múltiples representaciones reflejan los principios del DUA.", area: "DUA" },
      { q: "Sebastián, baja visión y parálisis cerebral, se comunica con señas naturales. ¿Qué principio de adecuación es más adecuado según Decreto N°83?", opts: ["Igualdad de oportunidades.", "Calidad educativa con equidad.", "Flexibilidad en la respuesta educativa.", "Inclusión educativa y valoración de la diversidad."], answer: "C", exp: "El principio de flexibilidad en la respuesta educativa es clave para adecuar el currículo.", area: "Marco Normativo" },
      { q: "Solange, TDA y epilepsia con rigidez motora que afecta su escritura. ¿Qué criterio considerar en la adecuación de acceso?", opts: ["La forma de respuesta debe permitir diferentes formas y ayudas técnicas.", "Comunicación oral/gestual, lectura y escritura como aprendizajes básicos.", "La organización del entorno debe permitir acceso autónomo.", "El grado de complejidad de un contenido debe variar."], answer: "A", exp: "Una adecuación de acceso debe ofrecer múltiples formas de respuesta y ayudas técnicas.", area: "Estrategias" },
      { q: "Según Decreto N°83, ¿qué criterio considerar al graduar el nivel de complejidad de un OA?", opts: ["Plantear objetivos alcanzables y desafiantes basados en el currículum nacional.", "Incorporar objetivos no previstos de primera importancia.", "Seleccionar objetivos básicos imprescindibles.", "Destinar un período más prolongado o fraccionado."], answer: "A", exp: "La graduación debe mantener objetivos basados en el currículum, ajustando el nivel de complejidad.", area: "Marco Normativo" },
      { q: "Estudiante con TEL no sigue instrucciones ni asume roles en juegos motrices. ¿Qué criterio es más apropiado para adecuar el OA?", opts: ["Prescindir de todos los elementos que no logra.", "Sustituir temporalmente por un OA más simple.", "Secuenciar con precisión los niveles de logro.", "Eliminar aspectos que no son aprendizajes de base."], answer: "C", exp: "Secuenciar los niveles de logro permite identificar el nivel de aprendizaje adecuado.", area: "Estrategias" },
      { q: "Camilo, 3° Básico, lee con ritmo confundiendo 'río' por 'frío'. ¿Qué proceso cognitivo interviene?", opts: ["Memoria visual.", "Discriminación visual.", "Organización espacial.", "Coordinación óculo-manual."], answer: "B", exp: "La confusión de palabras similares evidencia dificultades de discriminación visual.", area: "Evaluación" },
      { q: "Pedro invierte mucho esfuerzo en decodificación y no lee con fluidez. ¿Qué tarea fortalece la habilidad necesaria?", opts: ["Identificar claves léxicas en oraciones simples.", "Emplear rasgos prosódicos en la lectura.", "Reconocer términos frecuentes e incorporar conceptos nuevos.", "Establecer relaciones entre signos gráficos y su sonido."], answer: "D", exp: "La decodificación requiere establecer relaciones entre grafemas y fonemas.", area: "Lenguaje" },
      { q: "Ignacio no recuerda enunciados simples ni deletrea. Educadora usa láminas cuadriculadas de patrones. ¿Qué proceso se aborda?", opts: ["Memoria visual.", "Memoria verbal.", "Percepción visual.", "Discriminación visual."], answer: "A", exp: "Recordar y reproducir un patrón visual trabaja la memoria visual.", area: "Evaluación" },
      { q: "María trabaja segmentación silábica y sonidos iniciales/finales. ¿Qué habilidad se trabaja?", opts: ["Atención selectiva.", "Conciencia fonológica.", "Discriminación auditiva.", "Categorización semántica."], answer: "B", exp: "Las actividades trabajan la conciencia fonológica.", area: "Lenguaje" },
      { q: "Grupo multigrado con dificultades en componentes simbólicos y operatorias. ¿Qué batería es pertinente?", opts: ["Prueba de Longeot.", "Prueba Yo y las Matemáticas.", "Prueba de Retención Numérica.", "Prueba de Comportamiento Matemático."], answer: "D", exp: "La PCM evalúa componentes simbólicos, operatorias y resolución de problemas.", area: "Evaluación" },
      { q: "Isidora resuelve mal un problema de porcentaje sin ordenar factores en regla de tres. ¿Cuál es su requerimiento de apoyo?", opts: ["Conocer estrategias de proporcionalidad.", "Comprender procedimientos de regla de tres directa y ordenar factores.", "Identificar fases de resolución del problema.", "Aplicar regla de tres inversa."], answer: "B", exp: "Isidora no ordena correctamente los factores en la regla de tres.", area: "Matemática" },
      { q: "Carlos, 4° Básico, agrega letras o sílabas innecesarias. ¿Qué desafío se observa?", opts: ["Inversiones.", "Inserciones.", "Transposiciones.", "Hiposegmentaciones."], answer: "B", exp: "Carlos agrega letras o sílabas que no corresponden, indicando inserciones.", area: "Lenguaje" },
      { q: "Gabriel comete errores al resolver adición y sustracción en la pizarra. ¿En qué áreas requiere apoyo respectivamente?", opts: ["Concepto de operación y valor posicional.", "Algoritmo y valor posicional.", "Concepto de operación y automatización.", "Automatización y algoritmo."], answer: "B", exp: "Gabriel presenta errores en el algoritmo y en el valor posicional al operar.", area: "Matemática" },
      { q: "Fernanda responde con tema no relacionado ('tengo un perro') a una pregunta sobre serpientes. ¿Qué nivel del lenguaje requiere apoyo?", opts: ["Nivel Sintáctico.", "Nivel Semántico.", "Nivel Pragmático.", "Nivel Morfológico."], answer: "C", exp: "No responder a la pregunta muestra dificultad pragmática.", area: "Lenguaje" },
      { q: "Pilar presenta trazos irregulares al escribir oraciones desde imágenes. ¿Cuál es su principal desafío?", opts: ["Eficiencia motriz.", "Organización espacial.", "Coordinación dinámica.", "Disociación de movimiento."], answer: "C", exp: "Presenta dificultades en la coordinación dinámica de la escritura.", area: "Lenguaje" },
      { q: "Carlos al dictado invierte y rota grafemas con baja fluidez. ¿Cuál es su principal desafío?", opts: ["Omisiones, traslaciones y trazo grueso.", "Hiposegmentaciones y trazos poco uniformes.", "Inversiones, rotaciones y dificultades en fluidez.", "Mezclas y agregados de grafemas."], answer: "C", exp: "Invierte y rota grafemas, además de baja fluidez, típico de DEA en escritura.", area: "Lenguaje" },
      { q: "Blanca no sabe ordenar sus ideas al construir oraciones con palabras móviles. ¿Cuál es su requerimiento de apoyo?", opts: ["Mejorar el seguimiento de instrucciones.", "Aumentar el vocabulario activo y pasivo.", "Favorecer la legibilidad tipográfica.", "Identificar combinaciones para organizar unidades."], answer: "D", exp: "Blanca necesita apoyo para organizar palabras en oraciones con estructura gramatical.", area: "Lenguaje" },
      { q: "¿Cuál instrumento permite evaluar cualitativamente la escritura?", opts: ["CLP", "CL-PT", "TOKEN", "BEVTA"], answer: "D", exp: "El BEVTA evalúa cualitativamente la escritura.", area: "Evaluación" },
      { q: "¿Qué habilidades evalúa el test de Cloze de Condemarín y Milicic?", opts: ["Calidad, velocidad y expresión de ideas de la escritura.", "Velocidad, eficacia lectora y ortografía.", "Comprensión lectora y modos de procesar información.", "Atención y retención de información oral."], answer: "C", exp: "El test de Cloze evalúa comprensión lectora y modos de procesar información.", area: "Evaluación" },
      { q: "Docente quiere determinar nivel lector e identificar signos disléxicos en 3° Básico. ¿Qué instrumento usar?", opts: ["CLP", "PCM", "TEDE", "TOKEN"], answer: "C", exp: "El TEDE identifica signos disléxicos.", area: "Evaluación" },
      { q: "¿Cuál es un propósito del momento 'después de la lectura' en comprensión lectora?", opts: ["Fomentar la utilización de predicciones para mejor comprensión.", "Desarrollar formulación de hipótesis y responder preguntas.", "Trabajar destrezas de incremento de vocabulario.", "Promover el empleo de paráfrasis con propias palabras."], answer: "D", exp: "Después de la lectura se promueve la paráfrasis y la reflexión sobre el texto.", area: "Lenguaje" },
      { q: "Docente pregunta '¿por qué creen?' durante lectura compartida de 'El Gorila Razán'. ¿Cuál es el propósito principal?", opts: ["Realizar conjeturas a partir de lo leído.", "Focalizar la atención de los estudiantes.", "Reconocer la idea global del texto.", "Favorecer el modelamiento de la lectura."], answer: "A", exp: "La docente busca que los estudiantes realicen conjeturas a partir de lo leído.", area: "Lenguaje" },
      { q: "4° Básico tiene dificultades extrayendo información sobre contaminación en Chiloé. ¿Qué estrategia del modelo integrado ayuda?", opts: ["Lectura compartida para formular hipótesis.", "Cuadro organizativo con estrategias de comprensión.", "Parafraseo visual de palabras escuchadas.", "Lecturas predecibles con patrones repetitivos."], answer: "B", exp: "El modelo integrado combina destrezas y significado; un cuadro de estrategias apoya la comprensión.", area: "Lenguaje" },
      { q: "1° Medio tiene desafíos identificando ideas globales de 'Hamlet'. ¿Qué actividad facilita la comprensión?", opts: ["Leer un acto seleccionando palabras clave.", "Construir un organizador gráfico con personajes, acciones y ambientes.", "Resolver interrogantes previas.", "Elaborar síntesis por acto."], answer: "B", exp: "Un organizador gráfico ayuda a identificar la estructura global de la obra.", area: "Lenguaje" },
      { q: "Estudiantes con DEA necesitan apoyo en estructuración de oraciones. ¿Qué actividad estimula el nivel morfosintáctico?", opts: ["Disertaciones grupales sobre un tema de interés.", "Organizar un enunciado con imágenes en grupo.", "Descripción individual de un dibujo favorito.", "Elaborar un cuento propio para leer a compañeros."], answer: "B", exp: "Organizar enunciados con imágenes apoya el desarrollo de la estructura morfosintáctica.", area: "Lenguaje" },
      { q: "4° Básico responde preguntas de activación previa antes de leer 'El lugar más bonito del mundo'. ¿Cuál es la finalidad principal?", opts: ["Realizar conjeturas a partir de la lectura.", "Facilitar identificar elementos estructurales del texto.", "Comprobar predicciones realizadas.", "Otorgar sentido a la lectura con conocimientos previos."], answer: "D", exp: "Las preguntas activan conocimientos previos y otorgan sentido a la lectura.", area: "Lenguaje" },
      { q: "Estudiantes de 2° Básico solo escriben oraciones simples (sustantivo+verbo). ¿Qué actividad trabaja el desafío?", opts: ["Completar oraciones incompletas con opciones de palabras.", "Ordenar palabras para construir oraciones con mayor complejidad.", "Copiar oraciones modelo con estructuras complejas.", "Dictado de oraciones con diferentes estructuras."], answer: "B", exp: "Ordenar palabras para construir oraciones más complejas desarrolla la sintaxis.", area: "Lenguaje" },
      { q: "Mauricio, DEA, escribe mal 'El caballo corre veloz'. ¿Qué actividad sería pertinente proponerle?", opts: ["Copiar la oración separando sílabas.", "Copiar la oración utilizando los rieles.", "Separar en sílabas las palabras.", "Unir las palabras con su significado."], answer: "C", exp: "Separar en sílabas ayuda a la segmentación y escritura correcta de palabras.", area: "Lenguaje" },
      { q: "1° Básico omite sílabas iniciales o intermedias y dibuja la palabra resultante. ¿Qué habilidad se trabaja?", opts: ["Conciencia fonológica.", "Conciencia fonémica.", "Dominio fonético.", "Discriminación auditiva."], answer: "A", exp: "La segmentación y manipulación de sílabas es parte de la conciencia fonológica.", area: "Lenguaje" },
      { q: "Docentes planifican con lluvia de ideas y preguntas orientadoras para escribir una carta. ¿Qué estrategia de escritura usaron?", opts: ["Escritura espontánea.", "Escritura guiada.", "Escritura creativa.", "Escritura consensuada."], answer: "B", exp: "La planificación con lluvia de ideas y preguntas orientadoras es una escritura guiada.", area: "Lenguaje" },
      { q: "Mario descompone el número 5 con material concreto. ¿Qué ejercicio corresponde al nivel simbólico de descomposición aditiva?", opts: ["5 = 3 + 2", "5 = 1 + 4", "5 = 2 + 3", "5 = 0 + 5"], answer: "A", exp: "La descomposición aditiva en el nivel simbólico se representa con una ecuación.", area: "Matemática" },
      { q: "4° Básico distingue datos relevantes con dificultad. Equipo usa el 'Método de cuatro pasos de Polya'. ¿Por qué es adecuado?", opts: ["Desarrolla relación entre lenguaje y matemática.", "Fomenta descubrimiento de la reflexión lógica.", "Favorece comprensión con contextos del entorno.", "Posibilita comprensión de algoritmos aplicados."], answer: "B", exp: "El método de Polya fomenta la reflexión lógica y el descubrimiento en la solución de problemas.", area: "Matemática" },
      { q: "2° Básico: pareja tiene desafíos al reconstruir la historia de un cuento con imágenes. ¿Qué objetivo es prioritario?", opts: ["Juegos con patrones para organizar elementos.", "Agrupaciones por semejanzas y diferencias.", "Guía recortable para justificar criterio de agrupación.", "Numerales para dibujar la cantidad."], answer: "A", exp: "La secuencia temporal se aborda mediante juegos de organización de patrones.", area: "Matemática" },
      { q: "7° Básico usa el método MCM para sumar fracciones. ¿Por qué es adecuado?", opts: ["Enfatiza importancia de operaciones básicas.", "Favorece reconocimiento de multiplicación de términos.", "Apoya el algoritmo mediante reducción a denominador universal.", "Estimula memoria visual del algoritmo."], answer: "C", exp: "El método MCM apoya el algoritmo de reducción de fracciones a denominador común.", area: "Matemática" },
      { q: "Rafael no reconoce números grandes. ¿Qué estrategia es más apropiada para su participación?", opts: ["Ejercitar sistema decimal con cubos multibase.", "Elaborar análisis y síntesis con tablero posicional.", "Trabajar valor de números con bloques lógicos.", "Identificar posición con bingo numeral."], answer: "B", exp: "El tablero posicional ayuda a comprender la composición simbólica de números grandes.", area: "Matemática" },
      { q: "¿Qué material apoya la composición y descomposición aditiva de numerales?", opts: ["Tangram.", "Recta numérica.", "Bloques lógicos.", "Bloques multibase."], answer: "D", exp: "Los bloques multibase son ideales para trabajar composición y descomposición aditiva.", area: "Matemática" },
      { q: "¿Qué material desarrolla observación, comparación, clasificación y seriación?", opts: ["Bloques lógicos.", "Regletas de Cuisenaire.", "Ábaco.", "Tangram."], answer: "A", exp: "Los bloques lógicos desarrollan observación, comparación, clasificación y seriación.", area: "Matemática" },
      { q: "2° Básico confunde conjuntos desiguales con equivalentes. Equipo envía guía de comparación a apoderados. ¿Cuál es el propósito principal?", opts: ["Colaborar con el aprendizaje de la operatoria convencional.", "Fortalecer nociones subyacentes a la operatoria a abordar.", "Establecer hábitos de estudio.", "Anticipar contenidos a tratar en clases."], answer: "B", exp: "Las actividades fortalecen nociones subyacentes como comparación, clasificación y seriación.", area: "Matemática" },
      { q: "Felipe, TDA con hiperactividad, solo está tranquilo frente al computador y madre le hace las tareas. ¿Qué estrategia mejora hábitos de estudio?", opts: ["Implementar un cronograma de rutinas diarias estables.", "Apoyar contenidos con un profesional externo.", "Derivar a psicólogo para terapia conductual.", "Retirar estímulos hasta que logre autorregularse."], answer: "A", exp: "Un cronograma de rutinas estables ayuda a establecer hábitos de estudio y autorregulación.", area: "Estrategias" },
      { q: "Carolina, DEA en cálculo, trabaja valor posicional hasta la milésima. ¿Qué adecuación de forma de respuesta representa esto?", opts: ["Mostrar video de composición y descomposición.", "Entregar tablero posicional para composición hasta la milésima.", "Brindar cubos multibase para descomposición hasta 1.000.", "Integrar con investigación histórica de los números."], answer: "B", exp: "El tablero posicional es una adecuación de forma de respuesta.", area: "Matemática" },
      { q: "Docente de 3° Básico inicia clase con historia personal y carta escondida. ¿Por qué responde al DUA?", opts: ["Ofrece apoyos de baja exigencia cognitiva.", "Personaliza la presentación con formatos flexibles.", "Crea clima de apoyo reduciendo incertidumbre.", "Dispone de vías alternativas para captar el interés."], answer: "D", exp: "El inicio de clase capta el interés y responde a diferencias intra e interindividuales.", area: "DUA" },
      { q: "Pedro, kinésico, tiene desafíos con recursos expresivos de poemas. ¿Qué adecuación de acceso es pertinente?", opts: ["Seleccionar contenidos básicos.", "Flexibilizar el tiempo del currículum.", "Secuenciar metas más pequeñas o amplias.", "Acceder a modos alternativos de presentar información."], answer: "D", exp: "Una adecuación de acceso debe ofrecer modos alternativos de presentación kinésica.", area: "Estrategias" },
      { q: "Docente busca implicar y ofrecer múltiples formas de expresión sobre efectos del cigarrillo. ¿Qué estrategia cumple esto?", opts: ["Escoger cómo trabajar con listado de acciones previo.", "Escoger contenido para maqueta y autoevaluarse.", "Dar información con video, lectura y mapa conceptual.", "Realizar video con preguntas de metacognición."], answer: "A", exp: "Permite implicación, planeación y múltiples formas de acción y expresión.", area: "Estrategias" },
      { q: "1° Medio: estudiantes no distinguen lo esencial de lo irrelevante en investigación histórica. ¿Qué estrategia es pertinente?", opts: ["Cuadro entre factores de cambio con ilustraciones.", "Vínculos con imágenes claves.", "Identificar conceptos clave con términos comunes.", "Esquemas u organizadores gráficos que destaquen hechos."], answer: "D", exp: "Los organizadores gráficos ayudan a distinguir lo esencial de lo irrelevante.", area: "Estrategias" },
      { q: "Santa, migrante, tiene dificultades con historia de Chile. ¿Qué adecuación es pertinente?", opts: ["Seleccionar objetivos prioritarios de historia de Chile.", "Comparar con la historia de su país de origen.", "Mostrar canales visual, auditivo y kinestésico.", "Determinar objetivos no relevantes."], answer: "B", exp: "Comparar con la historia de su país de origen hace el contenido más significativo.", area: "Estrategias" },
      { q: "Carla, altas capacidades, se aburre y distrae a otros. Equipo sugiere investigaciones y tutorías. ¿Qué justificación es coherente?", opts: ["Desarrolla habilidades de autorreflexión.", "Entrega la posibilidad de enfrentar diversos niveles de desafío.", "Posibilita afianzar estructuras internas para memoria de trabajo.", "Proporciona planificar el aprendizaje colaborativamente."], answer: "B", exp: "Las altas capacidades requieren desafíos adicionales que ofrecen investigaciones y tutorías.", area: "Estrategias" },
      { q: "Tania se desorienta al llegar a clases. Equipo incorpora adecuaciones de tiempo y horario. ¿Qué estrategia incorpora a la familia?", opts: ["Incorporar imágenes con pasos de la rutina.", "Invitar a un familiar a ayudarla en la sala.", "Apoyar practicar rutinas del colegio en el hogar.", "Acordar llegada anticipada para recibir orientaciones."], answer: "C", exp: "Practicar las rutinas en el hogar con la familia facilita la adaptación.", area: "PIE" }
    ]
  },

  2021: {
    color: "#f59e0b",
    label: "2021",
    questions: [
      { q: "¿Cuál corresponde a la definición de 'Discapacidad' desde el Enfoque Biopsicosocial?", opts: ["Es una situación de múltiples desventajas por deficiencias que restringen un rol normal según edad, sexo y contexto.", "Es la condición producida por enfermedad o trauma que necesita cuidados médicos/tratamiento.", "Es un fenómeno de origen social enfocado en la integración plena en sociedad.", "Es un fenómeno multidimensional con interacción entre persona y contexto socioambiental."], answer: "D", exp: "El enfoque biopsicosocial entiende la discapacidad como la interacción entre la persona y su entorno.", area: "Evaluación" },
      { q: "¿Qué acción es necesaria para implementar el Enfoque Ecológico Funcional en la elaboración del PACI?", opts: ["Fortalecer aprendizajes básicos según el impacto en el proyecto de vida.", "Priorizar OA transversales que potencien habilidades sociales.", "Establecer trabajo de habilidades de vida diaria según expectativas familiares.", "Eliminar objetivos de habilidades lingüísticas más complejas."], answer: "A", exp: "El enfoque ecológico funcional prioriza aprendizajes con impacto en el proyecto de vida.", area: "Evaluación" },
      { q: "¿Qué principio sustenta los modelos basados en la diversidad y la inclusión?", opts: ["El desarrollo de métodos de evaluación permite caracterizar mejor las discapacidades.", "La calidad de aprendizaje depende directamente de las características de desarrollo.", "Los factores ambientales y la respuesta educativa son fundamentales.", "Conocer la etiología de los requerimientos permite establecer apoyos adecuados."], answer: "C", exp: "Los modelos inclusivos consideran los factores ambientales y la respuesta educativa como claves.", area: "Estrategias" },
      { q: "¿Cuál medida responde al Enfoque de derecho en la incorporación de principios inclusivos?", opts: ["La incorporación de la subvención especial diferencial.", "La creación de grupos diferenciales en escuelas regulares.", "El establecimiento de medidas contra la discriminación arbitraria.", "El desarrollo de un currículum predeterminado para NEE."], answer: "C", exp: "El enfoque de derecho se refleja en medidas contra la discriminación arbitraria.", area: "Marco Normativo" },
      { q: "¿Por qué la educación inclusiva asume un 'modelo social' para atender la diversidad?", opts: ["Porque la inserción crea una sociedad más justa.", "Porque las personas con discapacidad han sido las más marginadas.", "Porque el sistema educativo desprovee de apoyos para la inserción.", "Porque la sociedad excluye a las personas con discapacidad de escuelas regulares."], answer: "C", exp: "El modelo social enfatiza que la exclusión es causada por la falta de apoyos del sistema.", area: "Estrategias" },
      { q: "Sobre neuroplasticidad: en primera infancia se establecen bases para todo aprendizaje posterior. ¿Qué premisa lo explica?", opts: ["Crecimiento de estructuras cerebrales y craneales.", "Procesos de migración neuronal y especialización.", "Crecimiento de dendritas y aumento de conexiones neuronales.", "Sinaptogénesis o poda neuronal en zonas necesarias."], answer: "C", exp: "En primera infancia se produce un crecimiento exponencial de dendritas y conexiones sinápticas.", area: "Evaluación" },
      { q: "¿Cuál es el principal aporte del Decreto N°67/2018 a los procesos de evaluación?", opts: ["Asegurar el monitoreo constante mediante retroalimentación.", "Procurar diversas formas de evaluación según características e intereses.", "Promover participación activa de estudiantes en la evaluación.", "Permitir eximición de asignaturas si persisten dificultades."], answer: "B", exp: "El Decreto 67 promueve una evaluación diversificada que atienda a la diversidad.", area: "Marco Normativo" },
      { q: "¿Qué normativa establece exigencias de accesibilidad, ajustes necesarios y prevención de discriminación para personas con discapacidad?", opts: ["Ley N°20.845/15", "Ley N°20.422/10", "Decreto Exento N°83/15", "Decreto Supremo N°170/09"], answer: "B", exp: "La Ley 20.422 establece normas sobre igualdad de oportunidades e inclusión social.", area: "Marco Normativo" },
      { q: "Según el Decreto N°170/2009, ¿qué debe hacer el profesor de educación regular en sus 3 horas semanales de PIE?", opts: ["Participar en capacitaciones sobre NEET.", "Planificar adecuaciones curriculares pertinentes.", "Gestionar adquisición de recursos de apoyo.", "Realizar reuniones con apoderados sobre conducta."], answer: "B", exp: "El profesor regular debe planificar adecuaciones curriculares en las horas asignadas al PIE.", area: "PIE" },
      { q: "¿Qué procedimiento está contemplado en el proceso de detección y derivación al PIE según Decreto N°170?", opts: ["Evaluación fonoaudiológica con pruebas validadas nacionalmente.", "Evaluación psicopedagógica que determine NEE y apoyos.", "Examen de salud descartando problemas de audición o visión.", "Observación directa del comportamiento en el aula."], answer: "B", exp: "La evaluación psicopedagógica es el procedimiento clave para determinar NEE y apoyos.", area: "PIE" },
      { q: "¿Qué condiciones debe cumplir el instrumento psicopedagógico según Decreto N°170?", opts: ["Validado y pertinente con la cultura del estudiante.", "Integrado y pertinente con los intereses del estudiante.", "Adaptado y pertinente con aprendizajes previos.", "Individualizado y pertinente con estilo de aprendizaje."], answer: "A", exp: "El instrumento debe ser validado y culturalmente pertinente.", area: "Evaluación" },
      { q: "¿Qué documento se elabora en el proceso de reevaluación según Decreto N°170?", opts: ["Informe de familia.", "Informe de ingreso.", "Informe fonoaudiológico.", "Informe psicopedagógico."], answer: "A", exp: "En la reevaluación se elabora un informe de familia, entre otros.", area: "PIE" },
      { q: "¿Qué situación expresa mejor el Enfoque de Derechos según Bases Curriculares de Educación Parvularia?", opts: ["Notifican a padres que hay cupos PIE para matricular a su hija.", "Reducen jornada por baja disposición en último periodo de la mañana.", "Julián ingresa tarde por condición de salud; equipo brinda apoyos a sus desafíos.", "El Centro de Padres gestiona terapeuta ocupacional externo."], answer: "C", exp: "El enfoque de derechos se cumple cuando el establecimiento brinda apoyos oportunos sin condicionamientos.", area: "Marco Normativo" },
      { q: "3° Básico evalúa formativamente la multiplicación con estaciones rotativas de material concreto, pictórico y simbólico. ¿Qué principio refleja?", opts: ["Estaciones rotativas con material concreto, pictórico y simbólico.", "Guía contextualizada con apoyos gráficos y modelado.", "Proyección de problema con estrategia del 'palito preguntón'.", "Situaciones de compraventa con graduación según estudiante con mayor desafío."], answer: "A", exp: "Las estaciones con múltiples representaciones reflejan los principios del DUA.", area: "DUA" },
      { q: "Sebastián, baja visión y parálisis cerebral, se comunica con señas naturales. ¿Qué principio de adecuación es más adecuado según Decreto N°83?", opts: ["Igualdad de oportunidades.", "Calidad educativa con equidad.", "Flexibilidad en la respuesta educativa.", "Inclusión educativa y valoración de la diversidad."], answer: "C", exp: "El principio de flexibilidad en la respuesta educativa es clave para adecuar el currículo.", area: "Marco Normativo" },
      { q: "Solange, TDA y epilepsia con rigidez motora que afecta su escritura. ¿Qué criterio considerar en la adecuación de acceso?", opts: ["La forma de respuesta debe permitir diferentes formas y ayudas técnicas.", "Comunicación oral/gestual, lectura y escritura como aprendizajes básicos.", "La organización del entorno debe permitir acceso autónomo.", "El grado de complejidad de un contenido debe variar."], answer: "A", exp: "Una adecuación de acceso debe ofrecer múltiples formas de respuesta y ayudas técnicas.", area: "Estrategias" },
      { q: "Según Decreto N°83, ¿qué criterio considerar al graduar el nivel de complejidad de un OA?", opts: ["Plantear objetivos alcanzables y desafiantes basados en el currículum nacional.", "Incorporar objetivos no previstos de primera importancia.", "Seleccionar objetivos básicos imprescindibles.", "Destinar un período más prolongado o fraccionado."], answer: "A", exp: "La graduación debe mantener objetivos basados en el currículum, ajustando el nivel de complejidad.", area: "Marco Normativo" },
      { q: "Estudiante con TEL no sigue instrucciones ni asume roles en juegos motrices. ¿Qué criterio es más apropiado para adecuar el OA?", opts: ["Prescindir de todos los elementos que no logra.", "Sustituir temporalmente por un OA más simple.", "Secuenciar con precisión los niveles de logro.", "Eliminar aspectos que no son aprendizajes de base."], answer: "C", exp: "Secuenciar los niveles de logro permite identificar el nivel de aprendizaje adecuado.", area: "Estrategias" },
      { q: "Camilo, 3° Básico, lee con ritmo confundiendo 'río' por 'frío'. ¿Qué proceso cognitivo interviene?", opts: ["Memoria visual.", "Discriminación visual.", "Organización espacial.", "Coordinación óculo-manual."], answer: "B", exp: "La confusión de palabras similares evidencia dificultades de discriminación visual.", area: "Evaluación" },
      { q: "Pedro invierte mucho esfuerzo en decodificación y no lee con fluidez. ¿Qué tarea fortalece la habilidad necesaria?", opts: ["Identificar claves léxicas en oraciones simples.", "Emplear rasgos prosódicos en la lectura.", "Reconocer términos frecuentes e incorporar conceptos nuevos.", "Establecer relaciones entre signos gráficos y su sonido."], answer: "D", exp: "La decodificación requiere establecer relaciones entre grafemas y fonemas.", area: "Lenguaje" },
      { q: "Ignacio no recuerda enunciados simples ni deletrea. Educadora usa láminas cuadriculadas de patrones. ¿Qué proceso se aborda?", opts: ["Memoria visual.", "Memoria verbal.", "Percepción visual.", "Discriminación visual."], answer: "A", exp: "Recordar y reproducir un patrón visual trabaja la memoria visual.", area: "Evaluación" },
      { q: "María trabaja segmentación silábica y sonidos iniciales/finales. ¿Qué habilidad se trabaja?", opts: ["Atención selectiva.", "Conciencia fonológica.", "Discriminación auditiva.", "Categorización semántica."], answer: "B", exp: "Las actividades trabajan la conciencia fonológica.", area: "Lenguaje" },
      { q: "Grupo multigrado con dificultades en componentes simbólicos y operatorias. ¿Qué batería es pertinente?", opts: ["Prueba de Longeot.", "Prueba Yo y las Matemáticas.", "Prueba de Retención Numérica.", "Prueba de Comportamiento Matemático."], answer: "D", exp: "La PCM evalúa componentes simbólicos, operatorias y resolución de problemas.", area: "Evaluación" },
      { q: "Isidora resuelve mal un problema de porcentaje sin ordenar factores en regla de tres. ¿Cuál es su requerimiento de apoyo?", opts: ["Conocer estrategias de proporcionalidad.", "Comprender procedimientos de regla de tres directa y ordenar factores.", "Identificar fases de resolución del problema.", "Aplicar regla de tres inversa."], answer: "B", exp: "Isidora no ordena correctamente los factores en la regla de tres.", area: "Matemática" },
      { q: "Carlos, 4° Básico, agrega letras o sílabas innecesarias. ¿Qué desafío se observa?", opts: ["Inversiones.", "Inserciones.", "Transposiciones.", "Hiposegmentaciones."], answer: "B", exp: "Carlos agrega letras o sílabas que no corresponden, indicando inserciones.", area: "Lenguaje" },
      { q: "Gabriel comete errores al resolver adición y sustracción en la pizarra. ¿En qué áreas requiere apoyo respectivamente?", opts: ["Concepto de operación y valor posicional.", "Algoritmo y valor posicional.", "Concepto de operación y automatización.", "Automatización y algoritmo."], answer: "B", exp: "Gabriel presenta errores en el algoritmo y en el valor posicional al operar.", area: "Matemática" },
      { q: "Fernanda responde con tema no relacionado ('tengo un perro') a una pregunta sobre serpientes. ¿Qué nivel del lenguaje requiere apoyo?", opts: ["Nivel Sintáctico.", "Nivel Semántico.", "Nivel Pragmático.", "Nivel Morfológico."], answer: "C", exp: "No responder a la pregunta muestra dificultad pragmática.", area: "Lenguaje" },
      { q: "Pilar presenta trazos irregulares al escribir oraciones desde imágenes. ¿Cuál es su principal desafío?", opts: ["Eficiencia motriz.", "Organización espacial.", "Coordinación dinámica.", "Disociación de movimiento."], answer: "C", exp: "Presenta dificultades en la coordinación dinámica de la escritura.", area: "Lenguaje" },
      { q: "Carlos al dictado invierte y rota grafemas con baja fluidez. ¿Cuál es su principal desafío?", opts: ["Omisiones, traslaciones y trazo grueso.", "Hiposegmentaciones y trazos poco uniformes.", "Inversiones, rotaciones y dificultades en fluidez.", "Mezclas y agregados de grafemas."], answer: "C", exp: "Invierte y rota grafemas, además de baja fluidez, típico de DEA en escritura.", area: "Lenguaje" },
      { q: "Blanca no sabe ordenar sus ideas al construir oraciones con palabras móviles. ¿Cuál es su requerimiento de apoyo?", opts: ["Mejorar el seguimiento de instrucciones.", "Aumentar el vocabulario activo y pasivo.", "Favorecer la legibilidad tipográfica.", "Identificar combinaciones para organizar unidades."], answer: "D", exp: "Blanca necesita apoyo para organizar palabras en oraciones con estructura gramatical.", area: "Lenguaje" },
      { q: "¿Cuál instrumento permite evaluar cualitativamente la escritura?", opts: ["CLP", "CL-PT", "TOKEN", "BEVTA"], answer: "D", exp: "El BEVTA evalúa cualitativamente la escritura.", area: "Evaluación" },
      { q: "¿Qué habilidades evalúa el test de Cloze de Condemarín y Milicic?", opts: ["Calidad, velocidad y expresión de ideas de la escritura.", "Velocidad, eficacia lectora y ortografía.", "Comprensión lectora y modos de procesar información.", "Atención y retención de información oral."], answer: "C", exp: "El test de Cloze evalúa comprensión lectora y modos de procesar información.", area: "Evaluación" },
      { q: "Docente quiere determinar nivel lector e identificar signos disléxicos en 3° Básico. ¿Qué instrumento usar?", opts: ["CLP", "PCM", "TEDE", "TOKEN"], answer: "C", exp: "El TEDE identifica signos disléxicos.", area: "Evaluación" },
      { q: "¿Cuál es un propósito del momento 'después de la lectura' en comprensión lectora?", opts: ["Fomentar la utilización de predicciones para mejor comprensión.", "Desarrollar formulación de hipótesis y responder preguntas.", "Trabajar destrezas de incremento de vocabulario.", "Promover el empleo de paráfrasis con propias palabras."], answer: "D", exp: "Después de la lectura se promueve la paráfrasis y la reflexión sobre el texto.", area: "Lenguaje" },
      { q: "Docente pregunta '¿por qué creen?' durante lectura compartida de 'El Gorila Razán'. ¿Cuál es el propósito principal?", opts: ["Realizar conjeturas a partir de lo leído.", "Focalizar la atención de los estudiantes.", "Reconocer la idea global del texto.", "Favorecer el modelamiento de la lectura."], answer: "A", exp: "La docente busca que los estudiantes realicen conjeturas a partir de lo leído.", area: "Lenguaje" },
      { q: "4° Básico tiene dificultades extrayendo información sobre contaminación en Chiloé. ¿Qué estrategia del modelo integrado ayuda?", opts: ["Lectura compartida para formular hipótesis.", "Cuadro organizativo con estrategias de comprensión.", "Parafraseo visual de palabras escuchadas.", "Lecturas predecibles con patrones repetitivos."], answer: "B", exp: "El modelo integrado combina destrezas y significado; un cuadro de estrategias apoya la comprensión.", area: "Lenguaje" },
      { q: "1° Medio tiene desafíos identificando ideas globales de 'Hamlet'. ¿Qué actividad facilita la comprensión?", opts: ["Leer un acto seleccionando palabras clave.", "Construir un organizador gráfico con personajes, acciones y ambientes.", "Resolver interrogantes previas.", "Elaborar síntesis por acto."], answer: "B", exp: "Un organizador gráfico ayuda a identificar la estructura global de la obra.", area: "Lenguaje" },
      { q: "Estudiantes con DEA necesitan apoyo en estructuración de oraciones. ¿Qué actividad estimula el nivel morfosintáctico?", opts: ["Disertaciones grupales sobre un tema de interés.", "Organizar un enunciado con imágenes en grupo.", "Descripción individual de un dibujo favorito.", "Elaborar un cuento propio para leer a compañeros."], answer: "B", exp: "Organizar enunciados con imágenes apoya el desarrollo de la estructura morfosintáctica.", area: "Lenguaje" },
      { q: "4° Básico responde preguntas de activación previa antes de leer 'El lugar más bonito del mundo'. ¿Cuál es la finalidad principal?", opts: ["Realizar conjeturas a partir de la lectura.", "Facilitar identificar elementos estructurales del texto.", "Comprobar predicciones realizadas.", "Otorgar sentido a la lectura con conocimientos previos."], answer: "D", exp: "Las preguntas activan conocimientos previos y otorgan sentido a la lectura.", area: "Lenguaje" },
      { q: "Estudiantes de 2° Básico solo escriben oraciones simples (sustantivo+verbo). ¿Qué actividad trabaja el desafío?", opts: ["Completar oraciones incompletas con opciones de palabras.", "Ordenar palabras para construir oraciones con mayor complejidad.", "Copiar oraciones modelo con estructuras complejas.", "Dictado de oraciones con diferentes estructuras."], answer: "B", exp: "Ordenar palabras para construir oraciones más complejas desarrolla la sintaxis.", area: "Lenguaje" },
      { q: "Mauricio, DEA, escribe mal 'El caballo corre veloz'. ¿Qué actividad sería pertinente proponerle?", opts: ["Copiar la oración separando sílabas.", "Copiar la oración utilizando los rieles.", "Separar en sílabas las palabras.", "Unir las palabras con su significado."], answer: "C", exp: "Separar en sílabas ayuda a la segmentación y escritura correcta de palabras.", area: "Lenguaje" },
      { q: "1° Básico omite sílabas iniciales o intermedias y dibuja la palabra resultante. ¿Qué habilidad se trabaja?", opts: ["Conciencia fonológica.", "Conciencia fonémica.", "Dominio fonético.", "Discriminación auditiva."], answer: "A", exp: "La segmentación y manipulación de sílabas es parte de la conciencia fonológica.", area: "Lenguaje" },
      { q: "Docentes planifican con lluvia de ideas y preguntas orientadoras para escribir una carta. ¿Qué estrategia de escritura usaron?", opts: ["Escritura espontánea.", "Escritura guiada.", "Escritura creativa.", "Escritura consensuada."], answer: "B", exp: "La planificación con lluvia de ideas y preguntas orientadoras es una escritura guiada.", area: "Lenguaje" },
      { q: "Mario descompone el número 5 con material concreto. ¿Qué ejercicio corresponde al nivel simbólico de descomposición aditiva?", opts: ["5 = 3 + 2", "5 = 1 + 4", "5 = 2 + 3", "5 = 0 + 5"], answer: "A", exp: "La descomposición aditiva en el nivel simbólico se representa con una ecuación.", area: "Matemática" },
      { q: "4° Básico distingue datos relevantes con dificultad. Equipo usa el 'Método de cuatro pasos de Polya'. ¿Por qué es adecuado?", opts: ["Desarrolla relación entre lenguaje y matemática.", "Fomenta descubrimiento de la reflexión lógica.", "Favorece comprensión con contextos del entorno.", "Posibilita comprensión de algoritmos aplicados."], answer: "B", exp: "El método de Polya fomenta la reflexión lógica y el descubrimiento en la solución de problemas.", area: "Matemática" },
      { q: "2° Básico: pareja tiene desafíos al reconstruir la historia de un cuento con imágenes. ¿Qué objetivo es prioritario?", opts: ["Juegos con patrones para organizar elementos.", "Agrupaciones por semejanzas y diferencias.", "Guía recortable para justificar criterio de agrupación.", "Numerales para dibujar la cantidad."], answer: "A", exp: "La secuencia temporal se aborda mediante juegos de organización de patrones.", area: "Matemática" },
      { q: "7° Básico usa el método MCM para sumar fracciones. ¿Por qué es adecuado?", opts: ["Enfatiza importancia de operaciones básicas.", "Favorece reconocimiento de multiplicación de términos.", "Apoya el algoritmo mediante reducción a denominador universal.", "Estimula memoria visual del algoritmo."], answer: "C", exp: "El método MCM apoya el algoritmo de reducción de fracciones a denominador común.", area: "Matemática" },
      { q: "Rafael no reconoce números grandes. ¿Qué estrategia es más apropiada para su participación?", opts: ["Ejercitar sistema decimal con cubos multibase.", "Elaborar análisis y síntesis con tablero posicional.", "Trabajar valor de números con bloques lógicos.", "Identificar posición con bingo numeral."], answer: "B", exp: "El tablero posicional ayuda a comprender la composición simbólica de números grandes.", area: "Matemática" },
      { q: "¿Qué material apoya la composición y descomposición aditiva de numerales?", opts: ["Tangram.", "Recta numérica.", "Bloques lógicos.", "Bloques multibase."], answer: "D", exp: "Los bloques multibase son ideales para trabajar composición y descomposición aditiva.", area: "Matemática" },
      { q: "¿Qué material desarrolla observación, comparación, clasificación y seriación?", opts: ["Bloques lógicos.", "Regletas de Cuisenaire.", "Ábaco.", "Tangram."], answer: "A", exp: "Los bloques lógicos desarrollan observación, comparación, clasificación y seriación.", area: "Matemática" },
      { q: "2° Básico confunde conjuntos desiguales con equivalentes. Equipo envía guía de comparación a apoderados. ¿Cuál es el propósito principal?", opts: ["Colaborar con el aprendizaje de la operatoria convencional.", "Fortalecer nociones subyacentes a la operatoria a abordar.", "Establecer hábitos de estudio.", "Anticipar contenidos a tratar en clases."], answer: "B", exp: "Las actividades fortalecen nociones subyacentes como comparación, clasificación y seriación.", area: "Matemática" },
      { q: "Felipe, TDA con hiperactividad, solo está tranquilo frente al computador y madre le hace las tareas. ¿Qué estrategia mejora hábitos de estudio?", opts: ["Implementar un cronograma de rutinas diarias estables.", "Apoyar contenidos con un profesional externo.", "Derivar a psicólogo para terapia conductual.", "Retirar estímulos hasta que logre autorregularse."], answer: "A", exp: "Un cronograma de rutinas estables ayuda a establecer hábitos de estudio y autorregulación.", area: "Estrategias" },
      { q: "Carolina, DEA en cálculo, trabaja valor posicional hasta la milésima. ¿Qué adecuación de forma de respuesta representa esto?", opts: ["Mostrar video de composición y descomposición.", "Entregar tablero posicional para composición hasta la milésima.", "Brindar cubos multibase para descomposición hasta 1.000.", "Integrar con investigación histórica de los números."], answer: "B", exp: "El tablero posicional es una adecuación de forma de respuesta.", area: "Matemática" },
      { q: "Docente de 3° Básico inicia clase con historia personal y carta escondida. ¿Por qué responde al DUA?", opts: ["Ofrece apoyos de baja exigencia cognitiva.", "Personaliza la presentación con formatos flexibles.", "Crea clima de apoyo reduciendo incertidumbre.", "Dispone de vías alternativas para captar el interés."], answer: "D", exp: "El inicio de clase capta el interés y responde a diferencias intra e interindividuales.", area: "DUA" },
      { q: "Pedro, kinésico, tiene desafíos con recursos expresivos de poemas. ¿Qué adecuación de acceso es pertinente?", opts: ["Seleccionar contenidos básicos.", "Flexibilizar el tiempo del currículum.", "Secuenciar metas más pequeñas o amplias.", "Acceder a modos alternativos de presentar información."], answer: "D", exp: "Una adecuación de acceso debe ofrecer modos alternativos de presentación kinésica.", area: "Estrategias" },
      { q: "Docente busca implicar y ofrecer múltiples formas de expresión sobre efectos del cigarrillo. ¿Qué estrategia cumple esto?", opts: ["Escoger cómo trabajar con listado de acciones previo.", "Escoger contenido para maqueta y autoevaluarse.", "Dar información con video, lectura y mapa conceptual.", "Realizar video con preguntas de metacognición."], answer: "A", exp: "Permite implicación, planeación y múltiples formas de acción y expresión.", area: "Estrategias" },
      { q: "1° Medio: estudiantes no distinguen lo esencial de lo irrelevante en investigación histórica. ¿Qué estrategia es pertinente?", opts: ["Cuadro entre factores de cambio con ilustraciones.", "Vínculos con imágenes claves.", "Identificar conceptos clave con términos comunes.", "Esquemas u organizadores gráficos que destaquen hechos."], answer: "D", exp: "Los organizadores gráficos ayudan a distinguir lo esencial de lo irrelevante.", area: "Estrategias" },
      { q: "Santa, migrante, tiene dificultades con historia de Chile. ¿Qué adecuación es pertinente?", opts: ["Seleccionar objetivos prioritarios de historia de Chile.", "Comparar con la historia de su país de origen.", "Mostrar canales visual, auditivo y kinestésico.", "Determinar objetivos no relevantes."], answer: "B", exp: "Comparar con la historia de su país de origen hace el contenido más significativo.", area: "Estrategias" },
      { q: "Carla, altas capacidades, se aburre y distrae a otros. Equipo sugiere investigaciones y tutorías. ¿Qué justificación es coherente?", opts: ["Desarrolla habilidades de autorreflexión.", "Entrega la posibilidad de enfrentar diversos niveles de desafío.", "Posibilita afianzar estructuras internas para memoria de trabajo.", "Proporciona planificar el aprendizaje colaborativamente."], answer: "B", exp: "Las altas capacidades requieren desafíos adicionales que ofrecen investigaciones y tutorías.", area: "Estrategias" },
      { q: "Tania se desorienta al llegar a clases. Equipo incorpora adecuaciones de tiempo y horario. ¿Qué estrategia incorpora a la familia?", opts: ["Incorporar imágenes con pasos de la rutina.", "Invitar a un familiar a ayudarla en la sala.", "Apoyar practicar rutinas del colegio en el hogar.", "Acordar llegada anticipada para recibir orientaciones."], answer: "C", exp: "Practicar las rutinas en el hogar con la familia facilita la adaptación.", area: "PIE" }
    ]
  },

  2022: {
    color: "#ec4899",
    label: "2022",
    questions: [
      { q: "Equipo PIE desarrolla taller 'Respuestas educativas para la diversidad'. ¿Qué opinión se enmarca en el enfoque biopsicosocial?", opts: ["Juan", "Violeta", "Susana", "Enrique"], answer: "B", exp: "Violeta considera factores sociales, económicos y contextuales que actúan como obstáculos.", area: "Evaluación" },
      { q: "¿Qué acción es necesaria para implementar el enfoque ecológico funcional en la elaboración del PACI?", opts: ["Fortalecer aprendizajes básicos según impacto en el proyecto de vida.", "Priorizar OA transversales de habilidades sociales.", "Establecer habilidades de vida diaria según expectativas familiares.", "Eliminar objetivos de habilidades lingüísticas complejas."], answer: "A", exp: "El enfoque ecológico funcional considera el impacto en el proyecto de vida del estudiante.", area: "Evaluación" },
      { q: "¿Qué enunciado corresponde a un principio de los modelos basados en la diversidad y la inclusión?", opts: ["Los métodos de evaluación permiten caracterizar discapacidades.", "La calidad de aprendizaje depende del desarrollo del estudiante.", "Los factores ambientales y la respuesta educativa son fundamentales.", "Conocer la etiología permite establecer apoyos adecuados."], answer: "C", exp: "Los modelos basados en la diversidad consideran los factores ambientales y la respuesta educativa como fundamentales.", area: "Estrategias" },
      { q: "¿Qué opción corresponde a un aporte del Informe Warnock?", opts: ["Promueve la creación de escuelas especiales.", "Consolida el concepto de NEE señalando fines de educación iguales para todos.", "Considera la diversidad como patrimonio común de la humanidad.", "Refuerza la inclusión de estudiantes segregados."], answer: "B", exp: "El Informe Warnock consolidó el concepto de NEE y estableció fines educativos iguales para todos.", area: "Marco Normativo" },
      { q: "¿Qué criterio evaluativo se asocia al enfoque ecológico y funcional en Educación Especial?", opts: ["Identificar necesidades actuales, futuras y potencialidades según contexto familiar, social y cultural.", "Priorizar factores de orden emocional.", "Identificar NEE con un instrumento estandarizado.", "Identificar necesidades con lista de cotejo de barreras curriculares."], answer: "A", exp: "El enfoque ecológico y funcional considera el contexto familiar, social y cultural.", area: "Evaluación" },
      { q: "¿Qué marco normativo invita a las comunidades a pensarse a sí mismas y reflexionar sobre sus prácticas?", opts: ["Ley de Inclusión Escolar", "Plan de Formación Ciudadana", "Política Nacional de Convivencia Escolar", "Orientaciones Técnicas para Programas de Integración Escolar"], answer: "C", exp: "La Política Nacional de Convivencia Escolar invita a las comunidades a reflexionar sobre sus prácticas.", area: "Marco Normativo" },
      { q: "¿Cuál es el principal aporte del Decreto N°67/2018 a los procesos de evaluación?", opts: ["Asegurar monitoreo constante con retroalimentación.", "Procurar diversas formas de evaluación según características.", "Promover participación activa en la evaluación.", "Permitir eximición de asignaturas."], answer: "B", exp: "El Decreto 67 promueve diversas formas de evaluación considerando las características de los estudiantes.", area: "Marco Normativo" },
      { q: "En una conversación de equipo de aula de 3° Medio, ¿qué concepto engloba las medidas tomadas?", opts: ["Enriquecimiento del currículum", "Múltiples formas de implicación", "Diversificación de las formas de expresión", "Adecuaciones de acceso a los OA"], answer: "B", exp: "Las medidas tomadas corresponden a múltiples formas de implicación del DUA.", area: "DUA" },
      { q: "Según el Decreto N° 170/2009, ¿qué debe hacer el profesor regular en sus 3 horas semanales de PIE?", opts: ["Participar en capacitaciones sobre NEET.", "Planificar adecuaciones curriculares pertinentes.", "Gestionar adquisición de recursos de apoyo.", "Realizar reuniones con apoderados."], answer: "B", exp: "El profesor regular debe planificar adecuaciones curriculares en las horas asignadas al PIE.", area: "PIE" },
      { q: "¿Qué acción debe realizar un equipo de aula para garantizar respuestas diversificadas según Decreto N° 170/2009?", opts: ["Definir diferentes formas para evaluar aprendizajes y progresos.", "Elaborar un Plan de Apoyo Individual.", "Establecer ajustes a los OA.", "Implementar adecuaciones curriculares de acceso."], answer: "A", exp: "Para garantizar respuestas diversificadas, el equipo debe definir diferentes formas de evaluación.", area: "PIE" },
      { q: "¿En cuál diagnóstico puede participar un psicopedagogo según el Decreto N° 170/2009?", opts: ["Discapacidad Intelectual Leve (DIL)", "Trastorno Específico del Lenguaje (TEL)", "Funcionamiento Intelectual Limítrofe (FIL)", "Trastorno de Déficit Atencional con Hiperactividad (TDAH)"], answer: "D", exp: "El psicopedagogo puede participar en el diagnóstico de TDAH según el Decreto 170.", area: "PIE" },
      { q: "¿Cuál es una tarea de los equipos de aula en el PIE según orientaciones ministeriales del Decreto N° 170/2009?", opts: ["Planificar instancias de comunicación de la comunidad educativa.", "Gestionar el buen uso del tiempo, espacios y materiales.", "Diseñar la respuesta educativa y de acceso al currículo.", "Crear un clima que facilite la colaboración."], answer: "C", exp: "Los equipos de aula deben diseñar la respuesta educativa y de acceso al currículo.", area: "PIE" },
      { q: "Javiera, NEE en 2° Básico. Según Decreto Exento N° 83/2015, ¿qué criterio orienta la adecuación implementada?", opts: ["Adaptar la estructura del tiempo.", "Ajustar las condiciones del entorno.", "Proporcionar diferentes formas de respuesta.", "Otorgar información a través de formas alternativas."], answer: "D", exp: "La adecuación implementada otorga información a través de formas alternativas.", area: "Marco Normativo" },
      { q: "Solange, 7° Básico. ¿Qué criterios considerar para generar adecuación curricular de acceso?", opts: ["La forma de respuesta debe permitir diferentes formas.", "Comunicación oral/gestual como aprendizajes básicos.", "La organización del entorno debe permitir acceso autónomo.", "El grado de complejidad de un contenido debe variar."], answer: "A", exp: "La adecuación de acceso debe permitir diferentes formas de respuesta según el Decreto 83.", area: "Marco Normativo" },
      { q: "Rolando, 6° Básico, NEEP y cardiopatía congénita con inasistencias prolongadas. ¿Qué criterio de adecuación implementar en los OA?", opts: ["Temporalización", "Graduación del nivel de complejidad", "Eliminación de Objetivos de Aprendizaje", "Priorización de Objetivos de Aprendizaje y contenidos"], answer: "D", exp: "Ante inasistencias prolongadas, se debe priorizar objetivos de aprendizaje.", area: "Marco Normativo" },
      { q: "Profesor de 2° Básico trabaja actividad de recordar y esconder palabras. ¿Qué procesos cognitivos predominan?", opts: ["Atención y memoria verbal", "Abstracción y asociación visual", "Discriminación y percepción visual", "Comprensión y categorización verbal"], answer: "A", exp: "Las acciones de leer, esconder y recordar palabras involucran atención y memoria verbal.", area: "Evaluación" },
      { q: "Equipo de aula de 2° Básico en Matemática. ¿Qué aspecto se configura como barrera al aprendizaje?", opts: ["La ausencia de un contexto de aprendizaje funcional y cotidiano.", "La falta de diversificación en mecanismos de revisión y retroalimentación.", "La falta de material de apoyo en la actividad de aplicación.", "La ausencia de un modelo de coenseñanza en equipo."], answer: "B", exp: "La falta de revisión y retroalimentación durante la actividad se configura como una barrera.", area: "Estrategias" },
      { q: "1° Básico trabaja grupos consonánticos BL y BR clasificando objetos por sonidos iniciales. ¿Qué proceso cognitivo predomina?", opts: ["Memoria visual", "Conciencia silábica", "Conciencia fonémica", "Discriminación Visual"], answer: "C", exp: "La actividad de clasificar objetos según sonidos iniciales trabaja la conciencia fonémica.", area: "Lenguaje" },
      { q: "Equipo de aula de 4° Medio en Orientación quiere recoger información sobre intereses y vocación. ¿Qué instrumento es pertinente?", opts: ["Test de autoestima escolar", "Escala de inteligencia de Wechsler", "Cuestionario 'Yo siento, yo pienso'", "Batería psicopedagógica Evalúa 10"], answer: "D", exp: "La Batería Evalúa 10 permite evaluar intereses y vocación.", area: "Evaluación" },
      { q: "En la evaluación psicoeducativa de un estudiante de 3° Básico, ¿qué acción debe llevar a cabo el equipo de aula prioritariamente?", opts: ["Medir sus habilidades sociales", "Solicitar una valoración médica", "Evaluar sus habilidades cognitivas", "Realizar una anamnesis a su familia"], answer: "D", exp: "La anamnesis familiar es prioritaria para recabar información relevante sobre el estudiante.", area: "Evaluación" },
      { q: "Equipo de aula de 6° Básico responde a baja participación evaluando continuamente para ajustar la enseñanza. ¿Qué procedimiento de evaluación es?", opts: ["Evaluación formativa", "Evaluación intermedia", "Evaluación diagnóstica", "Evaluación acumulativa"], answer: "A", exp: "La evaluación formativa permite conocer el nivel de aprendizaje y generar soluciones.", area: "Evaluación" },
      { q: "Durante la evaluación psicopedagógica, Emilia invierte el orden de las palabras al hablar. ¿En qué nivel del lenguaje presenta desafíos?", opts: ["Sintáctico", "Semántico", "Perceptivo", "Pragmático"], answer: "A", exp: "Emilia presenta desafíos en el nivel sintáctico al invertir el orden de las palabras.", area: "Lenguaje" },
      { q: "Francisco, 6° Básico, DEA en cálculo, no logra representar situaciones reales con lenguaje algebraico. ¿Cuál es su desafío?", opts: ["El dominio de procedimientos convencionales de cálculo algebraico.", "La representación de situaciones reales a través de lenguaje algebraico.", "La comprensión de lectura subyacente.", "La selección de información relevante."], answer: "B", exp: "Francisco no logra representar la situación real a través de lenguaje algebraico.", area: "Matemática" },
      { q: "Constanza, 4° Básico, presenta errores en la descomposición numérica. ¿En qué ámbito requiere apoyo?", opts: ["Sistema decimal", "Series numéricas", "Concepto de número", "Algoritmo de la multiplicación"], answer: "A", exp: "Constanza requiere apoyo en el sistema decimal.", area: "Matemática" },
      { q: "Emiliano, 1° Medio, DEA en cálculo. ¿Cuál es su requerimiento de apoyo con elementos algebraicos?", opts: ["Comprender la operatoria como fundamento del cálculo.", "Reconocer las letras y números involucrados.", "Conceptualizar y visualizar elementos algebraicos.", "Reconocer reglas de priorización algorítmica."], answer: "C", exp: "Emiliano requiere conceptualizar y visualizar elementos algebraicos.", area: "Matemática" },
      { q: "Profesora diferencial usa método analítico en 2° Básico. ¿Qué estrategia corresponde a este método?", opts: ["Identificar letras progresivamente", "Aprender sonidos de letras y sílabas", "Reconocer palabras y descomponerlas en sílabas y letras", "Utilizar sílabas como unidades básicas"], answer: "C", exp: "El método analítico parte de la palabra para luego descomponerla.", area: "Lenguaje" },
      { q: "Equipo de aula de 3° Básico. ¿Qué justifica la estrategia implementada antes de la lectura?", opts: ["Otorga sentido a la lectura utilizando conocimientos previos", "Permite leer con un propósito y desarrollar conjeturas", "Facilita la identificación de elementos estructurales", "Posibilita conjeturas a partir de lo que van leyendo"], answer: "B", exp: "La estrategia permite leer con propósito y desarrollar conjeturas sobre el texto.", area: "Lenguaje" },
      { q: "A principio de año, 2° Básico. ¿Qué estrategia con canciones es pertinente para el nivel?", opts: ["Leer y cantar una canción para reescribir con letras móviles", "Utilizar preguntas orientadoras para recortar y ordenar sílabas", "Proyectar la estrofa de una canción para copiar y marcar", "Identificar y subrayar la sílaba final de títulos de canciones"], answer: "A", exp: "Leer y cantar una canción con reescritura con letras móviles es pertinente para el nivel.", area: "Lenguaje" },
      { q: "1° Medio en Lengua y Literatura. ¿Qué estrategia es pertinente para visualizar acciones y espacios?", opts: ["Analizar relatos para determinar protagonista y espacio", "Trabajar con un capítulo para secuenciar acciones con imágenes", "Definir previamente conceptos asociados al objetivo", "Revisar fragmentos de novelas gráficas"], answer: "D", exp: "Revisar novelas gráficas ayuda a visualizar acciones, espacio y emociones.", area: "Lenguaje" },
      { q: "4° Básico requiere apoyo para distinguir información relevante. ¿Por qué el equipo usa una estrategia de relacionar datos?", opts: ["Para que reconozcan información, comparen y clasifiquen", "Para que identifiquen datos, los relacionen y saquen conclusiones", "Para que distingan hechos principales y establezcan conjeturas", "Para que localicen información explícita y reflexionen"], answer: "B", exp: "La estrategia busca identificar datos, relacionarlos y sacar conclusiones.", area: "Lenguaje" },
      { q: "Leonor, 3° Básico, DEA en lectura. ¿Qué estrategia con comics es adecuada?", opts: ["Reconocer la sílaba inicial de un listado de nombres", "Observar distintos comics para elegir personaje y describirlo", "Revisar enciclopedias para escribir una infografía", "Leer una palabra e identificar sus consonantes"], answer: "B", exp: "Observar comics y describir personajes motiva a Leonor y utiliza recursos visuales.", area: "Lenguaje" },
      { q: "Profesora usa Pruebas Piagetanas. ¿Qué estrategia aborda la necesidad de apoyo del subtest 'uso de cuantificadores'?", opts: ["Entregar tarjetas con ilustraciones de acciones sucesivas", "Facilitar una serie numérica con apoyo de imágenes", "Emplear fichas para realizar estimaciones de cantidades", "Utilizar tarjetas con numerales y palitos de helado"], answer: "C", exp: "El subtest de cuantificadores se aborda con estimaciones de cantidades usando 'más que' y 'menos que'.", area: "Matemática" },
      { q: "Estudiante con DEA en cálculo. ¿Qué estrategia de reversibilidad es pertinente?", opts: ["Trabajar la seriación ascendente en recta numérica", "Trabajar la clasificación de operaciones", "Desarrollar la reversibilidad de las operaciones", "Desarrollar la correspondencia unívoca"], answer: "C", exp: "Trabajar la reversibilidad ayuda a comprender la relación entre sumandos.", area: "Matemática" },
      { q: "Renata en 3° Básico. ¿Qué estrategia permite responder al requerimiento de apoyo con números cercanos a la decena?", opts: ["Realizar estimaciones de cantidades", "Identificar el valor posicional", "Reforzar las propiedades conmutativa y asociativa", "Completar rectas numéricas"], answer: "B", exp: "Identificar el valor posicional ayuda a comprender y operar con números próximos a la decena.", area: "Matemática" },
      { q: "2° Básico trabaja comparación de números. ¿Qué estrategia con balanza numérica es pertinente?", opts: ["Presentar el objetivo de manera visual y modelar paso a paso", "Trabajar pictóricamente con tablas de conteo", "Ejercitar con videos explicativos", "Desarrollar de lo concreto a lo abstracto con balanza numérica"], answer: "D", exp: "Transitar de lo concreto a lo abstracto con balanza numérica es clave para la comparación de números.", area: "Matemática" },
      { q: "2° Básico trabaja componer y descomponer números. ¿Qué estrategia con material didáctico es pertinente?", opts: ["Reforzar la adición con reagrupamiento con cintas numeradas y ábaco", "Practicar agrupamiento y reagrupamiento con bloques multibase y dados", "Practicar combinaciones básicas con fichas y regletas", "Practicar organización ascendente/descendente con cartas y cubos unifix"], answer: "B", exp: "Los bloques multibase y dados permiten practicar agrupamiento y reagrupamiento.", area: "Matemática" },
      { q: "Equipo de aula de 4° Básico realiza actividad grupal significativa fuera del aula. ¿Qué justifica la estrategia?", opts: ["Fortalece el aprendizaje autodirigido", "Posibilita la implicación en la tarea", "Potencia el desarrollo del lenguaje geométrico", "Desarrolla la autorregulación"], answer: "B", exp: "La actividad grupal fuera del aula posibilita la implicación al ser significativa y colaborativa.", area: "Estrategias" },
      { q: "Sebastián, 3° Básico. ¿Qué estrategia con aula invertida y bloques multibase responde a sus necesidades?", opts: ["Utilizar la modalidad de aula invertida con bloques multibase", "Emplear gamificación con tableros lúdicos", "Utilizar trabajo por proyectos con bloques multibase", "Emplear estaciones de aprendizaje con bloques lógicos"], answer: "A", exp: "La modalidad de aula invertida con bloques multibase aborda sus necesidades.", area: "Matemática" },
      { q: "Equipo de gestión de liceo técnico busca fomentar la autonomía de los estudiantes. ¿Qué estrategia responde?", opts: ["Crear rutinas de clase y sistemas de alerta", "Incorporar el desarrollo de proyectos", "Promover la autorreflexión", "Diferenciar grados de dificultad"], answer: "B", exp: "Incorporar proyectos para que participen en el diseño de tareas fomenta la autonomía.", area: "Estrategias" },
      { q: "Equipo de aula de 1° Medio busca favorecer la participación en clases de improvisación. ¿Qué estrategia es más pertinente?", opts: ["Mostrar videos y permitir actividad individual", "Registrar progresos y enseñar oralidad", "Analizar videos motivacionales y anticipar errores", "Dinámicas de autoreflexión, grupos colaborativos y ensayo con improvisación"], answer: "D", exp: "Las dinámicas de autoreflexión, grupos claros y técnicas de improvisación favorecen la participación.", area: "Estrategias" },
      { q: "5° Básico en Historia necesita retener información y trabajar de forma autónoma. ¿Qué estrategia responde?", opts: ["Agrupar la información en unidades más pequeñas", "Facilitar avisos o pautas para categorizar", "Utilizar mnemotécnicas y organizadores gráficos", "Realizar preguntas o cuestionarios autocorrectivos"], answer: "C", exp: "Mnemotécnicas y organizadores gráficos apoyan la retención y autonomía.", area: "Estrategias" },
      { q: "4° Básico en Historia trabaja coordenadas geográficas. ¿Qué estrategia lúdica es adecuada?", opts: ["Manipular una gigantografía", "Jugar batalla naval", "Manipular elementos plásticos como una pelota", "Jugar a ubicar países en un globo terráqueo"], answer: "B", exp: "La batalla naval permite explorar coordenadas de manera lúdica y práctica.", area: "Estrategias" },
      { q: "2° Básico necesita comparar y contrastar información. ¿Qué estrategia diversificada es la más pertinente?", opts: ["Dramatizar situaciones", "Mostrar video y hacer lista", "Leer narraciones y comparar relatos", "Proyectar imágenes y realizar cuadro comparativo"], answer: "D", exp: "Proyectar imágenes y hacer un cuadro comparativo apoya la comparación de información.", area: "Estrategias" },
      { q: "5° Básico usa mapas ampliados con colores e imágenes. ¿Qué justifica esta sugerencia?", opts: ["Favorecen la transferencia", "Favorecen la memoria visual", "Favorecen la percepción", "Favorecen la implicación"], answer: "C", exp: "Ampliar el mapa y usar colores e imágenes favorece la percepción.", area: "DUA" },
      { q: "2° Medio con situaciones de discriminación. ¿Qué estrategia favorece la incorporación de las familias?", opts: ["Desarrollar talleres de formación parental", "Realizar reuniones informativas", "Planear conversatorios sobre diversidad", "Organizar espacios informativos"], answer: "C", exp: "Conversatorios sobre diversidad y respeto involucran a las familias en la solución.", area: "Estrategias" },
      { q: "Establecimiento incorpora a familias en ciudadanía digital. ¿Qué estrategia permite lograr el objetivo?", opts: ["Elaborar un informe monográfico", "Analizar políticas de privacidad y elaborar infografías", "Desarrollar cápsulas virtuales", "Revisar información y construir decálogos"], answer: "B", exp: "Analizar políticas y elaborar infografías involucra a familias y estudiantes.", area: "Estrategias" },
      { q: "5° Básico, Luis. ¿Qué estrategia favorece la participación de las familias en inclusión?", opts: ["Implementar escuelas con y para apoderados", "Generar vínculos con instituciones externas", "Organizar talleres informativos sobre inclusión", "Actualizar el protocolo de convivencia"], answer: "C", exp: "Talleres informativos sobre inclusión y respeto por la diversidad involucran a las familias.", area: "Estrategias" }
    ]
  },

  2023: {
    color: "#06b6d4",
    label: "2023",
    questions: [
      { q: "Equipo PIE desarrolla taller 'Respuestas educativas para la diversidad'. ¿Qué opinión se enmarca en el enfoque biopsicosocial?", opts: ["Juan", "Violeta", "Susana", "Enrique"], answer: "B", exp: "Violeta considera factores sociales, económicos y contextuales que actúan como obstáculos.", area: "Evaluación" },
      { q: "¿Qué acción es necesaria para implementar el enfoque ecológico funcional en la elaboración del PACI?", opts: ["Fortalecer aprendizajes básicos según impacto en el proyecto de vida.", "Priorizar OA transversales de habilidades sociales.", "Establecer habilidades de vida diaria según expectativas familiares.", "Eliminar objetivos de habilidades lingüísticas complejas."], answer: "A", exp: "El enfoque ecológico funcional considera el impacto en el proyecto de vida del estudiante.", area: "Evaluación" },
      { q: "¿Qué enunciado corresponde a un principio de los modelos basados en la diversidad y la inclusión?", opts: ["Los métodos de evaluación permiten caracterizar discapacidades.", "La calidad de aprendizaje depende del desarrollo del estudiante.", "Los factores ambientales y la respuesta educativa son fundamentales.", "Conocer la etiología permite establecer apoyos adecuados."], answer: "C", exp: "Los modelos basados en la diversidad consideran los factores ambientales y la respuesta educativa como fundamentales.", area: "Estrategias" },
      { q: "¿Qué opción corresponde a un aporte del Informe Warnock?", opts: ["Promueve la creación de escuelas especiales.", "Consolida el concepto de NEE señalando fines de educación iguales para todos.", "Considera la diversidad como patrimonio común de la humanidad.", "Refuerza la inclusión de estudiantes segregados."], answer: "B", exp: "El Informe Warnock consolidó el concepto de NEE y estableció fines educativos iguales para todos.", area: "Marco Normativo" },
      { q: "¿Qué criterio evaluativo se asocia al enfoque ecológico y funcional en Educación Especial?", opts: ["Identificar necesidades actuales, futuras y potencialidades según contexto familiar, social y cultural.", "Priorizar factores de orden emocional.", "Identificar NEE con un instrumento estandarizado.", "Identificar necesidades con lista de cotejo de barreras curriculares."], answer: "A", exp: "El enfoque ecológico y funcional considera el contexto familiar, social y cultural.", area: "Evaluación" },
      { q: "¿Qué marco normativo invita a las comunidades a pensarse a sí mismas y reflexionar sobre sus prácticas?", opts: ["Ley de Inclusión Escolar", "Plan de Formación Ciudadana", "Política Nacional de Convivencia Escolar", "Orientaciones Técnicas para Programas de Integración Escolar"], answer: "C", exp: "La Política Nacional de Convivencia Escolar invita a las comunidades a reflexionar sobre sus prácticas.", area: "Marco Normativo" },
      { q: "¿Cuál es el principal aporte del Decreto N°67/2018 a los procesos de evaluación?", opts: ["Asegurar monitoreo constante con retroalimentación.", "Procurar diversas formas de evaluación según características.", "Promover participación activa en la evaluación.", "Permitir eximición de asignaturas."], answer: "B", exp: "El Decreto 67 promueve diversas formas de evaluación considerando las características de los estudiantes.", area: "Marco Normativo" },
      { q: "En una conversación de equipo de aula de 3° Medio, ¿qué concepto engloba las medidas tomadas?", opts: ["Enriquecimiento del currículum", "Múltiples formas de implicación", "Diversificación de las formas de expresión", "Adecuaciones de acceso a los OA"], answer: "B", exp: "Las medidas tomadas corresponden a múltiples formas de implicación del DUA.", area: "DUA" },
      { q: "Según el Decreto N° 170/2009, ¿qué debe hacer el profesor regular en sus 3 horas semanales de PIE?", opts: ["Participar en capacitaciones sobre NEET.", "Planificar adecuaciones curriculares pertinentes.", "Gestionar adquisición de recursos de apoyo.", "Realizar reuniones con apoderados."], answer: "B", exp: "El profesor regular debe planificar adecuaciones curriculares en las horas asignadas al PIE.", area: "PIE" },
      { q: "¿Qué acción debe realizar un equipo de aula para garantizar respuestas diversificadas según Decreto N° 170/2009?", opts: ["Definir diferentes formas para evaluar aprendizajes y progresos.", "Elaborar un Plan de Apoyo Individual.", "Establecer ajustes a los OA.", "Implementar adecuaciones curriculares de acceso."], answer: "A", exp: "Para garantizar respuestas diversificadas, el equipo debe definir diferentes formas de evaluación.", area: "PIE" },
      { q: "¿En cuál diagnóstico puede participar un psicopedagogo según el Decreto N° 170/2009?", opts: ["Discapacidad Intelectual Leve (DIL)", "Trastorno Específico del Lenguaje (TEL)", "Funcionamiento Intelectual Limítrofe (FIL)", "Trastorno de Déficit Atencional con Hiperactividad (TDAH)"], answer: "D", exp: "El psicopedagogo puede participar en el diagnóstico de TDAH según el Decreto 170.", area: "PIE" },
      { q: "¿Cuál es una tarea de los equipos de aula en el PIE según orientaciones ministeriales del Decreto N° 170/2009?", opts: ["Planificar instancias de comunicación de la comunidad educativa.", "Gestionar el buen uso del tiempo, espacios y materiales.", "Diseñar la respuesta educativa y de acceso al currículo.", "Crear un clima que facilite la colaboración."], answer: "C", exp: "Los equipos de aula deben diseñar la respuesta educativa y de acceso al currículo.", area: "PIE" },
      { q: "Javiera, NEE en 2° Básico. Según Decreto Exento N° 83/2015, ¿qué criterio orienta la adecuación implementada?", opts: ["Adaptar la estructura del tiempo.", "Ajustar las condiciones del entorno.", "Proporcionar diferentes formas de respuesta.", "Otorgar información a través de formas alternativas."], answer: "D", exp: "La adecuación implementada otorga información a través de formas alternativas.", area: "Marco Normativo" },
      { q: "Solange, 7° Básico. ¿Qué criterios considerar para generar adecuación curricular de acceso?", opts: ["La forma de respuesta debe permitir diferentes formas.", "Comunicación oral/gestual como aprendizajes básicos.", "La organización del entorno debe permitir acceso autónomo.", "El grado de complejidad de un contenido debe variar."], answer: "A", exp: "La adecuación de acceso debe permitir diferentes formas de respuesta según el Decreto 83.", area: "Marco Normativo" },
      { q: "Rolando, 6° Básico, NEEP y cardiopatía congénita con inasistencias prolongadas. ¿Qué criterio de adecuación implementar en los OA?", opts: ["Temporalización", "Graduación del nivel de complejidad", "Eliminación de Objetivos de Aprendizaje", "Priorización de Objetivos de Aprendizaje y contenidos"], answer: "D", exp: "Ante inasistencias prolongadas, se debe priorizar objetivos de aprendizaje.", area: "Marco Normativo" },
      { q: "Profesor de 2° Básico trabaja actividad de recordar y esconder palabras. ¿Qué procesos cognitivos predominan?", opts: ["Atención y memoria verbal", "Abstracción y asociación visual", "Discriminación y percepción visual", "Comprensión y categorización verbal"], answer: "A", exp: "Las acciones de leer, esconder y recordar palabras involucran atención y memoria verbal.", area: "Evaluación" },
      { q: "Equipo de aula de 2° Básico en Matemática. ¿Qué aspecto se configura como barrera al aprendizaje?", opts: ["La ausencia de un contexto de aprendizaje funcional y cotidiano.", "La falta de diversificación en mecanismos de revisión y retroalimentación.", "La falta de material de apoyo en la actividad de aplicación.", "La ausencia de un modelo de coenseñanza en equipo."], answer: "B", exp: "La falta de revisión y retroalimentación durante la actividad se configura como una barrera.", area: "Estrategias" },
      { q: "1° Básico trabaja grupos consonánticos BL y BR clasificando objetos por sonidos iniciales. ¿Qué proceso cognitivo predomina?", opts: ["Memoria visual", "Conciencia silábica", "Conciencia fonémica", "Discriminación Visual"], answer: "C", exp: "La actividad de clasificar objetos según sonidos iniciales trabaja la conciencia fonémica.", area: "Lenguaje" },
      { q: "Equipo de aula de 4° Medio en Orientación quiere recoger información sobre intereses y vocación. ¿Qué instrumento es pertinente?", opts: ["Test de autoestima escolar", "Escala de inteligencia de Wechsler", "Cuestionario 'Yo siento, yo pienso'", "Batería psicopedagógica Evalúa 10"], answer: "D", exp: "La Batería Evalúa 10 permite evaluar intereses y vocación.", area: "Evaluación" },
      { q: "En la evaluación psicoeducativa de un estudiante de 3° Básico, ¿qué acción debe llevar a cabo el equipo de aula prioritariamente?", opts: ["Medir sus habilidades sociales", "Solicitar una valoración médica", "Evaluar sus habilidades cognitivas", "Realizar una anamnesis a su familia"], answer: "D", exp: "La anamnesis familiar es prioritaria para recabar información relevante sobre el estudiante.", area: "Evaluación" },
      { q: "Equipo de aula de 6° Básico responde a baja participación evaluando continuamente para ajustar la enseñanza. ¿Qué procedimiento de evaluación es?", opts: ["Evaluación formativa", "Evaluación intermedia", "Evaluación diagnóstica", "Evaluación acumulativa"], answer: "A", exp: "La evaluación formativa permite conocer el nivel de aprendizaje y generar soluciones.", area: "Evaluación" },
      { q: "Durante la evaluación psicopedagógica, Emilia invierte el orden de las palabras al hablar. ¿En qué nivel del lenguaje presenta desafíos?", opts: ["Sintáctico", "Semántico", "Perceptivo", "Pragmático"], answer: "A", exp: "Emilia presenta desafíos en el nivel sintáctico al invertir el orden de las palabras.", area: "Lenguaje" },
      { q: "Francisco, 6° Básico, DEA en cálculo, no logra representar situaciones reales con lenguaje algebraico. ¿Cuál es su desafío?", opts: ["El dominio de procedimientos convencionales de cálculo algebraico.", "La representación de situaciones reales a través de lenguaje algebraico.", "La comprensión de lectura subyacente.", "La selección de información relevante."], answer: "B", exp: "Francisco no logra representar la situación real a través de lenguaje algebraico.", area: "Matemática" },
      { q: "Constanza, 4° Básico, presenta errores en la descomposición numérica. ¿En qué ámbito requiere apoyo?", opts: ["Sistema decimal", "Series numéricas", "Concepto de número", "Algoritmo de la multiplicación"], answer: "A", exp: "Constanza requiere apoyo en el sistema decimal.", area: "Matemática" },
      { q: "Emiliano, 1° Medio, DEA en cálculo. ¿Cuál es su requerimiento de apoyo con elementos algebraicos?", opts: ["Comprender la operatoria como fundamento del cálculo.", "Reconocer las letras y números involucrados.", "Conceptualizar y visualizar elementos algebraicos.", "Reconocer reglas de priorización algorítmica."], answer: "C", exp: "Emiliano requiere conceptualizar y visualizar elementos algebraicos.", area: "Matemática" },
      { q: "Profesora diferencial usa método analítico en 2° Básico. ¿Qué estrategia corresponde a este método?", opts: ["Identificar letras progresivamente", "Aprender sonidos de letras y sílabas", "Reconocer palabras y descomponerlas en sílabas y letras", "Utilizar sílabas como unidades básicas"], answer: "C", exp: "El método analítico parte de la palabra para luego descomponerla.", area: "Lenguaje" },
      { q: "Equipo de aula de 3° Básico. ¿Qué justifica la estrategia implementada antes de la lectura?", opts: ["Otorga sentido a la lectura utilizando conocimientos previos", "Permite leer con un propósito y desarrollar conjeturas", "Facilita la identificación de elementos estructurales", "Posibilita conjeturas a partir de lo que van leyendo"], answer: "B", exp: "La estrategia permite leer con propósito y desarrollar conjeturas sobre el texto.", area: "Lenguaje" },
      { q: "A principio de año, 2° Básico. ¿Qué estrategia con canciones es pertinente para el nivel?", opts: ["Leer y cantar una canción para reescribir con letras móviles", "Utilizar preguntas orientadoras para recortar y ordenar sílabas", "Proyectar la estrofa de una canción para copiar y marcar", "Identificar y subrayar la sílaba final de títulos de canciones"], answer: "A", exp: "Leer y cantar una canción con reescritura con letras móviles es pertinente para el nivel.", area: "Lenguaje" },
      { q: "1° Medio en Lengua y Literatura. ¿Qué estrategia es pertinente para visualizar acciones y espacios?", opts: ["Analizar relatos para determinar protagonista y espacio", "Trabajar con un capítulo para secuenciar acciones con imágenes", "Definir previamente conceptos asociados al objetivo", "Revisar fragmentos de novelas gráficas"], answer: "D", exp: "Revisar novelas gráficas ayuda a visualizar acciones, espacio y emociones.", area: "Lenguaje" },
      { q: "4° Básico requiere apoyo para distinguir información relevante. ¿Por qué el equipo usa una estrategia de relacionar datos?", opts: ["Para que reconozcan información, comparen y clasifiquen", "Para que identifiquen datos, los relacionen y saquen conclusiones", "Para que distingan hechos principales y establezcan conjeturas", "Para que localicen información explícita y reflexionen"], answer: "B", exp: "La estrategia busca identificar datos, relacionarlos y sacar conclusiones.", area: "Lenguaje" },
      { q: "Leonor, 3° Básico, DEA en lectura. ¿Qué estrategia con comics es adecuada?", opts: ["Reconocer la sílaba inicial de un listado de nombres", "Observar distintos comics para elegir personaje y describirlo", "Revisar enciclopedias para escribir una infografía", "Leer una palabra e identificar sus consonantes"], answer: "B", exp: "Observar comics y describir personajes motiva a Leonor y utiliza recursos visuales.", area: "Lenguaje" },
      { q: "Profesora usa Pruebas Piagetanas. ¿Qué estrategia aborda la necesidad de apoyo del subtest 'uso de cuantificadores'?", opts: ["Entregar tarjetas con ilustraciones de acciones sucesivas", "Facilitar una serie numérica con apoyo de imágenes", "Emplear fichas para realizar estimaciones de cantidades", "Utilizar tarjetas con numerales y palitos de helado"], answer: "C", exp: "El subtest de cuantificadores se aborda con estimaciones de cantidades usando 'más que' y 'menos que'.", area: "Matemática" },
      { q: "Estudiante con DEA en cálculo. ¿Qué estrategia de reversibilidad es pertinente?", opts: ["Trabajar la seriación ascendente en recta numérica", "Trabajar la clasificación de operaciones", "Desarrollar la reversibilidad de las operaciones", "Desarrollar la correspondencia unívoca"], answer: "C", exp: "Trabajar la reversibilidad ayuda a comprender la relación entre sumandos.", area: "Matemática" },
      { q: "Renata en 3° Básico. ¿Qué estrategia permite responder al requerimiento de apoyo con números cercanos a la decena?", opts: ["Realizar estimaciones de cantidades", "Identificar el valor posicional", "Reforzar las propiedades conmutativa y asociativa", "Completar rectas numéricas"], answer: "B", exp: "Identificar el valor posicional ayuda a comprender y operar con números próximos a la decena.", area: "Matemática" },
      { q: "2° Básico trabaja comparación de números. ¿Qué estrategia con balanza numérica es pertinente?", opts: ["Presentar el objetivo de manera visual y modelar paso a paso", "Trabajar pictóricamente con tablas de conteo", "Ejercitar con videos explicativos", "Desarrollar de lo concreto a lo abstracto con balanza numérica"], answer: "D", exp: "Transitar de lo concreto a lo abstracto con balanza numérica es clave para la comparación de números.", area: "Matemática" },
      { q: "2° Básico trabaja componer y descomponer números. ¿Qué estrategia con material didáctico es pertinente?", opts: ["Reforzar la adición con reagrupamiento con cintas numeradas y ábaco", "Practicar agrupamiento y reagrupamiento con bloques multibase y dados", "Practicar combinaciones básicas con fichas y regletas", "Practicar organización ascendente/descendente con cartas y cubos unifix"], answer: "B", exp: "Los bloques multibase y dados permiten practicar agrupamiento y reagrupamiento.", area: "Matemática" },
      { q: "Equipo de aula de 4° Básico realiza actividad grupal significativa fuera del aula. ¿Qué justifica la estrategia?", opts: ["Fortalece el aprendizaje autodirigido", "Posibilita la implicación en la tarea", "Potencia el desarrollo del lenguaje geométrico", "Desarrolla la autorregulación"], answer: "B", exp: "La actividad grupal fuera del aula posibilita la implicación al ser significativa y colaborativa.", area: "Estrategias" },
      { q: "Sebastián, 3° Básico. ¿Qué estrategia con aula invertida y bloques multibase responde a sus necesidades?", opts: ["Utilizar la modalidad de aula invertida con bloques multibase", "Emplear gamificación con tableros lúdicos", "Utilizar trabajo por proyectos con bloques multibase", "Emplear estaciones de aprendizaje con bloques lógicos"], answer: "A", exp: "La modalidad de aula invertida con bloques multibase aborda sus necesidades.", area: "Matemática" },
      { q: "Equipo de gestión de liceo técnico busca fomentar la autonomía de los estudiantes. ¿Qué estrategia responde?", opts: ["Crear rutinas de clase y sistemas de alerta", "Incorporar el desarrollo de proyectos", "Promover la autorreflexión", "Diferenciar grados de dificultad"], answer: "B", exp: "Incorporar proyectos para que participen en el diseño de tareas fomenta la autonomía.", area: "Estrategias" },
      { q: "Equipo de aula de 1° Medio busca favorecer la participación en clases de improvisación. ¿Qué estrategia es más pertinente?", opts: ["Mostrar videos y permitir actividad individual", "Registrar progresos y enseñar oralidad", "Analizar videos motivacionales y anticipar errores", "Dinámicas de autoreflexión, grupos colaborativos y ensayo con improvisación"], answer: "D", exp: "Las dinámicas de autoreflexión, grupos claros y técnicas de improvisación favorecen la participación.", area: "Estrategias" },
      { q: "5° Básico en Historia necesita retener información y trabajar de forma autónoma. ¿Qué estrategia responde?", opts: ["Agrupar la información en unidades más pequeñas", "Facilitar avisos o pautas para categorizar", "Utilizar mnemotécnicas y organizadores gráficos", "Realizar preguntas o cuestionarios autocorrectivos"], answer: "C", exp: "Mnemotécnicas y organizadores gráficos apoyan la retención y autonomía.", area: "Estrategias" },
      { q: "4° Básico en Historia trabaja coordenadas geográficas. ¿Qué estrategia lúdica es adecuada?", opts: ["Manipular una gigantografía", "Jugar batalla naval", "Manipular elementos plásticos como una pelota", "Jugar a ubicar países en un globo terráqueo"], answer: "B", exp: "La batalla naval permite explorar coordenadas de manera lúdica y práctica.", area: "Estrategias" },
      { q: "2° Básico necesita comparar y contrastar información. ¿Qué estrategia diversificada es la más pertinente?", opts: ["Dramatizar situaciones", "Mostrar video y hacer lista", "Leer narraciones y comparar relatos", "Proyectar imágenes y realizar cuadro comparativo"], answer: "D", exp: "Proyectar imágenes y hacer un cuadro comparativo apoya la comparación de información.", area: "Estrategias" },
      { q: "5° Básico usa mapas ampliados con colores e imágenes. ¿Qué justifica esta sugerencia?", opts: ["Favorecen la transferencia", "Favorecen la memoria visual", "Favorecen la percepción", "Favorecen la implicación"], answer: "C", exp: "Ampliar el mapa y usar colores e imágenes favorece la percepción.", area: "DUA" },
      { q: "2° Medio con situaciones de discriminación. ¿Qué estrategia favorece la incorporación de las familias?", opts: ["Desarrollar talleres de formación parental", "Realizar reuniones informativas", "Planear conversatorios sobre diversidad", "Organizar espacios informativos"], answer: "C", exp: "Conversatorios sobre diversidad y respeto involucran a las familias en la solución.", area: "Estrategias" },
      { q: "Establecimiento incorpora a familias en ciudadanía digital. ¿Qué estrategia permite lograr el objetivo?", opts: ["Elaborar un informe monográfico", "Analizar políticas de privacidad y elaborar infografías", "Desarrollar cápsulas virtuales", "Revisar información y construir decálogos"], answer: "B", exp: "Analizar políticas y elaborar infografías involucra a familias y estudiantes.", area: "Estrategias" },
      { q: "5° Básico, Luis. ¿Qué estrategia favorece la participación de las familias en inclusión?", opts: ["Implementar escuelas con y para apoderados", "Generar vínculos con instituciones externas", "Organizar talleres informativos sobre inclusión", "Actualizar el protocolo de convivencia"], answer: "C", exp: "Talleres informativos sobre inclusión y respeto por la diversidad involucran a las familias.", area: "Estrategias" }
    ]
  },

  2024: {
    color: "#8b5cf6",
    label: "2024",
    questions: [
      { q: "¿Qué consideración representa un fundamento del modelo biopsicosocial desde un enfoque ecológico?", opts: ["La mirada biomédica del sujeto, que valora las variables cognitivo conductuales", "La persona como un agente de cambio y que tiene un papel activo en su desarrollo", "El funcionamiento intelectual desde un punto de vista práctico y conceptual", "La influencia de múltiples factores, individuales y contextuales, en el desarrollo"], answer: "D", exp: "El modelo biopsicosocial desde un enfoque ecológico considera la influencia de múltiples factores.", area: "Evaluación" },
      { q: "Desde el modelo biopsicosocial, ¿qué factores influyen en los procesos de aprendizaje y participación de un estudiante con DEA?", opts: ["Las prácticas pedagógicas docentes en el aula", "La interacción del estudiante con múltiples sistemas interrelacionados", "Las características individuales propias del estudiante", "El entorno social, económico y cultural del estudiante"], answer: "B", exp: "El modelo biopsicosocial considera la interacción con múltiples sistemas interrelacionados.", area: "Evaluación" },
      { q: "El Decreto N°83/2015 aprueba criterios de flexibilización y diversificación curricular. ¿Cuál es su propósito principal?", opts: ["Otorgar una respuesta educativa pertinente y relevante para el estudiantado", "Que los docentes comprendan que la diversidad existe y flexibilicen", "Facilitar la trayectoria educativa de todos los estudiantes", "Dar a conocer el cuerpo legal de las normas de evaluación"], answer: "A", exp: "El propósito principal del Decreto 83 es otorgar una respuesta educativa pertinente.", area: "Marco Normativo" },
      { q: "¿Cuáles son los principales aportes del enfoque biopsicosocial al diseñar un plan de apoyo?", opts: ["Potencia los refuerzos al considerar a diversos actores", "Comprende que las NEE se abordan desde las interacciones del sujeto", "Permite visualizar y seleccionar las estrategias más adecuadas", "Favorece la descentralización de los apoyos"], answer: "A", exp: "El enfoque biopsicosocial potencia los refuerzos al considerar a diversos actores.", area: "Estrategias" },
      { q: "Dos docentes comentan sobre nivelación de estudiantes. ¿Qué comentario representa el enfoque homogeneizador?", opts: ["'... sé que se van a terminar nivelando.'", "'... todos están aprendiendo relativamente rápido...'", "'... Espero no necesitar apoyo del PIE.'", "'... los tendré a todos aprendiendo de aquí a fin de año.'"], answer: "A", exp: "El comentario sobre nivelación refleja un enfoque homogeneizador.", area: "Estrategias" },
      { q: "¿Cuál fue un impacto significativo de la implementación del Decreto N°83/2015 en la forma de enseñar?", opts: ["Se evidenció la importancia de mantener actualizados los diagnósticos", "Se evidenció que el profesorado debía actualizar sus conocimientos", "Se evidenció la importancia de considerar las NEE en la planificación curricular", "Se evidenció la necesidad de incorporar a la familia en las decisiones"], answer: "C", exp: "El impacto significativo fue considerar las necesidades educativas en la planificación curricular.", area: "Marco Normativo" },
      { q: "¿Qué interpretación corresponde a las decisiones del tercer nivel de concreción curricular?", opts: ["Se planifica para el grupo de estudiantes que puede seguir los OA", "Se planifica el currículum de forma diversificada para el grupo curso", "Se pesquisa al grupo de estudiantes que no consigue aprender al ritmo del curso", "Se permite realizar co-docencia para apoyar a quienes no aprenden"], answer: "B", exp: "El tercer nivel de concreción curricular planifica de forma diversificada para el grupo curso.", area: "Marco Normativo" },
      { q: "Una adecuación curricular de OA modifica lo que algunos estudiantes aprenderán. ¿Qué modificaciones se pueden realizar al proceso evaluativo?", opts: ["Graduar los OA al nivel curricular", "Otorgar mayor tiempo de respuesta", "Incorporar variadas evaluaciones sumativas", "Variar la ponderación de las evaluaciones sumativas"], answer: "A", exp: "Se pueden graduar los OA al nivel curricular del estudiante.", area: "Evaluación" },
      { q: "Según el Decreto N°170/2010, ¿qué rol deben ejercer los profesionales no docentes dentro del equipo de aula?", opts: ["Colaborar en la aplicación de instrumentos diagnósticos", "Apoyar, desde sus disciplinas, a los equipos docentes", "Completar los registros individuales de cada estudiante", "Entrevistar a padres y apoderados"], answer: "B", exp: "Los profesionales no docentes deben apoyar desde sus disciplinas a los equipos docentes.", area: "PIE" },
      { q: "¿Qué procedimiento está contemplado en el proceso de detección y derivación según Decreto 170/2009?", opts: ["Evaluación fonoaudiológica con pruebas validadas", "Evaluación psicopedagógica que determine las necesidades educativas", "Examen de salud para descartar problemas de audición o visión", "Observación directa del comportamiento y funcionamiento social"], answer: "B", exp: "La evaluación psicopedagógica determina las necesidades educativas especiales.", area: "PIE" },
      { q: "¿Cuáles son las funciones del fonoaudiólogo del PIE en un establecimiento regular?", opts: ["Mantener actualizada la información en plataformas ministeriales", "Asignar carga horaria a los profesionales del PIE", "Orientar a padres, madres y apoderados sobre el proceso educativo", "Aplicar escalas de conducta adaptativa y madurez social"], answer: "A", exp: "La función del fonoaudiólogo incluye orientar a padres y apoderados.", area: "PIE" },
      { q: "¿Qué ámbitos de acción dan cuenta del propósito de disponer horas para planificar y evaluar en el PIE?", opts: ["Áreas de trabajo colaborativo y de coordinación", "Planificación y registro de acciones implementadas", "Trabajo colaborativo de profesores y profesionales de apoyo", "Coordinación, trabajo colaborativo, planificación y evaluación"], answer: "D", exp: "Los ámbitos son coordinación, trabajo colaborativo, planificación y evaluación.", area: "PIE" },
      { q: "Proporcionar 'instrucciones explícitas para cada paso'. ¿A qué estrategia de apoyo corresponde?", opts: ["Estrategias alternativas para activar conocimientos previos", "Estrategias alternativas para apoyar la memoria y la transferencia", "Estrategias alternativas para guiar el procesamiento de la información", "Estrategias que destaquen los conceptos esenciales"], answer: "C", exp: "La descripción corresponde a estrategias para guiar el procesamiento de la información.", area: "Estrategias" },
      { q: "Equipo de 3° Básico diseña clase de Matemática con estaciones rotativas por habilidad. ¿Qué experiencia refleja el DUA?", opts: ["Organizan estaciones rotativas para el trabajo de cada habilidad matemática", "Solicitan el desarrollo de una guía de trabajo contextualizada", "Desarrollan una clase con una situación problemática proyectada", "Diseñan una actividad de compraventa con graduación individual"], answer: "A", exp: "Las estaciones rotativas con material concreto, pictórico y simbólico reflejan el DUA.", area: "DUA" },
      { q: "Según el Decreto Supremo N° 83/2015, ¿a quiénes se deben realizar adecuaciones?", opts: ["Solo a los estudiantes de un grupo de curso que se encuentren en el PIE", "Todos los estudiantes de un grupo de curso pueden acceder a una adecuación", "Solo a los estudiantes que presentan necesidades educativas permanentes", "Todos los estudiantes que hayan sido diagnosticados"], answer: "B", exp: "Todos los estudiantes pueden acceder a adecuaciones curriculares, pertenezcan o no al PIE.", area: "Marco Normativo" },
      { q: "En el marco del Decreto Exento N° 83/2015, ¿qué información es fundamental en la evaluación diagnóstica integral?", opts: ["Apoyos recibidos históricamente y su efectividad", "Fortalezas y desafíos del estudiante y su contexto", "Antecedentes del diagnóstico clínico y estado de salud", "Desempeño académico y conductual de años anteriores"], answer: "B", exp: "La evaluación diagnóstica debe considerar fortalezas y desafíos del estudiante y su contexto.", area: "Evaluación" },
      { q: "Según el Decreto N° 83/2015, ¿qué criterio se debe considerar al graduar el nivel de complejidad de un OA?", opts: ["Plantear objetivos que sean alcanzables y desafiantes", "Incorporar objetivos no previstos en las Bases Curriculares", "Seleccionar OA que se consideran básicos", "Destinar un período más prolongado o fraccionado"], answer: "A", exp: "La graduación debe plantear objetivos alcanzables y desafiantes basados en el currículum nacional.", area: "Marco Normativo" },
      { q: "El Decreto N° 83/2015 plantea criterios para adecuaciones curriculares. ¿Qué elementos del currículum pueden ser adecuados?", opts: ["La forma en que los estudiantes demostrarán sus aprendizajes", "Los medios en que se les presentará la información", "Los aprendizajes prescritos en las distintas asignaturas", "Los tiempos asignados a trabajar las unidades didácticas"], answer: "C", exp: "Los aprendizajes prescritos en las asignaturas pueden ser adecuados según el Decreto 83.", area: "Marco Normativo" },
      { q: "¿En qué momento se deben modificar los OA en el marco de la diversificación de la enseñanza?", opts: ["Durante todo el año escolar, abarcando todas las unidades", "Al inicio de cada una de las unidades, en la planificación", "Durante todo el año, considerando cambiar contenidos o contextos", "Al inicio de las unidades, en la planificación general"], answer: "D", exp: "Los OA se deben modificar al inicio de las unidades en la planificación general.", area: "Evaluación" },
      { q: "Las DEA no se manifiestan hasta transcurrido al menos un año de escolaridad. ¿Qué medidas tomar durante el primer año básico?", opts: ["Dar apoyo específico fuera del aula regular", "Emplear metodologías y recursos diversos para la enseñanza", "Realizar un trabajo sistemático y permanente", "Evaluar los factores predictores del aprendizaje al inicio del año"], answer: "D", exp: "Se deben evaluar los factores predictores del aprendizaje lector y matemático al inicio del año.", area: "Evaluación" },
      { q: "Un estudiante de 3° básico está en una escuela hospitalaria. ¿En qué aspecto se manifiesta la necesidad educativa transitoria?", opts: ["Cognitivo", "Físico", "Neurobiológico", "Socioemocional"], answer: "D", exp: "La necesidad educativa se manifiesta en el aspecto socioemocional (desmotivación, extrañar compañeros).", area: "Evaluación" },
      { q: "En un aula diversa, en la enseñanza de la lectura, ¿qué tipo de estrategias deben usar los docentes?", opts: ["Trabajar con material concreto, pictórico y digital", "Considerar las rutas fonológica y visual en la misma proporción", "Diseñar estrategias que fortalezcan la decodificación fonológica", "Incorporar el juego como estrategia central"], answer: "A", exp: "Los docentes deben trabajar con material concreto, pictórico y digital para la enseñanza de la lectura.", area: "Lenguaje" },
      { q: "¿Qué situación de aprendizaje contiene explícitamente percepción, memoria y atención?", opts: ["Identificar el grafema P entre varios otros evocando su sonido", "Observar signos gráficos e identificar el grafema P", "Observar el grafema P para transcribirlo digitalmente", "Marcar el grafema P por su contorno sin salirse"], answer: "A", exp: "La actividad de identificar, seleccionar y evocar el sonido involucra percepción, memoria y atención.", area: "Evaluación" },
      { q: "Estudiante de 2° medio de 16 años. ¿Qué instrumentos son adecuados para su etapa de desarrollo?", opts: ["Evaluación psicométrica WAIS IV e instrumentos de valoración pedagógica", "Evaluación psicopedagógica WISC V e instrumentos de valoración pedagógica", "Evaluación psicopedagógica WAIS IV e instrumentos de valoración pedagógica", "Evaluación psicométrica WISC V e instrumentos de valoración pedagógica"], answer: "C", exp: "Para un estudiante de 16 años se debe usar WAIS IV en evaluación psicopedagógica.", area: "Evaluación" },
      { q: "¿Qué condiciones debe cumplir la Evaluación Diagnóstica Integral según Decreto N° 170/2009?", opts: ["Validada y adaptada al nivel curricular", "Contextualizada y pertinente con la cultura", "Interdisciplinaria y realizada por un equipo de profesionales idóneos", "Individualizada y aprobada por el equipo directivo"], answer: "C", exp: "La evaluación diagnóstica integral debe ser interdisciplinaria y realizada por profesionales idóneos.", area: "PIE" },
      { q: "Estudiante de 4° básico ingresa a una nueva escuela. ¿Por qué el equipo optó por un instrumento como Evalúa-3?", opts: ["Porque facilita la revisión de la cobertura curricular", "Porque prioriza el análisis cualitativo de las competencias matemáticas", "Porque permite indagar tanto en aspectos cognitivos como instrumentales", "Porque posibilita el ingreso al PIE"], answer: "C", exp: "La batería Evalúa-3 permite indagar en aspectos cognitivos e instrumentales.", area: "Evaluación" },
      { q: "¿Por qué usar el BEVTA en un diagnóstico inicial de lenguaje?", opts: ["Porque recaba información sobre los niveles del lenguaje", "Porque aporta datos sobre el nivel de lectura y errores", "Porque entrega una visión sobre habilidades psicolinguísticas", "Porque permite conocer los procesos de producción de texto"], answer: "A", exp: "El BEVTA recaba información sobre los niveles del lenguaje que influyen en la adquisición lectora.", area: "Evaluación" },
      { q: "Joaquín, 2° medio, suma fracciones como si fueran números naturales. ¿Qué requerimiento de apoyo presenta?", opts: ["Dificultades al utilizar el mínimo común múltiplo", "Dificultades al reconocer el valor de cada término fraccionario", "Dificultades al establecer la jerarquía de los números fraccionarios", "Dificultades al sumar fracciones con distinto denominador"], answer: "D", exp: "Joaquín suma las fracciones como si fueran naturales, evidenciando dificultades con distinto denominador.", area: "Matemática" },
      { q: "¿Qué instrumento entrega información completa sobre los factores predictores de la lectura?", opts: ["Prueba de Lectura del Dr. Olea", "EVALÚA 0", "Prueba de Dominio lector de FUNDAR", "Prueba de Alfabetización Inicial"], answer: "D", exp: "La Prueba de Alfabetización Inicial evalúa los factores predictores de la lectura.", area: "Evaluación" },
      { q: "Según el Decreto N° 170/2009, ¿qué dimensiones se deben considerar en la evaluación diagnóstica integral de DEA?", opts: ["Dimensión familiar, educativa y médica", "Dimensión contextual, social y cultural", "Dimensión escolar, psicológica y cognitiva", "Dimensión curricular, lingüística y actitudinal"], answer: "A", exp: "La evaluación diagnóstica integral de DEA considera las dimensiones familiar, educativa y médica.", area: "Evaluación" },
      { q: "Estudiante de 3° básico lee con fluidez pero no logra recomponer la secuencia cronológica. ¿En qué nivel presenta dificultades?", opts: ["Semántico - comprensivo", "Sintáctico", "Decodificación", "Fonológico"], answer: "B", exp: "La dificultad para recomponer la secuencia cronológica corresponde al nivel sintáctico.", area: "Lenguaje" },
      { q: "¿Qué apoyos podrían requerir estudiantes con DEA en el área de cálculo?", opts: ["Apoyo en la comprensión de cambios de ámbito numérico", "Apoyo en la adquisición de procedimientos de operaciones básicas", "Apoyo en la sistematización de estrategias para resolver problemas", "Apoyo en la optimización de estrategias de cálculo mental"], answer: "B", exp: "Los estudiantes con DEA en cálculo requieren apoyo en la adquisición de procedimientos de operaciones básicas.", area: "Matemática" },
      { q: "¿Qué apoyos tienen mayor efectividad en un estudiante con TDAH?", opts: ["Trabajar contenidos de manera segmentada en tiempos breves", "Realizar pausas activas y destacar información relevante", "Ubicar a los estudiantes en puestos estratégicos", "Aplicar evaluaciones a primera hora de la jornada"], answer: "B", exp: "Las pausas activas y destacar información relevante son estrategias efectivas para estudiantes con TDAH.", area: "Estrategias" },
      { q: "Estudiante de 4° básico con DEA en lectura. ¿Qué estrategia es apropiada antes de la lectura?", opts: ["Considerar temáticas atractivas y trabajar vocabulario contextual", "Activar conocimientos previos y crear imágenes mentales", "Relacionar experiencias con lo que va a leer", "Dialogar sobre la experiencia y contextualizar el tema"], answer: "A", exp: "Antes de la lectura, se deben considerar temáticas atractivas y trabajar vocabulario contextual.", area: "Lenguaje" },
      { q: "Estudiante de 1° básico con discalculia que no nombra números, cantidades ni términos matemáticos. ¿Qué tipo de discalculia presenta?", opts: ["Practognóstica", "Léxica", "Verbal", "Gráfica"], answer: "C", exp: "La dificultad para nombrar números y términos matemáticos corresponde a discalculia verbal.", area: "Matemática" },
      { q: "Según el Modelo Integrado de Enseñanza de la lectura, ¿qué actividad continúa a una actividad fonológica inicial?", opts: ["Crear enunciados con sentido sintáctico y semántico", "Separar las palabras en sílabas", "Pintar las letras faltantes", "Encerrar el fonema inicial"], answer: "A", exp: "El Modelo Integrado continúa con la creación de enunciados con sentido sintáctico y semántico.", area: "Lenguaje" },
      { q: "2° medio verá la película Machuca. ¿Qué actividad favorece la comprensión de términos de la época?", opts: ["Ordenarlos en una posible secuencia de acciones", "Debatir acerca de su uso en diversos contextos comunicativos", "Redactar expectativas sobre la película usándolos", "Ubicarlos en mapas conceptuales incompletos"], answer: "B", exp: "Debatir sobre el uso de los términos en diversos contextos favorece su comprensión.", area: "Lenguaje" },
      { q: "En co-docencia, ¿qué acción podría realizar la codocente en 1° básico respecto al acceso al léxico?", opts: ["Trabajar por igual las dos vías de acceso al léxico", "Realizar actividades lúdicas tipo cuenta cuentos", "Preparar un cuadernillo de aprestamiento grafomotor", "Complementar actividades con textos kinestésicos"], answer: "A", exp: "La codocente debe trabajar por igual las dos vías de acceso al léxico en primero básico.", area: "Co-docencia" },
      { q: "¿Cuál estrategia NO es prioritaria para un estudiante con DEA?", opts: ["Ejercitar la representación grafémica de palabras aisladas", "Ejercitar la decodificación de palabras de uso común", "Ejercitar procesos fonológicos de palabras", "Ejercitar los tiempos gramaticales (pasado, presente y futuro)"], answer: "D", exp: "Ejercitar tiempos gramaticales no es prioritario para un estudiante con DEA.", area: "Estrategias" },
      { q: "Clase de Historia en 4° básico con una fuente histórica. ¿Qué estrategia usar antes de revisarla?", opts: ["Proyectar un video relacionado con la temática", "Trabajar palabras claves presentes en la fuente histórica", "Modelar estrategias de inferencia de la información", "Entregar información de otra cultura latinoamericana"], answer: "B", exp: "Antes de revisar la fuente histórica, se deben trabajar palabras claves para ampliar el vocabulario.", area: "Estrategias" },
      { q: "7° básico: profesora implementa clubes de lectura. ¿Cuál es la principal razón?", opts: ["Estimulan las funciones cognitivas", "Promueven la comprensión lectora", "Posibilitan la implicación en la actividad", "Fortalecen las habilidades comunicativas"], answer: "C", exp: "Los clubes de lectura posibilitan la implicación en la actividad según los intereses de los estudiantes.", area: "Lenguaje" },
      { q: "Profesor de 3° básico enfatiza los 'momentos de la escritura'. ¿Qué fundamenta esta decisión pedagógica?", opts: ["La importancia de la didáctica de la asignatura", "La visualización de la estructura libera memoria de trabajo", "La utilización de la estrategia de los 'momentos de la escritura'", "El abordaje de otros aspectos de la lengua escrita"], answer: "B", exp: "La visualización de la estructura libera memoria de trabajo para la planificación.", area: "Lenguaje" },
      { q: "Docente diferencial implementa vocabulario visual en flash cards. ¿Qué justifica esta estrategia?", opts: ["Reforzar el acceso al léxico por la ruta visual", "Proponer diferentes estrategias de enseñanza", "Formar vocabulario visual es parte de los OA", "Proponer estrategias diversificadas para el currículum"], answer: "A", exp: "Reforzar la ruta visual apoya el proceso lector en estudiantes con ruta fonológica alterada.", area: "Lenguaje" },
      { q: "¿Qué estrategia apoya a un estudiante de 2° básico con dificultades en seriación?", opts: ["Ordenar tres elementos y designar el lugar de uno perdido", "Localizar números en materiales y agrupar por muchos-pocos", "Ordenar más de 5 elementos y establecer correspondencia entre series", "Localizar números en materiales y agrupar por muchos-pocos"], answer: "C", exp: "La seriación implica ordenar elementos y establecer correspondencia entre series.", area: "Matemática" },
      { q: "¿Por cuál noción pre-lógica está precedida la adquisición del número?", opts: ["Cuantificadores, cardinalidad, ordinalidad, seriación", "Conservación de cantidad, reversibilidad del pensamiento", "Clasificación, correspondencia uno a uno, cuantificadores", "Ordinalidad, seriación, numeración, clasificación"], answer: "C", exp: "La adquisición del número está precedida por clasificación, correspondencia uno a uno y cuantificadores.", area: "Matemática" },
      { q: "¿Qué estrategia enseña el valor posicional a un estudiante de tercer año básico?", opts: ["Localizar números en materiales y agrupar por muchos o pocos", "Realizar conteo por agrupamientos y usar una tabla numérica", "Ordenar elementos según tamaño y cantidad", "Localizar números en materiales y contarlos"], answer: "B", exp: "El conteo por agrupamientos y el uso de tabla numérica enseña el valor posicional.", area: "Matemática" },
      { q: "¿Qué estrategia dificulta la comprensión del sentido numérico en 1° básico?", opts: ["Usar materiales concretos para conceptos de más y menos", "Contar y establecer relaciones entre elementos", "Comparar números como 12 es mayor que 10", "Potenciar el sobreconteo desde uno de los sumandos"], answer: "D", exp: "El sobreconteo desde uno de los sumandos dificulta la comprensión del sentido numérico.", area: "Matemática" },
      { q: "¿Qué estrategia NO es idónea para trabajar con tableros multibase?", opts: ["Presentar las piezas más pequeñas para entender la unidad", "Contar 10 unidades y formar una decena en forma vertical", "Establecer correspondencia número cantidad", "Contar y agrupar unidades en forma ascendente y descendente"], answer: "C", exp: "Establecer correspondencia número-cantidad no es idónea para tableros multibase.", area: "Matemática" },
      { q: "Equipo de 5° básico usa un software geométrico. ¿Qué justifica esta propuesta?", opts: ["Permite interpretar información figural", "Permite explicar las transformaciones de figuras", "Permite visualizar las características específicas de las figuras", "Permite comprender las características de los giros"], answer: "C", exp: "El software permite visualizar las características específicas de las figuras geométricas.", area: "Matemática" },
      { q: "¿Qué estrategia es más adecuada para enseñar valor posicional con recursos tecnológicos?", opts: ["Utilizar bloques lógicos para clasificar y ordenar", "Implementar juegos de mesa con lectura y escritura de números", "Emplear un ábaco digital interactivo", "Usar videos explicativos sobre las posiciones"], answer: "C", exp: "El ábaco digital interactivo permite representar y manipular números para comprender el valor posicional.", area: "Matemática" },
      { q: "1° básico explora software educativos en parejas. ¿Qué estrategia complementaria funciona bien?", opts: ["Exposiciones orales", "Aprendizaje basado en problemas", "Lectura y discusión guiada", "Bitácora de registro de cumplimiento de tareas"], answer: "B", exp: "El aprendizaje basado en problemas complementa el trabajo colaborativo para lograr el OA.", area: "Estrategias" },
      { q: "¿Cómo mediar la comprensión y asociación de secuencias en estudiantes con DEA?", opts: ["Utilizando representaciones pictográficas y dramatizaciones", "Utilizando material fotográfico con su respectiva época", "Segmentando los períodos en no más de cinco hitos", "Haciendo una tabla de doble entrada"], answer: "A", exp: "Las representaciones pictográficas y dramatizaciones median la comprensión de secuencias.", area: "Estrategias" },
      { q: "¿Cuál es la fundamentación para realizar una adecuación de Graduación de un OA?", opts: ["Permitir el acceso a los mismos OA con indicadores modificados", "Garantizar el acceso pleno al currículum", "Ofrecer instancias de participación y aprendizaje dentro de sus posibilidades", "Facilitar el aprendizaje de aspectos esenciales para la trayectoria escolar"], answer: "D", exp: "La graduación facilita el aprendizaje de aspectos esenciales para la trayectoria escolar exitosa.", area: "Estrategias" },
      { q: "¿Qué estrategia inclusiva favorece la participación de estudiantes con DEA en reuniones sobre Planes Normativos?", opts: ["Diseñar y compartir textos informativos", "Realizar encuestas en línea", "Difundir los Planes Normativos anteriores", "Realizar reuniones con elementos visuales y auditivos"], answer: "D", exp: "Las reuniones con elementos visuales y auditivos favorecen la participación de estudiantes con DEA.", area: "Estrategias" },
      { q: "7° básico: estudiante tiene dificultades con multiplicación de fracciones. ¿Qué justifica la respuesta educativa del equipo?", opts: ["Requiere una adecuación de organización de tiempo", "Requiere una priorización curricular", "Requiere una adecuación de graduación del contenido", "Requiere una adecuación de enriquecimiento curricular"], answer: "B", exp: "La estudiante requiere priorización curricular considerando que la multiplicación es un aprendizaje imprescindible.", area: "PIE" },
      { q: "¿Qué estrategias contribuyen a que el Plan de Convivencia Escolar asegure una convivencia inclusiva?", opts: ["Desarrollar un diagnóstico para gestionar espacios formativos", "Proveer información en las entradas y crear espacios de atención", "Promover el trabajo colaborativo entre los estudiantes", "Visibilizar las oportunidades de los OA"], answer: "A", exp: "El diagnóstico y los espacios formativos contribuyen a asegurar una convivencia inclusiva.", area: "Estrategias" },
      { q: "7° básico con situaciones de hostigamiento. ¿Qué estrategia es adecuada para abordar la problemática?", opts: ["Desarrollar escuelas con y para padres, madres y apoderados", "Elaborar cartillas informativas", "Generar redes de apoyo externas", "Actualizar el reglamento de convivencia"], answer: "A", exp: "Desarrollar escuelas para padres y apoderados aborda la problemática desde la formación.", area: "Estrategias" },
      { q: "Establecimiento con número creciente de niños con DEA. ¿Qué estrategia NO contribuye a los planes de convivencia?", opts: ["Generar actividades deportivas", "Capacitar a la comunidad", "Aplicar cambios comunitarios", "Delegar la responsabilidad del proceso en el docente encargado"], answer: "D", exp: "Delegar la responsabilidad en un solo docente no contribuye a los planes de convivencia escolar.", area: "Estrategias" },
      { q: "Al reformular el Plan de Convivencia, ¿qué opción promueve la inclusión del estudiantado?", opts: ["El plan debe tener acciones y sanciones adaptadas a las necesidades educativas", "El plan debe ser igual para todos independientemente de su NEE", "El plan debe tener ajustes con certificado médico", "El plan debe tener acciones en relación con los distintos diagnósticos"], answer: "A", exp: "El plan debe tener acciones y sanciones adaptadas considerando el contexto y la trayectoria del estudiante.", area: "Estrategias" },
      { q: "Consejo Escolar quiere sensibilizar a la comunidad educativa. ¿Qué acciones implementar?", opts: ["Usar paneles informativos, exponer videos y hacer entrevistas", "Entregar trípticos, exponer videos y programar charlas", "Exponer videos, paneles y hacer entrevistas personalizadas", "Entrevistas personalizadas y exposición de videos e infografías"], answer: "B", exp: "Entregar trípticos, exponer videos y programar charlas son acciones de sensibilización adecuadas.", area: "Estrategias" }
    ]
  }

};

// ================================================================
//  BLOQUE COMPLEMENTARIO: LEY TEA (21.545) Y AUTISMO EN AULA REGULAR
//  Preguntas verificadas contra fuentes oficiales (Mineduc, CPEIP, BCN)
// ================================================================
const bonusData = {
  TEA: {
    color: "#14b8a6",
    label: "Ley TEA (21.545) en aula regular",
    questions: [
      { q: "¿Cuál es el objetivo principal de la Ley N°21.545, conocida como Ley TEA?", opts: ["Regular exclusivamente el diagnóstico clínico del TEA en el sistema de salud.", "Asegurar la igualdad de oportunidades, resguardar la inclusión social y eliminar la discriminación hacia las personas autistas en los ámbitos social, de salud y educativo.", "Crear escuelas especiales exclusivas para estudiantes con TEA.", "Establecer un nuevo instrumento de evaluación docente para especialistas en autismo."], answer: "B", exp: "La Ley 21.545 busca asegurar la igualdad de oportunidades y la inclusión social de las personas autistas, eliminando la discriminación en los ámbitos social, de salud y educativo.", area: "Marco Normativo" },
      { q: "¿En qué fecha fue promulgada la Ley N°21.545?", opts: ["10 de marzo de 2023", "2 de marzo de 2023", "1 de mayo de 2024", "2 de marzo de 2024"], answer: "B", exp: "La Ley N°21.545 fue promulgada el 2 de marzo de 2023.", area: "Marco Normativo" },
      { q: "Según las orientaciones del Mineduc sobre la Ley 21.545, ¿qué término se prioriza en el ámbito educativo para referirse a un estudiante con este diagnóstico?", opts: ["Trastorno del Espectro Autista (TEA), ya que es el término clínico oficial.", "Persona autista o persona dentro del espectro, priorizando un lenguaje centrado en la persona.", "Niño con capacidades diferentes.", "Paciente autista."], answer: "B", exp: "En el ámbito educativo se prioriza el término 'persona autista', reservando TEA para el contexto de diagnóstico en salud.", area: "Marco Normativo" },
      { q: "¿Cómo define el documento de orientaciones del Mineduc la condición de TEA?", opts: ["Como una enfermedad que requiere tratamiento médico permanente.", "Como una diferencia o diversidad en el neurodesarrollo típico, que se manifiesta en dificultades en la interacción y comunicación social.", "Como un trastorno exclusivamente conductual sin base neurológica.", "Como una discapacidad intelectual asociada siempre a un CI bajo 70."], answer: "B", exp: "Las orientaciones definen el TEA como una diferencia o diversidad en el neurodesarrollo típico, que se manifiesta en dificultades significativas en la interacción y comunicación social.", area: "Marco Normativo" },
      { q: "¿A qué tipo de establecimientos educacionales se aplica la Ley N°21.545?", opts: ["Solo a establecimientos públicos.", "Solo a establecimientos con PIE.", "A todo tipo de establecimientos: públicos, subvencionados y privados.", "Solo a escuelas especiales."], answer: "C", exp: "La Ley 21.545 se aplica a todo tipo de establecimientos educativos: públicos, subvencionados (semipúblicos) y privados.", area: "Marco Normativo" },
      { q: "Según la Ley N°21.545, ¿qué derecho específico se otorga a un estudiante con diagnóstico de TEA dentro del establecimiento educacional en situaciones de emergencia?", opts: ["Ser trasladado automáticamente a un establecimiento de educación especial.", "Contar con atención prioritaria en salud dentro del recinto.", "Acudir a emergencias respecto de su integridad, en la forma que determine el establecimiento.", "Recibir eximición completa de evaluaciones durante todo el año."], answer: "C", exp: "La ley establece que las personas diagnosticadas con TEA estarán facultadas para acudir a emergencias respecto de su integridad en los establecimientos donde cursan su enseñanza.", area: "Marco Normativo" },
      { q: "¿Con qué otro cuerpo legal se relaciona directamente la Ley N°21.545 en materia de igualdad de oportunidades para personas con discapacidad?", opts: ["Ley N°20.370 (Ley General de Educación) exclusivamente.", "Ley N°20.422, sobre igualdad de oportunidades e inclusión social de personas con discapacidad.", "Código del Trabajo.", "Ley N°19.284."], answer: "B", exp: "La Ley TEA se enmarca, entre otros cuerpos normativos, en la Ley N°20.422 sobre igualdad de oportunidades e inclusión social de personas con discapacidad.", area: "Marco Normativo" },
      { q: "En el marco del Decreto N°170/2009, ¿cómo se clasifica el TEA para efectos del ingreso de un estudiante al PIE de una escuela regular?", opts: ["Como Necesidad Educativa Especial de carácter transitorio.", "Como Necesidad Educativa Especial de carácter permanente.", "Como una condición que impide el ingreso al PIE.", "Como un diagnóstico exclusivo de escuelas especiales, no aplicable a PIE regular."], answer: "B", exp: "El TEA se reconoce como una Necesidad Educativa Especial de carácter permanente, lo que habilita el ingreso de un estudiante al PIE de una escuela regular.", area: "PIE" },
      { q: "Un estudiante autista de 2° Básico se desregula cuando hay cambios inesperados en la rutina de la sala. ¿Cuál estrategia pedagógica es más pertinente para el equipo de aula?", opts: ["Aumentar la exigencia académica para fortalecer su tolerancia a la frustración.", "Anticipar los cambios mediante apoyos visuales de la rutina diaria.", "Reducir su participación en actividades grupales de forma permanente.", "Solicitar que la familia lo mantenga en casa los días de actividades no habituales."], answer: "B", exp: "Anticipar los cambios mediante apoyos visuales (agendas o paneles de rutina) es una estrategia central para reducir la desregulación ante lo inesperado.", area: "Estrategias" },
      { q: "¿Cuál de las siguientes es una adecuación curricular de acceso pertinente para un estudiante autista con alta sensibilidad sensorial en el aula?", opts: ["Reducir los objetivos de aprendizaje del nivel.", "Ajustar las condiciones del entorno físico, como iluminación, ruido o ubicación dentro de la sala.", "Eximirlo de todas las evaluaciones orales.", "Cambiarlo permanentemente a un curso con menos estudiantes con NEE."], answer: "B", exp: "Ajustar las condiciones del entorno (iluminación, ruido, ubicación) es una adecuación curricular de acceso frente a la sensibilidad sensorial, sin modificar los objetivos de aprendizaje.", area: "Estrategias" },
      { q: "¿Qué sistema de apoyo es más adecuado para favorecer la comunicación de un estudiante autista no verbal en el aula regular, en coherencia con el enfoque de la Ley 21.545?", opts: ["Ignorar los intentos comunicativos no verbales hasta que use lenguaje oral.", "Implementar sistemas alternativos y/o aumentativos de comunicación (SAAC) pertinentes al estudiante.", "Derivarlo de manera inmediata a un establecimiento especial.", "Suspender su participación en actividades de comunicación oral del curso."], answer: "B", exp: "Los sistemas alternativos y/o aumentativos de comunicación (SAAC) favorecen la participación y comunicación del estudiante, en coherencia con el enfoque de derechos e inclusión de la Ley 21.545.", area: "Estrategias" },
      { q: "Según el enfoque de neurodiversidad, promovido también por la Ley TEA, ¿cómo debería entenderse el autismo dentro de la comunidad educativa?", opts: ["Como una condición a corregir hasta lograr un funcionamiento neurotípico.", "Como una variación natural del funcionamiento neurológico humano, que requiere ajustes del entorno más que 'normalizar' a la persona.", "Como un trastorno exclusivamente conductual que se resuelve con sanciones.", "Como una etapa transitoria del desarrollo que desaparece con la edad."], answer: "B", exp: "El enfoque de neurodiversidad entiende el autismo como una variación natural del funcionamiento neurológico, poniendo el foco en ajustar el entorno y los apoyos, no en 'normalizar' a la persona.", area: "Estrategias" },
      { q: "El equipo de aula de un estudiante autista de 5° Básico elabora un panel visual con los pasos de una actividad de Ciencias, además de anticipar verbalmente los cambios de actividad. ¿Qué principio del DUA se ve reflejado principalmente en esta decisión?", opts: ["Múltiples formas de representación de la información.", "Múltiples formas de evaluación sumativa.", "Eliminación de contenidos curriculares complejos.", "Aplicación exclusiva de estrategias de disciplina."], answer: "A", exp: "El uso de apoyos visuales y la anticipación de la información reflejan el principio de múltiples formas de representación del DUA.", area: "DUA" },
      { q: "Un estudiante autista de 7° Básico presenta un interés muy marcado por un tema específico (por ejemplo, trenes). ¿Cuál es la estrategia pedagógica más coherente con un enfoque de fortalezas para potenciar su participación?", opts: ["Prohibir que hable de su interés en clases para evitar que se distraiga.", "Incorporar su interés específico como motor motivacional dentro de actividades curriculares, cuando sea pertinente.", "Derivarlo a un taller aparte del resto del curso de forma permanente.", "Ignorar completamente sus intereses dentro de la planificación de aula."], answer: "B", exp: "Incorporar los intereses específicos del estudiante como motor motivacional es coherente con un enfoque de fortalezas y con el principio de implicación del DUA.", area: "Estrategias" },
      { q: "En el marco de la Ley N°21.545, ¿cuál es el rol del Estado respecto de la detección de señales de TEA en la primera infancia?", opts: ["No tiene ningún rol, ya que corresponde solo a la familia.", "Impulsar tamizajes o evaluaciones para identificar señales de TEA, especialmente entre los 16 meses y los 5 años.", "Realizar la detección únicamente a partir de los 10 años de edad.", "Delegar la detección exclusivamente a los establecimientos educacionales, sin apoyo del sistema de salud."], answer: "B", exp: "La Ley TEA establece la obligación de impulsar tamizajes o evaluaciones para identificar señales de TEA, especialmente entre los 16 meses y los 5 años de edad.", area: "Evaluación" }
    ]
  }
};

const allData = { ...quizData, ...bonusData };

// Umbrales oficiales del Sistema de Reconocimiento (Docente Más / CPEIP)
const CAT_COLOR = { A: "#4ade80", B: "#60a5fa", C: "#f59e0b", D: "#f87171", E: "#f87171" };
const TRAMO_COLOR = { "Experto II": "#4ade80", "Experto I": "#22d3ee", Avanzado: "#60a5fa", Temprano: "#f59e0b", Inicial: "#f87171" };
const TRAMO_MATRIX = {
  A: { A: "Experto II", B: "Experto II", C: "Experto I", D: "Temprano" },
  B: { A: "Experto II", B: "Experto I", C: "Avanzado", D: "Temprano" },
  C: { A: "Experto I", B: "Avanzado", C: "Temprano", D: "Inicial" },
  D: { A: "Temprano", B: "Temprano", C: "Inicial", D: "Inicial" },
  E: { A: "Inicial", B: "Inicial", C: "Inicial", D: "Inicial" },
};
const catPrueba = (n) => {
  if (n === "" || n === null || n === undefined || isNaN(n)) return null;
  const v = parseFloat(n);
  if (v >= 3.38) return "A";
  if (v >= 2.75) return "B";
  if (v >= 1.88) return "C";
  if (v >= 1) return "D";
  return null;
};
const catPortafolio = (n) => {
  if (n === "" || n === null || n === undefined || isNaN(n)) return null;
  const v = parseFloat(n);
  if (v >= 3.01) return "A";
  if (v >= 2.51) return "B";
  if (v >= 2.26) return "C";
  if (v >= 2.0) return "D";
  if (v >= 1) return "E";
  return null;
};
const tramoFor = (portCat, pruebaCat) => (portCat && pruebaCat ? TRAMO_MATRIX[portCat][pruebaCat] : null);
// Proyección lineal simple (NO oficial): mapea % de aciertos del quiz a la escala 1.00-4.00 de la Prueba
const simulatedPruebaScore = (pct) => Math.round((1 + (pct / 100) * 3) * 100) / 100;

// Clasificador heurístico: distingue preguntas de análisis de caso (situación narrativa aplicada)
// de preguntas conceptuales directas. Es una estimación por patrones de texto, no una etiqueta manual exacta.
const isCaseQuestion = (text) => {
  if (/lea la siguiente situaci[oó]n/i.test(text)) return true;
  if (text.length > 220) return true;
  if (/[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+,?\s(?:es un|es una|de|un|una)?.{0,20}\d°?\s?(Básico|Medio)/.test(text)) return true;
  return false;
};

const AREAS = ["Todas", "Evaluación", "Marco Normativo", "Estrategias", "PIE", "DUA", "Lenguaje", "Matemática", "Co-docencia"];

export default function QuizDEA() {
  const [screen, setScreen] = useState("home");
  const [selectedYear, setSelectedYear] = useState(null);
  const [mode, setMode] = useState("practice");
  const [filterArea, setFilterArea] = useState("Todas");
  const [shuffle, setShuffle] = useState(false);
  const [onlyUnseen, setOnlyUnseen] = useState(false);
  const [quizLength, setQuizLength] = useState("Todas");
  const [seenQuestions, setSeenQuestionsState] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [examTime, setExamTime] = useState(0);
  const [examTimeLimit, setExamTimeLimit] = useState(null);
  const [wrongQuestions, setWrongQuestionsState] = useState([]);
  const [previousBest, setPreviousBest] = useState(null);
  const setWrongQuestions = (updater) => {
    setWrongQuestionsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      storage.set("wrongQuestions", JSON.stringify(next)).catch(() => {});
      return next;
    });
  };
  const [reviewMode, setReviewMode] = useState(false);
  const timerRef = useRef(null);

  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [officialResults, setOfficialResults] = useState([]);
  const [newResult, setNewResult] = useState({ year: new Date().getFullYear(), pruebaPuntaje: "", portafolioPuntaje: "", notes: "" });

  useEffect(() => {
    (async () => {
      try {
        const result = await storage.get("officialResults");
        if (result && result.value) setOfficialResults(JSON.parse(result.value));
      } catch (e) {
        // sin registros previos
      }
    })();
    (async () => {
      try {
        const result = await storage.get("wrongQuestions");
        if (result && result.value) setWrongQuestionsState(JSON.parse(result.value));
      } catch (e) {
        // sin preguntas guardadas
      }
    })();
    (async () => {
      try {
        const result = await storage.get("seenQuestions");
        if (result && result.value) setSeenQuestionsState(JSON.parse(result.value));
      } catch (e) {
        // sin registro de preguntas vistas
      }
    })();
  }, []);

  const saveOfficialResults = async (list) => {
    setOfficialResults(list);
    try {
      await storage.set("officialResults", JSON.stringify(list));
    } catch (e) {
      console.error("No se pudo guardar el registro", e);
    }
  };

  const addOfficialResult = () => {
    if (!newResult.pruebaPuntaje && !newResult.portafolioPuntaje) {
      alert("Ingresa al menos un puntaje (Prueba o Portafolio).");
      return;
    }
    const entry = { ...newResult, id: Date.now() };
    saveOfficialResults([entry, ...officialResults]);
    setNewResult({ year: new Date().getFullYear(), pruebaPuntaje: "", portafolioPuntaje: "", notes: "" });
  };

  const removeOfficialResult = (id) => {
    saveOfficialResults(officialResults.filter((r) => r.id !== id));
  };


  useEffect(() => {
    (async () => {
      try {
        const result = await storage.get("quizHistory");
        if (result && result.value) setHistory(JSON.parse(result.value));
      } catch (e) {
        // sin historial previo
      } finally {
        setHistoryLoaded(true);
      }
    })();
  }, []);

  const saveHistory = async (newHistory) => {
    setHistory(newHistory);
    try {
      await storage.set("quizHistory", JSON.stringify(newHistory));
    } catch (e) {
      console.error("No se pudo guardar el historial", e);
    }
  };

  useEffect(() => {
    if (screen === "quiz" && mode === "exam") {
      timerRef.current = setInterval(() => {
        setExamTime((t) => {
          const next = t + 1;
          if (examTimeLimit && next >= examTimeLimit) {
            clearInterval(timerRef.current);
            setTimeout(() => autoFinishExam(), 0);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen, mode, examTimeLimit]);

  const buildQuestions = (year, area, shuf, unseenOnly, limit) => {
    let qs;
    if (year === "ALL") {
      qs = Object.entries(quizData).flatMap(([y, data]) => data.questions.map((q, i) => ({ ...q, originalIndex: i, year: parseInt(y), qid: `${y}-${i}` })));
    } else {
      qs = allData[year]?.questions.map((q, i) => ({ ...q, originalIndex: i, year, qid: `${year}-${i}` })) || [];
    }
    if (area !== "Todas") qs = qs.filter((q) => q.area === area);
    if (unseenOnly) qs = qs.filter((q) => !seenQuestions.includes(q.qid));
    if (limit && qs.length > limit) {
      qs = [...qs].sort(() => Math.random() - 0.5).slice(0, limit);
    } else if (shuf) {
      qs = [...qs].sort(() => Math.random() - 0.5);
    }
    return qs;
  };

  const markSeen = (qids) => {
    setSeenQuestionsState((prev) => {
      const next = Array.from(new Set([...prev, ...qids]));
      storage.set("seenQuestions", JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const startQuiz = (year, review = false, areaOverride = null) => {
    const areaToUse = areaOverride || filterArea;
    if (areaOverride) setFilterArea(areaOverride);
    const limit = quizLength === "Todas" ? null : parseInt(quizLength);
    const qs = review ? wrongQuestions : buildQuestions(year, areaToUse, shuffle, onlyUnseen, limit);
    if (qs.length === 0) {
      alert(review ? "No tienes preguntas para repasar. ¡Bien hecho!" : onlyUnseen ? "Ya viste todas las preguntas con estos filtros. Desactiva 'solo nuevas' para repasar." : "No hay preguntas con los filtros seleccionados.");
      return;
    }
    if (!review) markSeen(qs.map((q) => q.qid));
    setQuestions(qs);
    setSelectedYear(year);
    setCurrent(0);
    setSelected(null);
    setConfirmed(false);
    setScore(0);
    setAnswers([]);
    setExamTime(0);
    setExamTimeLimit(mode === "exam" ? Math.round(150 * (qs.length / 60)) * 60 : null);
    setFlagged([]);
    setReviewMode(review);
    setScreen("quiz");
  };

  const finishQuiz = (finalAnswers, finalScore, timedOut = false) => {
    clearInterval(timerRef.current);
    const areaStatsForHistory = {};
    const caseTypeStats = { caso: { correct: 0, total: 0 }, conceptual: { correct: 0, total: 0 } };
    questions.forEach((q, i) => {
      if (!areaStatsForHistory[q.area]) areaStatsForHistory[q.area] = { correct: 0, total: 0 };
      areaStatsForHistory[q.area].total++;
      const bucket = isCaseQuestion(q.q) ? "caso" : "conceptual";
      caseTypeStats[bucket].total++;
      if (finalAnswers[i]?.correct) {
        areaStatsForHistory[q.area].correct++;
        caseTypeStats[bucket].correct++;
      }
    });

    const previousAttempts = history.filter((h) => h.year === selectedYear);
    const bestPrevPct = previousAttempts.length > 0 ? Math.max(...previousAttempts.map((h) => pct(h.score, h.total))) : null;
    setPreviousBest(bestPrevPct);

    const result = {
      year: selectedYear,
      score: finalScore,
      total: questions.length,
      date: new Date().toLocaleDateString("es-CL"),
      time: examTime,
      mode,
      timedOut,
      areas: areaStatsForHistory,
      caseType: caseTypeStats,
    };
    const newHistory = [result, ...history].slice(0, 50);
    saveHistory(newHistory);
    setScreen("results");
  };

  const confirmAnswer = () => {
    if (!selected) return;
    const q = questions[current];
    const correct = selected === q.answer;
    if (correct) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, { question: current, selected, correct, answer: q.answer }]);
    setConfirmed(true);
    if (!correct) {
      setWrongQuestions((prev) => {
        if (!prev.find((wq) => wq.q === questions[current].q)) {
          return [...prev, questions[current]];
        }
        return prev;
      });
    }
  };

  const advance = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setConfirmed(false);
    } else {
      finishQuiz(answers, score);
    }
  };

  const autoFinishExam = () => {
    // Se agota el tiempo simulado de la ECEP: las preguntas no respondidas cuentan como incorrectas/omitidas.
    setAnswers((prevAnswers) => {
      const padded = [...prevAnswers];
      for (let i = padded.length; i < questions.length; i++) {
        padded.push({ question: i, selected: null, correct: false, answer: questions[i]?.answer });
      }
      setScore((s) => {
        finishQuiz(padded, s, true);
        return s;
      });
      return padded;
    });
  };

  const toggleFlag = () => {
    setFlagged((prev) => (prev.includes(current) ? prev.filter((f) => f !== current) : [...prev, current]));
  };

  const exportResults = () => {
    const text = `📊 RESULTADOS QUIZ ECEP\nAño: ${selectedYear}\nPuntaje: ${score}/${questions.length} (${Math.round((score / questions.length) * 100)}%)\nModo: ${mode}\nFecha: ${new Date().toLocaleDateString("es-CL")}\n\n`;
    const details = questions
      .map((q, i) => {
        const ans = answers[i];
        return `P${i + 1}: ${ans?.correct ? "✅" : "❌"} ${q.q.substring(0, 50)}...`;
      })
      .join("\n");
    const blob = new Blob([text + details], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `quiz_resultados_${selectedYear}.txt`;
    a.click();
  };

  const clearHistory = async () => {
    try {
      await storage.delete("quizHistory");
    } catch (e) {
      // nada que borrar
    }
    setHistory([]);
    alert("Historial eliminado.");
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const pct = (n, t) => (t === 0 ? 0 : Math.round((n / t) * 100));

  if (screen === "home") {
    const homeAreaTotals = {};
    history.forEach((h) => {
      if (h.areas) {
        Object.entries(h.areas).forEach(([area, stats]) => {
          if (!homeAreaTotals[area]) homeAreaTotals[area] = { correct: 0, total: 0 };
          homeAreaTotals[area].correct += stats.correct;
          homeAreaTotals[area].total += stats.total;
        });
      }
    });
    const homeSortedAreas = Object.entries(homeAreaTotals)
      .filter(([, s]) => s.total >= 3)
      .sort((a, b) => pct(a[1].correct, a[1].total) - pct(b[1].correct, b[1].total));
    const weakestArea = homeSortedAreas.length > 0 ? homeSortedAreas[0] : null;

    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🧠</div>
            <h1 style={{ color: "white", fontSize: 26, fontWeight: 800, margin: "0 0 8px" }}>Quiz ECEP — Educación Diferencial</h1>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Preparación para la Prueba de Conocimientos Específicos y Pedagógicos</p>
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
              {Object.values(quizData).reduce((acc, y) => acc + y.questions.length, 0)} preguntas • {Object.keys(quizData).length} año(s) cargado(s) en esta demo
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>Modo de estudio</p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                ["practice", "🎯", "Práctica", "Ver respuesta al confirmar"],
                ["study", "📖", "Estudio", "Ver explicación siempre"],
                ["exam", "⏱️", "Examen", "Sin pistas, con cronómetro"],
              ].map(([m, icon, label, desc]) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: "14px 8px",
                    borderRadius: 12,
                    border: `2px solid ${mode === m ? "#3b82f6" : "transparent"}`,
                    background: mode === m ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)",
                    color: mode === m ? "#60a5fa" : "#94a3b8",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 22 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{label}</div>
                  <div style={{ fontSize: 10, marginTop: 2, opacity: 0.8 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
              <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 10px", textTransform: "uppercase" }}>Área temática</p>
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "white",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {AREAS.map((a) => (
                  <option key={a} value={a} style={{ background: "#1e293b" }}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
              <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 10px", textTransform: "uppercase" }}>Orden</p>
              <button
                onClick={() => setShuffle((s) => !s)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: shuffle ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)",
                  border: `1px solid ${shuffle ? "#7c3aed" : "rgba(255,255,255,0.15)"}`,
                  color: shuffle ? "#a78bfa" : "#94a3b8",
                  cursor: "pointer",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Shuffle size={15} /> {shuffle ? "Aleatorio ✓" : "Aleatorio"}
              </button>
            </div>
          </div>

          <button
            onClick={() => setOnlyUnseen((v) => !v)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              background: onlyUnseen ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${onlyUnseen ? "#10b981" : "rgba(255,255,255,0.1)"}`,
              color: onlyUnseen ? "#34d399" : "#94a3b8",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            🆕 {onlyUnseen ? "Solo preguntas nunca vistas ✓" : "Mostrar solo preguntas nunca vistas"}
            {seenQuestions.length > 0 && <span style={{ opacity: 0.7 }}>({seenQuestions.length} ya vistas)</span>}
          </button>

          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 10px", textTransform: "uppercase" }}>⏳ Cantidad de preguntas</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Todas", "10", "15", "20", "30"].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuizLength(n)}
                  style={{
                    flex: 1,
                    minWidth: 55,
                    padding: "8px 6px",
                    borderRadius: 8,
                    border: `2px solid ${quizLength === n ? "#3b82f6" : "transparent"}`,
                    background: quizLength === n ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)",
                    color: quizLength === n ? "#60a5fa" : "#94a3b8",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {n === "Todas" ? "Todas" : `${n} preg.`}
                </button>
              ))}
            </div>
            {quizLength !== "Todas" && <p style={{ color: "#64748b", fontSize: 10, margin: "8px 0 0" }}>Examen corto de práctica: {quizLength} preguntas aleatorias según tus filtros.</p>}
          </div>

          <button
            onClick={() => startQuiz("ALL")}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 15,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            🎲 Todos los años (2017–2024) — {Object.values(quizData).reduce((acc, y) => acc + y.questions.length, 0)} preguntas
          </button>

          <button
            onClick={() => startQuiz("TEA")}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              background: "rgba(20,184,166,0.12)",
              border: "1px solid rgba(20,184,166,0.35)",
              color: "#5eead4",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            🧩 Refuerzo: Ley TEA (21.545) en aula regular — {bonusData.TEA.questions.length} preguntas
          </button>

          <p style={{ color: "#64748b", fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 8px", textTransform: "uppercase" }}>O elige un año específico</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
            {Object.entries(quizData).map(([year, data]) => {
              const bestScores = history.filter((h) => h.year === parseInt(year));
              const best = bestScores.length > 0 ? Math.max(...bestScores.map((h) => pct(h.score, h.total))) : null;
              return (
                <button
                  key={year}
                  onClick={() => startQuiz(parseInt(year))}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid rgba(255,255,255,0.1)`,
                    borderRadius: 12,
                    padding: 14,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${data.color}22`;
                    e.currentTarget.style.borderColor = data.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 900, color: data.color }}>{year}</div>
                  <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 2 }}>{data.questions.length} preguntas</div>
                  {best !== null && (
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <Star size={11} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ color: "#f59e0b", fontSize: 10, fontWeight: 700 }}>{best}%</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {wrongQuestions.length > 0 && (
            <button
              onClick={() => startQuiz(selectedYear || Object.keys(quizData)[0], true)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                background: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.3)",
                color: "#f59e0b",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <RefreshCw size={16} /> Repasar errores ({wrongQuestions.length} preguntas)
            </button>
          )}

          {weakestArea && (
            <button
              onClick={() => startQuiz("ALL", false, weakestArea[0])}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#fca5a5",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              🎯 Practica tu punto débil: {weakestArea[0]} ({pct(weakestArea[1].correct, weakestArea[1].total)}%)
            </button>
          )}

          <button
            onClick={() => setScreen("official")}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "#a78bfa",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            📋 Mis resultados oficiales (ECEP / Portafolio) {officialResults.length > 0 && `(${officialResults.length})`}
          </button>

          {historyLoaded && history.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ color: "white", fontSize: 14, fontWeight: 700, margin: 0 }}>📊 Historial</p>
                <button onClick={() => setScreen("stats")} style={{ background: "none", border: "none", color: "#60a5fa", fontSize: 12, cursor: "pointer" }}>
                  Ver todo →
                </button>
              </div>
              {history.slice(0, 3).map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>
                    Año {h.year} — {h.date}
                  </span>
                  <span style={{ color: pct(h.score, h.total) >= 70 ? "#4ade80" : "#f87171", fontWeight: 700, fontSize: 12 }}>{pct(h.score, h.total)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "quiz") {
    const q = questions[current];
    const yearColor = allData[selectedYear]?.color || "#3b82f6";
    const progress = ((current + 1) / questions.length) * 100;

    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", padding: "16px", fontFamily: "system-ui, sans-serif" }}>
        <Timer durationMinutes={120} />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={() => setScreen("home")} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>
              <Home size={14} /> Inicio
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {mode === "exam" && examTimeLimit && (
                <span style={{ color: examTimeLimit - examTime <= 60 ? "#f87171" : "#f59e0b", fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>
                  ⏱️ {fmt(Math.max(0, examTimeLimit - examTime))} restantes
                </span>
              )}
              <span style={{ color: "#94a3b8", fontSize: 13 }}>
                {current + 1} / {questions.length}
              </span>
              <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 700 }}>✓ {score}</span>
            </div>
            <button
              onClick={toggleFlag}
              style={{
                background: flagged.includes(current) ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.08)",
                border: `1px solid ${flagged.includes(current) ? "#f59e0b" : "transparent"}`,
                color: flagged.includes(current) ? "#f59e0b" : "#94a3b8",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              <Flag size={14} />
            </button>
          </div>

          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 4, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${yearColor}, ${yearColor}aa)`, borderRadius: 99, transition: "width 0.4s ease" }} />
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <span style={{ background: `${yearColor}22`, color: yearColor, borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{q.year || selectedYear}</span>
            <span style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8", borderRadius: 99, padding: "2px 10px", fontSize: 11 }}>{q.area}</span>
            {flagged.includes(current) && <span style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", borderRadius: 99, padding: "2px 10px", fontSize: 11 }}>🚩</span>}
          </div>

          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 20, marginBottom: 14 }}>
            <p style={{ color: "white", fontSize: 15, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{q.q}</p>
          </div>

          {mode === "study" && !confirmed && (
            <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <p style={{ color: "#93c5fd", fontSize: 12, margin: "0 0 4px", fontWeight: 700 }}>📖 Modo Estudio — Respuesta: {q.answer}</p>
              <p style={{ color: "#bfdbfe", fontSize: 12, margin: 0, lineHeight: 1.5 }}>{q.exp}</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {q.opts.map((opt, i) => {
              const letter = ["A", "B", "C", "D"][i];
              const isSelected = selected === letter;
              const isCorrect = letter === q.answer;
              let bg = "rgba(255,255,255,0.06)";
              let border = "rgba(255,255,255,0.1)";
              let textColor = "#e2e8f0";
              if ((confirmed && mode !== "exam") || mode === "study") {
                if (isCorrect) {
                  bg = "rgba(74,222,128,0.15)";
                  border = "#4ade80";
                  textColor = "#4ade80";
                } else if (isSelected && !isCorrect) {
                  bg = "rgba(248,113,113,0.15)";
                  border = "#f87171";
                  textColor = "#f87171";
                }
              } else if (isSelected) {
                bg = `${yearColor}22`;
                border = yearColor;
                textColor = "white";
              }
              return (
                <button
                  key={letter}
                  onClick={() => !confirmed && setSelected(letter)}
                  style={{
                    background: bg,
                    border: `2px solid ${border}`,
                    borderRadius: 12,
                    padding: "12px 16px",
                    color: textColor,
                    cursor: confirmed ? "default" : "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    transition: "all 0.2s",
                    fontSize: 13,
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ minWidth: 24, height: 24, borderRadius: 6, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>
                    {confirmed && isCorrect ? "✓" : confirmed && isSelected && !isCorrect ? "✗" : letter}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {confirmed && mode !== "study" && mode !== "exam" && (
            <div
              style={{
                background: answers[answers.length - 1]?.correct ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                border: `1px solid ${answers[answers.length - 1]?.correct ? "#4ade80" : "#f87171"}`,
                borderRadius: 12,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <p style={{ color: answers[answers.length - 1]?.correct ? "#4ade80" : "#f87171", fontWeight: 700, margin: "0 0 4px", fontSize: 13 }}>
                {answers[answers.length - 1]?.correct ? "✅ Correcto" : `❌ Incorrecto — Respuesta: ${q.answer}`}
              </p>
              <p style={{ color: "#cbd5e1", fontSize: 12, margin: 0, lineHeight: 1.5 }}>{q.exp}</p>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <button
              onClick={() => {
                if (current > 0) {
                  setCurrent((c) => c - 1);
                  setSelected(null);
                  setConfirmed(false);
                }
              }}
              disabled={current === 0}
              style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "none", color: current === 0 ? "#475569" : "#94a3b8", cursor: current === 0 ? "not-allowed" : "pointer", fontSize: 13 }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            {!confirmed && mode !== "exam" ? (
              <button
                onClick={confirmAnswer}
                disabled={!selected}
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: 12,
                  background: selected ? yearColor : "rgba(255,255,255,0.06)",
                  border: "none",
                  color: selected ? "white" : "#475569",
                  cursor: selected ? "pointer" : "not-allowed",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Confirmar
              </button>
            ) : (
              <button
                onClick={mode === "exam" && !confirmed ? confirmAnswer : advance}
                disabled={mode === "exam" && !confirmed && !selected}
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: 12,
                  background: yearColor,
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {mode === "exam" && !confirmed ? "Responder" : current === questions.length - 1 ? "Ver resultados" : "Siguiente"} <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "results") {
    const total = questions.length;
    const p = pct(score, total);
    const yearColor = allData[selectedYear]?.color || "#3b82f6";
    const areaStats = {};
    questions.forEach((q, i) => {
      if (!areaStats[q.area]) areaStats[q.area] = { correct: 0, total: 0 };
      areaStats[q.area].total++;
      if (answers[i]?.correct) areaStats[q.area].correct++;
    });
    const sortedAreas = Object.entries(areaStats).sort((a, b) => pct(a[1].correct, a[1].total) - pct(b[1].correct, b[1].total));

    const simScore = simulatedPruebaScore(p);
    const simCat = catPrueba(simScore);
    const lastOfficial = officialResults.length > 0 ? [...officialResults].sort((a, b) => b.year - a.year)[0] : null;
    const lastPortafolioCat = lastOfficial ? catPortafolio(lastOfficial.portafolioPuntaje) : null;
    const simTramo = tramoFor(lastPortafolioCat, simCat);

    const caseStats = { caso: { correct: 0, total: 0 }, conceptual: { correct: 0, total: 0 } };
    questions.forEach((q, i) => {
      const bucket = isCaseQuestion(q.q) ? "caso" : "conceptual";
      caseStats[bucket].total++;
      if (answers[i]?.correct) caseStats[bucket].correct++;
    });

    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 56, marginBottom: 6 }}>{p >= 70 ? "🏆" : p >= 50 ? "📚" : "💪"}</div>
            <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>Resultados — {selectedYear === "ALL" ? "Todos los años" : selectedYear === "TEA" ? "Ley TEA en aula regular" : `Año ${selectedYear}`}</h2>
            <div style={{ fontSize: 44, fontWeight: 900, color: p >= 70 ? "#4ade80" : p >= 50 ? "#f59e0b" : "#f87171", marginBottom: 4 }}>{p}%</div>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
              {score} de {total} correctas {mode === "exam" && `• Tiempo: ${fmt(examTime)}`}
              {history[0]?.timedOut && <span style={{ color: "#f87171" }}> • ⏰ Tiempo agotado</span>}
            </p>
            {previousBest !== null && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 10,
                  padding: "6px 14px",
                  borderRadius: 99,
                  background: p > previousBest ? "rgba(74,222,128,0.12)" : p === previousBest ? "rgba(148,163,184,0.12)" : "rgba(248,113,113,0.12)",
                  border: `1px solid ${p > previousBest ? "#4ade80" : p === previousBest ? "#94a3b8" : "#f87171"}`,
                }}
              >
                <span style={{ fontSize: 12, color: p > previousBest ? "#4ade80" : p === previousBest ? "#cbd5e1" : "#f87171", fontWeight: 700 }}>
                  {p > previousBest ? `📈 +${p - previousBest}% vs tu mejor anterior (${previousBest}%)` : p === previousBest ? `➡️ Igualaste tu mejor anterior (${previousBest}%)` : `📉 ${p - previousBest}% vs tu mejor anterior (${previousBest}%)`}
                </span>
              </div>
            )}
          </div>

          <div style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.25)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <p style={{ color: "#5eead4", fontSize: 13, fontWeight: 700, margin: "0 0 8px" }}>🧪 Simulación de puntaje (NO oficial)</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: "#5eead4" }}>{simScore.toFixed(2)}</span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>/ 4.00</span>
              {simCat && <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: CAT_COLOR[simCat] }}>Categoría {simCat}</span>}
            </div>
            {simTramo && lastOfficial && (
              <p style={{ color: TRAMO_COLOR[simTramo], fontSize: 12, fontWeight: 700, margin: "0 0 8px" }}>
                🎯 Si cruzas esto con tu Portafolio {lastOfficial.year} ({lastOfficial.portafolioPuntaje}): tramo simulado = {simTramo}
              </p>
            )}
            <p style={{ color: "#64748b", fontSize: 10, margin: 0, lineHeight: 1.5 }}>
              Es una proyección lineal simple (100% de aciertos = 4.00 puntos), <strong>no la escala oficial</strong> de la ECEP. La prueba real usa metodología psicométrica que no equivale directamente al % de respuestas correctas. Úsalo solo como referencia de tendencia, no como predicción de tu resultado real.
            </p>
          </div>

          {(caseStats.caso.total > 0 || caseStats.conceptual.total > 0) && (
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <p style={{ color: "white", fontSize: 13, fontWeight: 700, margin: "0 0 4px" }}>🧩 Análisis de caso vs. conceptual</p>
              <p style={{ color: "#64748b", fontSize: 10, margin: "0 0 10px" }}>Clasificación estimada por patrones de texto, no es una etiqueta oficial exacta.</p>
              {[
                ["caso", "📖 Preguntas de análisis de caso (situación aplicada)"],
                ["conceptual", "📎 Preguntas conceptuales directas"],
              ].map(([key, label]) => {
                if (caseStats[key].total === 0) return null;
                const cp = pct(caseStats[key].correct, caseStats[key].total);
                return (
                  <div key={key} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ color: "#cbd5e1", fontSize: 12 }}>{label}</span>
                      <span style={{ color: cp >= 70 ? "#4ade80" : cp >= 50 ? "#f59e0b" : "#f87171", fontWeight: 700, fontSize: 12 }}>
                        {caseStats[key].correct}/{caseStats[key].total} ({cp}%)
                      </span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${cp}%`, background: cp >= 70 ? "#4ade80" : cp >= 50 ? "#f59e0b" : "#f87171", borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {Object.keys(areaStats).length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <p style={{ color: "white", fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}>📊 Rendimiento por área</p>
              {sortedAreas.map(([area, stats]) => {
                const ap = pct(stats.correct, stats.total);
                return (
                  <div key={area} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ color: "#cbd5e1", fontSize: 12 }}>{area}</span>
                      <span style={{ color: ap >= 70 ? "#4ade80" : ap >= 50 ? "#f59e0b" : "#f87171", fontWeight: 700, fontSize: 12 }}>
                        {stats.correct}/{stats.total}
                      </span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${ap}%`, background: ap >= 70 ? "#4ade80" : ap >= 50 ? "#f59e0b" : "#f87171", borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
              {sortedAreas.length > 0 && (
                <div style={{ marginTop: 10, padding: 10, background: "rgba(248,113,113,0.1)", borderRadius: 8 }}>
                  <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>
                    🎯 Área más débil: <strong>{sortedAreas[0][0]}</strong> ({pct(sortedAreas[0][1].correct, sortedAreas[0][1].total)}%)
                  </p>
                  <p style={{ color: "#4ade80", fontSize: 12, margin: "4px 0 0" }}>
                    💪 Área más fuerte: <strong>{sortedAreas[sortedAreas.length - 1][0]}</strong> ({pct(sortedAreas[sortedAreas.length - 1][1].correct, sortedAreas[sortedAreas.length - 1][1].total)}%)
                  </p>
                </div>
              )}
            </div>
          )}

          {answers.some((a) => !a.correct) && (
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <p style={{ color: "white", fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>
                📝 Preguntas para reforzar ({answers.filter((a) => !a.correct).length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {answers.map((a, i) => {
                  if (a.correct) return null;
                  const q = questions[i];
                  return (
                    <div key={i} style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: 12 }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                        <span style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8", borderRadius: 99, padding: "2px 8px", fontSize: 10 }}>{q.area}</span>
                      </div>
                      <p style={{ color: "#e2e8f0", fontSize: 13, margin: "0 0 8px", lineHeight: 1.5 }}>{q.q}</p>
                      <p style={{ color: "#f87171", fontSize: 12, margin: "0 0 4px" }}>
                        Tu respuesta: <strong>{a.selected}</strong> · Correcta: <strong>{a.answer}</strong>
                      </p>
                      <p style={{ color: "#cbd5e1", fontSize: 12, margin: 0, lineHeight: 1.5 }}>{q.exp}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {flagged.length > 0 && (
            <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: 12, marginBottom: 14 }}>
              <p style={{ color: "#f59e0b", fontWeight: 700, margin: "0 0 4px", fontSize: 13 }}>🚩 Preguntas marcadas: {flagged.length}</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => startQuiz(selectedYear)} style={{ padding: "14px", borderRadius: 12, background: yearColor, border: "none", color: "white", cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <RotateCcw size={16} /> Repetir {selectedYear === "ALL" ? "todos los años" : selectedYear === "TEA" ? "este repaso" : `año ${selectedYear}`}
            </button>
            <button onClick={exportResults} style={{ padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Download size={16} /> Exportar resultados
            </button>
            <button onClick={() => setScreen("home")} style={{ padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Home size={16} /> Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "stats") {
    const areaTotals = {};
    history.forEach((h) => {
      if (h.areas) {
        Object.entries(h.areas).forEach(([area, stats]) => {
          if (!areaTotals[area]) areaTotals[area] = { correct: 0, total: 0 };
          areaTotals[area].correct += stats.correct;
          areaTotals[area].total += stats.total;
        });
      }
    });
    const sortedAvgAreas = Object.entries(areaTotals).sort((a, b) => pct(a[1].correct, a[1].total) - pct(b[1].correct, b[1].total));

    const evolutionData = [...history]
      .reverse()
      .map((h, i) => ({ intento: i + 1, pct: pct(h.score, h.total), label: `${h.date}${h.year === "ALL" ? " (Mix)" : h.year === "TEA" ? " (TEA)" : ` (${h.year})`}` }));

    const heatYears = [...new Set(history.map((h) => h.year))].sort((a, b) => {
      const aNum = typeof a === "number";
      const bNum = typeof b === "number";
      if (aNum && bNum) return a - b;
      if (aNum) return -1;
      if (bNum) return 1;
      return String(a).localeCompare(String(b));
    });
    const heatAreas = Object.keys(areaTotals).sort();
    const heatMatrix = {};
    history.forEach((h) => {
      if (!h.areas) return;
      Object.entries(h.areas).forEach(([area, stats]) => {
        heatMatrix[area] = heatMatrix[area] || {};
        heatMatrix[area][h.year] = heatMatrix[area][h.year] || { correct: 0, total: 0 };
        heatMatrix[area][h.year].correct += stats.correct;
        heatMatrix[area][h.year].total += stats.total;
      });
    });
    const heatColor = (ap) => {
      if (ap >= 85) return "#15803d";
      if (ap >= 70) return "#4ade80";
      if (ap >= 55) return "#facc15";
      if (ap >= 40) return "#f59e0b";
      return "#dc2626";
    };

    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button onClick={() => setScreen("home")} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>
              ← Volver
            </button>
            <h2 style={{ color: "white", fontSize: 18, fontWeight: 800, margin: 0 }}>📊 Historial y Progreso</h2>
            {history.length > 0 && <span style={{ color: "#64748b", fontSize: 12 }}>({history.length})</span>}
          </div>

          {evolutionData.length >= 2 && (
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <p style={{ color: "white", fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>📈 Evolución en el tiempo</p>
              <div style={{ width: "100%", height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="intento" stroke="#64748b" fontSize={10} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, fontSize: 12 }}
                      labelFormatter={() => ""}
                      formatter={(value, name, props) => [`${value}%`, props.payload.label]}
                    />
                    <Line type="monotone" dataKey="pct" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p style={{ color: "#64748b", fontSize: 10, margin: "6px 0 0" }}>Cada punto es un intento, en orden cronológico (el 1 es el más antiguo).</p>
            </div>
          )}

          {Object.keys(areaTotals).length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <p style={{ color: "white", fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>📈 Mapa de progreso por área (promedio histórico)</p>
              {sortedAvgAreas.map(([area, stats]) => {
                const ap = pct(stats.correct, stats.total);
                return (
                  <div key={area} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ color: "#cbd5e1", fontSize: 13 }}>{area}</span>
                      <span style={{ color: ap >= 70 ? "#4ade80" : ap >= 50 ? "#f59e0b" : "#f87171", fontWeight: 700, fontSize: 13 }}>{ap}%</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${ap}%`, background: ap >= 70 ? "#4ade80" : ap >= 50 ? "#f59e0b" : "#f87171", borderRadius: 99, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
              {sortedAvgAreas.length > 0 && (
                <div style={{ marginTop: 12, padding: 12, background: "rgba(248,113,113,0.1)", borderRadius: 8 }}>
                  <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>
                    🔴 Área más débil (priorizar estudio): <strong>{sortedAvgAreas[0][0]}</strong> ({pct(sortedAvgAreas[0][1].correct, sortedAvgAreas[0][1].total)}%)
                  </p>
                  <p style={{ color: "#4ade80", fontSize: 13, margin: "4px 0 0" }}>
                    🟢 Área más fuerte: <strong>{sortedAvgAreas[sortedAvgAreas.length - 1][0]}</strong> ({pct(sortedAvgAreas[sortedAvgAreas.length - 1][1].correct, sortedAvgAreas[sortedAvgAreas.length - 1][1].total)}%)
                  </p>
                </div>
              )}
            </div>
          )}

          {heatAreas.length > 0 && heatYears.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <p style={{ color: "white", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>🔥 Mapa de calor: área × año</p>
              <p style={{ color: "#64748b", fontSize: 11, margin: "0 0 12px" }}>Verde = dominado, rojo = requiere refuerzo. Desliza si no cabe.</p>
              <div style={{ overflowX: "auto" }}>
                <div style={{ display: "inline-block", minWidth: "100%" }}>
                  <div style={{ display: "flex", marginBottom: 4 }}>
                    <div style={{ width: 110, flexShrink: 0 }} />
                    {heatYears.map((y) => (
                      <div key={y} style={{ width: 40, flexShrink: 0, textAlign: "center", color: "#94a3b8", fontSize: 10, fontWeight: 700 }}>
                        {y === "ALL" ? "Mix" : y}
                      </div>
                    ))}
                  </div>
                  {heatAreas.map((area) => (
                    <div key={area} style={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
                      <div style={{ width: 110, flexShrink: 0, color: "#cbd5e1", fontSize: 11, paddingRight: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{area}</div>
                      {heatYears.map((y) => {
                        const cell = heatMatrix[area]?.[y];
                        const ap = cell ? pct(cell.correct, cell.total) : null;
                        return (
                          <div
                            key={y}
                            title={cell ? `${area} · ${y === "ALL" ? "Mixto" : y}: ${cell.correct}/${cell.total} (${ap}%)` : "Sin datos"}
                            style={{
                              width: 36,
                              height: 28,
                              flexShrink: 0,
                              margin: "0 2px",
                              borderRadius: 6,
                              background: ap === null ? "rgba(255,255,255,0.04)" : heatColor(ap),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: ap === null ? "#475569" : "#0f172a",
                              fontSize: 9,
                              fontWeight: 800,
                            }}
                          >
                            {ap === null ? "–" : `${ap}`}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>📋 Intentos anteriores:</p>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: 40, fontSize: 14 }}>No hay resultados aún. ¡Empieza a practicar!</div>
          ) : (
            history.map((h, i) => {
              const p = pct(h.score, h.total);
              const color = allData[h.year]?.color || "#3b82f6";
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ color, fontWeight: 800, fontSize: 15 }}>{h.year === "ALL" ? "Todos" : h.year}</span>
                    <span style={{ color: "#64748b", fontSize: 11, marginLeft: 8 }}>{h.date}</span>
                    {h.time > 0 && <span style={{ color: "#64748b", fontSize: 11, marginLeft: 8 }}>⏱️ {Math.floor(h.time / 60)}min</span>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: p >= 70 ? "#4ade80" : p >= 50 ? "#f59e0b" : "#f87171" }}>{p}%</div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>
                      {h.score}/{h.total}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                marginTop: 16,
                padding: "10px",
                borderRadius: 10,
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.2)",
                color: "#f87171",
                cursor: "pointer",
                fontSize: 12,
                width: "100%",
              }}
            >
              Eliminar historial
            </button>
          )}
        </div>
      </div>
    );
  }

  if (screen === "official") {
    const catColor = CAT_COLOR;
    const tramoColor = TRAMO_COLOR;

    const previewPruebaCat = catPrueba(newResult.pruebaPuntaje);
    const previewPortafolioCat = catPortafolio(newResult.portafolioPuntaje);
    const previewTramo = tramoFor(previewPortafolioCat, previewPruebaCat);

    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button onClick={() => setScreen("home")} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>
              ← Volver
            </button>
            <h2 style={{ color: "white", fontSize: 18, fontWeight: 800, margin: 0 }}>📋 Mis resultados oficiales</h2>
          </div>

          <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <p style={{ color: "#c4b5fd", fontSize: 12, margin: "0 0 6px", lineHeight: 1.6 }}>
              Ingresa tus <strong>puntajes reales</strong> (1.00 a 4.00) de la Prueba ECEP y del Portafolio, tal como aparecen en tu certificado CPEIP. El tramo se calcula con la matriz oficial del Sistema de Reconocimiento.
            </p>
            <p style={{ color: "#a78bfa", fontSize: 11, margin: 0, lineHeight: 1.5 }}>
              ⚠️ Esta matriz muestra el tramo <strong>potencial según puntajes</strong>. La asignación final oficial también exige cumplir los años de experiencia (bienios) mínimos de ese tramo. Verifica siempre tu resolución en portaldocente.mineduc.cl o docentemas.cl.
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
            <p style={{ color: "white", fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>Agregar registro</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <input
                type="number"
                value={newResult.year}
                onChange={(e) => setNewResult({ ...newResult, year: e.target.value })}
                placeholder="Año"
                style={{ width: 80, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
              />
              <input
                type="number"
                step="0.01"
                min="1"
                max="4"
                value={newResult.pruebaPuntaje}
                onChange={(e) => setNewResult({ ...newResult, pruebaPuntaje: e.target.value })}
                placeholder="Puntaje Prueba (ej: 3.05)"
                style={{ width: 150, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
              />
              <input
                type="number"
                step="0.01"
                min="1"
                max="4"
                value={newResult.portafolioPuntaje}
                onChange={(e) => setNewResult({ ...newResult, portafolioPuntaje: e.target.value })}
                placeholder="Puntaje Portafolio (ej: 3.08)"
                style={{ width: 170, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
              />
            </div>

            {(previewPruebaCat || previewPortafolioCat) && (
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 10, marginBottom: 8 }}>
                {previewPruebaCat && <span style={{ fontSize: 12, color: catColor[previewPruebaCat] }}>Prueba → <strong>{previewPruebaCat}</strong></span>}
                {previewPortafolioCat && <span style={{ fontSize: 12, color: catColor[previewPortafolioCat] }}>Portafolio → <strong>{previewPortafolioCat}</strong></span>}
                {previewTramo && (
                  <span style={{ fontSize: 13, fontWeight: 800, color: tramoColor[previewTramo], marginLeft: "auto" }}>
                    🎯 {previewTramo}
                  </span>
                )}
              </div>
            )}

            <input
              type="text"
              value={newResult.notes}
              onChange={(e) => setNewResult({ ...newResult, notes: e.target.value })}
              placeholder="Notas (opcional)"
              style={{ width: "100%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white", borderRadius: 8, padding: "8px 10px", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }}
            />
            <button
              onClick={addOfficialResult}
              style={{ width: "100%", padding: "10px", borderRadius: 10, background: "#8b5cf6", border: "none", color: "white", cursor: "pointer", fontWeight: 700, fontSize: 13 }}
            >
              Guardar registro
            </button>
          </div>

          {officialResults.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: 30, fontSize: 13 }}>Aún no tienes registros guardados.</div>
          ) : (
            officialResults
              .slice()
              .sort((a, b) => a.year - b.year)
              .map((r) => {
                const pC = catPrueba(r.pruebaPuntaje);
                const poC = catPortafolio(r.portafolioPuntaje);
                const tr = tramoFor(poC, pC);
                return (
                  <div key={r.id} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 12, marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ color: "white", fontWeight: 800, fontSize: 14 }}>{r.year}</span>
                        {r.pruebaPuntaje && (
                          <span style={{ marginLeft: 10, color: catColor[pC] || "#94a3b8", fontSize: 12, fontWeight: 700 }}>
                            Prueba: {r.pruebaPuntaje} ({pC})
                          </span>
                        )}
                        {r.portafolioPuntaje && (
                          <span style={{ marginLeft: 10, color: catColor[poC] || "#94a3b8", fontSize: 12, fontWeight: 700 }}>
                            Portafolio: {r.portafolioPuntaje} ({poC})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeOfficialResult(r.id)}
                        style={{ background: "rgba(248,113,113,0.1)", border: "none", color: "#f87171", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 11 }}
                      >
                        Eliminar
                      </button>
                    </div>
                    {tr && (
                      <div style={{ marginTop: 6, fontSize: 13, fontWeight: 800, color: tramoColor[tr] }}>
                        🎯 Tramo proyectado: {tr}
                      </div>
                    )}
                    {r.notes && <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>{r.notes}</div>}
                  </div>
                );
              })
          )}
        </div>
      </div>
    );
  }

  return null;
}
