const Ganache = require("../../../../ganache-core/src/packages/core/lib/index.js").default;
const Web3 = require("web3");
const generateSend = require("../utils/rpc");

/**
 * Initialize Ganache provider with `options`
 * @param {Object} options - Ganache provider options
 * @returns {Object} accounts, provider, send, web3 Object
 */
const initializeTestProvider = async(options = {}, provider = null) => {
  if (provider || options.provider) {
    throw new Error("THIS SHOULD ONLY TEST TS GANACHE!!!");
  }
  provider = provider || options.provider || Ganache.provider(options);
  const send = generateSend(provider);
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();

  return {
    accounts,
    provider,
    send,
    web3
  };
};

module.exports = initializeTestProvider;
