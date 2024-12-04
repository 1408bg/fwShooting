function setupMainScene() {
  const game = window.game;
  const main = game.createScene('main');
  const bangSound = new Audio('/assets/bang.mp3');
  let socket;
  
  let clientId = -1;
  let recentDirection = new Vector({ x: 1, y: 0 });
  let canShoot = true;
  let killCount = 0;

  const playerOrigin = GameObject.colored({
    color: Color.fromHex('#000000'),
    size: new Size({ width: 50, height: 50 }),
    layer: 1
  });

  playerOrigin.element.appendChild(
    new ElementBuilder('img')
    .setSize(new Size({ width: 50, height: 50 }))
    .setPosition(new Vector({ x: -25, y: 0 }))
    .setAttributes({ src: '/assets/gun.png' })
    .build()
  );

  const playerPrefab = new Prefab({
    object: playerOrigin
  });
  
  const player = playerPrefab.instantiate({ layer: 1 });
  player.transformOrigin = '50% 50%';
  player.rotate = 0;
  player.color = Color.fromHex('#000000');
  player.element.style.borderRadius = '50%';
  player.applyElement();
  let players = {};
  const playerTail = createTail(player);
  const playerObjects = new Map();
  let playerTails = new Map();
  
  const shootText = new TextUI({
    text: '쏠 수 있는',
    position: new Vector({ x: 100, y: game.height-50 })
  });
  
  const killText = new TextUI({
    text: '0명 죽인',
    position: new Vector({ x: 100, y: game.height-70})
  });
  
  function createPlayer() {
    const player = playerPrefab.instantiate({
      setupFunction: (e) => {
        e.color = Color.fromHex('#808080');
        e.element.style.backgroundColor = e.color;
        e.element.style.borderRadius = '50%';
        e.applyElement();
        return e;
      }
    });
    player.transformOrigin = '50% 50%';
    main.addObject({ object: player });
    return player;
  }
  
  function createTail(player) {
    const tail = [];
  
    function updateTail() {
      tail.push({ 
        x: player.position.x + 25, 
        y: player.position.y + 25,
        object: null
      });
  
      if (tail.length > 30) {
        const removedSegment = tail.shift();
        if (removedSegment.object) main.removeObject(removedSegment.object);
      }
      
      function *tailScale() {
        while (this.element) {
          this.size.subtract(new Size({ width: 0.04, height: 0.04 }));
          this.applySize();
          yield null;
        }
      }
      
      tail.forEach((segment) => {
        if (!segment.object) {
          const tailObject = GameObject.colored({
            color: player.color.copy().adjustAlpha(0.25),
            size: new Size({ width: 25, height: 25 })
          });
          tailObject.anchorPoint = new Vector({ x: 0.5, y: 0.5 });
          main.addObject({ object: tailObject });
          segment.object = tailObject;
        }
        
        const tailObject = segment.object;
        tailObject.position.x = segment.x;
        tailObject.position.y = segment.y;
        tailObject.applyPosition();
        tailObject.applyAnchorPoint();
        startCoroutine(tailScale.bind(tailObject));
      });
    }
    
    return { tail, updateTail };
  }
  
  function createBullet(position, direction, isOwnBullet) {
    const bullet = GameObject.colored({
      color: isOwnBullet ? Color.fromHex('#0000FF') : Color.fromHex('#FF0000'),
      size: new Size({ width: 10, height: 10 })
    });
  
    bullet.anchorPoint = new Vector({ x: 0.5, y: 0.5 });
    bullet.position.x = position.x;
    bullet.position.y = position.y;
    bullet.applyPosition();
    bullet.applyAnchorPoint();
    main.addObject({ object: bullet });
  
    function *moveBullet() {
      const bulletSpeed = 8;
      const force = new Vector({ x: direction.x, y: direction.y }).scale(bulletSpeed);
      while (true) {
        bullet.position.add(force);
        bullet.applyPosition();
  
        if (!game.contains(bullet)) {
          main.removeObject(bullet);
          break;
        }
  
        if (isOwnBullet) {
          playerObjects.forEach((player, id) => {
            if (player.isCollide(bullet)) {
              kill(id);
            }
          })
        }
  
        yield null;
      }
    }
  
    startCoroutine(moveBullet);
  }
  function movePlayer(vector) {
    socket.emit('move', {
      x: vector.x,
      y: vector.y,
      rotate: player.rotate
    });
  }
  
  function shoot() {
    function *shootCooldown() {
      yield waitForDuration(new Duration({milisecond: 500}));
      shootText.setText('쏠 수 있는');
      canShoot = true;
    }
    if (canShoot) {
      shootText.setText('쏠 수 없는');
      socket.emit('shoot', {
        x: player.position.x+25,
        y: player.position.y+25,
        direction: recentDirection
      });
      canShoot = false;
      startCoroutine(shootCooldown);
    }
  }
  
  function kill(id) {
    socket.emit('kill', id);
  }
  
  function* moving() {
    const fps = 60;
    const delay = new Duration({ milisecond: 1000 / fps });
    const moveSpeed = 5;
    const rotateSpeed = 5;
    const movement = new Vector({ x: 0, y: 0 });
  
    while (true) {
      movement.set(Vector.zero);
  
      if (!game.contains(player)) kill(clientId);
  
      if (Input.getKey('a')) player.rotate -= rotateSpeed;
      if (Input.getKey('d')) player.rotate += rotateSpeed;
  
      const angleRad = (player.rotate * Math.PI) / 180;
      if (Input.getKey('w')) movement.moveByAngle(angleRad, -moveSpeed);
      if (Input.getKey('s')) movement.moveByAngle(angleRad, moveSpeed);
  
      if (Input.getKey(' ')) shoot();
  
      recentDirection = new Vector({ x: Math.cos(angleRad), y: Math.sin(angleRad) }).normalize().scale(-1);
  
      player.applyTransform();
      playerTail.updateTail();
      movePlayer(movement);
  
      yield waitForDuration(delay);
    }
  }
  
  function *gameLoop() {
    while (true) {
      for (let id in players) {
        const pos = players[id];
        const target = (id === clientId) ? player : playerObjects.get(id);
        if (target === undefined) continue;
        target.position.x = pos.x;
        target.position.y = pos.y;
        target.setTransform('rotate', pos.rotate);
        target.applyPosition();
        target.applyTransform();
        if (id !== clientId) playerTails.get(target).updateTail();
      }
      yield null;
    }
  }
  
  main.addObject({ object: player });
  main.addObject({ object: shootText });
  main.addObject({ object: killText });

  main.onLoad = () => {
    Input.addKeyUp('w');
    Input.addKeyUp('a');
    Input.addKeyUp('s');
    Input.addKeyUp('d');
    playerTails = new Map();
    socket = io();
    socket.on('currentPlayers', (serverPlayers) => {
      players = serverPlayers;
    });
    
    socket.on('newPlayer', (newPlayer) => {
      players[newPlayer.id] = newPlayer;
      const player = createPlayer();
      playerObjects.set(newPlayer.id, player);
      playerTails.set(player, createTail(player));
    });
    
    socket.on('prepared', (id) => {
      clientId = id;
      for (const id of Object.keys(players)) {
        if (id === clientId) continue;
        const player = createPlayer();
        playerObjects.set(id, player);
        playerTails.set(player, createTail(player));
      }
    });
    
    socket.on('playerMoved', (playerData) => {
      if (players[playerData.id]) {
        players[playerData.id].x = playerData.x;
        players[playerData.id].y = playerData.y;
        players[playerData.id].rotate = playerData.rotate;
      }
    });
    
    socket.on('playerDisconnected', (id) => {
      delete players[id];
      const player = playerObjects.get(id);
      main.removeObject(player);
      const tail = playerTails.get(player);
      tail.tail.forEach((e) => main.removeObject(e.object));
      playerTails.delete(player);
      playerObjects.delete(id);
    });
    
    socket.on('shoot', (data) => {
      const position = new Vector({ x: data.x, y: data.y });
      const isOwnBullet = data.id === clientId;
      bangSound.pause();
      bangSound.play();
      createBullet(position, data.direction, isOwnBullet);
    });
    
    socket.on('dead', (data) => {
      if (data.target === clientId) {
        alert('님죽음');
        game.loadSceneNamed({ name: 'start' });
      } else {
        main.removeObject(playerObjects.get(data.target));
        if (data.killer === clientId) {
          killCount++;
          killText.setText(`${killCount}명 죽인`);
        }
      }
    });

    socket.on('start', (data) => {
      player.position = new Vector({ x: data.x, y: data.y });
      player.applyPosition();
      startCoroutine(moving);
      startCoroutine(gameLoop);
    });
    
    socket.emit('requestStart', { width: game.width, height: game.height });
  }

  main.onUnload = () => {
    socket.disconnect();
    playerTails.forEach((tail) => {
      const tails = tail.tail;
      while (tails.length) main.removeObject(tails.shift().object);
    });
    playerObjects.forEach((object) => main.removeObject(object));
    stopCoroutine(moving);
    stopCoroutine(gameLoop);
  }
}

export default setupMainScene;