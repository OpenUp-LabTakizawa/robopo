# syntax=docker/dockerfile:1
# check=error=true
FROM oven/bun:1.4.2 AS builder
WORKDIR /usr/src/app
# Bind every workspace package.json so the frozen lockfile resolves, but only
# link @robopo/web: the docs package (Docusaurus) is not part of this image.
RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=bun.lock,target=bun.lock \
  --mount=type=bind,source=@robopo/web/package.json,target=@robopo/web/package.json \
  --mount=type=bind,source=@robopo/docs/package.json,target=@robopo/docs/package.json \
  --mount=type=cache,target=/root/.bun \
  bun i --frozen-lockfile --filter @robopo/web
COPY . .
# `next build` never opens a connection, but lib/db/db.ts throws when the URL
# is missing, so give it a placeholder.
ENV DATABASE_URL=postgres://build:build@localhost:5432/build
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM gcr.io/distroless/nodejs26-debian13:nonroot
WORKDIR /app
# The standalone output mirrors the workspace layout: node_modules at the
# root, server.js under @robopo/web. nonroot owns it so next/image can write
# its cache.
COPY --from=builder --chown=nonroot:nonroot /usr/src/app/@robopo/web/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /usr/src/app/@robopo/web/.next/static ./@robopo/web/.next/static
COPY --from=builder --chown=nonroot:nonroot /usr/src/app/@robopo/web/public ./@robopo/web/public
WORKDIR /app/@robopo/web

EXPOSE 3000
ENV HOSTNAME=0.0.0.0 PORT=3000 NEXT_TELEMETRY_DISABLED=1
ENTRYPOINT ["/nodejs/bin/node", "server.js"]
