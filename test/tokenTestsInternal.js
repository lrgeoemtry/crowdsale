'use strict';
var TokenOffering = artifacts.require('./helpers/PolyMathTokenOfferingMock.sol');
var POLYToken = artifacts.require('PolyMathToken.sol');
const assertFail = require('./helpers/assertFail');


import { latestTime, duration } from './helpers/latestTime';

const DECIMALS = 18;

contract('polyToken Internal Tests', async function ([miner, owner, investor, wallet, presale_wallet]) {
    let tokenOfferingDeployed;
    let tokenDeployed;
    let startTime;
    beforeEach(async function () {
        tokenDeployed = await POLYToken.new(presale_wallet);
        startTime = latestTime() + duration.seconds(1);
        const endTime = startTime + duration.weeks(1);
        const cap = web3.toWei(15000, 'ether');
        tokenOfferingDeployed = await TokenOffering.new(tokenDeployed.address, startTime, endTime, cap, wallet);
        await tokenOfferingDeployed.setBlockTimestamp(startTime + duration.days(1));
        await tokenDeployed.setOwner(tokenOfferingDeployed.address);
    });

    it('should not be finalized', async function () {
        const isFinalized = await tokenOfferingDeployed.isFinalized();
        assert.isFalse(isFinalized, "isFinalized should be false");
    });

    it('cap should be 15000 ETH', async function () {
        const cap = await tokenOfferingDeployed.cap();
        assert.equal(cap.toString(10), '15000000000000000000000', "cap is incorrect");
    });

    describe('#whitelistAddresses', async function () {
        let investors;
        beforeEach(async function () {
            investors = [
                '0x2718C59E08Afa3F8b1EaA0fCA063c566BA4EC98B',
                '0x14ABEbe9064B73c63AEcd87942B0ED2Fef2F7B3B',
                '0x5850f06700E92eDe92cb148734b3625DCB6A14d4',
                '0xA38c9E212B46C58e05fCb678f0Ce62B5e1bc6c52',
                '0x7e2392A0DDE190457e1e8b2c7fd50d46ACb6ad4f',
                '0x0306D4C6ABC853bfDc711291032402CF8506422b',
                '0x1a91022B10DCbB60ED14584dC66B7faC081A9691'
            ];
        });

        it('should not reset the owner balance of poly token to 850million, and new owner to 150million. it should be impossible, as this could increase their balance after tokens have been released to buyers', async function () {

            let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investors[0]);
            assert.isFalse(firstInvestorStatus);

            await tokenOfferingDeployed.whitelistAddresses([investor], true);
            let balance = await tokenDeployed.balanceOf(investor);
            assert.equal(balance.toNumber(), 0);

            const value = web3.toWei(1, 'ether');
            await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
            balance = await tokenDeployed.balanceOf(investor);
            assert.equal(balance.toNumber(), 1200 * 10 ** DECIMALS, 'balanceOf is 1200 for investor who just bought tokens');

            let currentOwnerBalance = await tokenDeployed.balanceOf(tokenOfferingDeployed.address);
            await assertFail(async () => {
                await tokenDeployed.setOwner("0x2718C59E08Afa3F8b1EaA0fCA063c566BA4EC98B", { from: tokenOfferingDeployed.address })

            });

            it('Shows that beneficiary and msg.sender are the same people, which is redundant', async function () {
                let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investors[0]);
                assert.isFalse(firstInvestorStatus);

                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                let balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0);

                const value = web3.toWei(1, 'ether');
                await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 1200 * 10 ** DECIMALS, 'balanceOf is 1200 for investor who just bought tokens');
            });

            it('Check if ethToTokens is in eth or in wei ', async function () {
                // let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investors[0]);
                // assert.isFalse(firstInvestorStatus);

                // await tokenOfferingDeployed.whitelistAddresses([investor], true);
                // let balance = await tokenDeployed.balanceOf(investor);
                // assert.equal(balance.toNumber(), 0);

                // const value = web3.toWei(1, 'ether');
                // await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                // balance = await tokenDeployed.balanceOf(investor);
                // assert.equal(balance.toNumber(), 1200 * 10 ** DECIMALS, 'balanceOf is 1200 for investor who just bought tokens');
            });


            it('Show that bounty, reserve, advisor and founder dont really do anywhere ', async function () {
                // let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investors[0]);
                // assert.isFalse(firstInvestorStatus);

                // await tokenOfferingDeployed.whitelistAddresses([investor], true);
                // let balance = await tokenDeployed.balanceOf(investor);
                // assert.equal(balance.toNumber(), 0);

                // const value = web3.toWei(1, 'ether');
                // await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                // balance = await tokenDeployed.balanceOf(investor);
                // assert.equal(balance.toNumber(), 1200 * 10 ** DECIMALS, 'balanceOf is 1200 for investor who just bought tokens');
            });

        })
    });
});


//TO TEST BEFORE MAKING NEW CODE
//test where the funds that arent allocated end up
    //test what can be done with them or are they just locked

    // have issue with not checking amount > entitled in release,
    // but it acutally might be checked further down in the contract inheritances for transfer. need to confirm**
    //test afterwrods, because i will be changin the contract code anyways