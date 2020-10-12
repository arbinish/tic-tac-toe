document.addEventListener('DOMContentLoaded', () => {
    console.log('loaded')
    const board = document.querySelector('#container')
    const resetButton = document.querySelector('nav button.reset')
    const autoBot = document.querySelector('.autobot')
    const settings = document.querySelector('.settings')
    const modalClose = document.querySelector('.modal .close')
    const modalSave = document.querySelector('.modal .save-modal')
    const settingsModal = document.querySelector('.modal')

    let turn = 0
    let gameOver = false
    let imageList = ["✓", "✗"]
    let markerId = ["tick", "cross"]
    let middlePos = [1, 4, 7]
    let winningStrategies = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]
    let players = ['player1', 'player2']

    function setRandomUsers() {
        if (Math.floor(Math.random() * 2) === 0) {
            sessionStorage.setItem('players', JSON.stringify(['Ayan', 'Eesha']))
        } else {
            sessionStorage.setItem('players', JSON.stringify(['Eesha', 'Ayan']))
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    window.demo = async () => {
        // demo mode
        let cells = document.querySelectorAll('.cell')
        let seen = []
        if (cells.length === 0) {
            console.log('nothing to do')
            return
        }
        console.log('demo mode', cells.length)
        while (gameOver == false) {
            let pos = Math.floor(Math.random() * cells.length)
            if (seen.indexOf(pos) >= 0) {
                continue
            }
            seen.push(pos)
            let delay = Math.random() * (1200-500) + 500
            await(sleep(delay))
            cells[pos].click()
        }
    }
    window.reset = () => {
        resetButton.click()
    }

    function initBoard() {
        clearBoard()
        turn = 0
        players = JSON.parse(sessionStorage.getItem('players')) || ['player-1', 'player-2']
        for (let i = 0; i < 9; i++) {
            let div = document.createElement('div')
            if (i < 6) {
                div.style.borderBottom = '2px solid black'
            }
            if (middlePos.indexOf(i) >= 0) {
                div.style.borderLeft = '2px solid black'
                div.style.borderRight = '2px solid black'
            }
            div.classList.add('cell')
            div.dataset.cellId = i
            board.appendChild(div)
        }
        updateStatus(`${players[0]}'s turn`)
        autoBot.removeAttribute('disabled')
        settings.removeAttribute('disabled')
        gameOver = false
        document.querySelector('div.winner').innerHTML = ''
        resetButton.style.visibility = 'hidden'
    }

    function clearBoard() {
        while (board.firstChild) {
            board.removeChild(board.lastChild)
        }
    }

    function checkWinner(symbol) {
        let selector = `div[data-marker-id="${symbol}"]`
        let positions = Array.prototype.map.call(
            document.querySelectorAll(selector),
            (d) => parseInt(d.dataset.cellId))
        for (p of winningStrategies) {
            if (positions.indexOf(p[0]) >= 0 && positions.indexOf(p[1]) >= 0 && positions.indexOf(p[2]) >= 0) {
                // change face color to green
                for (var idx of p) {
                    document.querySelector(`div[data-cell-id="${idx}"]`).style.color = 'lime'
                }
                return true
            }
        }
        return false
    }

    function showMessage(msg) {
        let div = document.querySelector('div.winner')
        div.innerHTML = `<b>${msg}</b>`
    }

    function updateStatus(msg) {
        const container = document.querySelector('#status')
        container.innerHTML = msg
    }

    function hideModal() {
        settingsModal.style.visibility = 'hidden'
        settings.removeAttribute('disabled')
        document.querySelector('div.black-overlay').remove()
    }

    initBoard()

    autoBot.addEventListener('click', () => {
        autoBot.setAttribute('disabled', true)
        window.demo()
    })

    board.addEventListener('click', (evt) => {
        if (gameOver === true) {
            return
        }
        let target = evt.target
        // ignore clicks on the container and process only cells
        if (target.classList.contains("cell") === false) {
            return
        }
        if (target.dataset.markerId !== undefined) {
            return
        }
        updateStatus(`${players[(turn + 1) % 2]}'s turn`)

        target.dataset.markerId = markerId[turn % 2]
        target.innerHTML = imageList[turn % 2]
        if (checkWinner(markerId[turn % 2])) {
            let player = `player-${turn % 2 + 1}`
            player = `${players[turn % 2]}`
            showMessage(`${player} wins!`)
            gameOver = true
            document.querySelector('button.reset').style.visibility = 'visible'
            return
        }
        turn += 1
        if (turn >= 9) {
            gameOver = true
            document.querySelector('button.reset').style.visibility = 'visible'
            showMessage('Its a Tie!')
            console.log('game over!')
        }
    })

    settings.addEventListener('click', () => {
        settings.setAttribute('disabled', true)
        settingsModal.style.visibility = 'visible'
        let div = document.createElement('div')
        div.classList.add('black-overlay')
        document.body.appendChild(div)

    })

    modalClose.addEventListener('click', () => {
        hideModal()
    })

    modalSave.addEventListener('click', () => {
        let player1 = document.querySelector('.modal .content #player1')
        let player2 = document.querySelector('.modal .content #player2')
        let hasChanged = false

        if (player1.value !== "" && player1.value !== players[0]) {
            players[0] = player1.value
            hasChanged = true
        }
        if (player2.value !== "" && player2.value !== players[1]) {
            players[1] = player2.value
            hasChanged = true
        }
        if (hasChanged === true) {
            sessionStorage.setItem('players', JSON.stringify(players))
            hideModal()
            initBoard()
        }
    })
    resetButton.addEventListener('click', () => {
        initBoard()
    })
});