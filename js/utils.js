'use strict'

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function getRandomIdx() {
    var randomI = getRandomInt(0, gLevel.SIZE)
    var randomJ = getRandomInt(0, gLevel.SIZE)
    var idx = { randomI, randomJ }
    return idx
}

function countMines(cellI, cellJ, board) {
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue
            const currCell = board[i][j]
            if (currCell.isMine) neighborsCount++;
        }
    }
    return neighborsCount
}

function getNumberStyleClass(cell, elCell) {
    if (cell.minesAroundCount === 1) elCell.classList.add("one")
    else if (cell.minesAroundCount === 2) elCell.classList.add("two")
    else if (cell.minesAroundCount === 3) elCell.classList.add("three")
    else if (cell.minesAroundCount >= 4) elCell.classList.add("four")
}