# Alta de clientes en VoxIA

Actualizado: 26-10-2026 · Luis Eduardo Vahos Hernández
Versión en línea (Claude Docs): https://claude.ai/artifact/C3MrWcuwrQYNjXZteEdrcf

Procedimiento para conectar el WhatsApp de un cliente nuevo a VoxIA, o traerlo desde otro proveedor, y dejarlo atendiendo con IA. Cada cliente tiene su propia cuenta de VoxIA, su propia cuenta de WhatsApp Business (WABA) y su propio número.

## Cómo funciona hoy

La cuenta de WhatsApp de cada cliente se crea dentro del portafolio comercial **Voxia**, el dueño de la app de Meta "voxia" (ID 1530207475818669). La app tiene **acceso estándar**, porque la revisión de Meta no aprobó el acceso avanzado.

| Qué | Dónde vive | Dueño |
| --- | --- | --- |
| Cuenta de VoxIA del cliente (ej. tevarichat@gmail.com) | voxia.learnway.co | El cliente |
| Espacio de trabajo del cliente | VoxIA, dentro de la cuenta del cliente | El cliente |
| Cuenta de WhatsApp Business (WABA), una por cliente | Portafolio Voxia en Meta | VoxIA |
| Número de teléfono | Dentro de la WABA del cliente | VoxIA |
| Cobro de conversaciones de WhatsApp | Método de pago del portafolio Voxia | VoxIA (se le cobra al cliente aparte) |

Qué implica:

- El cliente **no ve su WABA** en su propio Meta Business. Todo se administra desde el portafolio Voxia.
- Los mensajes que inicia la empresa (plantillas) se cobran a la tarjeta de Voxia.
- Meta revisa el **nombre para mostrar** de cada número (ej. "Tevari"). Mientras lo revisa, el número funciona.
- Límite: con el negocio Voxia verificado, hasta **20 números** en total.
- Si un cliente se va, su número se puede migrar a otro proveedor.

Hay **dos modelos** y los dos funcionan hoy (verificado el 26-10-2026):

| Modelo | Cuándo usarlo | Quién conecta | Cómo se conecta en VoxIA | Ejemplo |
| --- | --- | --- | --- | --- |
| **A. WABA del cliente en el portafolio Voxia** | El cliente no tiene ni quiere manejar nada en Meta | Tú, con tu Facebook | **Conexión manual** con el token del usuario del sistema Voxia (Paso 3) | Tevari |
| **B. Portafolio propio del cliente** | El cliente tiene o puede crear su Facebook de empresa; quiere ser dueño de su número y pagar a Meta con su tarjeta | **El cliente, con su propio Facebook** | Ventana de Meta (registro insertado) desde su sesión de VoxIA, interruptores apagados | Consultorio San Rafael |

Tu Facebook ya alcanzó el **límite de portafolios comerciales**: no crees un portafolio por cliente con tu cuenta. Para el modelo B, el portafolio lo crea el cliente.

## Qué pedirle al cliente

- [ ] Nombre comercial exacto (será el nombre para mostrar en WhatsApp)
- [ ] Correo para su cuenta de VoxIA, al que tenga acceso para verificarla
- [ ] Número de teléfono con código de país (+56, +57…)
- [ ] Cómo está hoy ese número: libre, en la app de WhatsApp o en otro proveedor
- [ ] Acceso al teléfono para recibir el código por SMS o llamada el día de la conexión
- [ ] País, idioma y zona horaria de atención
- [ ] Categoría del negocio, descripción corta, sitio web y logo (perfil de WhatsApp)
- [ ] Preguntas frecuentes y datos del negocio para el agente de IA (horarios, dirección, precios, políticas)
- [ ] Si agenda citas: profesionales, duración de cada cita, horarios y correos de calendario
- [ ] Persona que atenderá cuando el cliente pida hablar con un humano
- [ ] Si viene de otro proveedor: nombre del proveedor y acceso para desactivar la verificación en dos pasos

## Elegir el camino según el número

Antes de tocar Meta, pregunta cómo está hoy el número. Eso decide qué interruptor se usa en VoxIA (pantalla "Whatsapp" de `/channels/create?channel=whatsapp`).

| Cómo está el número | Qué hacer antes | Interruptor en VoxIA |
| --- | --- | --- |
| Nuevo o libre, sin WhatsApp | Nada | Modelo A: conexión manual (Paso 3). Modelo B: ambos apagados y **Continue** |
| En la app WhatsApp (normal) del celular, y el cliente no la necesita | Borrar la cuenta en la app: Ajustes → Cuenta → Eliminar cuenta. Esperar 3 a 5 minutos | Igual que un número libre |
| En la app **WhatsApp Business** y el cliente quiere seguir usándola | Nada. Actualizar la app a la última versión | **Connect an existing WhatsApp Business Account** (coexistencia: app + VoxIA a la vez) |
| En otro proveedor de chatbot o API (Twilio, 360dialog, Wati, etc.) | Ver la sección de migración | Según esa sección |

