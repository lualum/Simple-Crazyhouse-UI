// Hard-coded image paths
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

class CrazyhouseGame {
  constructor() {
    this.board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    this.whitePocket = [];
    this.blackPocket = [];
    this.turn = "white";
    this.initializeBoard();
  }

  initializeBoard() {
    const backRank = ["R", "N", "B", "Q", "K", "B", "N", "R"];
    for (let i = 0; i < 8; i++) {
      this.board[0][i] = backRank[i].toLowerCase();
      this.board[1][i] = "p";
      this.board[6][i] = "P";
      this.board[7][i] = backRank[i];
    }
  }

  getPiece(row, col) {
    return this.board[row][col];
  }

  isWhitePiece(piece) {
    return piece && piece === piece.toUpperCase();
  }

  invertPieceColor(piece) {
    if (!piece) return null;
    return this.isWhitePiece(piece)
      ? piece.toLowerCase()
      : piece.toUpperCase();
  }

  addToPocket(piece) {
    let pocketPiece = piece.toUpperCase();
    if (pocketPiece === 'K') return; // Kings cannot be captured in Crazyhouse
    if (this.isWhitePiece(piece)) {
      this.whitePocket.push(pocketPiece);
    } else {
      this.blackPocket.push(pocketPiece);
    }
  }

  findKing(isWhite) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.toUpperCase() === 'K' && this.isWhitePiece(piece) === isWhite) {
          return [row, col];
        }
      }
    }
    return null;
  }

  isSquareAttacked(row, col, byWhite) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && this.isWhitePiece(piece) === byWhite) {
          if (this.canPieceAttack(r, c, row, col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  canPieceAttack(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    if (!piece) return false;

    const pieceType = piece.toUpperCase();
    const isWhite = this.isWhitePiece(piece);
    const direction = isWhite ? -1 : 1;

    switch (pieceType) {
      case 'P':
        return Math.abs(fromCol - toCol) === 1 && toRow - fromRow === direction;
      case 'N':
        const dr = Math.abs(fromRow - toRow);
        const dc = Math.abs(fromCol - toCol);
        return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
      case 'B':
        return this.isDiagonalPath(fromRow, fromCol, toRow, toCol);
      case 'R':
        return this.isStraightPath(fromRow, fromCol, toRow, toCol);
      case 'Q':
        return this.isDiagonalPath(fromRow, fromCol, toRow, toCol) || 
               this.isStraightPath(fromRow, fromCol, toRow, toCol);
      case 'K':
        return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
      default:
        return false;
    }
  }

  isInCheck(isWhite) {
    const kingPos = this.findKing(isWhite);
    if (!kingPos) return false;
    return this.isSquareAttacked(kingPos[0], kingPos[1], !isWhite);
  }

  isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.board[currentRow][currentCol] !== null) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    return true;
  }

  isDiagonalPath(fromRow, fromCol, toRow, toCol) {
    if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;
    return this.isPathClear(fromRow, fromCol, toRow, toCol);
  }

  isStraightPath(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;
    return this.isPathClear(fromRow, fromCol, toRow, toCol);
  }

  isLegalMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    if (!piece) return false;

    const isWhite = this.isWhitePiece(piece);
    if ((this.turn === 'white') !== isWhite) return false;

    const targetPiece = this.board[toRow][toCol];
    if (targetPiece && this.isWhitePiece(targetPiece) === isWhite) return false;

    const pieceType = piece.toUpperCase();
    const direction = isWhite ? -1 : 1;

    let isValid = false;

    switch (pieceType) {
      case 'P':
        if (fromCol === toCol) {
          if (toRow - fromRow === direction && !targetPiece) {
            isValid = true;
          } else if (toRow - fromRow === 2 * direction && !targetPiece) {
            const startRow = isWhite ? 6 : 1;
            if (fromRow === startRow && this.isPathClear(fromRow, fromCol, toRow, toCol)) {
              isValid = true;
            }
          }
        } else if (Math.abs(fromCol - toCol) === 1 && toRow - fromRow === direction && targetPiece) {
          isValid = true;
        }
        break;
      case 'N':
        const dr = Math.abs(fromRow - toRow);
        const dc = Math.abs(fromCol - toCol);
        isValid = (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
        break;
      case 'B':
        isValid = this.isDiagonalPath(fromRow, fromCol, toRow, toCol);
        break;
      case 'R':
        isValid = this.isStraightPath(fromRow, fromCol, toRow, toCol);
        break;
      case 'Q':
        isValid = this.isDiagonalPath(fromRow, fromCol, toRow, toCol) || 
                  this.isStraightPath(fromRow, fromCol, toRow, toCol);
        break;
      case 'K':
        isValid = Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
        break;
    }

    if (!isValid) return false;

    // Check if move leaves king in check
    const originalPiece = this.board[toRow][toCol];
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;
    
    const inCheck = this.isInCheck(isWhite);
    
    this.board[fromRow][fromCol] = piece;
    this.board[toRow][toCol] = originalPiece;

    return !inCheck;
  }

  isLegalDrop(row, col, piece) {
    if (this.board[row][col] !== null) return false;

    const isWhite = this.turn === 'white';
    if ((this.turn === 'white') !== (piece === piece.toUpperCase())) return false;

    // Pawns cannot be dropped on back ranks
    if (piece.toUpperCase() === 'P' && (row === 0 || row === 7)) {
      return false;
    }

    // Simulate the drop
    const finalPiece = isWhite ? piece.toUpperCase() : piece.toLowerCase();
    this.board[row][col] = finalPiece;

    // Check if drop leaves own king in check
    const inCheck = this.isInCheck(isWhite);

    this.board[row][col] = null;

    return !inCheck;
  }

  dropPiece(row, col, piece) {
    if (!this.isLegalDrop(row, col, piece)) return false;

    const finalPiece =
      this.turn === "white" ? piece.toUpperCase() : piece.toLowerCase();
    this.board[row][col] = finalPiece;

    const pocket = this.turn === "white" ? this.whitePocket : this.blackPocket;
    const idx = pocket.indexOf(piece.toUpperCase());
    if (idx > -1) pocket.splice(idx, 1);

    this.turn = this.turn === "white" ? "black" : "white";
    return true;
  }

  movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    if (!piece) return false;

    if (!this.isLegalMove(fromRow, fromCol, toRow, toCol)) return false;

    const captured = this.board[toRow][toCol];
    if (captured) {
      this.addToPocket(this.invertPieceColor(captured));
    }

    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;
    
    if (piece.toUpperCase() === 'P' && (toRow === 0 || toRow === 7)) {
      this.board[toRow][toCol] = this.turn === "white" ? 'Q' : 'q';
    }

    this.turn = this.turn === "white" ? "black" : "white";
    return true;
  }

  reset() {
    this.board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    this.whitePocket = [];
    this.blackPocket = [];
    this.turn = "white";
    this.initializeBoard();
    updateUI();
  }
}

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

      square.addEventListener("dragover", handleDragOver);
      square.addEventListener("drop", handleDrop);
      square.addEventListener("dragleave", handleDragLeave);

      board.appendChild(square);
    }
  }
}

