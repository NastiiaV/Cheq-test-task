# Task management

A small task list: a NestJS API, a React app, and one AWS server that runs both. Tasks live in memory inside the API process. The public site is [http://16.170.218.219/](http://16.170.218.219/). `GET /health` on that host returns the API status.

## Layout

| Path | What it is |
| --- | --- |
| `api/` | NestJS service. `GET /health`, `GET /tasks`, `POST /tasks`, and `DELETE /tasks/:id`. |
| `web/` | Vite + React app. Task list, create form, and health badge. |
| `infra/` | Terraform: ECR repository, EC2 instance, security group, instance role. |
| `.github/workflows/deploy.yml` | On every push to `main`: test, build, deploy. |

## Run it locally

You need Node.js 22.

API, in one terminal:

```bash
cd api
npm ci
npm run start:dev
```

The API listens on [http://localhost:3000](http://localhost:3000).

Frontend, in a second terminal:

```bash
cd web
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The dev server calls `http://localhost:3000` unless you set `VITE_API_URL`.

`POST /tasks` needs a JSON body `{ "title": "..." }`. The title is required, trimmed, and limited to 200 characters. An empty title is rejected in the form before the request is sent, and the API returns 400 if it arrives anyway. A successful create returns 201. `GET /tasks` returns the tasks, newest first. `GET /health` returns `{ "status": "ok", "uptime": <seconds> }`.

## Tests and coverage

From `api/`:

```bash
npm test
```

That runs the Jest unit tests and prints a coverage table. The suite fails if statements, functions, or lines drop below 80%. `main.ts` is excluded from the count. Controller and service tests replace `TaskRepository` with a mock, so they do not use the in-memory store.

`npm run test:e2e` runs the HTTP tests in `api/test/`. Those are not part of `npm test`, and the GitHub workflow does not run them.

## Infrastructure and deployment

One `t3.micro` in the default VPC, `eu-north-1` (Stockholm), Amazon Linux 2023. Terraform also creates:

- an ECR repository, `cheq-task-api`
- a security group: SSH (22), the site (80), and the API container (3000)
- an instance role that can pull from ECR
- the SSH key pair used by GitHub Actions

On first boot the instance installs Docker and nginx. Nginx serves the built React app from `/var/www/tasks` and proxies `/health` and `/tasks` to the container on port 3000. The production build sets `VITE_API_URL` to an empty string (`web/.env.production`), so the browser calls those paths on the same host.

### Create the AWS user once

The servers come from Terraform. The IAM user that runs Terraform does not: AWS will not let a brand-new account create that user from code before any credentials exist.

1. In IAM, create a user named `cheq-deploy` with no console password.
2. Attach an inline policy whose JSON is `infra/ci-user-policy.json`.
3. Create an access key for the CLI.
4. On your machine, run `aws configure` with that key, the secret, and region `eu-north-1`.

`iam:PassRole` in that policy is limited to the role `cheq-task-instance`, and only when the role is passed to EC2.

### Provision

The private key stays on your machine. Terraform only uploads the public half.

```bash
ssh-keygen -t ed25519 -f "$HOME/.ssh/cheq-task" -N ""
cd infra
terraform init
terraform apply -var="public_key_path=$HOME/.ssh/cheq-task.pub"
```

`terraform output instance_public_ip` is the site address. State is kept in `infra/` on the machine that ran apply. It is gitignored. There is no remote backend, so apply and destroy from that same machine.

To remove it later:

```bash
terraform destroy -var="public_key_path=$HOME/.ssh/cheq-task.pub"
```

### What a push to `main` does

GitHub Actions secrets:

| Secret | Value |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | Access key of `cheq-deploy` |
| `AWS_SECRET_ACCESS_KEY` | Its secret |
| `AWS_REGION` | `eu-north-1` |
| `EC2_SSH_KEY` | Contents of `~/.ssh/cheq-task` (the private key) |

The workflow has two jobs. `test` runs `npm ci` and `npm test` in `api/`. `deploy` starts only after that job succeeds, so a failing test does not build or deploy.

`deploy` builds the React app, builds `api/Dockerfile`, and pushes the image to ECR tagged with the git SHA. It then SSHs to the instance tagged `cheq-task-api`, copies `web/dist` into `/var/www/tasks`, pulls that image, and replaces the container named `api` (`docker rm -f`, then `docker run` on port 3000 with `--restart unless-stopped`).

The image is a multi-stage build from `node:22.14.0-alpine`. The final stage installs production dependencies only, runs as the `node` user, and starts with `node dist/main.js`. `api/.dockerignore` keeps tests, `node_modules`, and local env files out of the build context.

## Assumptions and what is not finished

- An in-memory array is the database. Repository methods return Promises, but the data is gone when the container stops. Every deploy runs `docker rm -f`, so the task list is cleared on each push to `main`.
- `DELETE /tasks/:id` is extra. The button is there so a task added on the public site can be removed without restarting the container.
- The frontend is static files on nginx, not its own image. The assignment asked for a production Dockerfile for the API.
- Port 3000 is open to the internet as well as port 80, so the API can be called without nginx. SSH is open to `0.0.0.0/0` unless you set `allowed_ssh_cidr`.
- There is no HTTPS and no DNS name. Stopping the instance releases the public IP; the next start gets a new one, and a push cannot deploy while the instance is stopped.
- The pipeline does not run `npm run test:e2e` or any frontend tests.
- Request logs go to the container’s stdout (method, path, status, duration). Nothing ships them off the box.

## System architecture

```text
browser
  │  http://<public-ip>/
  ▼
nginx on EC2 :80
  ├─ /            static files from /var/www/tasks
  └─ /health
     /tasks       proxy to 127.0.0.1:3000
                      │
                      ▼
                 Docker container "api"
                 NestJS, in-memory tasks
                      ▲
                      │ docker pull
                 Amazon ECR  (image tag = git SHA)

GitHub Actions on push to main
  test (Jest) → build web + image → push ECR → SSH → replace files and container
```

### Scalability

The current box is one Node process with the task list in a local array, behind one nginx. A 10x increase in this API is still a small amount of traffic for a `t3.micro`, and the request logger plus a health poll every five seconds would not be what breaks first. What breaks first is that a second process cannot see the tasks, and a restart throws them away.

The specific changes, in that order:

1. Keep `TaskRepository` and replace `InMemoryTaskRepository` with PostgreSQL on RDS (a single small instance is enough at 10x). The API process then stores nothing that has to survive a restart.
2. Put an Application Load Balancer in front of the API. Its health check is `GET /health`, which already returns `status` and `uptime`. Run two or more copies of the same ECR image (an EC2 Auto Scaling group, or ECS on Fargate). They can share the work only after step 1.
3. Move the React build to S3 and CloudFront. Nginx on the instance would no longer serve the site or proxy the API, and a new frontend deploy would be a cache invalidation instead of an SSH copy.
4. Close public port 3000. Only the load balancer’s security group should reach the containers. Leave the image tag as the git SHA so each task definition points at one build.

I would not add a cache for `GET /tasks`. The list is the whole product, it changes on every create, and a cache would be extra machinery for a payload that is a JSON array of short titles.

### Observability

Today the only signal is the Nest request log line (`METHOD path status durationMs`) on the container’s stdout, plus nginx’s error log on the instance. A crash, a 500, or a full disk is invisible unless someone is SSH’d in and running `docker logs`.

For this service I would:

- Run the container with the `awslogs` driver into a log group `/cheq-task/api`, and install the CloudWatch agent for `/var/log/nginx/error.log`. The line the middleware already writes is enough to count status codes and latency with a metric filter. No request body: a task title does not belong in a log archive.
- Alarm on two things that this app can actually fail at: the ALB target check against `GET /health` going unhealthy, and a rise in 5xx on `/tasks`. The health JSON’s `uptime` dropping back to a small number is the restart signal.
- Report unexpected exceptions to Sentry from a Nest exception filter, with the path and status. Validation failures stay as 400s in the log. They are client mistakes, not pages to wake someone up for.
- Keep a canary outside the VPC that requests `https://<site>/health` every minute, because an alarm on the instance cannot fire if the instance cannot reach CloudWatch.

### AI use

I used Cursor to draft the Nest API, the React screens, the Dockerfile, the Terraform, and the GitHub Actions workflow, and then I read and changed that output.

The first `api/src/tasks` layout was flat: controller, service, DTO, and repository in one folder. I had it split into `dto/`, `repo/`, and `interfaces/`. The request logger started next to the tasks code. I moved it to `api/src/common/middleware/`, because it logs every request, not just task routes.

The first `infra/ci-user-policy.json` allowed `iam:PassRole` on `*`. AWS Access Analyzer flagged that. `PassRole` is now its own statement, limited to `role/cheq-task-instance` and only when the role is passed to EC2.
