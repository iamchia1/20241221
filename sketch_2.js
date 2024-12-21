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
    bomb: {
      img: null,
      width: 50,
      height: 50
    },
    background: { img: null }
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
  
  let bombs = [];
  
  const FRAME_DELAY = 7; // 動畫幀延遲
  
  function preload() {
    // 載入背景圖片
    sprites.background.img = loadImage("background.png");
  
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
    player1Animation.current = sprites.player1.hit;
    player2Animation.current = sprites.player2.attack;
  }
  
  function draw() {
    background(255);
    image(sprites.background.img, 0, 0, width, height); // 顯示背景圖
  
    // 更新並繪製 Player1
    updatePlayer(player1, player1Animation, 65, 87, 68); // A, W, D
    drawPlayerAnimation(player1, player1Animation);
  
    // 更新並繪製 Player2
    updatePlayer(player2, player2Animation, LEFT_ARROW, UP_ARROW, RIGHT_ARROW); // 左, 上, 右
    drawPlayerAnimation(player2, player2Animation);
  
    // 更新並繪製炸彈
    updateAndDrawBombs();
  
    // 繪製血量條
    drawHealthBar(player1, 50);  // Player1 血量條顯示於畫面左上
    drawHealthBar(player2, width - 150);  // Player2 血量條顯示於畫面右上
  }
  
  // 更新玩家狀態（移動、跳躍、切換技能）
  function updatePlayer(player, animation, leftKey, jumpKey, rightKey) {
    // 按下左鍵 (向左移動並釋放 hit 技能)
    if (keyIsDown(leftKey)) {
      player.x -= 5;
      player.direction = -1;
      animation.current = player === player1 ? sprites.player1.hit : sprites.player2.failed; // 切換動畫
    }
  
    // 按下右鍵 (向右移動並釋放 down 技能)
    else if (keyIsDown(rightKey)) {
      player.x += 5;
      player.direction = 1;
      animation.current = player === player1 ? sprites.player1.down : sprites.player2.failed; // 切換動畫
    }
  
    // 按下跳躍鍵 (跳躍並釋放 throw 技能)
    if (keyIsDown(jumpKey) && !player.isJumping) {
      player.speedY = player.jumpForce;
      player.isJumping = true;
      animation.current = player === player1 ? sprites.player1.throw : sprites.player2.fly; // 切換動畫
    }
  
    // 應用重力
    if (player.y < player.groundY) {
      player.speedY += player.gravity;
    } else {
      player.y = player.groundY;
      player.isJumping = false;
    }
  
    // 更新 Y 軸位置
    player.y += player.speedY;
  }
  
  // 繪製角色動畫
  function drawPlayerAnimation(player, animation) {
    if (animation.current && animation.current.img) {
      let currentSprite = animation.current;
  
      let frameWidth = currentSprite.width;
      let frameHeight = currentSprite.height;
      let sx = animation.frameIndex * frameWidth;
      let sy = 0;
  
      push();
      translate(player.x, player.y);
      scale(player.direction, 1);
  
      image(
        currentSprite.img,
        0, 0, frameWidth, frameHeight,
        sx, sy, frameWidth, frameHeight
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
  function drawHealthBar(player, xPosition) {
    const barWidth = 100;
    const barHeight = 10;
    const healthRatio = player.health / 100;
  
    // 顯示血條背景
    fill(0, 0, 0, 150);
    rect(xPosition, 20, barWidth, barHeight);
  
    // 顯示血條前景
    fill(255, 0, 0);
    rect(xPosition, 20, barWidth * healthRatio, barHeight);
  }
  
  // 更新並繪製炸彈
  function updateAndDrawBombs() {
    for (let i = bombs.length - 1; i >= 0; i--) {
      let bomb = bombs[i];
      bomb.x += bomb.speed;
  
      image(sprites.bomb.img, bomb.x, bomb.y, sprites.bomb.width, sprites.bomb.height);
  
      if (bomb.x > width || bomb.x < 0) {
        bombs.splice(i, 1);
      }
    }
  }
  
  // 處理炸彈發射
  function keyPressed() {
    if (key === 'f') { // Player1 發射炸彈
      bombs.push({
        x: player1.x + (player1.direction > 0 ? 50 : -50),
        y: player1.y + 20,
        speed: player1.direction * 7
      });
    }
  
    if (key === '0') { // Player2 發射炸彈
      bombs.push({
        x: player2.x + (player2.direction > 0 ? 50 : -50),
        y: player2.y + 20,
        speed: player2.direction * 7
      });
    }
  }  