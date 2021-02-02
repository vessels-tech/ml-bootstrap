# ml-bootstrap


A handy ts based cli tool for seeding and setting up a Mojaloop Hub based on a config file. No need for Postman scripts, or hacky environment files that you copy and paste around. 

Look at [`./src/seed/config.ts`](./src/seed/config.ts) to get started.


## Seeding the hackathon environment:

1. Edit the files in `./src/config.ts`

2. Set the necessary env vars:
```bash
export FSPIOP_URL=beta.moja-lab.live/api/fspiop
export ELB_URL=beta.moja-lab.live/api/admin
```

2. Run the seeder
```bash
npm run start
```

## TODO:

- parse config file
- decent logging using central-services-logger
- auto release and publish to npm
- getting started guide with examples
- integrate with pisp work