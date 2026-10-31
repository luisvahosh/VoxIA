# Migración a Hostinger con Nginx Proxy Manager (2026-10)

Mueve VoxIA de `srv1747749` a `srv2112745.hstgr.cloud` (179.197.91.51) con el mismo dominio, `voxia.learnway.co`. Meta, Google y Telegram no se reconfiguran.

Reglas de esta migración:

- El `.env` se copia idéntico. No se regenera ninguna clave.
- `RUN_DB_MIGRATE=false` en el servidor nuevo: los datos copiados ya tienen sus migraciones.
- El worker nuevo no se enciende hasta el corte. Con datos reales enviaría mensajes y recordatorios duplicados.
- Solo se mueve VoxIA. El servidor actual aloja otros proyectos y su Nginx Proxy Manager, que siguen allí. `docker compose -f docker-compose.prod.yml stop` detiene únicamente el stack `voxia`.
- El servidor actual sigue en su rama. El servidor nuevo usa la red `proxy-net` y su propio Nginx Proxy Manager, en `docker/npm/`.
- Nunca crees en Nginx Proxy Manager un host o bloque cuyo servicio no esté encendido: el sitio completo puede caerse.

Variables usadas abajo:

```bash
COMPOSE="docker compose -f docker-compose.prod.yml"
```

## 1. Preparar el servidor nuevo

```bash
fallocate -l 8G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable

git clone <URL_DEL_REPOSITORIO> ~/voxia
cd ~/voxia && git switch chore/hostinger-nginx-migration
docker compose -f docker/npm/docker-compose.yml up -d
```

Copia el `.env` desde el servidor actual sin imprimirlo:

```bash
# En el servidor actual
scp ~/voxia/.env root@179.197.91.51:~/voxia/.env
```

En el nuevo, apunta a `proxy-net` y deja `RUN_DB_MIGRATE=false`:

```bash
sed -i 's/^NGINX_EXTERNAL_NETWORK=.*/NGINX_EXTERNAL_NETWORK=proxy-net/; s/^RUN_DB_MIGRATE=.*/RUN_DB_MIGRATE=false/' .env
```

## 2. Construir las imágenes

Una por vez, para no agotar la memoria:

```bash
$COMPOSE build javascript-executor realtime
nohup $COMPOSE build builder > ~/build-builder.log 2>&1
nohup $COMPOSE build worker > ~/build-worker.log 2>&1
```

## 3. Entrar a Nginx Proxy Manager

El panel solo escucha en localhost. Abre un túnel desde tu PC y deja esa terminal abierta:

```bash
ssh -L 8181:127.0.0.1:81 root@179.197.91.51
```

Entra a `http://localhost:8181`, crea el administrador con una contraseña nueva y guárdala en tu gestor. Todavía no crees el host: los servicios deben estar encendidos primero (parte 5).

## 4. Copiar los datos

Detiene el servicio. En el ensayo, hazlo en un horario sin pacientes.

```bash
# En el servidor actual
cd ~/voxia
docker compose -f docker-compose.prod.yml stop builder worker realtime
docker compose -f docker-compose.prod.yml exec -T postgres sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > ~/voxia-respaldo.dump
docker compose -f docker-compose.prod.yml exec -T redis redis-cli save
docker compose -f docker-compose.prod.yml stop

for v in db-data cache-data filesystem-data; do
  docker run --rm -v voxia_$v:/from:ro alpine tar -C /from -czf - . \
    | ssh root@179.197.91.51 "docker volume create voxia_$v >/dev/null && \
      docker run --rm -i -v voxia_$v:/to alpine sh -c 'rm -rf /to/* && tar -C /to -xzf -'"
done
```

Si es solo el ensayo, vuelve a levantar el servidor actual:

```bash
docker compose -f docker-compose.prod.yml up -d
```

## 5. Ensayo

En el servidor nuevo, todo menos el worker:

```bash
$COMPOSE up -d postgres redis filesystem filesystem-init javascript-executor builder realtime
$COMPOSE ps
docker exec nginx-proxy-manager getent hosts builder realtime voxia-filesystem
```

Los 3 nombres deben responder. Crea un certificado temporal:

```bash
openssl req -x509 -nodes -newkey rsa:2048 -days 7 -subj "/CN=voxia.learnway.co"   -keyout ~/ensayo.key -out ~/ensayo.crt
```

En tu PC, agrega al archivo `C:\Windows\System32\drivers\etc\hosts`:

```
179.197.91.51 voxia.learnway.co
```

En Nginx Proxy Manager:

1. **SSL Certificates → Add → Custom:** sube `ensayo.crt` y `ensayo.key`.
2. **Hosts → Proxy Hosts → Add:** dominio `voxia.learnway.co`, `http`, `builder`, puerto `3000`, con **Websockets Support** activo.
3. **SSL:** elige el certificado temporal y activa **Force SSL**.
4. **Advanced (⚙):** pega los bloques `location` de `docker/nginx/voxia.learnway.co.conf`.

Acepta la advertencia del certificado temporal y revisa login, Inbox, flujos y archivos. No envíes mensajes. Al terminar, borra esa línea y apaga el stack:

```bash
$COMPOSE down
```

## 6. Corte

1. Un día antes, baja el TTL del registro DNS a 300 segundos.
2. Repite la parte 4 sin levantar el servidor actual.
3. En el servidor nuevo, levanta todo menos el worker: `$COMPOSE up -d postgres redis filesystem filesystem-init javascript-executor builder realtime`.
4. Cambia el registro A de `voxia.learnway.co` a `179.197.91.51`.
5. Cuando `dig +short voxia.learnway.co` muestre la IP nueva, edita el host en Nginx Proxy Manager, pestaña **SSL**, y pide **Request a new SSL Certificate** de Let's Encrypt.
6. Enciende el worker: `$COMPOSE up -d worker`.
7. Borra `~/ensayo.key`, `~/ensayo.crt` y el certificado temporal del panel.

## 7. Verificación

- [ ] Mensaje de WhatsApp en San Rafael y en Tevari, con respuesta.
- [ ] Reserva y evento en el calendario.
- [ ] Subida de un archivo y respuesta con dato exacto (RAG).
- [ ] Aviso al agente y página `/handoff`.
- [ ] Inbox en tiempo real.
- [ ] `curl -I https://voxia.learnway.co` desde fuera devuelve certificado válido.

## 8. Reversa

Si falla algo y no se corrige en 30 minutos: apaga el worker nuevo, enciende el servidor actual y regresa el DNS a la IP anterior. Lo que entró al servidor nuevo durante ese tiempo no vuelve al anterior.

Deja el servidor actual apagado 7 días antes de darlo de baja.

## 9. Restaurar un respaldo de Postgres

Probado el 2026-10-30: `pg_restore` terminó sin errores y los conteos coincidieron con producción (404 tablas, 60 versiones de flujo, 8 funciones de IA, 19 fragmentos de conocimiento y 15 campos de contacto).

La base debe crearse con el mismo usuario de producción, `voxia`, porque los trabajos de TimescaleDB guardan ese dueño. Usa la misma imagen fijada en `docker-compose.prod.yml` y no agregues `--no-owner`.

```bash
psql -U voxia -d voxia -c "SELECT timescaledb_pre_restore();"
pg_restore -U voxia -d voxia < respaldo.dump
psql -U voxia -d voxia -c "SELECT timescaledb_post_restore();"
```

Este procedimiento recupera solo Postgres. Los archivos, Redis y el `.env` se respaldan aparte.

Si pegas comandos en la consola y se pierde texto, pégalos por líneas cortas.
