import { CrazyhouseGame } from "./game.js";

const PIECE_IMAGES = {
  K: "pieces/wK.png",
  Q: "pieces/wQ.png",
  R: "pieces/wR.png",
  B: "pieces/wB.png",
  N: "pieces/wN.png",
  P: "pieces/wP.png",
  k: "pieces/bK.png",
  q: "pieces/bQ.png",
  r: "pieces/bR.png",
  b: "pieces/bB.png",
  n: "pieces/bN.png",
  p: "pieces/bP.png",
};

const game = new CrazyhouseGame();

function createBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
      square.dataset.row = row;
      square.dataset.col = col;
      square.dataset.pocket = "false";

      square.addEventListener("dragover", hoverOn);
      square.addEventListener("drop", handleDrop);
      square.addEventListener("dragleave", hoverOff);

      board.appendChild(square);
    }
  }
}

function handleDragStart(e) {
  e.target.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";

  e.dataTransfer.setData("piece", e.target.dataset.piece);
  e.dataTransfer.setData("row", e.target.dataset.row);
  e.dataTransfer.setData("col", e.target.dataset.col);
  e.dataTransfer.setData("pocket", e.target.dataset.pocket);

  console.log("Drag started for piece:", e.target.dataset.piece);
  console.log("Drag started from square:", e.target.dataset.row, e.target.dataset.col);
  console.log("Drag started from pocket:", e.target.dataset.pocket);
}

function handleDragEnd(e) {
  e.target.classList.remove("dragging");

  console.log("Drag ended for piece:", e.target.dataset.piece);
  console.log("Drag ended from square:", e.target.dataset.row, e.target.dataset.col);
  console.log("Drag ended from pocket:", e.target.dataset.pocket);
}

function hoverOn(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  e.currentTarget.classList.add("drag-over");
}

function hoverOff(e) {
  e.currentTarget.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");

  const piece = e.dataTransfer.getData("piece");

  const fromRow = parseInt(e.dataTransfer.getData("row"));
  const fromCol = parseInt(e.dataTransfer.getData("col"));

  const toRow = parseInt(e.currentTarget.dataset.row);
  const toCol = parseInt(e.currentTarget.dataset.col);

  const pocket = e.dataTransfer.getData("pocket") === "true";

  console.log("Drop detected at:", toRow, toCol, "from position: ", fromRow, fromCol, "from pocket:", pocket);

  if (pocket) {
    game.dropPiece(toRow, toCol, piece);
  } else {
    game.movePiece(fromRow, fromCol, toRow, toCol);
  }

  updateUI();
}

function updateUI() {
  const squares = document.querySelectorAll(".square");
  squares.forEach((square) => {
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = game.getPiece(row, col);

    square.innerHTML = "";

    if (piece) {
      const img = document.createElement("img");
      img.src = PIECE_IMAGES[piece];
      img.className = "piece";
      img.draggable = true;
      img.dataset.piece = piece;
      img.dataset.row = row;
      img.dataset.col = col;
      img.dataset.pocket = "false";
      img.addEventListener("dragstart", handleDragStart);
      img.addEventListener("dragend", handleDragEnd);
      square.appendChild(img);
    }
  });

  updatePocket("top-pocket", game.blackPocket, "black");
  updatePocket("bottom-pocket", game.whitePocket, "white");
}

function updatePocket(id, pieces, color) {
  const pocket = document.getElementById(id);
  pocket.innerHTML = "";

  const pieceCounts = {};
  pieces.forEach((p) => {
    pieceCounts[p] = (pieceCounts[p] || 0) + 1;
  });

  Object.entries(pieceCounts).forEach(([piece, count]) => {
    const pieceEl = document.createElement("div");
    pieceEl.className = "pocket-piece";
    pieceEl.draggable = true;

    const img = document.createElement("img");
    img.dataset.piece = piece;
    img.dataset.row = "NaN";
    img.dataset.col = "NaN";
    img.dataset.pocket = "true";

    const displayPiece =
      color === "white" ? piece.toUpperCase() : piece.toLowerCase();
    img.src = PIECE_IMAGES[displayPiece];
    pieceEl.appendChild(img);

    if (count > 1) {
      const countBadge = document.createElement("div");
      countBadge.className = "pocket-count";
      countBadge.textContent = count;
      pieceEl.appendChild(countBadge);
    }

    pieceEl.addEventListener("dragstart", handleDragStart);
    pieceEl.addEventListener("dragend", handleDragEnd);
    pocket.appendChild(pieceEl);
  });
}

createBoard();
updateUI();