window.addEventListener("DOMContentLoaded", () => {
    // Variables
    let menu = document.querySelector("#menu");
    let game_board = document.querySelector("memory-board");
    let lives_div = document.querySelector("#lives");
    let score_text = document.querySelector("#score");

    let lives_icons = [];
    let lives = 3;
    let max_lives = 3;
    let score = 0;
    let round = 0;

    let difficulty = {
        scale: 3,
        size: 3,
        size_max: 7,
        answers: 3,
        answers_max: 20,
        preview_time: 750,
    };
    let difficulty_defaults = {
        scale: 3,
        size: 3,
        size_max: 7,
        answers: 3,
        answers_max: 20,
        preview_time: 750,
    };

    // Functions
    function updateScore(change) {
        score += change;
        score_text.innerText = score;
    }

    function initGame() {
        lives = max_lives;
        round = 0;
        difficulty = {
            ...difficulty_defaults,
        };
        score = 0;
        updateScore(0);

        game_board.createGame(difficulty.size, difficulty.answers);
        setTimeout(() => {
            game_board.previewAnswers(difficulty.preview_time);
        }, 100);

        lives_icons = [];
        let icons = document.querySelector("#lives");
        icons.innerHTML = "";
        for (let i = 0; i < lives; i++) {
            let icon = document.createElement("span");
            icon.classList.add("material-icons");
            icon.classList.add("life");
            icon.innerText = "favorite";

            lives_icons.push(icon);
            icons.appendChild(icon);
        }
    }

    function gameScreen() {
        menu.classList.add("hidden");
        score_text.classList.remove("hidden");
        lives_div.classList.remove("hidden");
        game_board.classList.remove("hidden");
    }

    function menuScreen() {
        menu.classList.remove("hidden");
        score_text.classList.add("hidden");
        lives_div.classList.add("hidden");
        game_board.classList.add("hidden");
    }

    // Logic

    // == Event listeners
    menu.querySelector("#start-game").addEventListener("click", () => {
        gameScreen();
        initGame();
    });

    game_board.addEventListener("card-incorrect", () => {
        lives--;
        if (lives === 0) {
            game_board.lock();
            game_board.showAnswers();

            setTimeout(() => {
                menuScreen();
            }, 1500);
        }

        lives_icons[lives].classList.add("lost");
        lives_icons[lives].innerHTML = "heart_broken";
    })

    game_board.addEventListener("card-correct", () => {
        updateScore(1);
    });

    game_board.addEventListener("game-won", () => {
        updateScore(difficulty.size + difficulty.answers);

        round += 1;
        if (round % 3 === 0) {
            round += 1;
            difficulty.scale += 1;

            if (difficulty.scale % 2 === 0 && difficulty.size < difficulty.size_max) {
                difficulty.size += 1;
            }

            if (difficulty.scale % 3 && difficulty.answers < difficulty.answers_max) {
                difficulty.answers += 1 + Math.max(0, difficulty.scale - 5);
            }
        }

        setTimeout(() => {
            game_board.createGame(difficulty.size, difficulty.answers);
            setTimeout(() => {
                game_board.previewAnswers(difficulty.preview_time);
            }, 100);
        }, 250);
    });

    menuScreen();
});