## Paso 1: cuenta del cliente en VoxIA

1. En una ventana de incógnito, entra a voxia.learnway.co y regístrate con el correo del cliente (ej. tevarichat@gmail.com).
2. Abre el correo de verificación y confirma la cuenta.
3. Al entrar verás "Workspaces 0". Es normal: el espacio de trabajo se crea solo al conectar el primer canal (Paso 3).
4. Deja esa sesión abierta. Todo lo del cliente se hace con su cuenta, nunca con la de administrador ni con la de otro cliente.

La cuenta de administrador (luisvahosh@gmail.com) solo se usa para `/admin/platform-credentials` y soporte.

## Paso 2: WABA y número en Meta

Se hace con tu Facebook personal, el que administra el portafolio Voxia. Primero se crea la cuenta de WhatsApp del cliente y después se le agrega el número.

**A. Crear la WABA del cliente**

1. Entra a business.facebook.com/settings y elige el portafolio **Voxia** arriba a la izquierda.
2. Ve a **Cuentas → Cuentas de WhatsApp → Agregar → Crear una cuenta de WhatsApp Business**.
3. Nombre de la cuenta: el del cliente (ej. `Tevari`). Zona horaria y moneda del cliente.
4. Nunca agregues el número de un cliente dentro de la WABA de otro.

**B. Agregar y verificar el número**

1. En business.facebook.com/settings → **Cuentas de WhatsApp**, elige la cuenta del cliente → pestaña **Resumen** → **Agregar número de teléfono**.
2. Perfil: nombre para mostrar (ej. `Tevari`), categoría, descripción y sitio web del cliente.
3. Escribe el número con su país y elige **SMS** o **Llamada**. Ingresa el código de 6 dígitos.
4. Resultado esperado: el número aparece en la WABA del cliente. Puede verse como **Pendiente** mientras Meta revisa el nombre.

**C. Dar acceso y anotar el WABA ID** (obligatorio; sin esto VoxIA no ve la cuenta)

1. En business.facebook.com/settings → **Cuentas de WhatsApp**, elige la cuenta del cliente → **Asignar personas**.
2. Asigna **tu usuario** con **Control total**.
3. Asigna el usuario del sistema **Voxia** (ID 61594416670832) con **Control total**.
4. Revisa la pestaña **Personas**: deben verse los dos con Acceso total.
5. Anota el **WABA ID**: es el número que aparece después de `selected_asset_id=` en la barra de direcciones (ej. Tevari: `1482968146980721`). No es el ID del número de teléfono.

**D. Crear la cuenta de mensajes** (obligatorio; sin esto VoxIA recibe pero no puede responder)

Sin cuenta de mensajes, cada respuesta falla con `#(10) Viewer cannot access the provided Paid Message Account <WABA ID>` y aparece un ⓘ rojo en la Bandeja de entrada.

1. En business.facebook.com/settings → **Cuentas → Cuentas de mensajes** → **+ Agregar** → crear una con el nombre del cliente (ej. `Tevari`), su zona horaria y divisa.
2. Agrega el **método de pago** del portafolio Voxia (pestaña Resumen → Configuración de pago).
3. Pestaña **WhatsApp accounts**: vincúlala a la cuenta de WhatsApp del cliente.
4. **Asignar personas**: tu usuario y el usuario del sistema **Voxia**, ambos con **Control total**.
5. Revisa en la cuenta de WhatsApp del cliente → pestaña **Messaging accounts**: debe decir 1 vinculada.

No configures webhooks en developers.facebook.com: VoxIA hace esa parte al conectar.

## Paso 3: conectar el número en VoxIA

Requisito único, una sola vez para toda la plataforma: en `/admin/platform-credentials` (cuenta de administrador), la tarjeta **WhatsApp** debe tener el **App ID** 1530207475818669, la **Clave secreta de la app** real (32 caracteres, de developers.facebook.com → app voxia → Configuración de la app → Básica → **Mostrar**, nunca "Restablecer") y un **System User Token**. Si la clave está mal, la conexión termina en "The provider rejected this request".

**Modelo A (WABA en el portafolio Voxia): conexión manual.** No uses la ventana de Meta: con tu Facebook, Meta se salta la elección de la cuenta y VoxIA responde "This item can't be selected".

