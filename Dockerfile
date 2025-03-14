FROM caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY build /srv