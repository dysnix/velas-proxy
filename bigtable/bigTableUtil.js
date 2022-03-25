const {Bigtable} = require('@google-cloud/bigtable');
const bigtable = new Bigtable();

async function saveBlock (object) {

}

async function saveLog (object) {

}

async function saveReceipt (object) {

}

async function readBlock (id) {

}

async function readLog (id) {

}

async function readReceipt (id) {

}

async function checkRequestTime (id) {
    const requestTime = id * 0.4;
    const currTime = new Date().getSeconds();
    const createdTime = new Date(1970, 0, 1).setSeconds(currTime - requestTime);
    const twoWeeksAgo = new Date().getDate() - 14;
    return twoWeeksAgo < createdTime;
}

module.exports = { saveBlock, saveLog, saveReceipt, readBlock, readLog, readReceipt, checkRequestTime }