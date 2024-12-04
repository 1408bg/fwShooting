import setupStartScene from '/scenes/startScene.js';
import setupMainScene from '/scenes/mainScene.js';

Input.initialize();
Input.ignoreLetterCase = true;

const game = new Game({ useFullScreen: true, initHTMLStyle: true });
game.setBackground({ color: Color.fromHex('#87CEEB') });

setupStartScene();
setupMainScene();

game.loadSceneNamed({ name: 'start' });
