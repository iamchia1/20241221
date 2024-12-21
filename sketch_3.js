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
    bomb: { img: null, width: 50, height: 50 }
  };
  
  let backgroundImg;
  
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
    x: 1200,
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
    // 載入圖片
    sprites.player1.hit.img = loadImage("hit.png");
    sprites.player1.throw.img = loadImage("throw.png");
    sprites.player1.down.img = loadImage("down.png");
  
    sprites.player2.fly.img = loadImage("fly.png");
    sprites.player2.failed.img = loadImage("failed.png");
    sprites.player2.attack.img = loadImage("attack.png");
  
    sprites.bomb.img = loadImage("bomb.png");
  
    // 載入背景圖片
    backgroundImg = loadImage("background.png");
  }
  
  function setup() {
    createCanvas(windowWidth, windowHeight);
  
    // 設定初始動畫
    player1Animation.current = sprites.player1.hit;
    player2Animation.current = sprites.player2.attack;
  }
  
  function draw() {
    background(220);
  
    // 繪製背景
    image(backgroundImg, 0, 0, width, height);
  
    // 更新並繪製 Player1
    updatePlayer(player1, player1Animation, 65, 87, 68); // A, W, D
    drawPlayerAnimation(player1, player1Animation);
  
    // 更新並繪製 Player2
    updatePlayer(player2, player2Animation, LEFT_ARROW, UP_ARROW, RIGHT_ARROW); // 左, 上, 右
    drawPlayerAnimation(player2, player2Animation);
  
    // 更新並繪製炸彈
    updateAndDrawBombs();
  
    // 繪製血量條
    drawHealthBar(player1, 50);
    drawHealthBar(player2, width - 150);
  }
  
  function updatePlayer(player, animation, leftKey, jumpKey, rightKey) {
    // 按下左鍵 (向左移動並釋放 hit 技能)
    if (keyIsDown(leftKey)) {
      player.x -= 5;
      player.direction = -1; // 更新方向
      animation.current = player === player1 ? sprites.player1.hit : sprites.player2.failed; // 切換動畫
    }
  
    // 按下右鍵 (向右移動並釋放 down 技能)
    else if (keyIsDown(rightKey)) {
      player.x += 5;
      player.direction = 1; // 更新方向
      animation.current = player === player1 ? sprites.player1.down : sprites.player2.failed; // 切換動畫
    }
  
    // 按下跳躍鍵 (跳躍並釋放 throw 技能)
    if (keyIsDown(jumpKey) && !player.isJumping) {
      player.speedY = player.jumpForce; // 啟動跳躍
      player.isJumping = true; // 設定跳躍狀態
      animation.current = player === player1 ? sprites.player1.throw : sprites.player2.fly; // 切換動畫
    }
  
    // 應用重力
    if (player.y < player.groundY) {
      player.speedY += player.gravity; // 應用重力讓角色下落
    } else {
      player.y = player.groundY; // 讓角色停在地面
      player.isJumping = false; // 重設跳躍狀態
    }
  
    // 更新 Y 軸位置
    player.y += player.speedY;
  }
  
  function drawPlayerAnimation(player, animation) {
    let sprite = animation.current;
    let frameWidth = sprite.width;
    let frameHeight = sprite.height;
    let frameIndex = animation.frameIndex;
  
    // 顯示動畫的當前幀
    image(sprite.img, player.x, player.y, frameWidth, frameHeight, frameIndex * frameWidth, 0, frameWidth, frameHeight);
  
    // 計數幀數，控制動畫的播放速度
    animation.frameCount++;
  
    if (animation.frameCount >= FRAME_DELAY) {
      animation.frameIndex = (frameIndex + 1) % sprite.frames;  // 循環播放動畫幀
      animation.frameCount = 0;  // 重置幀計數
    }
  }
  
  // 繪製血量條
  function drawHealthBar(player, xPos) {
    const barWidth = 100;
    const barHeight = 10;
    const healthRatio = player.health / 100;
  
    fill(255, 0, 0);
    rect(xPos, 20, barWidth * healthRatio, barHeight);
  
    noFill();
    stroke(0);
    rect(xPos, 20, barWidth, barHeight);
  }
  
  function keyPressed() {
    // Player1 發射炸彈 (按F鍵)
    if (key === "f") {
      let bomb = {
        x: player1.x + (player1.direction > 0 ? 50 : -50), // 根據方向生成炸彈
        y: player1.y + 20,
        speed: player1.direction * 7 // 根據方向決定炸彈速度
      };
      bombs.push(bomb);
    }
  
    // Player2 發射炸彈 (按空白鍵)
    if (key === " ") {
      let bomb = {
        x: player2.x + (player2.direction > 0 ? 50 : -50),
        y: player2.y + 20,
        speed: player2.direction * 7
      };
      bombs.push(bomb);
    }
  }
  
  function updateAndDrawBombs() {
    for (let i = bombs.length - 1; i >= 0; i--) {
      let bomb = bombs[i];
      bomb.x += bomb.speed; // 更新炸彈位置
  
      // 繪製炸彈
      image(sprites.bomb.img, bomb.x, bomb.y, sprites.bomb.width, sprites.bomb.height);
  
      // 檢查炸彈是否碰到角色
      checkBombCollision(bomb);
  
      // 移除超出螢幕的炸彈
      if (bomb.x > width || bomb.x < 0) {
        bombs.splice(i, 1);
      }
    }
  }
  
  function checkBombCollision(bomb) {
    // 檢查炸彈是否碰到玩家1
    if (dist(bomb.x, bomb.y, player1.x, player1.y) < 50) {
      player1.health -= 10; // 扣除血量
      bombs.splice(bombs.indexOf(bomb), 1); // 移除已經碰撞的炸彈
    }
  
    // 檢查炸彈是否碰到玩家2
    if (dist(bomb.x, bomb.y, player2.x, player2.y) < 50) {
      player2.health -= 10; // 扣除血量
      bombs.splice(bombs.indexOf(bomb), 1); // 移除已經碰撞的炸彈
    }
  }
  