1. Ten a mano el **WABA ID** (Paso 2, C) y un **System User Token** (`EAA…`). Para generarlo: business.facebook.com/settings → Usuarios del sistema → **Voxia** → **Generar token**, app **voxia**, caducidad **Nunca**, permisos `whatsapp_business_management`, `whatsapp_business_messaging` y `business_management`. Generar uno nuevo no invalida los anteriores; **nunca pulses "Revocar tokens"**.
2. Con la sesión **del cliente** abierta, entra a `https://voxia.learnway.co/channels/create?channel=whatsapp`.
3. Activa **Connect an existing WhatsApp Business Account** y luego **Manual connect using System User Access token**.
4. Pega el **WABA ID** y el token en **Access Token** → **Continue**.
5. En **Phone number** marca el número del cliente → **Continue — manual connect**.
6. Sale "Your Whatsapp inbox is ready!" con una Webhook URL y un token. **No los pegues en la app de Meta**: VoxIA ya suscribió esa cuenta sola, y cambiar el webhook de la app corta a todos los demás clientes. Pulsa **Take me there**.
7. En **Configuración → General** del espacio nuevo ("New Workspace"): nombre, idioma Español, país y zona horaria.
8. Prueba: escribe al número desde otro celular. El mensaje debe aparecer en la Bandeja de entrada de ese cliente y no en la de otro.

**Comprobar a dónde envía Meta los mensajes** (siempre en el modelo A, y otra vez si el número se vuelve a registrar o verificar). Al registrar el número, Meta puede olvidar la dirección del cliente y los mensajes dejan de llegar aunque el celular muestre ✓✓. Este bloque toma el token de la base de datos sin mostrarlo y fija una dirección propia para el número (solo afecta a ese número):

```bash
cd ~/voxia
PHONE=<ID_DEL_NUMERO>   # ej. Tevari: 1309603122247435
Q() { docker compose -f docker-compose.prod.yml exec -T postgres psql -U voxia -d voxia -tAc "$1"; }
W="where \"phoneNumberId\"='$PHONE'"
TOKEN=$(Q "select auth->'tokens'->>'accessToken' from \"IntegrationWhatsapp\" $W")
VT=$(Q "select auth->>'verifyToken' from \"IntegrationWhatsapp\" $W")
URL=$(Q "select auth->'metadata'->>'webhookUrl' from \"IntegrationWhatsapp\" $W")
curl -s -X POST "https://graph.facebook.com/v25.0/$PHONE" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"webhook_configuration\":{\"override_callback_uri\":\"$URL\",\"verify_token\":\"$VT\"}}"; echo
curl -s "https://graph.facebook.com/v25.0/$PHONE?fields=webhook_configuration" -H "Authorization: Bearer $TOKEN"; echo
unset TOKEN VT
```

Resultado correcto: `{"success":true}` y una entrada `phone_number` con `https://voxia.learnway.co/integrations/whatsapp/webhook/<id del canal>`. Si solo aparece `application`, los mensajes no llegarán a ese cliente.

**Modelo B (portafolio propio del cliente): ventana de Meta.**

1. El cliente (o tú con su Facebook) abre `channels/create?channel=whatsapp` en su sesión de VoxIA, interruptores según "Elegir el camino" → **Continue**.
2. En Meta elige **su** portafolio, crea o elige su cuenta de WhatsApp, agrega el número y verifícalo por SMS.
3. **Confirmar** → **Finalizar**. Luego los pasos 7 y 8 de arriba.

## Migrar desde otro proveedor de chatbot

Si el número ya funciona en la API de WhatsApp con otro proveedor (Twilio, 360dialog, Wati, Respond.io, ManyChat, otro chatbot), se migra el **número** a una WABA nueva del cliente en el portafolio Voxia.

| Se conserva | No se conserva |
| --- | --- |
| El número de teléfono | El historial de chats (queda en el proveedor anterior) |
| El nombre para mostrar y su calidad | Las plantillas de mensajes (se crean de nuevo y Meta las revisa) |
| Los clientes pueden seguir escribiendo al mismo número | Los flujos y respuestas del chatbot anterior (se arman de nuevo en VoxIA) |

