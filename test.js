var FPS = 30;
var SPEED = 1;
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var sqr = function(x, y) {
    return x*x + y*y;
};
sqr.best = [0, 0];
sqr.limits = [-100, -100, 100, 100];
var easo = function(x, y) {
    x = x - 500;
    y = y - 500;
    return -Math.cos(x) * Math.cos(y) * Math.exp((-(x - Math.PI) * (x - Math.PI)) - (y - Math.PI) * (y - Math.PI));
};
easo.best = [0, 0];
easo.limits = [-2, -2, 2, 2];
var rast = function(x, y) {
    return 20 + x*x - 10*Math.cos(2*Math.PI*x) + y*y - 10*Math.cos(2*Math.PI*y);
};
rast.best = [0, 0];
rast.limits = [-5, -5, 5, 5];

// Choose a function
var fun = sqr;

// Set up viewport
Viewport.setCanvas(canvas);
Viewport.setView.apply(null, fun.limits);
Viewport.setBG(fun);

// Set up PSO
PSO.create(fun, 10, fun.limits[0], fun.limits[1], fun.limits[2], fun.limits[3], function() { return Vect.randomInSphere(2, null, 5); });
PSO.setUpdateMethod("box");

var parts = null;
var nextParts = null;
var tweens = [];
var goal = null;
parts = PSO.getParticles();
PSO.update();
nextParts = PSO.getParticles();
tweens = _.reduce(_.zip(parts, nextParts), function(memo, pair) {
    memo.push(Tween.newTween(pair[0], pair[1], SPEED));
    return memo;
}, []);
goal = Tween.newTween(goalParticle(), goalParticle(), SPEED)
function nextParticles() {
    parts = nextParts || PSO.getParticles();
    PSO.update();
    nextParts = PSO.getParticles();
    _.map(_.zip(nextParts, tweens), function(pair) {
        pair[1].addParticle(pair[0]);
    });
    goal.addParticle(goalParticle());
}
nextParticles();
var moreParticles = setInterval(function() {
    nextParticles();
}, 1000 / SPEED);
var drawInterval = setInterval(function() {
    Viewport.clear();
    Viewport.drawBG();
    _.map(tweens, function(t) {
        drawTween(t);
    });
    Viewport.drawBall(goal.getPosition(), 10, 'green');
    Viewport.drawBall(fun.best, 10, 'red');
    Viewport.drawText(PSO.getIteration());
}, 1000 / FPS);

// Draw a tween at the position given by the current time
function drawTween(tween) {
    Viewport.drawBall(tween.getCurrent().best.loc, 10, 'yellow');
    Viewport.drawBall(tween.getPosition(), 10, 'black');
}
function goalParticle() {
    var goal = PSO.getBest();
    return {
        pos: goal.loc,
        vel: Vect.create(0,0)
    };
}

