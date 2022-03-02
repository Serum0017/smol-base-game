const { Obstacle } = require("../obstacles.js");

let map = {
    default: {
        enemies: [],
        obstacles: [],
        bgColor: '#1f2229',
        tileColor: '#323645',
        width: 1000,
        height: 200,
        spawn: {x: 25, y: 100},
    },
    areas: [
        {
            enemies: [],
            obstacles: [
                //new Obstacle({x:250,y:100,w:75,h:50,rotateSpeed:0.05,startAngle:0,type:'rotate'}),
                //new Obstacle({x:50,y:100,w:100,h:50,type:'safe'}),
                //new Obstacle({x:50,y:150,w:350,h:50,type:'normal'}),
                //new Obstacle({x:300,y:0,w:50,h:50,effect:10,type:'normal'}),
                //new Obstacle({w:50,h:50,startPoint:0,points:[[0,0],[300,0],[300,150]],speed:0.1,type:'move'}),
                new Obstacle({x:450,y:100,w:50,h:75,rotateSpeed:0.1,startAngle:0,effect:1.01,type:['rotate']}),
            ],
            bgColor: '#1f2229',
            tileColor: '#323645',
        },
        {
            enemies: [],
            obstacles: [],
            bgColor: '#1f2229',
            tileColor: '#323645',
        },
        {
            enemies: [],
            obstacles: [],
            bgColor: '#1f2229',
            tileColor: '#323645',
            spawn: {x: 25, y: 25},
        },
    ]
}
module.exports = map;