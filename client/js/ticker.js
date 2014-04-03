// this is going to make us a tic tac toe of amazing proportion!

var canvas = document.getElementById('tictac');
var ctx = canvas.getContext('2d');

var tactoe = postal.channel();

// fun hack!
var width = canvas.width;

var padding = 10;
var size = 100;

var players = ['USA', 'Canada'];
var playerColors = ['#2368A0', '#B13631'];
var activePlayer = 0;
var ended = false;

function Square(x,y) {
  this.top  = padding + (padding + size) * y;
  this.left = padding + (padding + size) * x;
  
  this.x = x;
  this.y = y;
  
  this.size = size;
  
  tactoe.subscribe('click.registered', this._checkClick.bind(this));
}
Square.prototype.render = function(ctx) {
  if(this.claimed) {
    ctx.fillStyle = playerColors[this.owner]; 
  }

  this.xMin = this.left;
  this.xMax = this.left + this.size;
  this.yMin = this.top;
  this.yMax = this.top + this.size;
  return ctx.fillRect(this.left, this.top, this.size, this.size);
}

Square.prototype.claim = function(value) {
  if(ended || this.claimed || value === undefined) { return; }
  this.claimed = true;
  this.owner = value;
  tactoe.publish('square.claimed', { x : this.x, y : this.y, for : value });
  this.render(ctx);
  return value;
}
Square.prototype.pointInRect = function(x, y) {
  return x > this.xMin && x <= this.xMax && y > this.yMin && y <= this.yMax;
}
Square.prototype._checkClick = function(d) {
  if(this.pointInRect(d.x, d.y)) {
     this.clicked.bind(this)();
  }
}
Square.prototype.clicked = function() {
  console.log('you clicked', this.x, this.y);
  this.claim(activePlayer);
}

var squares = [];
var sq;
for(var i=0;i<3;++i) {
  for(var j=0;j<3;++j) {
    squares.push(sq = new Square(i, j));
    sq.render(ctx);
  }
}

function checkSame(a,b,c) {
  var a = squares[a], b = squares[b], c = squares[c];
  if (a.claimed && b.claimed && c.claimed && a.owner === b.owner && a.owner === c.owner){
    return a.owner + 1;
  }
}
function detectDraw(squares) {
  return squares.reduce(function(memo, value) { return memo && value.claimed}, true);
}

function findWinner(){
         //check horizontal
  return checkSame(0,1,2) || checkSame(3,4,5) || checkSame(6,7,8) ||
         //check vertical
         checkSame(0,3,6) || checkSame(1,4,7) || checkSame(2,5,8) ||
         //check diagonal
         checkSame(0,4,8) || checkSame(2,4,6) || detectDraw(squares);
}

function checkWin() {
  var winner = findWinner();
  if(winner !== undefined) {
    tactoe.publish('game.over', { winner: winner - 1 });
  }
}

// squares[2].claim('KANADA');

//tactoe.subscribe('square.claimed', function(data) { console.log('claimed!', data.x, data.y, data.for); });
tactoe.subscribe('square.claimed', function(data) {
  activePlayer = (activePlayer + 1) % 2;
  console.log('active', players[activePlayer]);
});
tactoe.subscribe('square.claimed', checkWin);
tactoe.subscribe('game.over', function(data) {
  ended = true;
  if(data.winner >= 0) {
    alert('Yaaay! ' + players[data.winner]);
  } else {
    alert('Draw.');
  }
});

canvas.addEventListener('click', function(evt) {
  tactoe.publish('click.registered', { x : evt.layerX, y : evt.layerY });
});