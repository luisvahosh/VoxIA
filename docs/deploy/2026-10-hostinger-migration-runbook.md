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
    | ssh -i ~/.ssh/voxia_migracion root@179.197.91.51 "docker volume create voxia_$v >/dev/null && \
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

Deja VoxIA apagado 7 días en el servidor actual antes de dar de baja sus datos. Los demás proyectos de ese servidor siguen encendidos.

Al terminar la migración, quita la llave temporal: en el servidor actual borra `~/.ssh/voxia_migracion*`, y en el nuevo borra de `~/.ssh/authorized_keys` la línea que termina en `root@srv1747749`. Después haz privado el repositorio de GitHub y crea una llave de solo lectura para el servidor nuevo.

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

## 10. Entrar a Nginx Proxy Manager

El panel no está publicado en internet: el puerto 81 solo escucha dentro del servidor. Para entrar, abre un túnel SSH cada vez que lo necesites.

1. En PowerShell, en tu PC:

```bash
ssh -L 8181:127.0.0.1:81 root@179.197.91.51
```

2. Escribe la contraseña del servidor y deja esa ventana abierta.
3. Abre `http://localhost:8181` e inicia sesión con el usuario del panel. La contraseña está en tu gestor, no en este documento.
4. Al terminar, cierra el panel y escribe `exit` en la ventana del túnel.

Si no carga:

- Revisa que la ventana del túnel siga abierta y conectada.
- Si el puerto 8181 está ocupado en tu PC, usa otro, por ejemplo `-L 8282:127.0.0.1:81`, y abre `http://localhost:8282`.
- En el servidor, comprueba que esté encendido: `docker ps --filter name=nginx-proxy-manager`.
- Si se apagó: `docker compose -f ~/voxia/docker/npm/docker-compose.yml up -d`.

Si se pierde la contraseña, se restablece en la base de datos interna del panel. No abras el puerto 81 en el firewall para resolverlo.

## 11. Respaldos diarios en Backblaze B2

`docker/backup/voxia-backup.sh` corre a las 06:00 UTC (03:00 de Chile). Cifra con `age` y sube Postgres, los archivos y el `.env` al bucket privado `voxia-respaldos`. El servidor solo guarda la llave pública; la privada está en tu gestor. Sin ella, los respaldos no se pueden abrir.

El bucket tiene retención por defecto de 7 días y una regla que oculta cada archivo a los 7 días y lo borra 1 día después. Backblaze la aplica en modo Compliance: nadie puede borrar una copia antes de que venza. Probado el 2026-10-31: un archivo subido quedó en Compliance por 7 días, y una llave de prueba no pudo borrar otro protegido.

La llave del servidor es de tipo Write Only, limitada a `voxia-respaldos`. No puede listar ni leer archivos, así que para recuperar crea una llave temporal de lectura.

Actívalo después del corte:

```bash
cp ~/voxia/docker/backup/voxia-backup.cron /etc/cron.d/voxia-backup
bash ~/voxia/docker/backup/voxia-backup.sh
tail -5 /var/log/voxia-backup.log
```

Para recuperar una copia, guarda la llave privada en `/root/age.key` (y bórrala al terminar) y descarga con esa llave temporal, configurada en un remoto de `rclone` llamado `voxia-b2-lectura`:

```bash
rclone copy voxia-b2-lectura:voxia-respaldos/<FECHA>/ ~/recuperar/
age -d -i /root/age.key -o ~/recuperar/postgres.dump ~/recuperar/postgres.dump.age
```

Luego restaura Postgres como indica la parte 9. Haz esta prueba una vez al mes.
