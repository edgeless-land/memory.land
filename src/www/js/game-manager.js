const API = "https://memory.edgeless.land/api";

window.addEventListener("DOMContentLoaded", () => {
    // Variables
    let menu = document.querySelector("#menu");
    let initials_input = document.querySelector("#initials");
    let leaderboard = document.querySelector("#leaderboard");
    let leaderboard_scores = document.querySelector("#leaderboard-scores");
    let game_board = document.querySelector("memory-board");
    let lives_div = document.querySelector("#lives");
    let score_text = document.querySelector("#score");

    let lives_icons = [];
    let lives = 3;
    let max_lives = 3;
    let score = 0;
    let round = 0;

    let initials = "unkn";

    let difficulty = {
        scale: 3,
        size: 3,
        size_max: 6,
        answers: 3,
        answers_max: 20,
        preview_time: 750,
    };
    let difficulty_defaults = {
        scale: 3,
        size: 3,
        size_max: 6,
        answers: 3,
        answers_max: 20,
        preview_time: 750,
    };

    // Functions
    function updateScore(change) {
        score += change;
        score_text.innerText = score;
    }

    // Reset game state
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

    async function refreshLeaderboard() {
        let req = await fetch(API + "/leaderboard/?amount=20");
        let scores = await req.json();
        
        leaderboard_scores.innerHTML = "";
        for (const score of scores) {
            let item = document.createElement("li");
            item.innerText = `${score.user.initials} - ${score.score}`;

            leaderboard_scores.appendChild(item);
        }
    }

    // Show the game board and related stats
    function gameScreen() {
        menu.classList.add("hidden");
        leaderboard.classList.add("hidden");
        score_text.classList.remove("hidden");
        lives_div.classList.remove("hidden");
        game_board.classList.remove("hidden");
    }

    // Show the menu
    function menuScreen() {
        refreshLeaderboard();

        menu.classList.remove("hidden");
        initials_input.value = "";
        leaderboard.classList.remove("hidden");
        score_text.classList.add("hidden");
        lives_div.classList.add("hidden");
        game_board.classList.add("hidden");
    }

    function menuStart() {
        // Get initials
        if (!initials_input.checkValidity()) {
            alert("Please enter 3-5 letters for your initials.");
            return;
        }

        initials = initials_input.value;
        // Reset the game state
        initGame();
        // Show the game board
        gameScreen();
    }

    // Start the game on button click
    menu.querySelector("#start-game").addEventListener("click", () => {
        menuStart();
    });
    initials_input.addEventListener("keypress", (e) => {
        if (e.keyCode != 13) return;
        menuStart();
    });


    // Listen for every time the player presses an incorrect answer
    game_board.addEventListener("card-incorrect", () => {
        // Remove a life for pressing an incorrect card
        lives--;

        // If game over
        if (lives === 0) {
            // Lock the game board and show the answers
            game_board.lock();
            game_board.showAnswers();

            // Do a short delay before returning to the menu
            setTimeout(async () => {
                // Submit the score to the leaderboard
                fetch(
                    `${API}/leaderboard/?score=${score}&initials=${initials}`,
                    {
                        method: "PUT",
                    }
                )
                .then(() => {
                    refreshLeaderboard();
                })
                .catch((err) => {
                    console.err(err);
                });

                // Return to menu
                menuScreen();
            }, 1500);
        }

        // Update the lives icons
        lives_icons[lives].classList.add("lost");
        lives_icons[lives].innerHTML = "heart_broken";
    })

    // Listen for every time the player presses a correct answer
    game_board.addEventListener("card-correct", () => {
        updateScore(1);
    });

    // Listen for every time the player finishes a round/board
    game_board.addEventListener("game-won", () => {
        // Give extra points for finishing a round
        updateScore(difficulty.size + difficulty.answers);

        // Increase the difficulty
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

        // Start the next round after a short delay
        setTimeout(() => {
            game_board.createGame(difficulty.size, difficulty.answers);
            setTimeout(() => {
                game_board.previewAnswers(difficulty.preview_time);
            }, 100);
        }, 250);
    });

    // Show the menu on page load
    menuScreen();
});
