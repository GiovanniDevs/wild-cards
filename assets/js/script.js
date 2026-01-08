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
    
    // Phase 3: Stop any existing swap interval when restarting
    stopSwapInterval();
    
    gridEl.innerHTML = "";
    const chosen = pickFaces(pairs);
    const cards = shuffle(chosen.concat(chosen)); // duplicate and shuffle

    cards.forEach((face, idx) => {
      const col = document.createElement("div");
      col.className = "col-3 d-flex justify-content-center";

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

 // Swap & move unMatched Cards feature
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

		startSwapInterval();
  }

   // Global Variables 
  let flipped = [];
  let lockBoard = false;
  // Swap & move unMatched Cards feature
	// Card swapping feature - Step 1: Global variables
	let swapInterval = null;
	const SWAP_INTERVAL_MS = 12000;  // 12 seconds (between 10-15)
	const PREVIEW_DURATION = 500;    // Visual feedback before swap
	const SWAP_DURATION = 600;       // Animation duration

  // Interval Management - stopSwapInterval()
	// Purpose: Stop swapping (e.g., game won, restart)
	function stopSwapInterval() {
		if (swapInterval) {
			clearInterval(swapInterval);
			swapInterval = null;
			console.log('Swap interval stopped');
		}
	}

 // Interval Management - startSwapInterval()
	function startSwapInterval() {
		// Clear any existing interval
		if (swapInterval) {
			clearInterval(swapInterval);
			console.log('Cleared existing swap interval');
		}
		
		swapInterval = setInterval(() => {
			changeOneUnmatchedCard();
		}, SWAP_INTERVAL_MS);
		
		console.log('Swap interval started - will swap cards every', SWAP_INTERVAL_MS / 1000, 'seconds');
	}









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

  // Sound effects for match
  const matchSound = new Audio("assets/sounds/pop-win-casino-winning-398059.mp3");
  matchSound.volume = 0.5; // Set volume to 50%

  function playMatchSound() {
    matchSound.currentTime = 0; // Reset to start
    matchSound.play().catch((err) => {
      console.warn("Could not play sound:", err);
    });
  }


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
    stopSwapInterval(); // Stop card swapping when time is up
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
        playMatchSound();
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
			// Swap & move unMatched Cards feature
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
      // Phase 3: Stop swap interval when game is won
      stopSwapInterval();
      showWinModal();
    }
  }

  // ------------ START of main part of the Swap & move unMatched Cards feature section ------------
  // Swap & move unMatched Cards feature
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







  // Swap & move unMatched Cards feature 
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
















  // Swap & move unMatched Cards feature
	// Core Functions - getCardContainer(card)
	// Purpose: Get the .col-3 parent container of a card
	function getCardContainer(card) {
		const container = card.closest('.col-3');		// Test logging
		if (container) {
			console.log('getCardContainer: Found container for card', card.dataset.face);
		} else {
			console.warn('getCardContainer: No .col-4 container found for card', card.dataset.face);
		}
		
		return container;
	}
  




  // Swap & move unMatched Cards feature
	// addVisualFeedback(card1, card2)
	// Purpose: Add pulse/scale/wiggle animation before swap
	function addVisualFeedback(card1, card2) {
		// Add CSS class to both cards
		card1.classList.add('swap-preview');
		card2.classList.add('swap-preview');
		
		// Test logging
		console.log('=== addVisualFeedback: Visual feedback added ===');
		console.log('Card 1:', card1.dataset.face, '- Preview animation started');
		console.log('Card 2:', card2.dataset.face, '- Preview animation started');
		
		// Remove class after PREVIEW_DURATION
		setTimeout(() => {
			card1.classList.remove('swap-preview');
			card2.classList.remove('swap-preview');
			console.log('Visual feedback removed after', PREVIEW_DURATION, 'ms');
		}, PREVIEW_DURATION);
	}








  
  // Swap & move unMatched Cards feature
	// Core Functions - 2.5 swapCardPositions(card1, card2)
	// Purpose: Physically swap two cards in the DOM
	function swapCardPositions(card1, card2) {

		// Step 1: Get containers
		const container1 = getCardContainer(card1);
		const container2 = getCardContainer(card2);
		
		if (!container1 || !container2) {
			console.error('swapCardPositions: Could not find containers for cards');
			return;
		}
		
		// Get their positions in grid (index in gridEl.children)
		const parent = gridEl;
		const children = Array.from(parent.children);
		const index1 = children.indexOf(container1);
		const index2 = children.indexOf(container2);
		
		// Test logging
		console.log('=== swapCardPositions: Swapping Cards ===');
		console.log('Card 1:', card1.dataset.face, '- Container index:', index1);
		console.log('Card 2:', card2.dataset.face, '- Container index:', index2);
		
		// Get VIEWPORT positions (not grid-relative) for animation
		const rect1 = container1.getBoundingClientRect();
		const rect2 = container2.getBoundingClientRect();
		
		// Store original positions in viewport coordinates
		const pos1 = { x: rect1.left, y: rect1.top };
		const pos2 = { x: rect2.left, y: rect2.top };
		
		console.log('=== Starting Visual Swap ===');
		console.log('Card 1 viewport position - X:', pos1.x.toFixed(2), 'Y:', pos1.y.toFixed(2));
		console.log('Card 2 viewport position - X:', pos2.x.toFixed(2), 'Y:', pos2.y.toFixed(2));
		
		// Calculate distance to move
		const deltaX1 = pos2.x - pos1.x;
		const deltaY1 = pos2.y - pos1.y;
		const deltaX2 = pos1.x - pos2.x;
		const deltaY2 = pos1.y - pos2.y;
		
		console.log('Card 1 will move:', deltaX1.toFixed(2), 'px X,', deltaY1.toFixed(2), 'px Y');
		console.log('Card 2 will move:', deltaX2.toFixed(2), 'px X,', deltaY2.toFixed(2), 'px Y');
		
		// Set up for animation with absolute positioning
		container1.classList.add('swapping');
		container2.classList.add('swapping');
		
		// Start animation from current position
		container1.style.transform = `translate(0, 0)`;
		container2.style.transform = `translate(0, 0)`;
		
		// Force reflow
		void container1.offsetHeight;
		void container2.offsetHeight;
		
		// Animate to target positions
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				console.log('Animating cards to new positions...');
				container1.style.transform = `translate(${deltaX1}px, ${deltaY1}px)`;
				container2.style.transform = `translate(${deltaX2}px, ${deltaY2}px)`;
			});
		});
		
		// After animation, swap in DOM
		setTimeout(() => {
			console.log('Animation complete, swapping in DOM...');
			
			// Swap the containers in the DOM
			const tempNode = document.createTextNode('');
			parent.insertBefore(tempNode, container1);
			
			if (container2.nextSibling) {
				parent.insertBefore(container1, container2.nextSibling);
			} else {
				parent.appendChild(container1);
			}
			
			parent.insertBefore(container2, tempNode);
			parent.removeChild(tempNode);
			
			// Remove animation styling
			container1.style.transform = '';
			container2.style.transform = '';
			container1.classList.remove('swapping');
			container2.classList.remove('swapping');
			
			console.log('=== Swap Complete ===');
		}, SWAP_DURATION);
	}
























  // Swap & move unMatched Cards feature
	// Core Functions - changeOneUnmatchedCard() (Main Function)
	// Purpose: Orchestrate the swap process
	function changeOneUnmatchedCard() {
		console.log('=== changeOneUnmatchedCard: Starting Swap Process ===');
		
		// Check if game is locked (user interacting)
		if (lockBoard) {
			console.log('changeOneUnmatchedCard: Board is locked, skipping swap');
			return;
		}
		
		// Get eligible cards
		const eligible = getUnmatchedFaceDownCards();
		if (eligible.length < 2) {
			console.log('changeOneUnmatchedCard: Not enough eligible cards (< 2), skipping swap');
			return;
		}
		
		// Select cards to swap
		const selected = selectCardsToSwap(eligible);
		if (!selected) {
			console.log('changeOneUnmatchedCard: Selection failed, skipping swap');
			return;
		}
		
		const [card1, card2] = selected;
		if (!card1 || !card2) {
			console.log('changeOneUnmatchedCard: Invalid cards selected, skipping swap');
			return;
		}
		
		// Add visual feedback
		addVisualFeedback(card1, card2);
		
		// Wait for preview, then swap
		setTimeout(() => {
			swapCardPositions(card1, card2);
			console.log('=== changeOneUnmatchedCard: Swap Process Complete ===');
		}, PREVIEW_DURATION);
	}







  







  

  // Testing: Helper function to check eligible cards anytime
	// Call this from the browser console: testEligibleCards()
	window.testEligibleCards = function() {
		console.log('=== Manual Test: getUnmatchedFaceDownCards() ===');
		const eligible = getUnmatchedFaceDownCards();
		console.log('Eligible cards:', eligible.length);
		console.log('Eligible card faces:', eligible.map(c => c.dataset.face));
		console.log('=== End Test ===');
		return eligible.length;
	};


