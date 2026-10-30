# Alta de clientes en VoxIA

Carpeta con el procedimiento para sumar clientes nuevos a VoxIA (WhatsApp + agente de IA).

| Archivo | Contenido |
| --- | --- |
| `01-procedimiento-alta-clientes.md` | Paso a paso completo: modelos A y B, Meta, conexión en VoxIA, migración, espacio de trabajo, pruebas y problemas conocidos |
| `02-api-key-gemini.md` | Cómo sacar la clave de Gemini y dónde pegarla |
| `03-horario-laboral.txt` | Código para derivar solo en horario laboral (se cambian `zona` y `horario` por cliente) |
| `04-guia-horario-laboral.md` | Guía clic por clic para montar la derivación en horario laboral |
| `clientes/` | Una ficha por cliente con sus datos de conexión (sin secretos) |

Plantillas de prompt: `../baseconocimiento/`.

Versión en línea para compartir: https://claude.ai/artifact/C3MrWcuwrQYNjXZteEdrcf

Nunca guardes aquí claves, tokens ni contraseñas (App Secret, System User Token, API keys).
