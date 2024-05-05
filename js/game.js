'use strict'

const EMPTY = ' '
const MINE = '💥'
const FLAG = '🚩'
const NORMAL = '😃'
const DEAD = '🤯'
const WIN = '😎'
const SHOWN = '👁‍🗨'
const MARKED = '🚩'
const HINT_IMG = '<img src="img/hint.png">'

var gGame
var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2,
    forVictory: 14
}
var gTimerInterval

function onInit() {

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    }

    gBoard = buildBoard()
    setMinesNegsCount()
    renderBoard()

    stopTimerInterval()
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.lives = 3
    gGame.isOn = true

    handelSmiley(NORMAL)
    handelShownCount()
    handelMarkedCount()
    handelLives()
    handelTimer()
}

function buildBoard() {
    const size = gLevel.SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
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
            strHTML += `<td class="cell cell-${i}-${j}" onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(event,this,${i},${j})"></td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {

    const cell = gBoard[i][j]

    if (cell.isMarked === true) return

    cell.isShown = true

    elCell.classList.add("cell-isClicked")

    if (cell.isMine) {
        elCell.innerHTML = MINE
        gGame.lives--
        gLevel.MINES--
        handelLives(elCell)
    }
    else {
        elCell.innerHTML = cell.minesAroundCount

        gGame.shownCount++
        handelShownCount()
        if (cell.minesAroundCount === 0) {
            elCell.innerHTML = EMPTY
            expandShown(i, j)
        }
    }

    getNumberStyleClass(cell, elCell)
}

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

                currCell.isShown = true
                gGame.shownCount++
                handelShownCount()
                getNumberStyleClass(currCell, elNewCell)
            }
        }
    }

}

function onCellMarked(event, elCell, i, j) {

    event.preventDefault()

    const cell = gBoard[i][j]

    if (cell.isShown === true) return

    if (event.button === 2) {
        if (cell.isMarked === true) {
            cell.isMarked = false
            elCell.innerHTML = ''
            gGame.markedCount--
            handelMarkedCount()
            return
        }
        cell.isMarked = true
        elCell.innerHTML = FLAG
        gGame.markedCount++
        handelMarkedCount()
    }
}

function handelLives(elCell) {
    const elLives = document.querySelector('.lives').innerText = gGame.lives
    if (gGame.lives === 0) {
        elCell.style.backgroundColor = 'red'
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                if (gBoard[i][j].isMine === true) {
                    gBoard[i][j].isShown === true

                    var elCell = document.querySelector(`.cell-${i}-${j}`)
                    elCell.classList.add("cell-isClicked")
                    elCell.innerHTML = MINE
                }
            }
        }

        gameOver()
    }


}

function handelTimer() {
    var start = Date.now()
    var elTime = document.querySelector('.time')

    gTimerInterval = setInterval(() => {
        const diff = Date.now() - start
        const secs = parseInt(diff / 1000)
        gGame.secsPassed = secs
        elTime.innerText = gGame.secsPassed
    })
}

function stopTimerInterval() {
    clearInterval(gTimerInterval)
}

function checkVictory() {
    if (gGame.shownCount === gLevel.SIZE ** 2 && gGame.markedCount === gLevel.MINES) {
        stopTimerInterval()
        handelSmiley(WIN)
        gGame.isOn = false
    }
}

function gameOver() {
    stopTimerInterval()
    handelSmiley(DEAD)
    gGame.isOn = false
}

function handelSmiley(state) {
    document.querySelector('.smiley').innerText = state
}

function handelShownCount() {
    document.querySelector('.isShown').innerText = `${SHOWN}${gGame.shownCount}`
}
function handelMarkedCount() {
    document.querySelector('.isMarked').innerText = `${MARKED}${gGame.markedCount}`
}

function onLevelBtn(value) {
    switch (value) {
        case (4):
            gLevel.SIZE = 4
            gLevel.MINES = 2
            gLevel.forVictory = 14
            break
        case (8):
            gLevel.SIZE = 8
            gLevel.MINES = 14
            gLevel.forVictory = 50
            break
        case (12):
            gLevel.SIZE = 12
            gLevel.MINES = 32
            gLevel.forVictory = 112
            break
    }
    onInit()
}

function restart() {
    onInit()
}