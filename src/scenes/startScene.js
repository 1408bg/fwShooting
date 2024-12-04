function setupStartScene() {
  const game = window.game;
  const start = game.createScene('start');

  const users = new TextUI({
    position: new Vector({ x: game.width/2, y: game.height/2 - 10}),
    text: '현재 ?? 명의 유저가 접속중인'
  });
  
  const startBtn = new ElementBuilder('button')
  .setText('시작하다')
  .setPosition(new Vector({ x: game.width/2 - 30, y: game.height/2 + 30 }))
  .onPress(() => game.loadSceneNamed({ name: 'main' }))
  .asButton().build();

  start.addElement({ element: startBtn });
  start.addObject({ object: users });

  start.onLoad = () => {
    fetch('/users')
    .then(data => data.json())
    .then(json => users.setText(`현재 ${json.count} 명의 유저가 접속중인`));
  }
}

export default setupStartScene;