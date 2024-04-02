const { World, Engine, Runner, Bodies, Render, Body, Events } = Matter;

function createMaze() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const rowNum = 6;
  const colNum = 6;

  const horizontalUnitLength = width / colNum;
  const verticalUnitLength = height / rowNum;

  const engine = Engine.create();
  const { world } = engine;
  engine.world.gravity.y = 0;

  const render = Render.create({
    // element: document.body,
    element: document.querySelector("#maze"),
    engine: engine,
    options: {
      wireframes: false,
      width,
      height,
    },
  });

  Render.run(render);
  Runner.run(Runner.create(), engine);

  const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  ];

  World.add(world, walls);

  //maze generation
  const shuffel = (arr) => {
    let counter = arr.length;
    while (counter > 0) {
      let randIndex = Math.floor(Math.random() * counter);
      counter--;
      let temp = arr[randIndex];
      arr[randIndex] = arr[counter];
      arr[counter] = temp;
    }
    return arr;
  };

  const grid = new Array(rowNum)
    .fill(null)
    .map(() => new Array(colNum).fill(false));
  const verticals = new Array(rowNum)
    .fill(null)
    .map(() => new Array(colNum - 1).fill(false));
  const horizontals = new Array(rowNum - 1)
    .fill(null)
    .map(() => new Array(colNum).fill(false));

  const startRow = Math.floor(Math.random() * rowNum);
  const startCol = Math.floor(Math.random() * colNum);

  // const navigateGrid = (rowNum, colNum) => {
  const navigateGrid = (currRow, currCol) => {
    //if the cell at [rowNum,colNum] is visited return
    if (grid[currRow][currCol]) return;
    //mark this cell as visited
    grid[currRow][currCol] = true;
    //assemble randomly ordered list of neighbors
    const neighbors = shuffel([
      [currRow - 1, currCol, "up"],
      [currRow, currCol + 1, "right"],
      [currRow + 1, currCol, "down"],
      [currRow, currCol - 1, "left"],
    ]);
    //for each neighbor...
    for (let neighbor of neighbors) {
      const [nextRow, nextCol, direction] = neighbor;

      //see if that neighbor is out of bounds
      if (
        nextRow < 0 ||
        nextRow > rowNum - 1 ||
        nextCol < 0 ||
        nextCol > colNum - 1
      )
        continue;
      //if it has been visited,continue to the next neighbor

      if (grid[nextRow][nextCol]) continue;
      //remove a wall from wither verticals or horizontals
      if (direction === "left") {
        verticals[currRow][currCol - 1] = true;
      } else if (direction === "right") {
        verticals[currRow][currCol] = true;
      } else if (direction === "up") {
        horizontals[currRow - 1][currCol] = true;
      } else if (direction === "down") {
        horizontals[currRow][currCol] = true;
      }

      //visit that next cell
      navigateGrid(nextRow, nextCol);
    }
  };

  navigateGrid(startRow, startCol);
  horizontals.forEach((row, rowIndex) => {
    row.forEach((open, colIndex) => {
      if (open) return;

      const wall = Bodies.rectangle(
        colIndex * horizontalUnitLength + horizontalUnitLength / 2,
        rowIndex * verticalUnitLength + verticalUnitLength,
        horizontalUnitLength,
        10,
        { isStatic: true, render: { fillStyle: "#BFC9CA" }, label: "wall" }
      );

      World.add(world, wall);
    });
  });

  verticals.forEach((row, rowIndex) => {
    row.forEach((open, colIndex) => {
      if (open) return;

      const wall = Bodies.rectangle(
        colIndex * horizontalUnitLength + horizontalUnitLength,
        rowIndex * verticalUnitLength + verticalUnitLength / 2,
        10,
        verticalUnitLength,

        { isStatic: true, render: { fillStyle: "#BFC9CA" }, label: "wall" }
      );

      World.add(world, wall);
    });
  });

  //GOAL
  const goal = Bodies.rectangle(
    (colNum - 1) * horizontalUnitLength + horizontalUnitLength / 2,
    (rowNum - 1) * verticalUnitLength + verticalUnitLength / 2,
    horizontalUnitLength / 2,
    verticalUnitLength / 2,
    { isStatic: true, render: { fillStyle: "#58D68D" }, label: "goal" }
  );

  World.add(world, goal);

  //BALL
  const ball = Bodies.circle(
    horizontalUnitLength / 2,
    verticalUnitLength / 2,
    Math.min(horizontalUnitLength, verticalUnitLength) / 4,
    { render: { fillStyle: "#3498DB" }, label: "ball" }
  );

  World.add(world, ball);

  document.addEventListener("keydown", (event) => {
    const { x, y } = ball.velocity;
    //UP
    if (event.keyCode === 87) {
      Body.setVelocity(ball, { x, y: y - 5 });
    }

    //RIGHT
    if (event.keyCode === 68) {
      Body.setVelocity(ball, { x: x + 5, y });
    }

    //DOWN
    if (event.keyCode === 83) {
      Body.setVelocity(ball, { x, y: y + 5 });
    }

    //LEFT
    if (event.keyCode === 65) {
      Body.setVelocity(ball, { x: x - 5, y });
    }
  });

  Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
      const labels = ["goal", "ball"];
      if (
        labels.includes(collision.bodyA.label) &&
        labels.includes(collision.bodyB.label)
      ) {
        world.gravity.y = 1;
        world.bodies.forEach((body) => {
          if (body.label === "wall") {
            Body.setStatic(body, false);
          }
        });
        document.querySelector(".winner").classList.remove("hidden");
      }
    });
  });
}

createMaze();

function closeHelp() {
  const help = document.querySelector(".help");
  if (!help.classList.contains("hidden")) {
    help.classList.add("hidden");
  }
}

function showHelp() {
  const help = document.querySelector(".help");
  if (help.classList.contains("hidden")) {
    help.classList.remove("hidden");
  }
}

function playAgain() {
  const winnerMsg = document.querySelector(".winner");
  if (!document.querySelector(".winner").classList.contains("hidden"))
    document.querySelector(".winner").classList.add("hidden");
  document.querySelector("#maze").innerHTML = "";
  createMaze();
}
