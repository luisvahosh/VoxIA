# Tevari

Cliente de VoxIA desde el 26-10-2026. Sitio: https://tevari.cl/es

Tevari es una IA para centros de salud que acompaña al paciente de principio a fin. El agente de WhatsApp atiende a dueños y directores de centros (venta B2B): resuelve dudas, conoce el centro y deriva a una persona para la demostración.

## Datos de conexión (no secretos)

| Dato | Valor |
| --- | --- |
| Cuenta VoxIA | tevarichat@gmail.com |
| Modelo | A: WABA en el portafolio Voxia, conexión manual |
| Portafolio Meta | Voxia (business_id 28448140728178837) |
| WABA ID | 1482968146980721 |
| Número | +56 9 8910 2325 |
| ID del número | 1309603122247435 |
| Nombre para mostrar | Tevari (en revisión de Meta el 26-10-2026) |
| Personas asignadas a la WABA | Luis Eduardo Vahos (Control total), usuario del sistema Voxia (Control total) |

Hay un portafolio extra llamado "Tevari" (ID 1444098327232248) del primer intento. Está sin uso; no borrarlo.

## Agente

- Prompt: `baseconocimiento/prompt-agente-tevari.md` (centros médicos y médicos independientes; resuelve dudas y deriva solo si lo piden, aceptan demo o no sabe).
- Función de derivación: `derivar_asesor` → flujo "Derivar a equipo Tevari": mensaje "Le comunico con una persona del equipo Tevari 🙌…" + **Notify agent on WhatsApp** (`+573006121465`, plantilla `aviso_agente`, idioma `es_CL`, pausa el bot). Publicado.
- Cuenta de mensajes: Tevari (28778228888495094), asignada a Luis y al usuario del sistema Voxia.
- El número tiene dirección propia de webhook por número (ver Paso 3 del procedimiento).

## Pendiente

- [x] Plantilla `aviso_agente` (Spanish CHL) activa; aviso probado desde dos teléfonos el 28-10-2026 (requirió agregar método de pago en Meta).
- [ ] Probar la página `/handoff`: responder y "Devolver al asistente".
- [x] Teléfono del cliente en el aviso: corregido (`8a08a0a0`), verificado el 30-10.
- [ ] Usar un número de vendedor distinto al celular de pruebas.
- [ ] Conectar la salida Error del aviso a nota + asignación.
- [ ] Cambiar el sitio web del perfil de WhatsApp (hoy learnway.co) si Tevari tiene otro.
- [x] Derivar solo en horario laboral: zona de Chile y sin atención los sábados. El horario publicado está en el bloque Execute JavaScript del flujo de derivación.