1. Pide al cliente una exportación de sus contactos (CSV) y de sus plantillas y textos del bot anterior.
2. En el proveedor anterior, **desactiva la verificación en dos pasos** (PIN de 6 dígitos) de ese número, o pide al proveedor que lo haga. Sin esto, Meta rechaza la migración.
3. Crea la WABA del cliente en el portafolio Voxia (Paso 2, A).
4. Agrega el número en esa WABA (Paso 2, B). Meta detecta que está en otra cuenta y ofrece **migrarlo**. Verifícalo con el código por SMS o llamada.
5. Da acceso (Paso 2, C) y conéctalo en VoxIA con la conexión manual (Paso 3, modelo A).
6. Prepara el espacio de trabajo (Paso 4) **antes** del cambio, y haz la migración en un horario de poco tráfico.
7. Cuando todo funcione, el cliente da de baja el servicio anterior.

## Paso 4: dejar listo el espacio de trabajo

La referencia es la configuración de Consultorio San Rafael, que ya funciona completa.

Plantillas de prompt en el repositorio (carpeta `baseconocimiento/`), menos de 10.000 caracteres cada una:

| Archivo | Cliente | Para qué sirve | Función de derivación |
| --- | --- | --- | --- |
| `prompt-agente-con-faq-para-pegar.md` | Consultorio San Rafael | Atención de pacientes, preguntas frecuentes y reservas | `derivar_secretaria` |
| `prompt-agente-tevari.md` | Tevari | Venta B2B a centros de salud: resolver dudas, conocer el centro y pasar a demostración | `derivar_asesor` |
| `rag-san-rafael/prompt-valentina-rag.md` | Consultorio San Rafael | Versión corta para usar con base de conocimiento (5.220 caracteres) | `derivar_secretaria` |

Para un cliente nuevo: copia la plantilla más parecida, cambia la información por la de su sitio web y mantén la regla de nombrar al equipo humano siempre igual.

**IA**

1. **Configuración → Integraciones → Gemini:** pega la clave de API y activa **AI Auto Respuesta**. Sin ese interruptor, el agente no responde. Cómo sacar la clave: ver `02-api-key-gemini.md`.
2. La clave de Gemini debe ser de un proyecto **con facturación** (Nivel 1). El plan gratuito permite solo 20 solicitudes al día y se agota en las pruebas.
3. **IA → Agentes:** crea el agente, márcalo como **predeterminado**, modelo **Gemini 3.5 Flash**, temperatura 0.3.
4. **Instrucciones:** máximo 10.000 caracteres.

**Base de conocimiento (si el cliente tiene mucha información)**

Con poca información, déjala en el prompt (Tevari). Con mucha, usa archivos (San Rafael): cada mensaje carga un prompt corto y solo los fragmentos necesarios, y baja el consumo de tokens. No hay que instalar nada: viene en la plataforma. Ejemplo completo: `baseconocimiento/rag-san-rafael/`.

1. **Prepara los archivos `.md` por tema**, con preguntas y respuestas de menos de 700 caracteres cada una. La plataforma corta en trozos de 1.000 caracteres, así cada respuesta cabe entera. Repite el nombre del negocio y el tema dentro de cada respuesta, para que la búsqueda la encuentre.
2. **IA → Knowledge → Upload File:** sube los archivos **de a uno**. Espera a que cada uno diga **success**.
3. **Agente → Tools:** marca cada archivo en la sección **File**. Si no se marcan, el agente no busca en ellos. No uses "Select All".
4. **Instrucciones:** deja solo tono, reglas, reservas, derivación y datos básicos. Agrega la orden de ejecutar `search_knowledge_base` para todo lo demás, de responder solo con lo encontrado y de nunca mencionar la búsqueda.
5. **Prueba** con preguntas de dato exacto que solo estén en los archivos (un precio, por ejemplo), y confirma en el servidor que busca: debe aparecer `resultCount` mayor que 0.
    ```bash
    docker compose -f docker-compose.prod.yml logs worker --since 15m 2>&1 | grep -i "knowledge-base" | cut -c1-300 | tail -5
    ```

**Funciones de IA y flujos**

- Nombre de cada función: solo letras sin tilde, números y guion bajo (ej. `agendar_nutricion`, `derivar_asesor`). Una tilde, una ñ o un espacio hace que el agente deje de responder del todo.
- **Finalidad:** cuándo usarla, en una o dos frases. **Trigger Flujo ID:** el flujo que se ejecuta.
- Cada flujo debe quedar **Publicado**, no solo guardado.
- Desmarca "Conectar al usuario con una persona" si usas una función propia para el traspaso.

**Agenda (si aplica)**

1. Conecta Google en **Calendarios externos** (un calendario por profesional).
2. Crea un **Calendario de citas** por profesional: duración, horarios, zona horaria, invitados.
3. Por cada uno, un flujo `Reservar - <especialidad>` con el paso **Programación de citas**, modo **Open booking page**, y una función `agendar_<especialidad>`.
4. Traduce los flujos automáticos "Booking confirmation" y "Reminder" (vienen en inglés): textos y el botón "More Information" → "Ver mi cita".

