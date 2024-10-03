# Meme Manager

Meme Manager is a project designed to manage and serve memes efficiently.

## About

This repository contains the **Meme Manager API**, which is built using **NestJS**, a progressive Node.js framework for building efficient and scalable server-side applications. The API provides endpoints to create, manage, and interact with memes, including features like user authentication, meme likes, and more.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Important Dependencies](#important-dependencies)
- [License](#license)

## Installation

To install the project dependencies, run:

```bash
npm install
```

## Usage

To start the project in development mode, use:

```bash
npm run start:dev
```

For production, build the project and then start it:

```bash
npm run build
npm run start:prod
```

## Important Dependencies

The project relies on the following dependencies:

- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`
- `nestjs`
- `@nestjs/config`
- `@nestjs/jwt`
- `@prisma/client`
- `bcrypt`
- `class-transformer`
- `class-validator`
- `date-fns`
- `multer`
- `uuid`

## License

The project is open source
