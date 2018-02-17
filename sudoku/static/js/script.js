"use strict";

//STATE VARIABLES
let points = 0;
let startTime = new Date().getTime();
let board = [];

// SUDOKU FUNCTIONS
let init = () => {
  window.parent.postMessage({
    messageType: "SETTING",
    options: {
      "width": 600,
      "height": 700
      }
  }, "*");
  let sudoku = document.getElementById('sudoku');
  for(let i=1;i<=9;i++){
    let row = document.createElement('tr');
    let board_row = [];
    for(let j=1;j<=9;j++){
      let cell = document.createElement('td');
      cell.className = "r"+i+" c"+j;
      let input = document.createElement('input');
      input.setAttribute("type", "number");
      cell.appendChild(input);
      row.appendChild(cell);
      board_row.push(0);
    }
    sudoku.appendChild(row);
    board.push(board_row);
  }

  let grill = [
  [1,1,5],[1,2,3],                [1,5,7],
  [2,1,6],                [2,4,1],[2,5,9],[2,6,5],
          [3,2,9],[3,3,8],                                [3,8,6],
  [4,1,8],                        [4,5,6],                        [4,9,3],
  [5,1,4],                [5,4,8],        [5,6,3],                [5,9,1],
  [6,1,7],                        [6,5,2],                        [6,9,6],
          [7,2,6],                                [7,7,2],[7,8,8],
                          [8,4,4],[8,5,1],[8,6,9],                [8,9,5],
                                  [9,5,8],                [9,8,7],[9,9,9]
  ];
  grill.forEach(x => {
    let el = document.querySelector('.r'+x[0]+'.c'+x[1]);
    board[x[0]-1][x[1]-1] = x[2];
    el.innerHTML = '<input type="number" value="'+x[2]+'" disabled>';
    el.className = el.className+' grey';
  });
}

Array.prototype.check = function(r1,r2,c1,c2){
  let s = new Set();
  for(let i=r1;i<r2;i++) {
    for(let j=c1;j<c2;j++) {
      s.add(parseInt(this[i][j]));
    }
  }
  s.delete(0);
  return s.size == 9;
}

function getBoard() {
  let matrix = [];
  let sudoku = document.getElementById('sudoku');
  for (let i = 1; i <= 9; i++) {
    let row = [];
    for (let j = 1; j <= 9; j++) {
      let el = document.querySelector('.r'+i+'.c'+j+'>input');
      row.push(parseInt(el.value));
    }
    matrix.push(row);
  }
  console.log(matrix);
  return matrix;
}

function done() {
  let res = true;
  for(let i=0;i<3;i++){
    for(let j=0;j<3;j++){
      res = res && board.check(3*i,3*i+3,3*j,3*j+3);
    }
  }
  for(let i=0;i<9;i++){
      res = res && board.check(i,i+1,0,9);
      res = res && board.check(0,9,i,i+1);    
  }
  return res;
}

function pack() {
  let p = ""
  for(let i=0;i<9;i++){
    for(let j=0;j<9;j++){
      let val = parseInt(board[i][j]);
      p = p.concat((val>0 && val<10)?val.toString():"0");
    }
  }
  return p;
}

function unpack(b) {
  let matrix = [];
  let sudoku = document.getElementById('sudoku');
  for (let i = 0; i < 9; i++) {
    let row = [];
    for (let j = 0; j < 9; j++) {
      let v = parseInt(b[i*9+j]);
      row.push(parseInt(v));
    }
    matrix.push(row);
  }
  board = matrix;
  return matrix;
}

function resume(state) {
  let sudoku = document.getElementById('sudoku');
  for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= 9; j++) {
      let val = state[i-1][j-1]
      document.querySelector('.r'+i+'.c'+j+'>input').value = val>0?val:'';
    }
  }
}

// MESSAGES FUNCTIONS
function score() {
  let score = done()? parseInt(1000000000/(new Date().getTime() - startTime)): 0;
  let msg = {
    "messageType": "SCORE",
    "score": score,
  };
  console.log(msg);
  window.parent.postMessage(msg, "*");
}

function save() {
  let msg = {
    "messageType": "SAVE",
    "gameState": {
      "board": pack(board),
      "elapsedTime": new Date().getTime() - startTime,
    }
  };
  console.log(msg);
  window.parent.postMessage(msg, "*");
}

function load() {
  var msg = {
    "messageType": "LOAD_REQUEST",
  };
  console.log(msg);
  window.parent.postMessage(msg, "*");
}

function message(evt) {
  if(evt.data.messageType === "LOAD") {
    let board = evt.data.gameState.board;
    let elapsedTime = evt.data.gameState.elapsedTime;
    resume(unpack(board));
    startTime = new Date().getTime() - elapsedTime;
  } else if (evt.data.messageType === "ERROR") {
    alert(evt.data.info);
  }
}

function showWin() {
  let inputs = Array.prototype.slice.call(document.querySelectorAll('#sudoku input'));
  inputs.map(i => {
    i.remove();
  })
  let message = ' YOU WIN ';
  let i = 1;
  function animate() {
    let l = message[0];
    if(message){
      message = message.slice(1);
      let c = '.r5.c';
      let square = document.querySelector(c+i);
      square.className = c+i;
      square.innerHTML = l;
      i++;
      setTimeout(animate, 200);
    }
  };
  animate();
}
//LISTENERS
document.getElementById("save").addEventListener("click", save);
document.getElementById("load").addEventListener("click", load);
window.addEventListener("message", message);
document.getElementById("sudoku").addEventListener("change", function (e) {
  let classes = e.target.parentElement.className;
  let r = classes.match(/r[0-9]/)[0].match(/[0-9]/)-1;
  let c = classes.match(/c[0-9]/)[0].match(/[0-9]/)-1;
  board[r][c] = e.target.value;
  if(done()){
    score();
    setTimeout(showWin, 200);
  }
});

//INITIALIZATION
init()
