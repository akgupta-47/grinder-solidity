const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
// we made this change to work around the problems in web3
const provider = ganache.provider();
const web3 = new Web3(provider);
const { interface, bytecode } = require('../compile');

// while using a variable inside beforeEach statement we need to define that variable beforehand
let accounts;
let inbox;

beforeEach(async () => {
    // get list of all accounts
    accounts = await web3.eth.getAccounts();

    // use one of contracts to actually deploy
    // solidity compiler spited out the json representation of the interface
    // but we need to pass an actual js object to contract function
    inbox = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data: bytecode, 
            arguments: ['Crypto master hi!!']
        })
        .send({
            from: accounts[0],
            gas: '1000000'
        });
    // the first line does not say anything about deployment , it just sets up an interface for a contract for communication
    // .deploy tells web3 that we want to deploy a copy of the contract
    //  .send instructs web3 to send out a transaction that creates this contract

    inbox.setProvider(provider);
});
// we can use web3 to create a contract or accesss a already deployed contract


describe('Inbox', () => {
    // it is a test to run
    // assert library is pre-defined in node
    // .ok function checks if value exists, fails test if value is null or undefined
    it('deploys a contract', () => {
        assert.ok(inbox.options.address);
    });

    it('has a default message', async () => {
        // there are 2 types of contract functions
        // one are simple ,default that are instantaneous and free
        // other is modifiable, takes some time and costs money
        // so, here .message() is function in contract and it takes arguments to defined in that function
        // but the .call() method is used to modify the contract , mention user, gas etc.
        const message = await inbox.methods.message().call();
        assert.strictEqual(message, 'Crypto master hi!!');
    });

    it('custom message', async () => {
        await inbox.methods.setMessage('bye cryptoMaster').send({from: accounts[0]});
        const message = await inbox.methods.message().call();
        assert.strictEqual(message, 'bye cryptoMaster');
    });
});