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
    background: {
      img: null
    }
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
  
  let bombs = []; // 儲存炸彈
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
  
  const FRAME_DELAY = 7; // 動畫幀延遲
  
  function preload() {
    // 載入圖片
    sprites.player1.hit.img = loadImage("hit.png");
    sprites.player1.throw.img = loadImage("throw.png");
    sprites.player1.down.img = loadImage("down.png");
    sprites.player2.fly.img = loadImage("fly.png");
    sprites.player2.failed.img = loadImage("failed.png");
    sprites.player2.attack.img = loadImage("attack.png");
    sprites.background.img = loadImage("background.png"); // 背景圖
  }
  
  function setup() {
    createCanvas(windowWidth, windowHeight);
  
    // 設定初始動畫
    player1Animation.current = sprites.player1.hit;
    player2Animation.current = sprites.player2.attack;
  }
  
  function draw() {
    background(255);
    image(sprites.background.img, 0, 0, width, height); // 顯示背景圖
  
    // 更新並繪製 Player1
    updatePlayer(player1, player1Animation, 65, 87, 68, 'f'); // A, W, D, F
    drawPlayerAnimation(player1, player1Animation);
  
    // 更新並繪製 Player2
    updatePlayer(player2, player2Animation, LEFT_ARROW, UP_ARROW, RIGHT_ARROW, ' '); // 左, 上, 右, 空白鍵
    drawPlayerAnimation(player2, player2Animation);
  
    // 更新並繪製炸彈
    updateAndDrawBombs();
  
    // 檢查炸彈與角色碰撞，並扣血
    checkBombCollisions();
  
    // 繪製血量條
    drawHealthBar(player1, 50);  // Player1 血量條顯示於畫面左上
    drawHealthBar(player2, width - 150);  // Player2 血量條顯示於畫面右上
  }
  
  // 更新玩家狀態（移動、跳躍、丟炸彈）
  function updatePlayer(player, animation, leftKey, jumpKey, rightKey, bombKey) {
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
  
    // 按下丟炸彈鍵
    if (keyIsDown(bombKey)) {
      throwBomb(player); // 丟炸彈
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
  
  // 丟炸彈
  function throwBomb(player) {
    let bomb = {
      x: player.direction === 1 ? player.x + 115 : player.x - 50,  // 根據玩家方向設置炸彈起始位置
      y: player.y + 40,  // 稍微向上偏移
      speed: player.direction === 1 ? 5 : -5,  // 根據玩家方向控制炸彈速度
    };
    bombs.push(bomb);  // 將炸彈加入炸彈陣列
  }
  
  // 更新並繪製炸彈
  function updateAndDrawBombs() {
    for (let i = 0; i < bombs.length; i++) {
      bombs[i].x += bombs[i].speed;  // 更新炸彈位置
  
      // 繪製炸彈
      ellipse(bombs[i].x, bombs[i].y, 20, 20);
    }
  }
  
  // 檢查炸彈與角色的碰撞，並扣血
  function checkBombCollisions() {
    for (let i = 0; i < bombs.length; i++) {
      let bomb = bombs[i];
  
      // 檢查炸彈是否與 Player1 碰撞
      if (bomb.x > player1.x && bomb.x < player1.x + 115 && bomb.y > player1.y && bomb.y < player1.y + 108) {
        player1.health -= 10;  // 扣除 Player1 生命值
        bombs.splice(i, 1);  // 移除炸彈
      }
  
      // 檢查炸彈是否與 Player2 碰撞
      if (bomb.x > player2.x && bomb.x < player2.x + 131 && bomb.y > player2.y && bomb.y < player2.y + 116) {
        player2.health -= 10;  // 扣除 Player2 生命值
        bombs.splice(i, 1);  // 移除炸彈
      }
    }
  }
  
  // 繪製血量條
  function drawHealthBar(player, xPos) {
    const barWidth = 100;
    const barHeight = 10;
    const healthRatio = player.health / 100;
  
    fill(255, 0, 0);
    rect(xPos, 50, barWidth * healthRatio, barHeight);  // 顯示血量條
  
    noFill();
    stroke(0);
    rect(xPos, 50, barWidth, barHeight);  // 顯示血量框
  }
  