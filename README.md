# kuso-demo-todo-web

Vanilla-JS frontend for the kuso demo todo app. Pairs with [`kuso-demo-todo-api`](https://github.com/ivo9999/kuso-demo-todo-api).

## Env

- `API_BASE` (required) – URL of the API service. In kuso, set this to `${{ <api-service-name>.URL }}` so it resolves to the in-cluster DNS / public domain automatically.
- `PORT` (default `8080`)

## Deploy via kuso

1. Same project as the API.
2. Add this repo as a service. Runtime auto-detected (nixpacks → Node).
3. Set env: `API_BASE=https://<your-api-domain>`.
