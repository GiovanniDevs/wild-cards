/* Memory Match game script */
(() => {
  const gridEl = document.querySelector(".grid");
  const startBtn = document.getElementById("start-button");
  const restartBtn = document.getElementById("restart-button");
  const imagesBase = "assets/images/Cards 01/";

  // Candidate face images from the folder
  const faces = [
    "Club_A.png",
    "Diamond_A.png",
    "Heart_A.png",
    "Spade_A.png",
    "Club_K.png",
    "Diamond_K.png",
    "Heart_K.png",
    "Spade_K.png",
    "Club_Q.png",
    "Diamond_Q.png",
    "Heart_Q.png",
    "Spade_Q.png",
    "Club_J.png",
    "Diamond_J.png",
    "Heart_J.png",
    "Spade_J.png",
    "Joker.png",
    "Club_2.png",
    "Diamond_2.png",
    "Heart_2.png",
    "Spade_2.png",
  ];

  const cardBack = "assets/images/Cards 01/Card_Back_Normal.png";

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function pickFaces(count) {
    const copy = faces.slice();
    shuffle(copy);
    return copy.slice(0, count);
  }

  function buildBoard(pairs = 8) {
    if (!gridEl) return;
    gridEl.innerHTML = "";
    const chosen = pickFaces(pairs);
    const cards = shuffle(chosen.concat(chosen)); // duplicate and shuffle

    cards.forEach((face, idx) => {
      const col = document.createElement("div");
      col.className = "col-4 col-md-3 d-flex justify-content-center";

      const card = document.createElement("div");
      card.className = "card";
      card.dataset.face = face;

      card.innerHTML = `
				<div class="card-inner">
					<div class="card-front"></div>
					<div class="card-back"><img src="${encodeURI(
            imagesBase + face
          )}" alt="card"></div>
				</div>
			`;

      // show back initially (front is the cover)
      card.querySelector(
        ".card-front"
      ).style.backgroundImage = `url(${encodeURI(cardBack)})`;

      card.addEventListener("click", onCardClick);
      col.appendChild(card);
      gridEl.appendChild(col);
    });
  }

  let flipped = [];
  let lockBoard = false;

  // Timer setup (1 minute)

  const timerEl = document.getElementById("game-timer"); // element added in index.html
  let timerInterval = null;
  let timeLeft = 60; // seconds
  let timerStarted = false; // becomes true when first valid card is flipped

  // Format time to seconds

  function formatTime(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  // Update timer display warning color

  function updateTimerDisplay() {
    if (!timerEl) return;
    timerEl.textContent = formatTime(timeLeft);
    if (timeLeft <= 10) {
      timerEl.classList.add("timer-warning");
    } else {
      timerEl.classList.remove("timer-warning");
    }
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerStarted = false;
    }
  }

  function resetTimer() {
    stopTimer();
    timeLeft = 60;
    timerStarted = false;
    if (timerEl) {
      timerEl.classList.remove("timer-expired", "timer-warning");
      updateTimerDisplay();
    }
  }

  function onTimeUp() {
    if (timerEl) timerEl.classList.add("timer-expired");
    lockBoard = true; // block clicks when time is up
    alert("Time is up!");
  }

  function startTimer() {
    stopTimer();
    timeLeft = 60;
    if (timerEl) timerEl.classList.remove("timer-expired", "timer-warning");
    updateTimerDisplay();
    lockBoard = false; // ensure board is enabled on restart
    timerStarted = true;
    timerInterval = setInterval(() => {
      if (timeLeft <= 0) {
        stopTimer();
        updateTimerDisplay();
        onTimeUp();
        return;
      }
      timeLeft -= 1;
      updateTimerDisplay();
    }, 1000);
  }

  function onCardClick(e) {
    const card = e.currentTarget;
    if (lockBoard) return;
    if (
      card.classList.contains("matched") ||
      card.classList.contains("flipped")
    )
      return;

    // Start the timer on the first valid card flip
    if (!timerStarted) startTimer();

    flipCard(card);
    flipped.push(card);

    if (flipped.length === 2) {
      lockBoard = true;
      const [a, b] = flipped;
      if (a.dataset.face === b.dataset.face) {
        a.classList.add("matched");
        b.classList.add("matched");
        resetFlip(true);
      } else {
        setTimeout(() => {
          unflipCard(a);
          unflipCard(b);
          resetFlip(false);
        }, 900);
      }
    }
  }

  function flipCard(card) {
    card.classList.add("flipped");
  }

  function unflipCard(card) {
    card.classList.remove("flipped");
  }

  function resetFlip(matched) {
    flipped = [];
    lockBoard = false;
    if (matched) checkWin();
  }

  function checkWin() {
    const remaining = gridEl.querySelectorAll(".card:not(.matched)");
    if (remaining.length === 0) {
      stopTimer();
      setTimeout(() => alert("Congratulations — you found all pairs!"), 200);
    }
  }

  // ------------ START of game modals section ------------

  // Shows winning modal
  function showWinModal() {
    const modal = document.getElementById("win-modal");
    modal.style.display = "flex";

    // Optional: Add game stats
    // document.getElementById('final-stats').textContent = `Time: ${timeElapsed}s`;
  }

  //   Show lose modal
  function showLoseModal() {
    const modal = document.getElementById("lose-modal");
    modal.style.display = "flex";

    // Optional: Add game stats
    // document.getElementById('final-stats').textContent = `Time: ${timeElapsed}s`;
  }

  // Hide the modal and restart
  const winButton = document.getElementById("win-play-again-button");
  winButton.addEventListener("click", function () {
    document.getElementById("win-modal").style.display = "none";
    // restart the board
    buildBoard(8);
  });

  const loseButton = document.getElementById("lose-play-again-button");
  loseButton.addEventListener("click", function () {
    document.getElementById("lose-modal").style.display = "none";
    // restart the board
    buildBoard(8);
  });

  // ------------ END of modals section --------------

  startBtn && startBtn.addEventListener("click", () => buildBoard(8));
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      buildBoard(8);
      resetTimer(); // reset to 01:00, do NOT auto-start — start on first flip
    });
  }

  // build initial board on load and reset timer
  document.addEventListener("DOMContentLoaded", () => {
    buildBoard(8);
    resetTimer();
  });
})();
