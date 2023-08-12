# RestAPI NodeJS with Prisma ORM

## Server Requirement
- Node v18.10.0+
- PostgreSQL 14.3+

## Installation

Documentation API
[Docs Postman](https://documenter.getpostman.com/view/19496704/2s9Xy5LVeo)

install dependencies
```bash
npm install
```

copy .env.example to .env
```bash
cp .env.example .env
```

Setup your database in .env file

for example
```bash
PORT=3000
DATABASE_URL=""
JWT_SECRET=""

# Fill this if you want to run in production
SHADOW_DATABASE_URL=""
```

running migration
```bash
npm run migrate
npm run build
```

run the server
```bash
npm run start
```

## License
[MIT](https://choosealicense.com/licenses/mit/)

## Author
[Yusep Jaelani](https://facebook.com/yusep.jaelani.77)
