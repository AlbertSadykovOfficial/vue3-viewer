# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.13.0

FROM node:${NODE_VERSION}-slim as base

ARG PORT=3000

WORKDIR /app

# Build
FROM base as build

RUN npm cache clear --force

EXPOSE ${PORT}