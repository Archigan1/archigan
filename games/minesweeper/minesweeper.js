const $ = id => document.getElementById(id);

const grid = $("grid");

/**
 * Game object
 * @name Game
 * @type {gameObject}
 */

let Game = {
  status: "waiting",
  testmode: false,
  clock: undefined,
  // "click" | "flag"
  mode: "click",
  options: {
    mines: 0,
    maxmines: 20,
    size: {
      rows: 10,
      cols: 10
    }
  }
}

let flags = Game.options.maxmines;

generateGrid();

function generateGrid() {
  Game.status = "waiting";
  flags = Game.options.maxmines;
  $("flags").innerHTML = flags;
  clearInterval(Game.clock);
  Game.clock = undefined;
  $("timer").innerHTML = "00:00";
  $('msg').innerHTML = "&nbsp;";
  grid.innerHTML = "";
  Game.minesloaded = false;
  for (let i = 0; i < Game.options.size.rows; i++) {
    const row = grid.insertRow(i);
    for (let j = 0; j < Game.options.size.cols; j++) {
      const cell = row.insertCell(j);
      cell.onclick = async function (event) {
        if (Game.status === "waiting") {
          const rn = new Date().getTime();
          Game.clock = setInterval(function () {
            const now = new Date().getTime();
            const distance = now - rn;
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            $("timer").innerHTML = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
          }, 250);
          addMines(this);
          Game.status = "running";
        }
        switch (Game.mode) {
          case "flag":
            toggleFlag(this);
            break;
          case "click":
            clickCell(this, event);
            break;
        }
      };
      // On Right-Click
      cell.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (Game.status !== "running") return;
        toggleFlag(cell);
      })
      let mine = document.createAttribute("data-mine");
      mine.value = "false";
      cell.setAttributeNode(mine);
    }
  }
}

function addMines(clickedCell) {
  Game.options.mines = 0;
  addingMinesLoop: for (; Game.options.mines < flags;) {
    let row = Math.floor(Math.random() * Game.options.size.rows);
    let col = Math.floor(Math.random() * Game.options.size.cols);
    let cell = grid.rows[row].cells[col];

    if (Math.random() > 0.25) {
      let cellRow = clickedCell.parentNode.rowIndex;
      let cellCol = clickedCell.cellIndex;
      for (let i = Math.max(cellRow - 1, 0); i <= Math.min(cellRow + 1, (Game.options.size.rows - 1)); i++) {
        for (let j = Math.max(cellCol - 1, 0); j <= Math.min(cellCol + 1, (Game.options.size.cols - 1)); j++) {
          if (grid.rows[i].cells[j] === cell) {
            continue addingMinesLoop;
          }
        }
      }
    }

    if (cell === clickedCell || cell.getAttribute("data-mine") === "true") {
      continue;
    }
    cell.setAttribute("data-mine", "true");
    Game.options.mines++;
    if (Game.testmode) {
      cell.innerHTML = "x";
    }
  }
}

function revealMines() {
  for (let i = 0; i < Game.options.size.rows; i++) {
    for (let j = 0; j < Game.options.size.cols; j++) {
      let cell = grid.rows[i].cells[j];
      if (cell.getAttribute("data-mine") == "true") {
        cell.classList.add("mine");
        cell.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAABcSURBVDiNY2AY6uA/MYqYqGkjIw5XMBJwDSOSOryGwQwk2SG4XMbw/z/EPEZGXPZh6qdLmJGlH5lDiiFYDaWqy6gaZjSPAAYGMtMZNpdhpGwcBpEdYfTP6IMXAADvkxASlMYuswAAAABJRU5ErkJggg==" class="mine-image">'
      }
    }
  }
}

function checkLevelCompletion() {
  let levelComplete = true;
  let allflagged = true;
  for (let i = 0; i < Game.options.size.rows; i++) {
    for (let j = 0; j < Game.options.size.cols; j++) {
      if ((grid.rows[i].cells[j].getAttribute("data-mine") == "true") && !(grid.rows[i].cells[j].classList.contains("flag"))) {
        allflagged = false;
      }
      if ((grid.rows[i].cells[j].getAttribute("data-mine") == "false") && (grid.rows[i].cells[j].innerHTML == "") && !allflagged) {
        levelComplete = false;
      }
    }
  }
  if (levelComplete) {
    Game.status = "complete";
    $("msg").innerHTML = "<span style='color:#0f0'>You Win!!</span>";
    clearInterval(Game.clock);
    Game.clock = undefined;
    revealMines();
  }
}

