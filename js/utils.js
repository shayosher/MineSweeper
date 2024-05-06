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

function getNumberStyleClass(cell, elCell) {
    if (cell.minesAroundCount === 1) elCell.classList.add("one")
    else if (cell.minesAroundCount === 2) elCell.classList.add("two")
    else if (cell.minesAroundCount === 3) elCell.classList.add("three")
    else if (cell.minesAroundCount >= 4) elCell.classList.add("four")
}