var SAT = require('sat');
function runObstaclePhysics(obstacles) {
    for(let i in obstacles){
        obstacles[i].simulate(dt);
    }
}
function findDistance(x1,y1,x2,y2){
    return(Math.sqrt((x2-x1)**2+(y2-y1)**2));
}
function boundCircleRect(circle, rect){
    var c = new SAT.Circle(new SAT.Vector(circle.x,circle.y), circle.radius);
    var r = new SAT.Box(new SAT.Vector(rect.x,rect.y), rect.w, rect.h);
    var response = new SAT.Response();
    const collided = SAT.testCirclePolygon(c, r.toPolygon(), response);
    if(collided){
        return response;
    } else {
        return false;
    }
}
function boundPlayerRotatingObstacle(player, obstacle) {
	const oldAngle = obstacle.angle;
	obstacle.angle = Math.PI/180*obstacle.angle;
	obstacle.angle = oldAngle;
    const oldX = obstacle.x;
    const oldY = obstacle.y;
    obstacle.x -= obstacle.w / 2;
    obstacle.y -= obstacle.h / 2;
    const points = [
        rotatePoint(obstacle.x, obstacle.y, obstacle.pivotX, obstacle.pivotY, obstacle.angle, obstacle.distToPivot),
        rotatePoint(obstacle.x + obstacle.w, obstacle.y, obstacle.pivotX, obstacle.pivotY, obstacle.angle, obstacle.distToPivot),
        rotatePoint(obstacle.x + obstacle.w, obstacle.y + obstacle.h, obstacle.pivotX, obstacle.pivotY, obstacle.angle, obstacle.distToPivot),
        rotatePoint(obstacle.x, obstacle.y + obstacle.h, obstacle.pivotX, obstacle.pivotY, obstacle.angle, obstacle.distToPivot),
    ]
    obstacle.x = oldX;
    obstacle.y = oldY;
    const polySat = new SAT.Polygon(new SAT.Vector(0, 0), [...points.map(({x, y}) => new SAT.Vector(x, y))])
    const psat = new SAT.Circle(new SAT.Vector(player.x,player.y), player.radius);
    let response = new SAT.Response();
    const collision = SAT.testPolygonCircle(polySat, psat, response);
    if (collision) {
        return response;
    } else {
        return false;
    }
}
function runCollision (players, obstacles, arena){
    for(let i in players){
        let player = players[i];

        // bounding player w/ arena
        if (player.x - player.radius < 0) {
            player.x = player.radius;
            player.xChanged = true;
        } else if (player.x + player.radius > arena.width) {
            player.x = arena.width - player.radius;
            player.xChanged = true;
        }

        if (player.y - player.radius < 0) {
            player.y = player.radius;
            player.yChanged = true;
        } else if (player.y + player.radius > arena.height) {
            player.y = arena.height - player.radius;
            player.yChanged = true;
        }

        // collision with obstacles
        for(let o in obstacles){
            let obstacle = obstacles[o];
            if(obstacle.type == 'rotate'){
                let r = boundPlayerRotatingObstacle(player, obstacle)
                if(r){
                    runCollisionEffects(player, obstacle, r);
                    player.xChanged = true;
                    player.yChanged = true;
                }
            } else {
                let r = boundCircleRect(player, obstacle);
                if(r){
                    runCollisionEffects(player, obstacle, r);
                    player.xChanged = true;
                    player.yChanged = true;
                }
            }
        }
    }
}

function runCollisionEffects(circle, rect, resp){
    if(!circle.dead){
        // effects
        if(rect.type.includes('bounce')){
            resp.overlapV.x *= rect.effect;
            resp.overlapV.y *= rect.effect;
        }
        if(rect.type.includes('lava')){
            circle.dead = true;
            circle.deadChanged = true;
        }
        // custom collision
        if(rect.type.includes('rotate')){
            circle.x += resp.overlapV.x;
            circle.y += resp.overlapV.y;
        }
        if(rect.type.includes('normal') || rect.type.includes('move')){
            circle.x -= resp.overlapV.x;
            circle.y -= resp.overlapV.y;
        }
    }
    if(rect.type.includes('safe')){
        circle.dead = false;
        circle.deadChanged = true;
    }
}

function rotatePoint (pointX, pointY, originX, originY, angle, distToPivot=1) {
    angle = (angle * Math.PI) / 180.0;
    return {
        x:
            Math.cos(angle)  * (pointX - originX) -
            Math.sin(angle)  * (pointY - originY) +
            originX,
        y:
            Math.sin(angle)  * (pointX - originX) +
            Math.cos(angle)  * (pointY - originY) +
            originY,
    };
}

module.exports = {
    runObstaclePhysics,
    runCollision,
}