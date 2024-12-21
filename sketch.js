let sprites = {
  player1: {
    hit: { img: null, width: 115, height: 108, frames: 5 },
    throw: { img: null, width: 101, height: 121, frames: 5 },
    down: { img: null, width: 115, height: 79, frames: 5 }
  },
  player2: {
    fly: { img: null, width: 105, height: 86, frames: 4 },
    failed: { img: null, width: 151, height: 125, frames: 5 },
    attack: { img: null, width: 131, height: 116, frames: 5 }
  },
  bomb: { img: null, width: 50, height: 50 },
  background: { img: null } // 新增背景圖片
};

let player1 = {
  x: 100,
  y: 300,
  speedX: 5,
  speedY: 0,
  gravity: 0.8,
  jumpForce: -15,
  isJumping: false,
  groundY: 300,
  direction: 1, // 1 為向右，-1 為向左
  health: 100,
  currentAction: "hit"
};

let player2 = {
  x: 600,
  y: 300,
  speedX: 5,
  speedY: 0,
  gravity: 0.8,
  jumpForce: -15,
  isJumping: false,
  groundY: 300,
  direction: 1, // 1 為向右，-1 為向左
  health: 100,
  currentAction: "attack"
};

let player1Animation = {
  current: null, // 當前動畫
  frameIndex: 0, // 當前幀索引
  frameCount: 0  // 幀計數
};

let player2Animation = {
  current: null, // 當前動畫
  frameIndex: 0, // 當前幀索引
  frameCount: 0  // 幀計數
};

let bombs = []; // 存儲炸彈

const FRAME_DELAY = 7; // 動畫幀延遲

function preload() {
  // 載入背景圖片
  sprites.background.img = loadImage("background.png"); // 載入你的背景圖片

  // 載入 player1 的圖片
  sprites.player1.hit.img = loadImage("hit.png");
  sprites.player1.throw.img = loadImage("throw.png");
  sprites.player1.down.img = loadImage("down.png");

  // 載入 player2 的圖片
  sprites.player2.fly.img = loadImage("fly.png");
  sprites.player2.failed.img = loadImage("failed.png");
  sprites.player2.attack.img = loadImage("attack.png");

  // 載入炸彈圖片
  sprites.bomb.img = loadImage("bomb.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 設定初始動畫
  player1Animation.current = sprites.player1.hit;
  player2Animation.current = sprites.player2.attack;
}

function draw() {
  // 顯示背景圖片
  image(sprites.background.img, 0, 0, width, height); // 顯示背景圖片，拉伸填滿整個畫布

  // 繪製血量條
  drawHealthBar(player1);
  drawHealthBar(player2);

  // 更新並繪製 Player1
  updatePlayer(player1, player1Animation, 65, 87, 68, 70); // A, W, D, F
  drawPlayerAnimation(player1, player1Animation);

  // 更新並繪製 Player2
  updatePlayer(player2, player2Animation, LEFT_ARROW, UP_ARROW, RIGHT_ARROW, 32); // 左, 上, 右, Space
  drawPlayerAnimation(player2, player2Animation);

  // 更新並繪製炸彈
  updateAndDrawBombs();
}

// 更新玩家狀態（移動、跳躍、丟炸彈）
function updatePlayer(player, animation, leftKey, jumpKey, rightKey, bombKey) {
  // 移動邏輯
  if (keyIsDown(leftKey)) {
    player.x -= 5;
    player.direction = -1; // 更新方向為向左
    animation.current = player === player1 ? sprites.player1.hit : sprites.player2.failed;
  } else if (keyIsDown(rightKey)) {
    player.x += 5;
    player.direction = 1; // 更新方向為向右
    animation.current = player === player1 ? sprites.player1.down : sprites.player2.failed;
  }

  // 跳躍邏輯
  if (keyIsDown(jumpKey) && !player.isJumping) {
    player.speedY = player.jumpForce;
    player.isJumping = true;
    animation.current = player === player1 ? sprites.player1.throw : sprites.player2.fly;
  }

  if (player.y < player.groundY) {
    player.speedY += player.gravity;
  } else {
    player.y = player.groundY;
    player.isJumping = false;
  }

  player.y += player.speedY;

  // 丟炸彈
  if (keyIsDown(bombKey)) {
    throwBomb(player);
  }
}

// 更新炸彈並檢查碰撞
function updateAndDrawBombs() {
  for (let i = bombs.length - 1; i >= 0; i--) {
    let bomb = bombs[i];

    // 更新炸彈位置
    bomb.x += bomb.speedX;
    bomb.y += bomb.speedY;
    bomb.speedY += bomb.gravity;

    // 碰撞檢查
    if (checkCollision(bomb, player1)) {
      bomb.active = false;
      player1.health -= 10;
      player1.health = max(0, player1.health); // 限制生命值下限為 0
    }
    if (checkCollision(bomb, player2)) {
      bomb.active = false;
      player2.health -= 10;
      player2.health = max(0, player2.health); // 限制生命值下限為 0
    }

    if (!bomb.active) {
      bombs.splice(i, 1); // 刪除炸彈
    } else {
      // 繪製炸彈
      image(sprites.bomb.img, bomb.x, bomb.y, sprites.bomb.width, sprites.bomb.height);
    }
  }
}

// 丟炸彈
function throwBomb(player) {
  let bomb = {
    x: player.x + (player.direction > 0 ? 50 : -50), // 根據方向生成炸彈
    y: player.y + 20,
    speedX: player.direction * 7, // 根據方向決定炸彈速度
    speedY: 0,
    gravity: 0.2,
    active: true
  };
  bombs.push(bomb);
}

// 碰撞檢查
function checkCollision(bomb, player) {
  return (
    bomb.x < player.x + 50 && 
    bomb.x + 50 > player.x && 
    bomb.y < player.y + 50 && 
    bomb.y + 50 > player.y
  );
}

// 繪製角色動畫
function drawPlayerAnimation(player, animation) {
  if (animation.current && animation.current.img) {
    let currentSprite = animation.current;

    let frameWidth = currentSprite.width;
    let frameHeight = currentSprite.height;
    let sx = animation.frameIndex * frameWidth; // 計算切割圖片的起始 X
    let sy = 0; // 假設只有一排動畫

    push();
    translate(player.x, player.y);
    scale(player.direction, 1); // 根據方向翻轉角色

    image(
      currentSprite.img,
      0, 0, frameWidth, frameHeight, // 顯示的範圍
      sx, sy, frameWidth, frameHeight // 切割的範圍
    );
    pop();

    // 更新動畫幀
    animation.frameCount++;
    if (animation.frameCount >= FRAME_DELAY) {
      animation.frameIndex = (animation.frameIndex + 1) % currentSprite.frames;
      animation.frameCount = 0;
    }
  }
}

// 繪製血量條
function drawHealthBar(player) {
  const barWidth = 100;
  const barHeight = 10;
  const healthRatio = player.health / 100;

  fill(255, 0, 0);
  rect(50, 20 + (player === player1 ? 0 : 20), barWidth * healthRatio, barHeight); // 顯示
}