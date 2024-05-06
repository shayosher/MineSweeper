'use strict'

const EMPTY = ''
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
    size: 4,
    mines: 2,
    forVictory: 14
}
var gTimerInterval

function onInit() {

    restartTimer()
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    }
    gBoard = buildBoard()
    // setMinesLocations()
    // setMinesNegsCount()
    renderBoard()

    handelSmiley(NORMAL)
    handelShownCount()
    handelMarkedCount()
    renderLives()
}

function buildBoard() {
    const size = gLevel.size
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
    return board
}

function setMinesLocations() {
    for (var i = 0; i < gLevel.mines; i++) {
        var idx = getRandomIndex()
        if (gBoard[idx.randomI][idx.randomJ].isMine === false) gBoard[idx.randomI][idx.randomJ].isMine = true
        else i--
    }
}

function setMinesNegsCount() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].minesAroundCount = countNegsMines(i, j)
        }
    }
}

function countNegsMines(cellI, cellJ) {
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === cellI && j === cellJ) continue
            const currCell = gBoard[i][j]
            if (currCell.isMine) neighborsCount++;
        }
    }
    return neighborsCount
}

function renderBoard() {
    var strHTML = ''
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = ""
            const className = `cell cell-${i}-${j}`
            strHTML += `<td class="${className}" onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(event,${i},${j})"></td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    const cell = gBoard[i][j]

    if (gGame.shownCount === 0) {
        handelFirstClick(elCell, i, j)
        return
    }

    if (cell.isMarked) return
    if (cell.isShown) return

    if (cell.isMine) {
        elCell.innerHTML = MINE //renderCell({ i, j }, MINE)
        elCell.classList.add("cell-isClicked")
        reduceLives()
        checkGameOver(elCell)
    }
    else {
        expandShown(i, j)
    }
    checkVictory()
}

function handelFirstClick(elCell, i, j) {

    const cell = gBoard[i][j]


    gGame.shownCount++
    handelShownCount()
    startTimer()

    cell.isShown = true
    elCell.classList.add("cell-isClicked")

    setMinesLocations()
    setMinesNegsCount()

    onCellClicked(elCell, i, j)
}


function expandShown(cellI, cellJ) {

    const currCell = gBoard[cellI][cellJ]

    if (currCell.isMarked) return
    if (currCell.isShown) return
    if (currCell.isMine) return

    currCell.isShown = true
    gGame.shownCount++
    handelShownCount()
    // startTimer()

    const elNewCell = document.querySelector(`.cell-${cellI}-${cellJ}`)
    elNewCell.innerHTML = currCell.minesAroundCount
    elNewCell.classList.add("cell-isClicked")
    getNumberStyleClass(currCell, elNewCell)

    if (currCell.minesAroundCount === 0) {
        elNewCell.innerHTML = EMPTY // renderCell({ cellI, cellJ }, EMPTY)

        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gBoard[i].length) continue;
                if (i === cellI && j === cellJ) continue
                expandShown(i, j)
            }
        }
    }
}


function onCellMarked(event, i, j) {
    event.preventDefault()
    if (!gGame.isOn) return

    const cell = gBoard[i][j]
    if (cell.isShown === true) return

    if (cell.isMarked) {
        cell.isMarked = false
        gGame.markedCount--
        renderCell({ i, j }, '')
        handelMarkedCount()
    } else {
        cell.isMarked = true
        gGame.markedCount++
        renderCell({ i, j }, FLAG)
        handelMarkedCount()
    }
}

function checkGameOver(elCell) {
    renderLives()
    if (!gGame.lives) { //(gGame.lives === 0)
        elCell.style.backgroundColor = 'red'
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                if (gBoard[i][j].isMine === true) {
                    renderCell({ i, j }, MINE)
                    elCell.classList.add("cell-isClicked")
                }
            }
        }
        gameOver()
    }
}

function renderLives() {
    var livesStr = ''
    for (let i = 0; i < gGame.lives; i++) {
        livesStr += '❤️'
    }
    document.querySelector('.lives').innerText = `${livesStr} ${gGame.lives}`
}

function reduceLives() {
    gGame.lives--
    renderLives()
}

function startTimer() {
    if (gGame.shownCount === 1) {
        var startTime = Date.now()
        clearInterval(gTimerInterval)
        gTimerInterval = setInterval(() => {
            const timeDiff = Date.now() - startTime
            const seconds = getSeconds(timeDiff)
            const minutes = getMinutes(timeDiff)
            document.querySelector('.seconds').innerText = seconds
            document.querySelector('.minutes').innerText = minutes
        }, 1000)
    }
}

function getSeconds(timeDiff) {
    const seconds = new Date(timeDiff).getSeconds()
    return (seconds + '').padStart(2, '0')
}

function getMinutes(timeDiff) {
    const minutes = new Date(timeDiff).getMinutes()
    return (minutes + '').padStart(2, '0')
}

function restartTimer() {
    clearInterval(gTimerInterval)
    document.querySelector('.minutes').innerText = '00'
    document.querySelector('.seconds').innerText = '00'
}

function checkVictory() {
    if (gGame.shownCount === gLevel.forVictory && gGame.markedCount === gLevel.mines) {
        restartTimer()
        handelSmiley(WIN)
        gGame.isOn = false
    }
}

function gameOver() {
    restartTimer()
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
            gLevel.size = 4
            gLevel.mines = 2
            gLevel.forVictory = 14
            break
        case (8):
            gLevel.size = 8
            gLevel.mines = 14
            gLevel.forVictory = 50
            break
        case (12):
            gLevel.size = 12
            gLevel.mines = 32
            gLevel.forVictory = 112
            break
    }
    onInit()
}

function restart() {
    onInit()
}

function renderCell(location, value) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

