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
            describe('Workflow of the buyTokens function', async function () {

                it('Allocations cant go negative. But it currently does nothing because it appears to be designed for presale, which I am planning on splitting into another contract', async function () {
                });

                it('Should fail, since PolyMathTokenOffering.sol is the owner, but has no way to call setOwner in PolyMathToken.sol', async function () {
                    // let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investors[0]);
                    // assert.isFalse(firstInvestorStatus);

                    // await tokenOfferingDeployed.whitelistAddresses([investor], true);
                    // let balance = await tokenDeployed.balanceOf(investor);
                    // assert.equal(balance.toNumber(), 0);

                    // const value = web3.toWei(1, 'ether');
                    // await tokenOfferingDeployed.sendTransaction({ from: investor, value: value });
                    // balance = await tokenDeployed.balanceOf(investor);
                    // assert.equal(balance.toNumber(), 1200 * 10 ** DECIMALS, 'balanceOf is 1200 for investor who just bought tokens');

                    // let currentOwnerBalance = await tokenDeployed.balanceOf(tokenOfferingDeployed.address);
                    await assertFail(async function () {
                        await tokenDeployed.setOwner("0x2718C59E08Afa3F8b1EaA0fCA063c566BA4EC98B", { from: tokenOfferingDeployed.address });
                    });
                });
            })

            // it('Address(0) should fail if called by buyTokens', async function () {
            //     let firstInvestorStatus = await tokenOfferingDeployed.whitelist(investors[0]);
            //     assert.isFalse(firstInvestorStatus);

            //     await tokenOfferingDeployed.whitelistAddresses([investor], true);
            //     let balance = await tokenDeployed.balanceOf(investor);
            //     assert.equal(balance.toNumber(), 0);

            //     const value = web3.toWei(1, 'ether');
            //     await assertFail(async function () {
            //         await tokenOfferingDeployed.sendTransaction({ from: '0x', value: value });
            //     });

            // });
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
returns the correct amount from calculateBonusRate

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

getBlockTimeStamp()

emergencyfinalize()
finalize()

finalize()
will not run if it is finalzed
will finalize only when it should
will unpause the token
when finalized it is done finalizing

internal tests
valid purchase
ethToTokens
hasEnded
getBlockTimestamp
finalize
forwardfunds
checkFInalize?

onlyOwner
emergencyFinalize
whitelist

extra tests 
integer overflow stuff





stuff i need to test but not sure how yet



stuff I might test

events work


*/