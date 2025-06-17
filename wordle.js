const scoreBoard = document.querySelector(".score-board");
const scoreBoardLetter = document.querySelector(".scoreboard-letter");
const rows = 6;
const columns = 5;
let fiveletters;
let rowNumber = 0;
let columnNumber = 0;
const gridItems = [];
let isWaiting = false;
let correctWord = "";
const valid = "https://words.dev-apis.com/validate-word";
const WORD_FETCH = "https://words.dev-apis.com/word-of-the-day";
const loader = document.querySelector(".loader");
loader.classList.add("hidden");
const winMessage = document.querySelector(".win-message");
let hasWon = false;

function focusInput() {
  document.getElementById("hidden-input").focus();
}

async function validateWord(word) {
  const promise = await fetch(valid, {
    method: "POST",
    body: JSON.stringify({ word: word }),
  });
  const processedResponse = await promise.json();
  console.log(processedResponse.validWord);
  return processedResponse.validWord;
}

async function getWord() {
  const promise = await fetch(WORD_FETCH);
  const response = await promise.json();
  return response.word;
}

window.addEventListener("load", async () => {
  correctWord = (await getWord()).toLowerCase().normalize();
});

for (let i = 0; i < rows; i++) {
  gridItems.push([]);

  for (let j = 0; j < columns; j++) {
    const gridItem = document.createElement("div");
    gridItem.className = "gridItem";

    gridItems[i][j] = gridItem;
    gridItems[i][j].addEventListener("click", focusInput);

    // Append the grid item to the grid container
    scoreBoard.appendChild(gridItem);
  }
}

document.addEventListener("keydown", onKeyPress);
function onKeyPress(e) {
  if (!isLetter(e.key)) {
    if (e.key === "Enter") {
      handleEnter(e);
    } else if (e.key === "Backspace") {
      handleBackSpace(e);
    }
  } else if (columnNumber < 5) {
    gridItems[rowNumber][columnNumber].textContent = e.key;
    columnNumber++;
  }

  console.log(columnNumber);
}

function isLetter(key) {
  return /^[a-zA-Z]$/.test(key);
}

async function handleEnter(event) {
  if (hasWon === true) {
    return;
  }

  loader.classList.remove("hidden");
  if (isWaiting) {
    return;
  }

  let fiveLetterWord = gridItems[rowNumber]
    .slice(0, 5)
    .map((div) => div.textContent.trim().toLowerCase().normalize())
    .join("");
  console.log(fiveLetterWord.toLowerCase());

  if (fiveLetterWord.length < 5) {
    console.log("Incomplete Word");
    void loader.offsetWidth;
    loader.classList.add("hidden");

    return;
  }

  isWaiting = true;
  const isValid = await validateWord(fiveLetterWord.toLowerCase());

  function divStyle(div) {
    div.style.backgroundColor = "green";
    div.style.color = "white";
    return div;
  }

  if (isValid === true) {
    if (correctWord === fiveLetterWord.toLowerCase()) {
      gridItems[rowNumber].slice(0, 5).map(divStyle);
      void loader.offsetWidth;
      loader.classList.add("hidden");
      hasWon = true;
      winMessage.classList.remove("hidden-2");
      return;
    } else if (correctWord !== fiveLetterWord) {
      const { green, yellow, grey } = getWrongPosition(
        fiveLetterWord,
        correctWord
      );

      for (let i of green) {
        correctLetter(gridItems[rowNumber][i]);
      }

      for (let i of yellow) {
        wrongLetter(gridItems[rowNumber][i]);
      }

      for (let i of grey) {
        notThere(gridItems[rowNumber][i]);
      }
      void loader.offsetWidth;
      loader.classList.add("hidden");
    }

    nextRow();

    isWaiting = false;
  } else {
    console.log("Invalid Word, try again");
    gridItems[rowNumber].map((div) => {
      div.classList.remove("invalid");
      void div.offsetWidth;
      div.classList.add("invalid");
      void loader.offsetWidth;
      loader.classList.add("hidden");
    });
    isWaiting = false;
    return;
  }
}
console.log(columnNumber);

function handleBackSpace(event) {
  if (hasWon === true) {
    return;
  }

  if (columnNumber <= 0) {
    return;
  }
  console.log(columnNumber);
  columnNumber = columnNumber - 1;
  gridItems[rowNumber][columnNumber].textContent = ""; // clear that cell

  console.log(gridItems[rowNumber].map((text) => text.textContent));
}

function nextRow() {
  if (rowNumber >= 5) {
    alert("You lose!Game Over LOSERRRRR!😝");
  } else {
    rowNumber = rowNumber + 1;
    columnNumber = 0;
  }
}

function wrongLetter(l) {
  l.style.backgroundColor = "orange";
  l.style.color = "white";
  return l;
}

function correctLetter(l) {
  l.style.backgroundColor = "green";
  l.style.color = "white";
  return l;
}

function notThere(l) {
  l.style.backgroundColor = "grey";
  l.style.color = "white";
  return l;
}

function getWrongPosition(guess, answer) {
  const usedIndex = new Set();
  const result = {
    green: [],
    yellow: [],
    grey: [],
  };

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) {
      usedIndex.add(i);
      result.green.push(i);
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] !== answer[i]) {
      for (let j = 0; j < answer.length; j++) {
        if (guess[i] === answer[j] && !usedIndex.has(j) && i !== j) {
          result.yellow.push(i);
          usedIndex.add(j);
          break;
        }
      }
    }
  }

  for (let i = 0; i < guess.length; i++) {
    const alreadyMatched =
      result.green.includes(i) || result.yellow.includes(i);
    if (!alreadyMatched) {
      result.grey.push(i);
    }
  }

  return result;
}
