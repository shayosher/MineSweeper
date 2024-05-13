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
var gManuallyMinesMode
var gManuallyMinesModeStartGame
var gCountMines

function onInit() {

    gManuallyMinesMode = false
    gManuallyMinesModeStartGame = false

    restartTimer()
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: gLevel.mines > 2 ? 3 : 2,
        hintMode: false,
        hintsCount: 3,
        safeClicks: 3
    }
    gBoard = buildBoard()
    renderBoard()

    handelSmiley(NORMAL)
    handelShownCount()
    handelMarkedCount()
    renderLives()
    resHint()
    addBestScore()
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

function setMinesLocations(firstCellI, firstCellJ) {
    for (var i = 0; i < gLevel.mines; i++) {
        var idx = getRandomIndex()
        if (gBoard[idx.randomI][idx.randomJ] === gBoard[firstCellI][firstCellJ]) {
            i--
        }
        else if (gBoard[idx.randomI][idx.randomJ].isMine === false) gBoard[idx.randomI][idx.randomJ].isMine = true
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
            const className = `cell cell-${i}-${j}`
            strHTML += `<td class="${className}" onclick="onCellClicked(this,${i},${j}),userSetMines(${i},${j})" oncontextmenu="onCellMarked(event, ${i},${j})"></td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (gManuallyMinesMode) return

    const cell = gBoard[i][j]

    if (!gGame.shownCount && !gManuallyMinesModeStartGame) {
        setMinesLocations(i, j)
        setMinesNegsCount()
    }

    if (cell.isMarked) return
    if (cell.isShown) return

    if (gGame.hintMode) {
        handelHint(elCell, i, j)
        return
    }

    if (cell.isMine) {
        elCell.innerHTML = MINE //renderCell({ i, j }, MINE)
        elCell.classList.add("cell-isClicked")
        reduceLives()
        gLevel.mines--
        gLevel.forVictory++
        cell.isShown = true
        gGame.shownCount++
        checkGameOver(elCell)
    }
    else {
        expandShown(i, j)
    }
    checkVictory()
}

function expandShown(cellI, cellJ) {

    const currCell = gBoard[cellI][cellJ]

    if (currCell.isMarked) return
    if (currCell.isShown) return
    if (currCell.isMine) return

    currCell.isShown = true
    gGame.shownCount++
    handelShownCount()
    startTimer()

    const elCell = document.querySelector(`.cell-${cellI}-${cellJ}`)
    elCell.innerHTML = currCell.minesAroundCount
    elCell.classList.add("cell-isClicked")
    getNumberStyleClass(currCell, elCell)

    if (currCell.minesAroundCount === 0) {
        elCell.innerHTML = EMPTY // renderCell({ cellI, cellJ }, EMPTY)

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
    if (gManuallyMinesMode) return

    const cell = gBoard[i][j]
    if (cell.isShown) return

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
        checkVictory()
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

function handelHint(elCell, cellI, cellJ) {

    if (!gGame.shownCount) return
    if (gBoard[cellI][cellJ].isMarked) return
    if (gBoard[cellI][cellJ].isShown) return

    if (gBoard[cellI][cellJ].isMine) elCell.innerHTML = MINE
    else if (gBoard[cellI][cellJ].minesAroundCount === 0) elCell.innerHTML = EMPTY
    else elCell.innerHTML = gBoard[cellI][cellJ].minesAroundCount


    elCell.classList.add("cell-isClicked")
    getNumberStyleClass(gBoard[cellI][cellJ], elCell)

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === cellI && j === cellJ) continue
            if (gBoard[i][j].isMarked) continue

            const elNewCell = document.querySelector(`.cell-${i}-${j}`)

            if (gBoard[i][j].isMine) elNewCell.innerHTML = MINE
            else if (gBoard[i][j].minesAroundCount === 0) elNewCell.innerHTML = EMPTY
            else elNewCell.innerHTML = gBoard[i][j].minesAroundCount


            elNewCell.classList.add("cell-isClicked")
            getNumberStyleClass(gBoard[i][j], elNewCell)

            // setTimeout(() => {
            //     elCell.innerHTML = EMPTY
            //     elCell.classList.remove("cell-isClicked")

            //     elNewCell.innerHTML = EMPTY
            //     elNewCell.classList.remove("cell-isClicked")
            // }, 1000)
        }
    }

    setTimeout(() => {

        elCell.innerHTML = EMPTY
        elCell.classList.remove("cell-isClicked")

        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gBoard[i].length) continue;
                if (i === cellI && j === cellJ) continue
                if (gBoard[i][j].isMarked) continue
                if (gBoard[i][j].isShown) continue

                const elNewCell = document.querySelector(`.cell-${i}-${j}`)

                elNewCell.innerHTML = EMPTY
                elNewCell.classList.remove("cell-isClicked")

            }
        }
    }, 1000)

    gGame.hintMode = false
}

function onHintBtn(elHint) {

    if (!gGame.shownCount) return
    if (gGame.hintsCount === 0) return

    gGame.hintsCount--
    elHint.innerHTML = '<img src="img/bulbOn.jpg">'
    gGame.hintMode = true
}
function resHint() {
    const elHints = document.querySelectorAll('.ints button')
    for (let i = 0; i < elHints.length; i++) {
        elHints[i].innerHTML = '<img src="img/bulbOff.png">'
    }
}

function handelSmiley(state) {
    document.querySelector('.smiley-btn').innerText = state
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
    gGame.isOn = false
    gManuallyMinesMode = false
    clearInterval(gTimerInterval)
    onInit()
}


function checkGameOver(elCell) {
    renderLives()
    if (!gGame.lives) { //(gGame.lives === 0)
        revealAllMines(elCell)
        gameOver()
    }
}

function revealAllMines(elCell) {
    elCell.style.backgroundColor = 'red'
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine === true) {
                renderCell({ i, j }, MINE)
                elCell.classList.add("cell-isClicked")
            }
        }
    }
}

function gameOver() {
    clearInterval(gTimerInterval)
    handelSmiley(DEAD)
    gManuallyMinesMode = false
    gGame.isOn = false
}

function restart() {
    gGame.isOn = false
    gManuallyMinesMode = false
    if (gLevel.size === 4) {
        gLevel.mines = 2
        gLevel.forVictory = 14
    }

    if (gLevel.size === 8) {
        gLevel.mines = 14
        gLevel.forVictory = 50
    }

    if (gLevel.size === 12) {
        gLevel.mines = 32
        gLevel.forVictory = 112
    }

    onInit()
}

function checkVictory() {
    if (gGame.shownCount === gLevel.forVictory && gGame.markedCount === gLevel.mines) {
        clearInterval(gTimerInterval)

        const minutes = +document.querySelector('.minutes').innerText
        const seconds = +document.querySelector('.seconds').innerText
        const time = { minutes, seconds }

        if (gLevel.size === 4) {
            const bestMin = localStorage.getItem("score16Min")
            const bestSec = localStorage.getItem("score16Sec")
            if (!bestMin || time.minutes < bestMin) {
                localStorage.setItem("score16Min", time.minutes)
                localStorage.setItem("score16Sec", time.seconds)
            }
            if (time.minutes === bestMin) {
                if (time.seconds < bestSec) {
                    localStorage.setItem("score16Min", time.minutes)
                    localStorage.setItem("score16Sec", time.seconds)
                }
            }
        }

        if (gLevel.size === 8) {
            const bestMin = localStorage.getItem("score64Min")
            const bestSec = localStorage.getItem("score64Sec")
            if (!bestMin || time.minutes < bestMin) {
                localStorage.setItem("score64Min", time.minutes)
                localStorage.setItem("score64Sec", time.seconds)
            }
            if (time.minutes === bestMin) {
                if (time.seconds < bestSec) {
                    localStorage.setItem("score64Min", time.minutes)
                    localStorage.setItem("score64Sec", time.seconds)
                }
            }
        }

        if (gLevel.size === 12) {
            const bestMin = localStorage.getItem("score144Min")
            const bestSec = localStorage.getItem("score144Sec")
            if (!bestMin || time.minutes < bestMin) {
                localStorage.setItem("score144Min", time.minutes)
                localStorage.setItem("score144Sec", time.seconds)
            }
            if (time.minutes === bestMin) {
                if (time.seconds < bestSec) {
                    localStorage.setItem("score144Min", time.minutes)
                    localStorage.setItem("score144Sec", time.seconds)
                }
            }
        }

        handelSmiley(WIN)
        addBestScore()
        gManuallyMinesMode = false
        gGame.isOn = false
    }
}
function addBestScore() {

    document.querySelector(".score16Best").innerText = (localStorage.getItem("score16Min") + ':' + localStorage.getItem("score16Sec"))
    document.querySelector(".score64Best").innerText = (localStorage.getItem("score64Min") + ':' + localStorage.getItem("score64Sec"))
    document.querySelector(".score144Best").innerText = (localStorage.getItem("score144Min") + ':' + localStorage.getItem("score144Sec"))
}

function renderCell(location, value) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}



function onManuallyMines() {
    if (gGame.shownCount) return
    if (gManuallyMinesMode) return
    gManuallyMinesMode = true
    gManuallyMinesModeStartGame = true
    gCountMines = 0
    console.log(1);
}

function renderManuallyMinesFitback() {
    var htmlStr
    if (!(gLevel.mines - gCountMines)) {
        htmlStr = `Mines sre set! Start Playing!`
    } else {
        htmlStr = `${gLevel.mines - gCountMines} mines to position`
    }
    const elRemainMines = document.querySelector('.remain-mines span')
    elRemainMines.innerHTML = htmlStr
}

function userSetMines(i, j) {
    if (!gManuallyMinesMode) return

    const clickedCell = gBoard[i][j]
    clickedCell.isMine = true
    gCountMines++
    renderManuallyMinesFitback()

    if (gCountMines === gLevel.mines) {
        setTimeout(() => {
            gManuallyMinesMode = false
            gCountMines = 0
            setMinesNegsCount()
        }, 300)
    }

}