class MemoryBoard extends HTMLElement {
    // DOM
    #shadow;

    // Game board
    #size = -1;
    #cards = [];
    #answers = [];
    #picked = [];
    #bad_picked = [];

    // Logic
    #locked = false;

    // Style
    options = {
        "card-color": "white",
        "card-color-correct": "green",
        "card-color-incorrect": "red",
    };

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: "closed" });
    }

    static get observedAttributes() {
        return ["card-color", "card-color-correct", "card-color-incorrect"];
    }

    attributeChangedCallback(name, _, newValue) {
        switch (name) {
            case "card-color":
                this.options["card-color"] = newValue;
                break;
            case "card-color-correct":
                this.options["card-color-correct"] = newValue;
                break;
            case "card-color-incorrect":
                this.options["card-color-incorrect"] = newValue;
                break;
        }
    }

    #pickRandomCards(answersAmount, maxCards) {
        let cards = [];
        for (let i = 0; i < maxCards; i++) {
            cards.push(i);
        }

        let answers = [];
        for (let i = 0; i < answersAmount; i++) {
            let index = Math.floor(Math.random() * cards.length);
            answers.push(cards[index]);
            cards = cards.filter(card => card !== cards[index]);
        }

        return answers;
    }

    #handleCardClick(index) {
        let e = new Event("card-click");
        this.dispatchEvent(e);

        if (this.#locked) return;
        if (this.#picked.includes(index)) return;
        if (this.#bad_picked.includes(index)) return;

        if (this.#answers.includes(index)) {
            let e = new Event("card-correct");
            this.dispatchEvent(e);

            this.#cards[index].classList.add("correct");

            this.#picked.push(index);
            this.#picked.sort();
        } else {
            let e = new Event("card-incorrect");
            this.dispatchEvent(e);

            this.#cards[index].classList.add("incorrect");
            this.#bad_picked.push(index);
        }

        if (this.#picked.length === this.#answers.length && this.#picked.every((value, index) => value === this.#answers[index])) {
            let e = new Event("game-won");
            this.dispatchEvent(e);

            this.#locked = true;
        }
    }

    #resetGame() {
        this.#size = -1;
        this.#cards = [];
        this.#answers = [];
        this.#picked = [];
        this.#bad_picked = [];
        this.#locked = false;
    }

    createGame(size, answers) {
        let e = new Event("game-start");
        this.dispatchEvent(e);

        if (answers > size * size || answers < 1) {
            throw new Error("Active amount must be between 1 and the total amount of cards");
        }

        this.#resetGame();

        this.#size = size;

        this.#shadow.innerHTML = /* css */`
            <style>
                :host {
                    display: grid;
                    grid-template-columns: repeat(${size}, 1fr);
                    grid-template-rows: repeat(${size}, 1fr);
                    grid-gap: 1rem;
                    aspect-ratio: 1;
                }

                .card {
                    background-color: ${this.options["card-color"]};
                    border: none;
                    border-radius: 0.5rem;
                    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.4);
                    transition: 0.2s;
                }

                .card.correct {
                    background-color: ${this.options["card-color-correct"]};
                }

                .card.incorrect {
                    background-color: ${this.options["card-color-incorrect"]};
                }

                .card:hover {
                    cursor: pointer;
                    transform: scale(1.1);
                    box-shadow: 0 0 0.8rem rgba(0, 0, 0, 0.2);
                }
            </style>
        `;

        let pickedCardIndices = this.#pickRandomCards(answers, size * size);
        let cards = [];
        for (let i = 0; i < size * size; i++) {
            let card = document.createElement("button");
            card.setAttribute("class", "card");
            card.setAttribute("id", i);

            card.classList.add("card");
            card.addEventListener("pointerdown", this.#handleCardClick.bind(this, i));

            cards.push(card);
            this.#shadow.appendChild(card);
        }

        this.#cards = cards;
        this.#answers = pickedCardIndices;
        this.#answers.sort();
    }

    previewAnswers(duration = 1000) {
        let e = new Event("previewing");
        this.dispatchEvent(e);

        this.#locked = true;

        for (let card of this.#cards) {
            if (this.#answers.includes(parseInt(card.id))) {
                card.classList.add("correct");

                setTimeout(() => {
                    card.classList.remove("correct");
                }, duration);
            }
        }

        setTimeout(() => {
            this.#locked = false;
        }, duration + 100);
    }

    showAnswers() {
        for (let card of this.#cards) {
            if (this.#answers.includes(parseInt(card.id))) {
                card.classList.add("correct");
            }
        }
    }

    clearAnswers() {
        for (let card of this.#cards) {
            card.classList.remove("correct");
            card.classList.remove("incorrect");
        }
    }

    lock() {
        this.#locked = true;
    }

    get size() {
        return this.#size;
    }
}

window.customElements.define("memory-board", MemoryBoard);