# ml-bootstrap


A handy ts based cli tool for seeding and setting up a Mojaloop Hub based on a config file. No need for Postman scripts, or hacky environment files that you copy and paste around. 

Look at [`./example/default.json5`](./example/default.json5) for an example config file.


## How To -- npm/npx

```bash
npx ml-bootstrap
```

## How To -- Local Development

1. Clone this repo: 
```bash
git clone git@github.com:vessels-tech/ml-bootstrap.git
cd ml-bootstrap
npm install
```

1. Create a new config file, take a look at the `./example/` dir for some examples.

The most important parameters are:
- `urls.fspiop` - the location of the FSPIOP API (`/parties`, `/participants`, `/quotes`)
- `urls.alsAdmin` - The location of the ALS Admin API - used to register parties
- `urls.centralLedgerAdmin` - The location of the central-ledger api - used to register DFSP callback endpoints
- `applicationUrls.oracle` - This is used to sell the ALS which oracles to talk to

1. Run the tool!
```bash
npm run ml-bootstrap -- -c /path/to/your/config
```

For example:

```
$ npm run ml-bootstrap -- -c ./example/default.json5

> @mojaloop/oss-lab-bootstrap@0.1.0 ml-bootstrap /home/lew/developer/mojaloop/ml-bootstrap
> ts-node ./src/cli.ts "-c" "./example/default.json5"



  Running: Hub Steps
  Description: Sets up the hub accounts
  |
  - step: setup `HUB_MULTILATERAL_SETTLEMENT` account
executeRequest failed with status: 400
{
  errorInformation: {
    errorCode: '3003',
    errorDescription: 'Add Party information error - Hub account has already been registered.'
  }
}
  - step: setup `HUB_RECONCILIATION` account
executeRequest failed with status: 400
{
  errorInformation: {
    errorCode: '3003',
    errorDescription: 'Add Party information error - Hub account has already been registered.'
  }
}
  - step: setup `SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL`
  - step: setup `NET_DEBIT_CAP_ADJUSTMENT_EMAIL`
  - step: setup `NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL`
  |
  Hub Steps Passed
  Passed with warnings: 
    - setup `HUB_MULTILATERAL_SETTLEMENT` account: Error, Status: 400 Message: {"errorInformation":{"errorCode":"3003","errorDescription":"Add Party information error - Hub account has already been registered."}}
    - setup `HUB_RECONCILIATION` account: Error, Status: 400 Message: {"errorInformation":{"errorCode":"3003","errorDescription":"Add Party information error - Hub account has already been registered."}}

```


Some other options include:
```bash

# set up only the hub, no participants
npm run ml-bootstrap -- hub -c /path/to/your/config

# bootstrap only the participants
npm run ml-bootstrap -- participants -c /path/to/your/config

# bootstrap only the parties (end users)
npm run ml-bootstrap -- parties -c /path/to/your/config

# bootstrap only a single participant by name
npm run ml-bootstrap -- fspid=figmm -c /path/to/your/config
```

## TODO:
- [ ] decent logging using central-services-logger
- [ ] auto release and publish to npm
- [x] integrate with pisp work
- [x] dynamic settlement account id
- [x] bootstrap only one participant by name
- [ ] allow a hub to specify more than one currency