function clickCell(cell) {
  if (cell.getAttribute("data-mine") == "true") {
    revealMines();
    $("msg").innerHTML = "<span style='color:#f00'>Game Over</span>";
    Game.status = "over";
    clearInterval(Game.clock);
    Game.clock = undefined;
  } else {
    if (Game.status === "over") return;
    if (cell.classList.contains("flag")) toggleFlag(cell);
    cell.className = "clicked";
    let mineCount = 0;
    let cellRow = cell.parentNode.rowIndex;
    let cellCol = cell.cellIndex;
    for (let i = Math.max(cellRow - 1, 0); i <= Math.min(cellRow + 1, Game.options.size.rows - 1); i++) {
      for (let j = Math.max(cellCol - 1, 0); j <= Math.min(cellCol + 1, Game.options.size.cols - 1); j++) {
        if (grid.rows[i].cells[j].getAttribute("data-mine") == "true") {
          mineCount++;
        }
      }
    }
    cell.innerHTML = mineCount;
    switch (cell.innerHTML) {
      case "0":
        cell.style.color = "#00000000";
        break;
      case "1":
        cell.style.color = "#bfff00ff";
        break;
      case "2":
        cell.style.color = "#ffbf00ff";
        break;
      case "3":
        cell.style.color = "#ff8000ff";
        break;
      case "4":
        cell.style.color = "#ff4000ff";
        break;
      case "5":
        cell.style.color = "#ff0000ff";
        break;
      case "6":
        cell.style.color = "#ff0044ff";
        break;
      case "7":
        cell.style.color = "#ff0066ff";
        break;
      case "8":
        cell.style.color = "#ff0088ff";
        break;
    }
    if (mineCount == 0) {
      for (let i = Math.max(cellRow - 1, 0); i <= Math.min(cellRow + 1, Game.options.size.rows - 1); i++) {
        for (let j = Math.max(cellCol - 1, 0); j <= Math.min(cellCol + 1, Game.options.size.cols - 1); j++) {
          if (grid.rows[i].cells[j].innerHTML == "" || grid.rows[i].cells[j].classList.contains("flag")) {
            clickCell(grid.rows[i].cells[j]);
          }
        }
      }
    }
    checkLevelCompletion();
  }
}

function toggleFlag(cell) {
  if (cell.classList.contains("clicked")) return;
  if (cell.classList.contains("flag")) {
    flags++;
    $("flags").innerHTML = flags;
    cell.classList.remove("flag");
    cell.innerHTML = "";
  } else {
    flags--;
    if (flags === 0) return;
    $("flags").innerHTML = flags;
    cell.classList.add("flag");
    cell.classList.remove("mine");
    cell.innerHTML = "<img src='flag.png' class='mine-image' height='19px'>";
    checkLevelCompletion();
  }
}

function customGrid(ev) {
  const maxColumns = Math.floor(($("game").offsetWidth - 2) / 27) + 1;
  ev.preventDefault();
  $("options-cols").value = parseInt($("options-cols").value > maxColumns ? maxColumns : $("options-cols").value);
  $("options-cols").value = $("options-cols").value < 5 ? 5 : $("options-cols").value;
  $("options-rows").value = $("options-rows").value < 5 ? 5 : $("options-rows").value;
  Game.options.size.rows = $("options-rows").value;
  Game.options.size.cols = $("options-cols").value;

  Game.options.maxmines = $("automines").checked ? Math.round((Game.options.size.rows * Game.options.size.cols) / 5) : $("mineCount").value;
  generateGrid();
}

function defaultGrid(ev) {
  ev.preventDefault();
  $("options-cols").value = 10;
  $("options-rows").value = 10;
  customGrid(ev);
}

$("mode-flag-cell").addEventListener("click", () => {
  switch (Game.mode) {
    case "flag":
      Game.mode = "click";
      $("mode-flag-cell").classList.remove("clicked");
      break;
    case "click":
      Game.mode = "flag";
      $("mode-flag-cell").classList.add("clicked");
      break;
  }
  console.log(Game.mode);
});


window.addEventListener('resize', () => {
  if (window.outerWidth > 730 && Game.mode === "flag") {
    Game.mode = "click";
  }
});

$("automines").addEventListener("click", async () => {
  setTimeout(_ => _, 1);
  if ($("automines").checked) {
    $("mineCount").setAttribute("readonly", true);
    $("mineOverlay").style.display = "block";
  } else {
    $("mineCount").removeAttribute("readonly");
    $("mineOverlay").style.display = "none";
  }
});

function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}

if (!isTouchDevice()) $("mode").style.display = "none";


// ***** Type Definitions *****

/**
 * @typedef gameObject
 * @property {"running" | "over" | "complete" | "waiting"} status Status of the game
 * @property {boolean} testmode Testing mode
 * @property {undefined | number} clock Game clock
 * @property {"click" | "flag"} mode Whether to click the cell or flag the cell on click
 * @property {gameOptions} options The game options
 */

/**
 * @typedef gameOptions
 * @property {number} mines The number of current mines on the board
 * @property {number} maxmines The maximum number of mines that can put on the board
 * @property {gameOptionSize} size The size of the grid
 */

/**
 * @typedef gameOptionSize
 * @property {number} rows The number of rows the grid has
 * @property {number} cols The number of columns the grid has
*/