**Reserva dentro del chat (sin abrir navegador)**

Alternativa a la página de reservas: el paciente ve las horas y elige en WhatsApp, y si ninguna le sirve pide otro día sin pasar a secretaría. Funciona en San Rafael con nutrición; psicología y bariátrica siguen con la página para comparar.

1. **Campos del contacto** (`/custom-fields`): `fecha_desde` y `fecha_hasta` (Datetime), `horas_disponibles` y `horas_ofrecidas` (Long Text), `hora_reserva` (Datetime).
2. **Flujo `Consultar horas - <especialidad>`**, en este orden:
    - **Set Custom Field:** `fecha_desde`, Set, valor vacío (significa "ahora").
    - **Set Custom Field:** `fecha_hasta`, Set, `2027-12-31 23:59`.
    - **Appointment Scheduling** (está directo en Actions): modo Check availability, el calendario, `fecha_desde`, `fecha_hasta`, salida `horas_disponibles`, *Result used by AI* apagado.
    - **Gemini → Generate Text:** gemini-3.5-flash, temperatura 0, salida `horas_ofrecidas`. El prompt recibe la variable `horas_disponibles` (insértala con **{ }**), pide una lista numerada con día, fecha dd/mm/aaaa y hora en 24 h, y termina con: "¿Cuál prefiere? Si ninguna le acomoda, dígame qué día le acomoda y le busco horas para ese día."
    - **Send Text:** `{{horas_ofrecidas}}`.
3. **Flujo `Consultar horas por día - <especialidad>`:** duplica el anterior y quita **solo** el Set Custom Field de `fecha_desde`. Si se queda, siempre busca desde "ahora" e ignora el día pedido.
4. **Flujo `Reservar hora - <especialidad>`:** Appointment Scheduling en modo Book appointment con el campo `hora_reserva`. Salida Error: "Lo siento, esa hora ya no está disponible…".
5. **Funciones de IA:**

| Función | Data Collect | Flujo |
| --- | --- | --- |
| `consultar_horas_<especialidad>` | (ninguno) | Consultar horas |
| `consultar_horas_<especialidad>_dia` | `fecha_desde` → campo `fecha_desde` | Consultar horas por día |
| `reservar_hora_<especialidad>` | `hora_reserva` → campo `hora_reserva` | Reservar hora |

    **Finalidad** de la función por día:
    ```
    Usar cuando el paciente pide horas de nutrición para otro día o una fecha distinta a las ofrecidas. En fecha_desde envía el inicio de ese día en formato ISO de Chile, por ejemplo 2026-11-05T00:00:00-03:00 (usa -03:00 de septiembre a marzo y -04:00 de abril a agosto). Calcula la fecha a partir de las fechas que ya aparecen en la conversación. Después de llamarla no escribas nada más.
    ```
    Ajusta el ejemplo y la zona horaria al país del cliente.
6. **Agente → Tools:** marca las 3 funciones y desmarca `agendar_<especialidad>` si existía (no la borres).
7. **Prompt:** "Cuando el paciente elija una hora de la lista, confirma día y hora y EJECUTA `reservar_hora_…` con esa hora en formato ISO. Si pide otro día u otras horas, usa `consultar_horas_…_dia` con esa fecha, sin derivar."

El agente **no conoce la fecha de hoy**: por eso primero muestra la lista normal y calcula "el jueves" con las fechas que ya están en el chat. Si el profesional no atiende ese día, muestra las horas siguientes. Cada calendario limita las citas futuras por paciente; si la reserva falla en las pruebas, revisa ese límite.

**Traspaso a humano (aviso al vendedor por WhatsApp)**

El cliente sigue en el **mismo chat** y el vendedor se entera **por su WhatsApp, sin entrar a VoxIA** (disponible desde el commit `cc2421df`).

1. **Plantilla del aviso en Meta (una por cliente).** Las plantillas viven en la cuenta de WhatsApp de cada cliente y el aviso sale desde su número, así que se crea en cada cliente. WhatsApp Manager → elige la cuenta del cliente arriba a la derecha → **Plantillas de mensajes → Crear plantilla** → categoría **Utilidad**, nombre `aviso_agente`, tipo de variable **Número**, cuerpo:
    ```
    🔔 Nuevo cliente para atender: {{1}} ({{2}}).
    Resumen: {{3}}
    Responde aquí, sin iniciar sesión: {{4}}
    Gracias.
    ```
    Ejemplos: `Ana Pérez`, `+56911112222`, `Quiere una demostración para su consulta`, `https://voxia.learnway.co/handoff?token=ejemplo`. Espera a que diga **Activa** (minutos a 24 h).
   **Método de pago obligatorio:** sin tarjeta en la cuenta del cliente, Meta no entrega la plantilla (ver "Problemas conocidos").
