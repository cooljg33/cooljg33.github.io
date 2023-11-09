import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS } from "./fruits";

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F2FFE9",
    width: 620,
    height: 850,
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#557C55" }
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#557C55" }
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: "#557C55" }
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#557C55" }
})

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
let score = 0; 
let gameOver = false;

const scoreDisplay = document.createElement("div"); 
scoreDisplay.id = "score-display";
scoreDisplay.innerText = `Score: ${score}`;
document.body.appendChild(scoreDisplay);

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];
  
  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping : true,
    render: {
      sprite: { texture: `${fruit.name}.png`}
    },
    restitution: 0.5,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }
  switch(event.code) {
    case "ArrowLeft":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 30)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1.5,
            y: currentBody.position.y,
          });
      }, 5);
      break;

    case "ArrowRight":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < 590)
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1.5,
            y: currentBody.position.y,
          });
      }, 5);
      break;

    case "ArrowDown":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 800);
      break;
    case "Space":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 800);
      break;
  } 
}

window.onkeyup = (event) => {
  switch (event.code) {
    case "ArrowRight":
    case "ArrowLeft":
      clearInterval(interval);
      interval = null;
  }
}

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;

      if (index === FRUITS.length - 1) {
        return;
      }

      const points = (index+1)*10
      score += points;
      scoreDisplay.innerText = `Score: ${score}`;
      
      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.name}.png`}
          },
          index: index + 1,
        }
      );

      World.add(world, newBody);
    }

    if (
      !disableAction &&
      (collision.bodyA.name === "topLine" || collision.bodyB.name == "topLine")) {
      alert("Game over");
      onGameOver()
    }
  });
})

function onGameOver() {
  World.remove(world, world.bodies.filter(body => body.render.sprite));
  gameOver = true; 
  const finalScore = score; 
  scoreDisplay.innerText = `Final Score: ${finalScore}`;
  scoreDisplay.style.fontSize = "50px";
  scoreDisplay.style.color = "red"; 
  scoreDisplay.style.fontWeight = "bold";
  scoreDisplay.style.position = "absolute";
  scoreDisplay.style.top = "20%";
  scoreDisplay.style.left = "34%";
  scoreDisplay.style.transform = "translate(-50%, -50%)";
}


addFruit();