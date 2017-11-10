'use strict';
var TokenOffering = artifacts.require('./helpers/PolyMathTokenOfferingMock.sol');
var POLYToken = artifacts.require('PolyMathToken.sol');
const assertFail = require('./helpers/assertFail');

import { latestTime, duration } from './helpers/latestTime';

const DECIMALS = 18;

contract('Token Offering internal Tests', async function ([miner, owner, investor, wallet, presale_wallet]) {
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

            it('should whitelist and blacklist, with full arrays, multiple times', async function () {
                // let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investors[0]);
                // assert.isFalse(firstInvestorStatus);

                // await tokenOfferingDeployed.whitelistAddresses(investors, true);
                // firstInvestorStatus = await tokenOfferingDeployed.whitelist(investors[0]);
                // assert.isTrue(firstInvestorStatus);

                // await tokenOfferingDeployed.whitelistAddresses(investors, false);
                // firstInvestorStatus = await tokenOfferingDeployed.whitelist(investors[0]);
                // assert.isFalse(firstInvestorStatus);
            })

            it('What happens when someone contributes, but then gets blacklisted?', async function () {
            });


            it('Someone who contributes twice should have no problem doing so ', async function () {
            });


            it('Should  make sure Calculate bonus rate works with day three removed', async function () {
            });

            it('should allow Multiple users to properly buy tokens for all three bonus periods', async function () {
            });

            it('Cant buy before start time', async function () {
                await tokenOfferingDeployed.setBlockTimestamp(startTime + duration.days(-1));

                let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investor);
                assert.isFalse(firstInvestorStatus);

                await tokenOfferingDeployed.whitelistAddresses([investor], true);
                let balance = await tokenDeployed.balanceOf(investor);
                assert.equal(balance.toNumber(), 0);

                const value = web3.toWei(1, 'ether');
                await assertFail(async function(){ await tokenOfferingDeployed.sendTransaction({ from: investor, value: value })});
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
                await assertFail(async function(){ await tokenOfferingDeployed.sendTransaction({ from: investor, value: value })});
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

            it('The refund process works (go more in depth, this is more tests. they have also tested this', async function () {
            });

            it('The finalize process works (go more in depth, this is more tests. they have also tested this', async function () {
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
                await assertFail(async function () {await tokenOfferingDeployed.calculateBonusRate({from: investor})});
                await assertFail(async function () {await tokenOfferingDeployed.ethToTokens(500, {from: investor})});
                await assertFail(async function () {await tokenOfferingDeployed.forwardFunds(500, {from: investor})});
                await assertFail(async function () {await tokenOfferingDeployed.checkFinalize({from: investor})});
                await assertFail(async function () {await tokenOfferingDeployed.validPurchase({from: investor})});
                await assertFail(async function () {await tokenOfferingDeployed.hasEnded({from: investor})});
                await assertFail(async function () {await tokenOfferingDeployed.getBlockTimestamp({from: investor})});
                await assertFail(async function () {await tokenOfferingDeployed.finalize({from: investor})});

                //calling from Owner
                await assertFail(async function () {await tokenOfferingDeployed.calculateBonusRate()});
                await assertFail(async function () {await tokenOfferingDeployed.ethToTokens(500)});
                await assertFail(async function () {await tokenOfferingDeployed.forwardFunds(500)});
                await assertFail(async function () {await tokenOfferingDeployed.checkFinalize()});
                await assertFail(async function () {await tokenOfferingDeployed.validPurchase()});
                await assertFail(async function () {await tokenOfferingDeployed.hasEnded()});
                await assertFail(async function () {await tokenOfferingDeployed.getBlockTimestamp()});
                await assertFail(async function () {await tokenOfferingDeployed.finalize()});
            });
        });
    });
});


/* stuff to test

global variables
allocations cant go negative ****see note but done
Pausing (different test.......)


constructor PolyMathTokenOffering()
check the 5 requires for PolymathTokenOffering %%%%%




fallback()
buytokens() - see buy tokens

calculateBonusRate()
day 1 works
day 2 works
aftterworks it works
day 3 removed


whitelistAddress()
we can whitelist
we can blacklist
we can switch 


ethToTokens()
returns the correct amount from calculateBonusRate *** is within buyTokens, 

buytokens()
buytokens only works  during contribute time, then failes
buy tokesn only for whitelist
buytokens has beneficiary thing work
remaining to fund works
weiReturn works
forwardFunds() - returns wei appropriately 
issueTokens() (external call) - works
checkFinalize() - checks properly 
cap
weiRaised

forwardFunds()
sends ether to the wallet correctly 

checkFinalize()
hasended() returns correctly
finalize() runs

validPurchase()
runs if not finalized
stops if finalized
returns true when it should be a vliad purchase
does not when it is done
properly ends on the final purchase that would trigger an end

hasended()
will return false if cap reached
will return false if time ended
will return true otherwise

getBlockTimeStamp()%%%%%

emergencyfinalize()%%%%%
finalize()

finalize()
will not run if it is finalzed
will finalize only when it should
will unpause the token
when finalized it is done finalizing

internal tests%%%%
calculateBonusRate
ethToTokens
forwardFunds
checkFinalize
validPurchase
hasEnded
getBlockTimestamp
Finalize

onlyOwner%%%%
emergencyFinalize
whitelist

extra tests 
integer overflow stuff, assert vs. revert vs. require





stuff i need to test but not sure how yet



stuff I might test

events work


QUESTIONS
- can calculateBonusRate be internal? 

*/