2. **Anota el código de idioma** con que quedó: "Spanish" = `es`, "Spanish (CHL)" = `es_CL`, "Spanish (COL)" = `es_CO`, "Spanish (MEX)" = `es_MX`. Un código distinto da el error 132001.
3. **Flujo de derivación** (ej. `Derivar a equipo Tevari`, disparado por la función de IA `derivar_asesor`): mensaje al cliente ("Le comunico con una persona del equipo…") + **Actions → Inbox Actions → Notify agent on WhatsApp** con:

| Campo | Valor |
| --- | --- |
| Agent WhatsApp number | Número del vendedor con código de país (ej. `+573006121465`) |
| Approved template name | `aviso_agente` (vacío = texto simple, solo llega si el vendedor escribió al número en las últimas 24 h) |
| Template language code | El del punto 2 (ej. `es_CL`) |
| Pause the bot in this conversation | Activado (reemplaza "Transfer Conversation to Human") |

4. Opcional: conecta la salida **Error** a un bloque con **Assign Conversation** + **Add Contact Notes** ("No se pudo avisar al vendedor"). **Publica** el flujo.
5. **Qué recibe el vendedor:** nombre y teléfono del cliente, sus últimos mensajes y un enlace a `/handoff`. Ahí lee la conversación, **responde** (le llega al cliente desde el mismo número) y pulsa **Devolver al asistente** al terminar. El enlace sirve solo para esa conversación, vence a las 72 h y deja de funcionar al devolverla al asistente.
6. La Bandeja de entrada de VoxIA sigue mostrando todo el historial, incluidas las respuestas del vendedor.

**Derivar solo en horario laboral**

Fuera de horario el cliente recibe un mensaje con la hora de atención y el aviso sale solo al abrir. Mientras espera, el bot sigue activo. No requiere programar: se arma en el flujo de derivación. Probado dentro de horario el 30-10-2026 en San Rafael; la prueba fuera de horario está pendiente.

No uses las condiciones **"Is within working hours"** ni **"Current time"**: aparecen en el menú, pero el servidor no las evalúa.

Guía clic por clic: `04-guia-horario-laboral.md`.

1. **Campos** (`/custom-fields`): `en_horario` (Short Text), `proximo_horario` (Datetime), `proxima_atencion` (Short Text).
2. **Bloque Perform Action → Tools → Execute JavaScript Code**, en un bloque nuevo. En **Code** pega `alta-clientes-voxia/03-horario-laboral.txt` y cambia solo `zona` y `horario`. En **Output Custom Field** agrega las 3 filas, cada ruta con su campo de igual nombre.
3. **Marca ese bloque como inicio** del flujo (etiqueta **Start**).
4. **Bloque Condition:** Custom Field `en_horario`, **Is**, `no`. Debe ser `no`: si el campo viene vacío, el cliente sigue por el camino normal.
5. **Bloque Send Message** de fuera de horario. Va con dos llaves:
    ```
    En este momento estamos fuera del horario de atención. Nuestro equipo te contactará {{proxima_atencion}} por este mismo chat. Mientras tanto, puedo ayudarte con tus dudas.
    ```
6. **Bloque Wait:** tipo Date, Dynamic, campo `proximo_horario`, sin offset.
7. **Conexiones:**

| Desde | Hacia |
| --- | --- |
| Perform Action → Continue | Condition |
| Perform Action → Error | Mensaje "Te comunico…" |
| Condition → verde (`en_horario` = no) | Mensaje de fuera de horario |
| Condition → rojo | Mensaje "Te comunico…" |
| Mensaje de fuera de horario → Continue | Wait |
| Wait → Continue | Bloque con Notify agent |
| Mensaje "Te comunico…" → Continue | Bloque con Notify agent |

El círculo **Success** de Execute JavaScript debe quedar **vacío**: si se conecta, el flujo se salta la Condición. Deja también vacío el **Output Message** de la función de derivación. Si el cliente pide una persona dos veces durante la espera, llegan 2 avisos. El código no contempla festivos.

**Respaldo**

- Si el agente falla, entra el flujo de respuesta predeterminada. Que derive a humano o diga "en un momento te respondemos"; no que repita un campo con una respuesta vieja.

