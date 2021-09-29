import { GlobalConfig, formatAndValidateConfig, LooseGlobalConfig } from "../../src/config"
import { shouldNotBeExecuted } from "./utils"


describe('config', () => {
  describe('formatAndValidateConfig', () => {
    it('throws if both currency and currencies is specified', () => {
      // Arrange
      const input: LooseGlobalConfig = {
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
        formatAndValidateConfig(input)
        shouldNotBeExecuted()
      } catch(err) {
        // Assert
        const message = (err as unknown as Error).message
        expect(message).toMatch('Cannot specify both `currency` and `currencies`. Please use updated config')
      }
    })

    it('coerces old currency config into new format', () => {
      // Arrange
      const input: LooseGlobalConfig = {
        currency: 'USD',
        currencies: [],
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
      const expected = {
        currency: undefined,
        currencies: ['USD'],
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
      const result = formatAndValidateConfig(input)
      
      // Assert
      expect(result).toStrictEqual(expected)
    })
  })
})