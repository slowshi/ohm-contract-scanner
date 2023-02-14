'use strict'

try {
  const dotenv = require('dotenv').config();
} catch(_) {}
const { Telegraf } = require('telegraf');
const {abi: StakingAbi} = require('./abis/Staking.json');

// Setup
const { Network, Alchemy, Contract } = require('alchemy-sdk');

const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const TELEGRAM_KEY = process.env.TELEGRAM_KEY;

const bot = new Telegraf(TELEGRAM_KEY);
let findContractsInterval = null;
const init = async() => {
  console.log('Starting OHM Scanner...');
  const settings = {
    apiKey: ALCHEMY_API_KEY,
    network: Network.ARB_MAINNET,
  };
  const alchemy = new Alchemy(settings);
  let currentBlock = await alchemy.core.getBlockNumber();
  bot.startPolling();
  const findContracts = async () => {
    const latestBlock = await alchemy.core.getBlockNumber();
    for(let i = currentBlock; i <= latestBlock; i++) {
      const res = await alchemy.core.getBlockWithTransactions(i);
      console.log('BlockID:',i);
        for (const transaction of res.transactions) {
          if (transaction?.creates !== null) {
              try {
                  const provider = await alchemy.config.getProvider();
                  const contract = new Contract(transaction?.creates, StakingAbi, provider);
                  try {
                    const epoch = await contract.epoch();
                    console.log('Found an OHM contract');
                    bot.telegram.sendMessage(CHAT_ID,`
  Contract found!
  <b>Contract Address:</b>     ${contract.address}(<a href="https://arbiscan.io/address/${contract.address}">Link</a>)
  <b>Creator:</b>                       ${transaction.from}(<a href="https://arbiscan.io/address/${transaction.from}">Link</a>)


  `, {parse_mode: 'HTML', disable_web_page_preview: true});
                  } catch (e) {
                    continue;
                  }
              } catch (_) {
                  continue;
              }
          }
      }
      currentBlock = latestBlock;
    }
  };
  findContracts();
  // findContractsInterval = setInterval(async ()=>{ await findContracts();}, 30000);
}

init();
// Enable graceful stop
process.once('SIGINT', () => {
  console.log('Stopping');
  bot.stop('SIGINT')
  // clearInterval(findContractsInterval);
  process.exit(1);
});
process.once('SIGTERM', () => {
  console.log('Stopping');
  bot.stop('SIGTERM');
  // clearInterval(findContractsInterval);
  process.exit(1);
});