function handleDragStart(e) {
  e.target.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";

  if (e.target.dataset.pocket) {
    e.dataTransfer.setData("pocket", e.target.dataset.pocket);
    e.dataTransfer.setData("piece", e.target.dataset.piece);
  } else {
    e.dataTransfer.setData("row", e.target.dataset.row);
    e.dataTransfer.setData("col", e.target.dataset.col);
  }
}

function handleDragEnd(e) {
  e.target.classList.remove("dragging");
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  e.currentTarget.classList.add("drag-over");
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");

  const toRow = parseInt(e.currentTarget.dataset.row);
  const toCol = parseInt(e.currentTarget.dataset.col);

  const pocket = e.dataTransfer.getData("pocket");

  if (pocket) {
    const piece = e.dataTransfer.getData("piece");
    game.dropPiece(toRow, toCol, piece);
  } else {
    const fromRow = parseInt(e.dataTransfer.getData("row"));
    const fromCol = parseInt(e.dataTransfer.getData("col"));
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
      img.dataset.row = row;
      img.dataset.col = col;
      img.addEventListener("dragstart", handleDragStart);
      img.addEventListener("dragend", handleDragEnd);
      square.appendChild(img);
    }
  });

  updatePocket("white-pocket", game.whitePocket, "white");
  updatePocket("black-pocket", game.blackPocket, "black");
  
  document.getElementById("turn-indicator").textContent = 
    `${game.turn.charAt(0).toUpperCase() + game.turn.slice(1)} to move`;
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
    pieceEl.dataset.pocket = color;
    pieceEl.dataset.piece = piece;

    const img = document.createElement("img");
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