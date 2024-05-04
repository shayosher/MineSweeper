'use strict'

const EMPTY = ' '
const MINE = '💥'
const FLAG = '🔻'

var gBoard
var gLevel = { SIZE: 4, MINES: 2 }
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 }

function onInit() {
    gBoard = buildBoard()
    setMinesNegsCount()
    renderBoard()

}

function buildBoard() {
    const size = gLevel.SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = { minesAroundCount: 4, isShown: false, isMine: false, isMarked: false }
        }
    }

    for (var i = 0; i < gLevel.MINES; i++) {
        var idx = getRandomIdx()
        if (board[idx.randomI][idx.randomJ].isMine === false) board[idx.randomI][idx.randomJ].isMine = true
        else i--
    }
    return board
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            cell.minesAroundCount = countMines(i, j, gBoard)
        }
    }
}

function renderBoard() {
    var strHTML = ''
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gBoard[i].length; j++) {
            strHTML += `<td class="cell cell-${i}-${j}" onclick="onCellClicked(this, ${i}, ${j})"></td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {

    elCell.classList.add("cell-isClicked")

    const cell = gBoard[i][j]

    if (cell.isMine) elCell.innerHTML = MINE
    else {
        elCell.innerHTML = cell.minesAroundCount
        if (cell.minesAroundCount === 0) {
            elCell.innerHTML = EMPTY
            expandShown(i, j)
        }
    }

    getNumberStyleClass(cell, elCell)
}

function onCellMarked(elCell) { }

function checkGameOver() { }

function expandShown(cellI, cellJ) {

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === cellI && j === cellJ) continue
            const currCell = gBoard[i][j]
            const elNewCell = document.querySelector(`.cell-${i}-${j}`)

            // if (!currCell.isMine) onCellClicked(elNewCell, i, j) // רקורסיה עמוקה עם קריאות הולכות וגדלות

            if (!currCell.isMine) { //לכן רק מסביב
                elNewCell.classList.add("cell-isClicked")
                elNewCell.innerHTML = currCell.minesAroundCount
                if (currCell.minesAroundCount === 0) {
                    elNewCell.innerHTML = EMPTY
                }
                getNumberStyleClass(currCell, elNewCell)
            }
        }
    }

}

function onLevelBtn(value) {
    switch (value) {
        case (4):
            gLevel.SIZE = 4
            gLevel.MINES = 2
            break
        case (8):
            gLevel.SIZE = 8
            gLevel.MINES = 14
            break
        case (12):
            gLevel.SIZE = 12
            gLevel.MINES = 32
            break
    }
    onInit()
}