## Pruebas antes de entregar

Hazlas desde un celular que no sea del equipo, en este orden.

- [ ] Escribir `hola`: responde el agente con un saludo nuevo (no un texto repetido).
- [ ] Hacer una pregunta frecuente: responde con la información del negocio.
- [ ] Si agenda: pedir una cita por cada especialidad; llega el botón **Elegir hora**, la página sale en español, se reserva y llega la confirmación.
- [ ] Si reserva dentro del chat: pedir hora, elegir una de la lista y confirmar la cita. Repetir pidiendo otro día ("¿no tiene para el jueves?") y una semana lejana: la lista cambia y no deriva a secretaría.
- [ ] Si usa base de conocimiento: preguntar un dato que solo esté en los archivos; responde exacto y el registro muestra `resultCount` mayor que 0.
- [ ] La cita aparece en el calendario de Google del profesional.
- [ ] Pedir hablar con una persona: llega el aviso, el bot se pausa y la conversación queda asignada.
- [ ] Responder desde la Bandeja de entrada: el mensaje llega al celular desde el número del cliente.
- [ ] Reactivar el bot y comprobar que el agente vuelve a responder.
- [ ] Aviso al vendedor: llega el WhatsApp con el enlace; desde la página se responde al cliente y "Devolver al asistente" reactiva la IA.
- [ ] Derivación en horario: llegan "Te comunico…" y el aviso, sin mensaje de fuera de horario. Fuera de horario: llega la hora de atención y el aviso sale solo a esa hora.
- [ ] El mensaje aparece en la Bandeja de entrada del cliente correcto, no en la de otro.
- [ ] Los demás clientes (ej. San Rafael) siguen respondiendo.

## Problemas conocidos

Todos ocurrieron durante la puesta en marcha de Consultorio San Rafael y Tevari (octubre de 2026).

