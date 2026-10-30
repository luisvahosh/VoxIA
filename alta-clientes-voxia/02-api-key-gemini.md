# Clave de API de Gemini para un cliente

Cada espacio de trabajo de VoxIA necesita su propia integración de Gemini con una clave de API. La clave no se comparte por chat ni se guarda en archivos: se pega directo en VoxIA.

## Opción recomendada: una clave nueva por cliente

Así ves cuánto gasta cada cliente y, si una clave falla, no afecta a los demás.

1. Entra a **https://aistudio.google.com/apikey** con la cuenta de Google donde está activa la facturación (la misma de Consultorio San Rafael).
2. Pulsa **Crear clave de API** (Create API key).
3. En **Proyecto**, elige el proyecto **que tiene la facturación activa**.
   - Si eliges un proyecto sin facturación, la clave queda en el plan gratis de **20 consultas al día** y el agente deja de responder (error `429 RESOURCE_EXHAUSTED`).
4. Nómbrala `VoxIA - <Cliente>` (ej. `VoxIA - Tevari`) y copia la clave. Empieza con `AIza…`.
5. Comprueba en la lista de claves que el **Plan / Nivel** diga **Nivel 1** (pago), no **Gratis**.

## Opción rápida: reusar una clave existente

En la misma página **aistudio.google.com/apikey** está la clave que ya usas; pulsa sobre ella para copiarla. VoxIA no la muestra porque la guarda oculta.

## Dónde pegarla en VoxIA

Con la sesión **del cliente** (no la de administrador):

1. **Configuración → Integraciones → Gemini**.
2. Pega la clave y guarda.
3. **Activa "AI Auto Respuesta"**. Sin eso el agente no responde.

## Control de gasto

- En Google Cloud Console → **Facturación → Presupuestos y alertas**, crea un presupuesto con alerta (por ejemplo, al 50 % y al 90 %).
- Si una clave se filtra, bórrala en aistudio.google.com/apikey, crea otra y pégala en VoxIA.
