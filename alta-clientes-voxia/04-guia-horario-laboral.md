# Guía paso a paso: derivar solo en horario laboral

Se hace una vez por cliente, en el flujo que avisa al agente, y toma unos 15 minutos. Antes de empezar, ten listo el horario del cliente y su zona horaria. Entra con la cuenta del cliente.

## Parte 1: crear los 3 campos

1. Abre `https://voxia.learnway.co/space/<ID_DEL_ESPACIO>/custom-fields`.
2. Pulsa **+ Create Custom Field**. No uses "Create Bot Field" ni "Create Folder".
3. Crea estos campos, con el nombre exacto:

| Name | Type |
| --- | --- |
| `en_horario` | Short Text |
| `proximo_horario` | Datetime |
| `proxima_atencion` | Short Text |

## Parte 2: preparar el código

1. Abre `03-horario-laboral.txt`.
2. Si el cliente no tiene el horario de San Rafael, cambia `horario`: 0 es domingo y 6 es sábado. Borra los días cerrados.
3. Si no está en Chile, cambia `zona` (por ejemplo, `America/Bogota`).
4. Copia todo el contenido.

## Parte 3: bloque que revisa el horario

1. Abre el flujo de derivación. Revisa que no quede un panel abierto a la izquierda; si lo hay, ciérralo con la **X**.
2. Pulsa el **+ azul** de abajo → **Perform Action**.
3. Haz clic en el bloque nuevo → **+ Create** en su panel → **Tools** → **Execute JavaScript Code**.
4. Pulsa **Edit**, pega el código en **Code**.
5. En **Output Custom Field**, pulsa **Add** 3 veces y llena:

| Ruta | Campo |
| --- | --- |
| `en_horario` | `en_horario` |
| `proximo_horario` | `proximo_horario` |
| `proxima_atencion` | `proxima_atencion` |

6. Guarda el paso y cierra el panel con la **X**.
7. Pasa el mouse sobre el bloque y, en la barrita de iconos de arriba, márcalo como inicio. La etiqueta roja **Start** debe pasar a ese bloque.

## Parte 4: Condición

1. **+ azul** → **Condition**.
2. Haz clic en el bloque → **+ Add Condition**. No uses "Check New Condition".
3. Elige el campo personalizado `en_horario`, operador **Is**, valor `no` en minúsculas.
4. Cierra el panel.

El bloque queda con 2 salidas: el **círculo verde** significa fuera de horario y el **círculo rojo**, dentro de horario.

## Parte 5: mensaje de fuera de horario

1. **+ azul** → **Send Message**.
2. Agrega un texto y pega:

```
En este momento estamos fuera del horario de atención. Nuestro equipo te contactará {{proxima_atencion}} por este mismo chat. Mientras tanto, puedo ayudarte con tus dudas.
```

3. Revisa que la variable tenga **dos llaves**. Con una sola, el cliente la ve como texto. Si no la toma, insértala con el botón `</>`.

## Parte 6: espera

1. **+ azul** → **Wait**.
2. Haz clic en el bloque y elige: tipo **Date**, **Dynamic**, campo `proximo_horario`, offset apagado.

## Parte 7: conexiones

Cada línea sale de un círculo de la derecha y llega al circulito izquierdo del otro bloque. Arrastra sin soltar. Para borrar una línea, haz clic en ella y presiona **Supr**.

| Desde | Hacia |
| --- | --- |
| Perform Action → **Continue** | Condition |
| Perform Action → **Error** (rojo de Execute JavaScript) | Mensaje "Te comunico…" |
| Condition → **verde** | Mensaje de fuera de horario |
| Condition → **rojo** | Mensaje "Te comunico…" |
| Mensaje de fuera de horario → **Continue** | Wait |
| Wait → **Continue** | Bloque con Notify agent |
| Mensaje "Te comunico…" → **Continue** | Bloque con Notify agent (ya existe) |

**Antes de publicar, revisa:**

- El círculo **Success** de Execute JavaScript está **vacío**. Es un verde distinto al de la Condición; si se conecta, el flujo se salta la Condición.
- El **círculo verde de la Condición** tiene su línea.
- La etiqueta **Start** está en Perform Action.
- En **IA → AI Functions**, la función de derivación tiene el **Output Message** vacío.

Después pulsa **Publicar**.

## Parte 8: probar

**Dentro de horario.** Escribe "quiero hablar con una persona". Deben llegar el mensaje "Te comunico…" y el aviso al agente, y nada de "fuera de horario".

**Fuera de horario.** Antes, reactiva el bot con el ícono del robot en el Inbox, porque la prueba anterior lo pausó 24 horas. Escribe lo mismo. Debe llegar la hora de atención, por ejemplo "mañana a las 09:00". El aviso no sale en ese momento, sino a esa hora, y mientras tanto el bot sigue respondiendo.

Para ver qué calculó el código:

```bash
cd ~/voxia
docker compose -f docker-compose.prod.yml exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' <<'SQL'
SELECT cf.name, ccf.value, ccf."updatedAt"
FROM "ContactCustomField" ccf
JOIN "CustomField" cf ON cf.id = ccf."customFieldId"
WHERE cf."workspaceId" = '<ID_DEL_ESPACIO>'
  AND cf.name IN ('en_horario','proximo_horario','proxima_atencion')
ORDER BY ccf."updatedAt" DESC LIMIT 6;
SQL
```

## Si algo falla

| Qué pasa | Causa | Solución |
| --- | --- | --- |
| Dentro de horario dice "fuera del horario" | El círculo Success está conectado | Borrar esa línea y conectar el verde de la Condición |
| El cliente ve `{proxima_atencion}` | Variable con una sola llave | Escribirla con dos llaves |
| Sale un mensaje que no está en el flujo | Output Message de la función | Vaciarlo en AI Functions |
| Fuera de horario no pasa nada | El verde de la Condición está sin conectar | Conectarlo al mensaje de fuera de horario |

No contempla festivos. Si el cliente pide una persona dos veces durante la espera, llegan 2 avisos.