| Síntoma | Causa | Solución |
| --- | --- | --- |
| "The provider rejected this request" al conectar WhatsApp | Clave secreta de la app mal guardada en VoxIA ("Error validating client secret" en los registros) | Pegar la clave real en `/admin/platform-credentials` |
| "This item can't be selected" después de la ventana de Meta | Con tu Facebook, Meta solo comparte el "Negocio" y no la cuenta de WhatsApp (no pide elegir cuenta ni número) | Usar la conexión manual (Paso 3, modelo A). No borrar portafolios |
| El agente no responde a un contacto, pero sí a otros; los mensajes sí llegan | Esa conversación se derivó a una persona y el bot quedó en pausa 24 horas | Bandeja de entrada → abrir la conversación → ícono de robot "Transferir conversación al bot" |
| Un cliente deja de recibir mensajes justo después de conectar otro | Se pegó la Webhook URL de la pantalla "inbox is ready" en la app de Meta | Volver a dejar en la app el webhook https://voxia.learnway.co/integrations/whatsapp/webhook con el token de la tarjeta WhatsApp |
| El agente escribe en la Bandeja de entrada pero nada llega al celular (ⓘ rojo: "Viewer cannot access the provided Paid Message Account") | Falta la cuenta de mensajes o el usuario del sistema Voxia no está asignado a ella | Paso 2, D |
| El celular muestra ✓✓ pero el mensaje no aparece en VoxIA ni en los registros del builder | Al registrar de nuevo el número, Meta perdió la dirección propia del cliente | Paso 3, "Comprobar a dónde envía Meta" |
| El cliente recibe "Le comunico con una persona" pero al vendedor no le llega nada; registro `(#132001) Template name does not exist in the translation` | La plantilla `aviso_agente` aún no está Activa, o el código de idioma del paso no coincide (ej. `es` en vez de `es_CL`) | Esperar la aprobación de Meta; poner el código exacto. Para probar antes: nombre de plantilla vacío (texto simple, ventana de 24 h) |
| El cliente recibe "Le comunico con una persona", al vendedor no le llega nada y no hay errores en el worker | Meta acepta la plantilla y la rechaza después por falta de pago ("Business eligibility payment issue", solo visible en la tabla `ErrorLog`) | Agregar un método de pago a la cuenta de WhatsApp / cuenta de mensajes del cliente (Configuración del negocio → Facturación y pagos). Las plantillas se cobran |
| El agente escribe "Le comunico con una persona…" pero no se ejecuta el flujo | El nombre de la función de IA no coincide con el del prompt (ej. `IA_tevari` vs `derivar_asesor`) | Usar el mismo nombre exacto en la función y en el prompt |
| Al pedir otro día, repite la misma lista de horas | La función `consultar_horas_…_dia` no se creó o no está marcada en el agente, y usa la función normal | Crearla y marcarla en Tools. Comprobar en las tablas `AIFunction` y `AIAgent` (columna `tools`) |
| Dentro de horario dice "estamos fuera del horario" y el aviso llega igual | Se conectó el círculo Success de Execute JavaScript en vez del verde de la Condición | Borrar esa línea y conectar el verde de la Condición al mensaje de fuera de horario |
| Sale un mensaje que no está en el flujo (ej. "Te dejo el contacto directo") | Es el Output Message de la función de IA | Vaciar ese campo en AI Functions |
| "Upload failed: An unexpected error occurred during upload" en Knowledge | Los enlaces de subida apuntaban a la dirección interna `http://filesystem:9000` | Ya resuelto (`cf9ebdf0`): `S3_PUBLIC_ENDPOINT` en `.env`, servicio `voxia-filesystem` y ruta `/voxia/` en Nginx Proxy Manager |
| voxia.learnway.co se cae al guardar un bloque en Nginx Proxy Manager | El bloque apunta a un servicio que no existe en la red de Nginx | Borrar el bloque y guardar. Antes de pegar, comprobar con `docker exec nginx-proxy-manager getent hosts <servicio>` |
| Desde el servidor, `curl https://voxia.learnway.co` da `000` o error TLS | El servidor no llega a su propio dominio; no significa que el sitio esté caído | Revisar desde un navegador externo |
| El builder no termina de compilar: `exited (137)` | Falta de memoria: el worker ocupa ~7 GB | Detener el worker al compilar (los mensajes quedan en cola) y compilar en segundo plano con `nohup`; hay 8 GB de swap |
| El agente no responde nada | "AI Auto Respuesta" apagado en la integración de IA | Activarlo en Configuración → Integraciones |
| El agente repite siempre el mismo texto viejo | El agente falla y el flujo de respaldo reenvía un campo guardado | Ver la causa en los registros del worker |
| Registro: `429 RESOURCE_EXHAUSTED` | Clave de Gemini en plan gratuito (20 solicitudes al día) | Activar facturación en Google AI Studio |
| Registro: `Invalid function name` | Nombre de función con tilde, ñ o espacio | Renombrarla con letras sin tilde, números y `_` |
| Llega "Te envío el botón…" pero no el botón; registro `FlowVersion not found` | El flujo de la función no está publicado | Publicar el flujo |
| Ningún mensaje se procesa, ni WhatsApp ni Telegram | Worker trabado aunque figure "Up" | `docker compose -f docker-compose.prod.yml restart worker` |
| El agente habla de "ejecutivo" o "agente" | Usa la herramienta "Conectar al usuario con una persona" | Desmarcarla y nombrar al equipo en el prompt |
| El build del builder se queda horas pegado | Servidor sin swap | Ya resuelto: 4 GB de swap creados |

Comando para ver errores del agente (los errores de la IA no salen con nivel ERROR):

```bash
cd ~/voxia
docker compose -f docker-compose.prod.yml logs --since 5m worker 2>&1 | grep -iE 'WARN|ERROR|APICallError|statusCode|429' | cut -c1-500 | tail -n 20
```

Comprobar si un mensaje llegó al servidor y si el bot está en pausa:

```bash
docker compose -f docker-compose.prod.yml logs --since 15m builder | grep -i "webhook request body" | tail -5
docker compose -f docker-compose.prod.yml exec -T postgres psql -U voxia -d voxia -c "select id, \"botEnabled\", \"botResumeAt\" from \"Conversation\" where \"workspaceId\"='<ID_DEL_ESPACIO>' and \"botEnabled\"=false;"
```

## Borrar un número mal creado

Antes de borrar, confirma que el número no pertenece a ningún cliente activo: revisa en qué WABA está y si tiene conversaciones en VoxIA.

1. Entra a business.facebook.com/settings → **Cuentas de WhatsApp** con el portafolio Voxia.
2. Elige la cuenta donde quedó el número.
3. Si está **No verificado** o **Pendiente**, usa **⋯ → Eliminar número de teléfono**. La cuenta (WABA) queda vacía y se puede reutilizar: el WABA ID no cambia.
4. Si el número ya estaba conectado a VoxIA, primero desconéctalo en VoxIA (Configuración → Canales → WhatsApp) y después bórralo en Meta.
5. No borres portafolios comerciales: el borrado tarda días y tu Facebook ya está en el límite.
6. Espera de 5 a 15 minutos antes de volver a agregar ese número.

Un número verificado y en uso no se borra si tiene la verificación en dos pasos activa: primero hay que desactivarla.
