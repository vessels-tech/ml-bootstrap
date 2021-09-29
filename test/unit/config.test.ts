import { GlobalConfig, formatAndValidateConfig } from "../../src/config"
import { shouldNotBeExecuted } from "./utils"


describe('config', () => {
  describe('formatAndValidateConfig', () => {
    it('throws if both currency and currencies is specified', () => {
      // Arrange
      const input: GlobalConfig = {
        currency: 'USD',
        currencies: ['AED'],
        urls: {
          fspiop: 'example',
          alsEndpoint: 'example',
          alsAdmin: 'example',
          centralLedgerAdmin: 'example',
        },
        applicationUrls: {
          oracle: 'example'
        },
        oracles: [
          { oracleIdType: "MSISDN", endpoint: "http://beta.moja-lab.live/api/admin/oracle-simulator" }
        ],
        participants: []
      }
      
      // Act
      try {
        const result = formatAndValidateConfig(input)
        shouldNotBeExecuted()
      } catch(err) {
        // Assert
        expect(err).toBe('Cannot specify both `currency` and `currencies`. Please use updated config')
      }
    })


    it.todo('prints a warning when using the outdated currency config')
  })
})