// updated up to here just now 






	// Testing: Helper function to test card selection
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




   
  // Swap & move unMatched Cards feature
	// Helper function to test full swap process
	// Call this from the browser console: testSwapCards()
	window.testSwapCards = function() {
		console.log('=== Manual Test: Full Swap Process ===');
		const eligible = getUnmatchedFaceDownCards();
		if (eligible.length < 2) {
			console.log('Not enough eligible cards to swap (need at least 2)');
			return null;
		}
		
		const selected = selectCardsToSwap(eligible);
		if (!selected) {
			console.log('Selection failed');
			return null;
		}
		
		const [card1, card2] = selected;
		console.log('Testing swap with:', card1.dataset.face, 'and', card2.dataset.face);
		
		// Add visual feedback
		addVisualFeedback(card1, card2);
		
		// Wait for preview, then swap
		setTimeout(() => {
			swapCardPositions(card1, card2);
		}, PREVIEW_DURATION);
		
		console.log('=== Swap Test Initiated ===');
		return selected;
	};




	// Testing: Helper function to test main swap orchestration
	// Call this from the browser console: testChangeOneCard()
		window.testChangeOneCard = function() {
		console.log('=== Manual Test: changeOneUnmatchedCard() ===');
		changeOneUnmatchedCard();
		console.log('=== Test Initiated ===');
	};

  

  // ------------ END of main part of the Swap & move unMatched Cards feature section ------------


  // ------------ START of game modals section ------------

  // Shows winning modal
  function showWinModal() {
    const modal = document.getElementById("win-modal");
    modal.style.display = "flex";

    const score = calcScore();

    //Add game stats
    document.getElementById(
      "win-final-stats"
    ).textContent = `Final score: ${score}`;
  }

  function calcScore() {
    let level = getDifficultySeconds();
    let factor = level / 10;
    let score = timeLeft * factor;
    return score;
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
        const inst =
          window.bootstrap.Modal.getInstance(userModalEl) ||
          new window.bootstrap.Modal(userModalEl);
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
        if (usernameInput)
          usernameInput.value = localStorage.getItem("playerName") || "";
        userModal.show();
        if (usernameInput) usernameInput.focus();
      });
    }
  });
})();
