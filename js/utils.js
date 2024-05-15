'use strict'

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function getRandomIndex() {
    var randomI = getRandomInt(0, gLevel.size)
    var randomJ = getRandomInt(0, gLevel.size)
    var idx = { randomI, randomJ }
    return idx
}

