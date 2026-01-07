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

    // Step 1: Swap Positions of unMatched Cards 
		// getUnmatchedFaceDownCards() after board is built
		setTimeout(() => {
			console.log('=== Step 1 Test: getUnmatchedFaceDownCards() ===');
			const eligible = getUnmatchedFaceDownCards();
			console.log('Test Result: Found', eligible.length, 'eligible cards');
			console.log('Eligible card faces:', eligible.map(c => c.dataset.face));
			console.log('=== End Test ===');
			
			// Phase 2: Test selectCardsToSwap() automatically
			console.log('=== Step 2 Test: selectCardsToSwap() ===');
			selectCardsToSwap(eligible);
			console.log('=== End Test ===');
		}, 100);

  }

  let flipped = [];
  let lockBoard = false;

  // Step 1: Swap Positions of unMatched Cards 
	// Card swapping feature - Step 1: Global variables
	let swapInterval = null;
	const SWAP_INTERVAL_MS = 12000;  // 12 seconds (between 10-15)
	const PREVIEW_DURATION = 500;    // Visual feedback before swap
	const SWAP_DURATION = 600;       // Animation duration


  // Timer setup (1 minute)

  const timerEl = document.getElementById("game-timer"); // element added in index.html
  let timerInterval = null;
  let timeLeft = 60; // seconds (will be set from difficulty)
  let timerStarted = false; // becomes true when first valid card is flipped

  // Difficulty selection -> seconds mapping
  const difficultyRadios = document.querySelectorAll('input[name="options"]');
  const difficultySecondsMap = { easy: 90, normal: 60, hard: 30 };
  let currentDifficulty =
    document.querySelector('input[name="options"]:checked')?.value || "easy";

  function getDifficultySeconds() {
    return difficultySecondsMap[currentDifficulty] ?? 60;
  }

  // Update the timer preview when difficulty changes (if timer isn't running)
  difficultyRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      currentDifficulty = e.target.value;
      if (!timerStarted) {
        timeLeft = getDifficultySeconds();
        if (timerEl) {
          timerEl.classList.remove("timer-expired", "timer-warning");
          updateTimerDisplay();
        }
      }
    });
  });

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
    timeLeft = getDifficultySeconds();
    timerStarted = false;
    if (timerEl) {
      timerEl.classList.remove("timer-expired", "timer-warning");
      updateTimerDisplay();
    }
  }

  function onTimeUp() {
    if (timerEl) timerEl.classList.add("timer-expired");
    lockBoard = true; // block clicks when time is up
    showLoseModal();
  }

  function startTimer() {
    stopTimer();
    timeLeft = getDifficultySeconds();
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
		// optionally check for win when matched
		if (matched) {
			// Step 1: Swap Positions of unMatched Cards 
			// Log eligible cards after a match pair in the console log
			setTimeout(() => {
				console.log('=== After Match: Test Result - getUnmatchedFaceDownCards() ===');
				const eligible = getUnmatchedFaceDownCards();
				console.log('Match found! Eligible cards now:', eligible.length);
				console.log('Eligible card faces:', eligible.map(c => c.dataset.face));
				console.log('=== End Test ===');
				
				// Phase 2: Test selectCardsToSwap() automatically after match
				console.log('=== After Match: Test selectCardsToSwap() ===');
				selectCardsToSwap(eligible);
				console.log('=== End Test ===');
			}, 100);
			checkWin();
		}
	}

  function checkWin() {
    const remaining = gridEl.querySelectorAll(".card:not(.matched)");
    if (remaining.length === 0) {
      stopTimer();
      showWinModal();
    }
  }

  // Step 1: Swap Positions of unMatched Cards
	// Phase 2: Core Functions - 2.1 getUnmatchedFaceDownCards()
	// Purpose: Get all cards eligible for swapping
	function getUnmatchedFaceDownCards() {
		const allCards = gridEl.querySelectorAll('.card');
		const eligibleCards = Array.from(allCards).filter(card => {
			return !card.classList.contains('matched') && 
			       !card.classList.contains('flipped');
		});
		
		// Test logging
		console.log('Eligible cards for swapping:', eligibleCards.length);
		console.log('Total cards:', allCards.length);
		console.log('Matched cards:', gridEl.querySelectorAll('.card.matched').length);
		console.log('Flipped cards:', gridEl.querySelectorAll('.card.flipped').length);
		
		return eligibleCards;
	}

	// Phase 2: Core Functions - 2.2 selectCardsToSwap(eligibleCards)
	// Purpose: Randomly select 2 cards to swap
	function selectCardsToSwap(eligibleCards) {
		if (eligibleCards.length < 2) {
			console.log('selectCardsToSwap: Not enough eligible cards (< 2), skipping swap');
			return null;
		}
		
		// Shuffle and pick first 2
		const shuffled = shuffle(eligibleCards.slice());
		const selectedCards = [shuffled[0], shuffled[1]];
		
		// Test logging
		console.log('=== selectCardsToSwap: Cards Selected for Swap ===');
		console.log('Eligible cards available:', eligibleCards.length);
		console.log('Card 1 selected:', selectedCards[0].dataset.face);
		console.log('Card 2 selected:', selectedCards[1].dataset.face);
		console.log('Swapping:', selectedCards[0].dataset.face, '↔', selectedCards[1].dataset.face);
		console.log('=== End Selection ===');
		
		return selectedCards;
	}

  // Step 1 Testing: Helper function to check eligible cards anytime
	// Call this from the browser console: testEligibleCards()
	window.testEligibleCards = function() {
		console.log('=== Manual Test: getUnmatchedFaceDownCards() ===');
		const eligible = getUnmatchedFaceDownCards();
		console.log('Eligible cards:', eligible.length);
		console.log('Eligible card faces:', eligible.map(c => c.dataset.face));
		console.log('=== End Test ===');
		return eligible.length;
	};

	// Phase 2 Testing: Helper function to test card selection
	// Call this from the browser console: testCardSelection()
	window.testCardSelection = function() {
		console.log('=== Manual Test: selectCardsToSwap() ===');
		const eligible = getUnmatchedFaceDownCards();
		const selected = selectCardsToSwap(eligible);
		if (selected) {
			console.log('Selection successful!');
		} else {
			console.log('Selection failed: Not enough eligible cards');
		}
		console.log('=== End Test ===');
		return selected;
	};

  // ------------ START of game modals section ------------

  // Shows winning modal
  function showWinModal() {
    const modal = document.getElementById("win-modal");
    modal.style.display = "flex";

    //Add game stats
    document.getElementById(
      "win-final-stats"
    ).textContent = `Time left: ${timeLeft}s`;
  }

  //   Show lose modal
  function showLoseModal() {
    const modal = document.getElementById("lose-modal");
    modal.style.display = "flex";
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

  // Rules buttons modal

  const openButton = document.getElementById("open-rules");
  openButton.addEventListener("click", function () {
    document.getElementById("rules-modal").style.display = "flex";
  });

  const closeButton = document.getElementById("close-rules");
  closeButton.addEventListener("click", function () {
    document.getElementById("rules-modal").style.display = "none";
  });

  // build initial board on load and reset timer
  document.addEventListener("DOMContentLoaded", () => {
    buildBoard(8);
    resetTimer();

    const welcomeEl = document.getElementById("welcome-msg");
    function setWelcome(name) {
      if (welcomeEl) welcomeEl.textContent = `Welcome ${name}`;
    }

    const stored = localStorage.getItem("playerName");
    if (stored) {
      setWelcome(stored);
    }

    const userModalEl = document.getElementById("usernameModal");
    const saveBtn = document.getElementById("username-save-button");
    const usernameInput = document.getElementById("username-input");

    const saveName = () => {
      const name = (usernameInput && usernameInput.value.trim()) || "Player";
      localStorage.setItem("playerName", name);
      setWelcome(name);
      if (userModalEl && window.bootstrap) {
        const inst = window.bootstrap.Modal.getInstance(userModalEl) || new window.bootstrap.Modal(userModalEl);
        inst.hide();
      }
    };

    if (saveBtn) saveBtn.addEventListener("click", saveName);
    if (usernameInput) {
      usernameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          saveName();
        }
      });
    }

    // Show modal initial run
    if (!stored && userModalEl) {
      if (!window.bootstrap) {
        console.warn("Bootstrap not loaded; username modal will not be shown.");
      } else {
        const userModal = new window.bootstrap.Modal(userModalEl);
        userModal.show();
        if (usernameInput) usernameInput.focus();
      }
    }

    // allow editing the name once set
    const editBtn = document.getElementById("edit-username-button");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        const userModalEl = document.getElementById("usernameModal");
        const usernameInput = document.getElementById("username-input");
        if (!userModalEl) return;
        if (!window.bootstrap) {
          console.warn("Bootstrap not loaded; cannot open username modal.");
          return;
        }
        const userModal = new window.bootstrap.Modal(userModalEl);
        if (usernameInput) usernameInput.value = localStorage.getItem("playerName") || "";
        userModal.show();
        if (usernameInput) usernameInput.focus();
      });
    }
  });
})();
