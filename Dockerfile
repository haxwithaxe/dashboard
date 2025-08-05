ARG BASE_IMAGE=nginx:stable-alpine
FROM ${BASE_IMAGE}

LABEL org.opencontainers.image.authors="haxwithaxe W3AXE"
LABEL org.opencontainers.image.description="dashboard by haxwithaxe in a Docker container"
LABEL org.opencontainers.image.source="https://github.com/haxwithaxe/dashboard"

COPY ./*.js /usr/share/nginx/html/
COPY ./*.css /usr/share/nginx/html/
COPY ./*.html /usr/share/nginx/html/
RUN chmod -R a+rX /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=10s --start-period=2m --retries=3 CMD wget -q http://localhost/index.html || exit 1
