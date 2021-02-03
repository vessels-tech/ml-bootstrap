# ml-bootstrap


A handy ts based cli tool for seeding and setting up a Mojaloop Hub based on a config file. No need for Postman scripts, or hacky environment files that you copy and paste around. 

Look at [`./example/default.js`](./example/default.js) for an example config file.


## How To

1. Clone this repo: 
```bash
git clone git@github.com:vessels-tech/ml-bootstrap.git
cd ml-bootstrap
npm install
```

1. Create a new config file, take a look at the `./example/` dir for some examples.

The most important parameters are:
- `urls.fspiop`


1. Run the tool!
```bash
npm run ml-bootstrap -- -c /path/to/your/config
```


Some other options include:
```bash

# set up only the hub, no participants
npm run ml-bootstrap -- hub -c /path/to/your/config

# bootstrap only the participants
npm run ml-bootstrap -- participants -c /path/to/your/config

# bootstrap only the parties (end users)
npm run ml-bootstrap -- parties -c /path/to/your/config
```





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

- decent logging using central-services-logger
- auto release and publish to npm
- getting started guide with examples
- integrate with pisp work
- dynamic settlement account id