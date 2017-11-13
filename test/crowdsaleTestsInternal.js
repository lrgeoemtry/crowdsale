'use strict';
var TokenOffering = artifacts.require('./helpers/PolyMathTokenOfferingMock.sol');
var POLYToken = artifacts.require('PolyMathToken.sol');
const assertFail = require('./helpers/assertFail');

import { latestTime, duration } from './helpers/latestTime';

const DECIMALS = 18;

contract('Token Offering internal Tests', async function ([miner, owner, investor, wallet, presale_wallet, investor_1, investor_2, investor_3, investor_4, investor_5,]) {
    let tokenOfferingDeployed;
    let tokenDeployed;
    let startTime;

    describe('Constructor fails with incorrect inputs', async function () {
        it('PolyMathTokenOffering fails when startTime < getBlockTimeStamp', async function () {
            tokenDeployed = await POLYToken.new(presale_wallet);
            startTime = latestTime() + duration.seconds(-10);
            const endTime = startTime + duration.weeks(1);
            const cap = web3.toWei(15000, 'ether');
            await assertFail(async function () { tokenOfferingDeployed = await TokenOffering.new(tokenDeployed.address, startTime, endTime, cap, wallet) });
        });

        it('PolyMathTokenOffering fails when endtime < start Time', async function () {
            tokenDeployed = await POLYToken.new(presale_wallet);
            startTime = latestTime() + duration.seconds(1);
            const endTime = startTime + duration.seconds(-10);
            const cap = web3.toWei(15000, 'ether');
            await assertFail(async function () { tokenOfferingDeployed = await TokenOffering.new(tokenDeployed.address, startTime, endTime, cap, wallet) });
        });

        it('PolyMathTokenOffering fails when cap < 0', async function () {
            tokenDeployed = await POLYToken.new(presale_wallet);
            startTime = latestTime() + duration.seconds(1);
            const endTime = startTime + duration.weeks(1);
            const cap = web3.toWei(-1, 'ether');
            await assertFail(async function () { tokenOfferingDeployed = await TokenOffering.new(tokenDeployed.address, startTime, endTime, cap, wallet) });

        });

        it('PolyMathTokenOffering fails when _wallet = 0', async function () {
            tokenDeployed = await POLYToken.new(presale_wallet);
            startTime = latestTime() + duration.seconds(1);
            const endTime = startTime + duration.weeks(1);
            const cap = web3.toWei(15000, 'ether');
            await assertFail(async function () { tokenOfferingDeployed = await TokenOffering.new(tokenDeployed.address, startTime, endTime, cap, '0x') });
        });

        it('PolyMathTokenOffering fails when _token = 0x', async function () {
            tokenDeployed = await POLYToken.new(presale_wallet);
            startTime = latestTime() + duration.seconds(1);
            const endTime = startTime + duration.weeks(1);
            const cap = web3.toWei(15000, 'ether');
            await assertFail(async function () { tokenOfferingDeployed = await TokenOffering.new('0x', startTime, endTime, cap, wallet) });
        });
    });


    describe('Contract has been successfully created', async function () {
        beforeEach(async function () {
            tokenDeployed = await POLYToken.new(presale_wallet);
            startTime = latestTime() + duration.seconds(1);
            const endTime = startTime + duration.weeks(1);
            const cap = web3.toWei(15000, 'ether');
            tokenOfferingDeployed = await TokenOffering.new(tokenDeployed.address, startTime, endTime, cap, wallet);
            await tokenOfferingDeployed.setBlockTimestamp(startTime + duration.days(1));
            await tokenDeployed.setOwner(tokenOfferingDeployed.address);
        });

        describe('Workflow of the buyTokens function', async function () {
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

            it('Allocations cant go negative. But it currently does nothing because it appears to be designed for presale, which I am planning on splitting into another contract', async function () {
            });

            it('Should fail, since PolyMathTokenOffering.sol is the owner, but has no way to call setOwner in PolyMathToken.sol', async function () {
                await assertFail(async function () {
                    await tokenDeployed.setOwner(investors[0], { from: tokenOfferingDeployed.address });
                });
                await assertFail(async function () {
                    await tokenDeployed.setOwner(investors[1], { from: investor });
                });
            });

            it('should whitelist and blacklist, with arrays, multiple times', async function () {
                let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investor_1);
                let secondInvestorStatus = await tokenOfferingDeployed.whitelist(investor_2);
                let thirdInvestorStatus = await tokenOfferingDeployed.whitelist(investor_3);
                let fourthInvestorStatus = await tokenOfferingDeployed.whitelist(investor_4);
                let fifthInvestorStatus = await tokenOfferingDeployed.whitelist(investor_5);

                let arrayInvestors_1 = [investor_1, investor_2];
                let arrayInvestors_2 = [investor_3, investor_4, investor_5];

                assert.isFalse(firstInvestorStatus);
                assert.isFalse(secondInvestorStatus);
                assert.isFalse(thirdInvestorStatus);
                assert.isFalse(fourthInvestorStatus);
                assert.isFalse(fifthInvestorStatus);

                //set first array to true 
                await tokenOfferingDeployed.whitelistAddresses(arrayInvestors_1, true);
                firstInvestorStatus = await tokenOfferingDeployed.whitelist(investor_1);
                secondInvestorStatus = await tokenOfferingDeployed.whitelist(investor_2);

                assert.isTrue(firstInvestorStatus);
                assert.isTrue(secondInvestorStatus);

                //set second array to true 
                await tokenOfferingDeployed.whitelistAddresses(arrayInvestors_2, true);
                thirdInvestorStatus = await tokenOfferingDeployed.whitelist(investor_3);
                fourthInvestorStatus = await tokenOfferingDeployed.whitelist(investor_4);
                fifthInvestorStatus = await tokenOfferingDeployed.whitelist(investor_5);

                assert.isTrue(thirdInvestorStatus);
                assert.isTrue(fourthInvestorStatus);
                assert.isTrue(fifthInvestorStatus);

                //set first array to 
                await tokenOfferingDeployed.whitelistAddresses(arrayInvestors_1, false);
                firstInvestorStatus = await tokenOfferingDeployed.whitelist(investor_1);
                secondInvestorStatus = await tokenOfferingDeployed.whitelist(investor_2);

                assert.isFalse(firstInvestorStatus);
                assert.isFalse(secondInvestorStatus);

                await tokenOfferingDeployed.whitelistAddresses(arrayInvestors_2, false);
                thirdInvestorStatus = await tokenOfferingDeployed.whitelist(investor_3);
                fourthInvestorStatus = await tokenOfferingDeployed.whitelist(investor_4);
                fifthInvestorStatus = await tokenOfferingDeployed.whitelist(investor_5);

                assert.isFalse(thirdInvestorStatus);
                assert.isFalse(fourthInvestorStatus);
                assert.isFalse(fifthInvestorStatus);
            })

            it('Edge Case - Someone contributes, then gets blacklisted, then tries to contribute agian, and it should fail', async function () {
                let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investor);
                assert.isFalse(firstInvestorStatus);

                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                let balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0);

                const value = web3.toWei(1, 'ether');
                await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 1200 * 10 ** DECIMALS, 'balanceOf is 1200 for investor who just bought tokens');

                await tokenOfferingDeployed.whitelistAddresses([investor], false);
                await assertFail(async function () { await tokenOfferingDeployed.sendTransaction({ from: investor, value: value }) });

                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 1200 * 10 ** DECIMALS, 'balanceOf is still 1200, cuz he was blacklisted');


            });

            it('An investor can contribute multiple times, at multiple bonus rates, and will correctly receive tokens', async function () {
                let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investor);
                assert.isFalse(firstInvestorStatus);

                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                let balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0);

                await tokenOfferingDeployed.setBlockTimestamp(startTime + duration.days(1) - 1);

                const value = web3.toWei(1, 'ether');
                await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(10), 1200 * 10 ** DECIMALS, 'balanceOf is 1200 for investor who just bought tokens');


                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 1200 * 10 ** DECIMALS);

                await tokenOfferingDeployed.setBlockTimestamp(startTime + duration.days(1) + 1);

                await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(10), 2300 * 10 ** DECIMALS, 'balanceOf is 2300 for investor who just bought tokens (1200 + 1100)');

                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 2300 * 10 ** DECIMALS);

                await tokenOfferingDeployed.setBlockTimestamp(startTime + duration.days(2) + 1);

                await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 3300 * 10 ** DECIMALS, 'balanceOf is 3300 for investor who just bought tokens (1200 + 1100 + 1000)');
            });


            it('Should  make sure Calculate bonus rate works with day three removed', async function () {
                let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investors[0]);
                assert.isFalse(firstInvestorStatus);

                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                let balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0);

                await tokenOfferingDeployed.setBlockTimestamp(startTime + duration.days(2) + 1);

                const value = web3.toWei(1, 'ether');
                await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 1000 * 10 ** DECIMALS, 'balanceOf is 1000 for investor, because it is one second past day 2');
            });

            it('should allow Multiple users to properly buy tokens for all three bonus periods', async function () {

                for (let h = 1; h <= 3; h++) { //Changes the days of contribution
                    for (let i = 0; i < 10; i++) { //Incremints the contributions by one individual, 10, 0.1 ether contributions per day
                        for (let j = 1; j <= 5; j++) { //Changes the investor, we test 5 different investors, contributing 10 times, across days 1, 2, and 3

                            let investorCount;
                            if (j = 1) investorCount = investor_1;
                            if (j = 2) investorCount = investor_2;
                            if (j = 3) investorCount = investor_3;
                            if (j = 4) investorCount = investor_4;
                            if (j = 5) investorCount = investor_5;

                            let addPreviousDaysContributions;
                            let changingBonus;// we have 120, 110, and 100 because we chose 0.1 ether instead of the usual 1 ether, because 100 eth limit for normal testrpc
                            if (h === 1) {
                                addPreviousDaysContributions = 0;
                                changingBonus = 120;
                            };
                            if (h === 2) {
                                addPreviousDaysContributions = 1200 * 10 ** DECIMALS;
                                changingBonus = 110;
                            };
                            if (h === 3) {
                                addPreviousDaysContributions = 2300 * 10 ** DECIMALS;
                                changingBonus = 100;
                            };

                            await tokenOfferingDeployed.whitelistAddresses([investorCount], true);
                            await tokenOfferingDeployed.setBlockTimestamp(startTime + duration.days(h) - 1);

                            const value = web3.toWei(0.1, 'ether');
                            await tokenOfferingDeployed.sendTransaction({ from: investorCount, value: value });
                            let balance = await tokenDeployed.balanceOf(investorCount);
                            assert.equal(balance.toNumber(10), (((i + 1) * changingBonus * 10 ** DECIMALS) + addPreviousDaysContributions), 'Balance of all 5 investors increments correctly on 3 different days, with 10 different contributions');
                        }
                    }
                }
            });

            it('Cant buy before start time', async function () {
                await tokenOfferingDeployed.setBlockTimestamp(startTime + duration.days(-1));

                let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investor);
                assert.isFalse(firstInvestorStatus);

                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                let balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0);

                const value = web3.toWei(1, 'ether');
                await assertFail(async function () { await tokenOfferingDeployed.sendTransaction({ from: investor, value: value }) });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0, 'balanceOf is 0, blocktime < startTime');
            });

            it('Cant buy After ICO is finalized ', async function () {
                await tokenOfferingDeployed.setBlockTimestamp(startTime + duration.days(10));

                let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investor);
                assert.isFalse(firstInvestorStatus);

                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                let balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0);

                const value = web3.toWei(1, 'ether');
                await assertFail(async function () { await tokenOfferingDeployed.sendTransaction({ from: investor, value: value }) });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0, 'balanceOf is 0, blocktime > endTime');
            });

            it('Forward Funds correctly sends ether to polymath presale wallet ', async function () {
                let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investor);
                assert.isFalse(firstInvestorStatus);

                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                let balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0);

                const walletEthBalanceInitial = web3.eth.getBalance(wallet);

                const value = web3.toWei(1, 'ether');
                await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 1200 * 10 ** DECIMALS, 'balanceOf is 1200 for investor who just bought tokens');

                const walletEthBalance = web3.eth.getBalance(wallet);
                const walletEthIncrease = walletEthBalance.toNumber() - walletEthBalanceInitial.toNumber();
                assert.equal(walletEthIncrease, 1 * 10 ** DECIMALS, 'eth balance increases by 1 from investor contribution');
            });

            it('should reject a 0 msg.value send by an investor', async function () {
                let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investors[0]);
                assert.isFalse(firstInvestorStatus);

                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                let balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0);

                await tokenOfferingDeployed.setBlockTimestamp(startTime + duration.days(1) + 1);

                const value = web3.toWei(0, 'ether');
                assertFail(async function () {await tokenOfferingDeployed.sendTransaction({ from: investor, value: value })});
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0 * 10 ** DECIMALS, 'balanceOf is 0 for investor, because they tried to send 0');
            });

            it('Test low level beneficary function to make sure it works', async function () {
                //this is done in ERC20 test 
            });

            it('function emergencyFinalize works, and will not allow buying after it is called', async function () {
                let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investor);
                assert.isFalse(firstInvestorStatus);

                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                let balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0);

                const value = web3.toWei(1, 'ether');
                await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 1200 * 10 ** DECIMALS, 'balanceOf is 1200 for investor who just bought tokens');

                //Owner calls finalize for emergency, new contributions should fail after this
                await tokenOfferingDeployed.emergencyFinalize()

                await assertFail(async function () {
                    await tokenOfferingDeployed.sendTransaction({ from: investor, value: value })
                });
            });

            it('function emergencyFinalize is only callable by owner', async function () {
                let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investor);
                assert.isFalse(firstInvestorStatus);

                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                let balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0);

                const value = web3.toWei(1, 'ether');
                await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 1200 * 10 ** DECIMALS, 'balanceOf is 1200 for investor who just bought tokens');

                //If anyone else calls emergencyFinalize, it wont work
                await assertFail(async function () { await tokenOfferingDeployed.emergencyFinalize({ from: investor }) });

                await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 2400 * 10 ** DECIMALS, 'balanceOf is 2400 for investor who just bought tokens. Therefore emergency finalize didnt work');
            });

            it('function whiteListAddresses is only callable by owner', async function () {
                let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investor);
                assert.isFalse(firstInvestorStatus);

                await assertFail(async function () { await tokenOfferingDeployed.whitelistAddresses([investor], true, { from: investor }) });
                let balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0);

                const value = web3.toWei(1, 'ether');
                await assertFail(async function () { await tokenOfferingDeployed.sendTransaction({ from: investor, value: value }) });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0 * 10 ** DECIMALS, 'balanceOf is 0 for investor because whitelist did not work, because owner did not call it');

                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0);

                await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 1200 * 10 ** DECIMALS, 'balanceOf is 1200 for investor who just bought tokens, because they have been approved');
            });

            it('Internal functions cant be called externally', async function () {

                //calling from any random account
                await assertFail(async function () { await tokenOfferingDeployed.calculateBonusRate({ from: investor }) });
                await assertFail(async function () { await tokenOfferingDeployed.ethToTokens(500, { from: investor }) });
                await assertFail(async function () { await tokenOfferingDeployed.forwardFunds(500, { from: investor }) });
                await assertFail(async function () { await tokenOfferingDeployed.checkFinalize({ from: investor }) });
                await assertFail(async function () { await tokenOfferingDeployed.validPurchase({ from: investor }) });
                await assertFail(async function () { await tokenOfferingDeployed.hasEnded({ from: investor }) });
                await assertFail(async function () { await tokenOfferingDeployed.getBlockTimestamp({ from: investor }) });
                await assertFail(async function () { await tokenOfferingDeployed.finalize({ from: investor }) });

                //calling from Owner
                await assertFail(async function () { await tokenOfferingDeployed.calculateBonusRate() });
                await assertFail(async function () { await tokenOfferingDeployed.ethToTokens(500) });
                await assertFail(async function () { await tokenOfferingDeployed.forwardFunds(500) });
                await assertFail(async function () { await tokenOfferingDeployed.checkFinalize() });
                await assertFail(async function () { await tokenOfferingDeployed.validPurchase() });
                await assertFail(async function () { await tokenOfferingDeployed.hasEnded() });
                await assertFail(async function () { await tokenOfferingDeployed.getBlockTimestamp() });
                await assertFail(async function () { await tokenOfferingDeployed.finalize() });
            });
        });
    });
});