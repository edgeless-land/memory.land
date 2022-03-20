const API = "https://memory.edgeless.land/api";

async function refreshBoard() {
    let scores_list = document.querySelector("#scores");
    
    let scores_req = await fetch(API + "/leaderboard/?amount=100");
    let scores = await scores_req.json();
    
    scores_list.innerHTML = "";
    for (let score of scores) {
        let score_item = document.createElement("li");
        score_item.innerText = `${score.user.initials} - ${score.score}`;
        scores_list.appendChild(score_item);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    refreshBoard();
    setInterval(refreshBoard, 10000);
});