
class Duration {
  constructor({ milisecond = 0, second = 0, minute = 0, hour = 0, day = 0 }) {
    this.value = milisecond
    + second * 1000
    + minute * 60 * 1000
    + hour * 60 * 60 * 1000
    + day * 24 * 60 * 60 * 1000;
  }

  static get zero() { return new Duration({milisecond: 0}); }
}


/** @typedef {'TYPE ERROR' | 'VALUE ERROR' | 'CALCULATION ERROR', 'INIT ERROR'} ErrorType */

class FakeWorksError extends Error {
  /**
  * @param {ErrorType} type 
  * @param {string} message 
  */
  constructor(type, message) {
    super(`[${type}] : ${message}`);
  }

  static type(message) {
    return new FakeWorksError('TYPE ERROR', message);
  }

  static autoType(identifier, type) {
    return new FakeWorksError('TYPE ERROR', `arguments '${identifier}' must be ${type}`);
  }

  static value(message) {
    return new FakeWorksError('VALUE ERROR', message);
  }

  static calc(message) {
    return new FakeWorksError('CALCULATION ERROR', message);
  }
}


class Validator {
  static isNotClassType(value, classType) {
    return !(value instanceof classType);
  }

  static isNumber(value) {
    return typeof value === 'number' && !Number.isNaN(value);
  }

  static isNumberAll(...values) {
    return values.every(Validator.isNumber);
  }

  static isInteger(value) {
    return Number.isInteger(value);
  }

  static isIntegerAll(...values) {
    return values.every(Validator.isInteger);
  }

  static isFloat(value) {
    return Validator.isNumber(value);
  }

  static isFloatAll(...values) {
    return values.every(Validator.isFloat);
  }

  static isPositive(value) {
    return Validator.isNumber(value) && value >= 0;
  }

  static isPositiveAll(...values) {
    return values.every(Validator.isPositive);
  }

  static isNegative(value) {
    return Validator.isNumber(value) && value < 0;
  }

  static isNegativeAll(...values) {
    return values.every(Validator.isNegative);
  }

  static inRange(start, end, ...values) {
    return values.every(value => start <= value && value < end);
  }

  static isString(value) {
    return typeof value === 'string';
  }

  static isStringAll(...values) {
    return values.every(Validator.isString);
  }

  static isBoolean(value) {
    return typeof value === 'boolean';
  }

  static isBooleanAll(...values) {
    return values.every(Validator.isBoolean);
  }

  static isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  static isObjectAll(...values) {
    return values.every(Validator.isObject);
  }

  static isArray(value) {
    return Array.isArray(value);
  }

  static isArrayAll(...values) {
    return values.every(Validator.isArray);
  }

  static isFunction(value) {
    return typeof value === 'function';
  }

  static isFunctionAll(...values) {
    return values.every(Validator.isFunction);
  }

  static isEmpty(value) {
    if (value == null) return true; // covers both null and undefined
    if (Validator.isArray(value) || Validator.isString(value)) return value.length === 0;
    if (Validator.isObject(value)) return Object.keys(value).length === 0;
    return false;
  }

  static isEmptyAll(...values) {
    return values.every(Validator.isEmpty);
  }
}



class Color {
  constructor({ r, g, b, a }) {
    if (!Validator.isPositiveAll(r, g, b)) {
      throw FakeWorksError.autoType('r, g, b',  'positive number');
    }
    if (!Validator.isFloat(a)) {
      throw FakeWorksError.autoType('a' ,'Float');
    }
    if (!Validator.inRange(0, 256, r, g, b)) {
      throw FakeWorksError.value('r, g, b must be within the range of 0 to 255');
    }
    if (a < 0 || a > 1) {
      throw FakeWorksError.value('a must be within the range of 0 to 1');
    }
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static get transparent() {
    return new Color({
      r: 0,
      g: 0,
      b: 0,
      a: 0
    });
  }

  static fromRGB({ r, g, b }) {
    if (!Validator.isPositiveAll(r, g, b)) {
      throw FakeWorksError.autoType('r, g, b' ,'positive number');
    }
    if (!Validator.inRange(0, 256, r, g, b)) {
      throw FakeWorksError.value('r, g, b must be within the range of 0 to 255');
    }
    return new Color({ r, g, b, a: 1 });
  }

  static fromHex(hex) {
    if (!Validator.isString(hex)) {
      throw FakeWorksError.autoType('hex',  'string');
    }
    hex = hex.replace('#', '');
    let r, g, b, a = 1;

    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16) / 255;
    } else {
      throw FakeWorksError.value('Invalid hex color format\nformat can be like #RRGGBB or #RRGGBBAA');
    }

    return new Color({ r, g, b, a });
  }
  
  copy() {
    return new Color({
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a
    });
  }

  adjustAlpha(newAlpha) {
    if (!Validator.inRange(0, 1, newAlpha)) {
      throw FakeWorksError.value('newAlpha must be within the range of 0 to 1');
    }
    this.a = newAlpha;
    return this;
  }

  lighten(amount) {
    this.r = Math.min(255, this.r + amount);
    this.g = Math.min(255, this.g + amount);
    this.b = Math.min(255, this.b + amount);
    this.a = this.a;
    return this;
  }
  
  darken(amount) {
    this.r = Math.max(0, this.r - amount);
    this.g = Math.max(0, this.g - amount);
    this.b = Math.max(0, this.b - amount);
    this.a = this.a;
    return this;
  }

  equals(color) {
    if (Validator.isNotClassType(color, Color)) {
      throw FakeWorksError.autoType('color', 'Color');
    }
    return this.r === color.r && this.g === color.g && this.b === color.b && this.a === color.a;
  }

  toHex() {
    const toHexComponent = (value) => value.toString(16).padStart(2, '0');
    return `#${toHexComponent(this.r)}${toHexComponent(this.g)}${toHexComponent(this.b)}${this.a < 1 ? toHexComponent(Math.round(this.a * 255)) : ''}`;
  }

  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
}



class Size {
  /** @type {number} */
  #width;
  /** @type {number} */
  #height;
  constructor({width, height}) {
    if (!Validator.isPositiveAll(width, height)) {
      throw FakeWorksError.value('width and height must be Positive');
    }
    this.#width = width;
    this.#height = height;
  }

  get width() { return this.#width };
  get height() { return this.#height; }

  set width(value) {
    if (!Validator.isPositive(value)) {
      throw FakeWorksError.value('width must be positive');
    }
    this.#width = value;
  }

  set height(value) {
    if (!Validator.isPositive(value)) {
      throw FakeWorksError.value('height must be positive');
    }
    this.#height = value;
  }

  static fitOf(node) {
    if (Validator.isNotClassType(node, Node)) {
      throw FakeWorksError.autoType('node', 'Node');
    }
    const target = node.cloneNode(true);
    target.style.visibility = 'hidden';
    target.style.position = 'absolute';
    target.style.left = '-9999px';
    target.style.whiteSpace = 'nowrap';
    target.style.display = 'inline-block';
    document.body.appendChild(target);
    const rect = target.getBoundingClientRect();
    const size = {
      width: rect.width,
      height: rect.height
    };
    document.body.removeChild(target);
    return new Size(size);
  }
  
  copy() {
    return new Size({
      width: this.width,
      height: this.height
    });
  }

  contains(size) {
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    return (this.width >= size.width) && (this.height >= size.height);
  }

  equals(size) {
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    return this.width === size.width && this.height === size.height;
  }

  scale(factor) {
    if (!Validator.isFloat(factor)) {
      throw FakeWorksError.autoType('factor', 'Float');
    }
    if (factor <= 0) {
      throw FakeWorksError.value('factor must be greater than zero');
    }
    this.width *= factor;
    this.height *= factor;
    return this;
  }

  increase({width = 0, height = 0}) {
    if (!Validator.isNumberAll(width, height)) {
      throw FakeWorksError.type('width, height must be Number');
    }
    this.width = Math.max(0, this.width + width);
    this.height = Math.max(0, this.height + height);
    return this;
  }

  decrease({width = 0, height = 0}) {
    if (!Validator.isNumberAll(width, height)) {
      throw FakeWorksError.type('width, height must be Number');
    }
    this.width = Math.max(0, this.width - width);
    this.height = Math.max(0, this.height - height);
    return this;
  }

  area() {
    return this.width * this.height;
  }

  add(size) {
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    this.width = Math.max(0, this.width + size.width);
    this.height = Math.max(0, this.height + size.height);
    return this;
  }

  subtract(size) {
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    this.width = Math.max(0, this.width - size.width);
    this.height = Math.max(0, this.height - size.height);
    return this;
  }

  divide(size) {
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    if (size.width === 0 || size.height === 0) {
      throw FakeWorksError.calc('Cannot divide by zero in size dimensions');
    }
    this.width /= size.width;
    this.height /= size.height;
    return this;
  }

  aspectRatio() {
    if (this.height === 0) {
      throw FakeWorksError.calc('Height cannot be zero when calculating aspect ratio');
    }
    return this.width / this.height;
  }

  toString() {
    return `Size(width: ${this.width}px, height: ${this.height}px)`;
  }
}



class Vector {
  constructor({x, y}) {
    if (!Validator.isNumber(x) || !Validator.isNumber(y)) {
      throw FakeWorksError.autoType('x and y', 'number');
    }
    this.x = x;
    this.y = y;
  }

  static get zero() { return new Vector({x: 0, y: 0}); }

  copy() {
    return new Vector({x: this.x, y: this.y});
  }

  increase({x = 0, y = 0}) {
    if (!Validator.isNumber(x) || !Validator.isNumber(y)) {
      throw FakeWorksError.autoType('x and y', 'number');
    }
    this.x += x;
    this.y += y;
    return this;
  }

  decrease({x = 0, y = 0}) {
    if (!Validator.isNumber(x) || !Validator.isNumber(y)) {
      throw FakeWorksError.autoType('x and y', 'number');
    }
    this.x -= x;
    this.y -= y;
    return this;
  }

  set(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    this.x = vector.x;
    this.y = vector.y;
    return this;
  }

  distance(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    return Math.sqrt((this.x - vector.x) ** 2 + (this.y - vector.y) ** 2);
  }

  equals(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    return this.x === vector.x && this.y === vector.y;
  }

  angle(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    return Math.atan2(vector.y - this.y, vector.x - this.x);
  }

  moveByAngle(angle, distance) {
    if (!Validator.isNumberAll(angle, distance)) {
      throw FakeWorksError.autoType('angle and distance', 'number');
    }
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    this.x += dx;
    this.y += dy;
    return this;
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize() {
    const mag = this.magnitude();
    return mag === 0 ? this.copy() : new Vector({ x: this.x / mag, y: this.y / mag });
  }

  dotProduct(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    return this.x * vector.x + this.y * vector.y;
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  scale(scalar) {
    if (!Validator.isNumber(scalar)) {
      throw FakeWorksError.autoType('scalar', 'number');
    }
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar) {
    if (!Validator.isNumber(scalar)) {
      throw FakeWorksError.autoType('scalar', 'number');
    }
    if (scalar === 0) {
      throw FakeWorksError.value('can not divide with zero');
    }
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  crossProduct(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    return this.x * vector.y - this.y * vector.x;
  }

  add(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  subtract(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  toString() {
    return `Vector(x: ${this.x}, y: ${this.y})`;
  }
}



const Coroutine = Object.getPrototypeOf(function*() {}).constructor;

class CoroutineManager {
  constructor() {
    this.coroutines = new Set();
  }

  startCoroutine(coroutine) {
    if (Validator.isNotClassType(coroutine, Coroutine)) {
      throw FakeWorksError.autoType('coroutine', 'Coroutine');
    }
    const iterator = coroutine();

    const process = () => {
      const { value, done } = iterator.next();

      if (done) {
        this.coroutines.delete(coroutine);
        return;
      }

      if (value === null) {
        requestAnimationFrame(() => {
          if (this.coroutines.has(coroutine)) process();
        });
      }
      else if (value instanceof Promise) {
        value.then(() => {
          if (this.coroutines.has(coroutine)) process();
        });
      } else {
        process();
      }
    };

    this.coroutines.add(coroutine);
    process();

    return coroutine;
  }

  stopCoroutine(coroutine) {
    if (Validator.isNotClassType(coroutine, Coroutine)) {
      throw FakeWorksError.autoType('coroutine', 'Coroutine');
    }
    this.coroutines.delete(coroutine);
  }
}

function waitForDuration(duration) {
  if (Validator.isNotClassType(duration, Duration)) {
    throw FakeWorksError.autoType('duration', 'Duration');
  }
  return new Promise(
    resolve => {
      const end = new Date().getTime() + duration.value;
      const check = () => {
        requestAnimationFrame(()=>{
          if (new Date().getTime() >= end) resolve();
          else check();
        });
      };
      check();
    }
  )
}

const coroutineManager = new CoroutineManager();
const startCoroutine = coroutineManager.startCoroutine.bind(coroutineManager);
const stopCoroutine = coroutineManager.stopCoroutine.bind(coroutineManager);



class GameObject {
  /** @type {boolean} */
  #alive;
  /** @type {Vector} */
  #position;
  /** @type {Size} */
  #size;
  /** @type {HTMLElement} */
  #element;
  /** @type {Vector} */
  #anchorPoint;
  /** @type {number} */
  #layer;
  /** @type {Object} */
  #transformState;
  /** @type {Set} */
  #components;

  constructor({position = Vector.zero, element, size = undefined, anchorPoint = Vector.zero, layer = 0}) {
    if (size === undefined) {
      size = Size.fitOf(element);
    }
    if (Validator.isNotClassType(position, Vector)) {
      throw FakeWorksError.autoType('position', 'Vector');
    }
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    if (Validator.isNotClassType(element, HTMLElement)) {
      throw FakeWorksError.autoType('element', 'HTMLElement');
    }
    if (Validator.isNotClassType(anchorPoint, Vector)) {
      throw FakeWorksError.autoType('anchorPoint', 'Vector');
    }
    if (!Validator.isInteger(layer)) {
      throw FakeWorksError.autoType('layer', 'Integer');
    }
    this.#alive = true;
    this.#position = position;
    this.#size = size;
    this.#element = element;
    this.#anchorPoint = anchorPoint;
    this.#layer = layer;
    this.#transformState = {
      translate: { x: 0, y: 0 },
      rotate: 0,
      scale: { x: 1, y: 1 },
      skew: { x: 0, y: 0 },
    };
    this.#components = new Set();
    element.style.position = 'absolute';
    element.style.willChange = 'width, height, left, top, transform-origin';
    element.style.width = `${size.width}px`;
    element.style.height = `${size.height}px`;
    this.applyAnchorPoint();
    element.style.zIndex = layer;
    this.transformOrigin = false;
  }

  static colored({position = Vector.zero, color, size, layer = 0}) {
    const element = document.createElement('div');
    element.style.backgroundColor = color.toString();
    return new GameObject({
      position: position,
      element: element,
      size: size,
      layer: layer
    });
  }

  get position() { return this.#position; }
  get size() { return this.#size; }
  get element() { return this.#alive ? this.#element : null; }
  get anchorPoint() { return this.#anchorPoint; }
  get layer() { return this.#layer; }
  
  set position(newPosition) {
    if (Validator.isNotClassType(newPosition, Vector)) {
      throw FakeWorksError.autoType('newPosition', 'Vector');
    }
    this.#position = newPosition;
    this.applyPosition();
  }
  
  set size(newSize) {
    if (Validator.isNotClassType(newSize, Size)) {
      throw FakeWorksError.autoType('newSize', 'Size');
    }
    this.#size = newSize;
    this.applySize();
  }
  
  set element(newElement) {
    if (Validator.isNotClassType(newElement, HTMLElement)) {
      throw FakeWorksError.autoType('newElement', 'HTMLElement');
    }
    this.#element = newElement;
    this.applyElement();
  }

  set anchorPoint(newAnchorPoint) {
    if (Validator.isNotClassType(newAnchorPoint, Vector)) {
      throw FakeWorksError.autoType('newAnchorPoint', 'Vector');
    }
    this.#anchorPoint = newAnchorPoint;
    this.applyAnchorPoint();
    this.applyPosition();
  }
  
  set layer(newLayer) {
    if (!Validator.isInteger(newLayer)) {
      throw FakeWorksError.autoType('newLayer', 'Integer');
    }
    this.#layer = newLayer;
    this.applyLayer();
  }

  /**
  * @typedef {'translate' | 'rotate' | 'scale' | 'skew'} TransformStateKeys
  * @param {TransformStateKeys} type
  */
  setTransform(type, value) {
    if (!this.#alive) return;
    this.#transformState[type] = value;
    this.applyTransform();
  }

  generateTransformString() {
    const { translate, rotate, scale, skew } = this.#transformState;
    return `
      translate(${translate.x}px, ${translate.y}px)
      rotate(${rotate}deg)
      scale(${scale.x}, ${scale.y})
      skew(${skew.x}deg, ${skew.y}deg)
    `.trim();
  }

  applyTransform() {
    if (!this.#element) return;
    this.#element.style.transform = this.generateTransformString();
  }
  
  applyPosition() {
    if (!this.#alive) return;
    const adjustedX = this.#position.x - this.#anchorPoint.x * this.#size.width;
    const adjustedY = this.#position.y - this.#anchorPoint.y * this.#size.height;
    this.#element.style.left = `${adjustedX}px`;
    this.#element.style.top = `${adjustedY}px`;
  }

  applySize() {
    if (!this.#alive) return;
    this.#element.style.width = `${this.#size.width}px`;
    this.#element.style.height = `${this.#size.height}px`;
  }

  applyElement() {
    if (!this.#alive) return;
    const element = this.#element;
    element.style.width = `${this.size.width}px`;
    element.style.height = `${this.size.height}px`;
    element.style.left = `${this.position.x}px`;
    element.style.top = `${this.position.y}px`;
    element.style.zIndex = this.layer;
  }

  applyAnchorPoint() {
    if (!this.#alive) return;
    const { x, y } = this.#anchorPoint;
    if (this.transformOrigin) this.#element.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    else this.#element.style.transformOrigin = this.transformOrigin;
    this.applyPosition();
  }

  applyLayer() {
    if (!this.#alive) return;
    this.#element.style.zIndex = this.#layer;
  }
  
  copy() {
    return new GameObject({
      position: this.#position.copy(),
      size: this.#size.copy(),
      element: this.#element.cloneNode(true),
      anchorPoint: this.#anchorPoint.copy(),
      layer: this.layer
    });
  }

  awake() {
    if (!this.#alive) this.#alive = true;
  }

  remove(deep = false) {
    for (const component of this.#components) { this.removeComponent(component); }
    if (this.#alive) {
      document.body.removeChild(this.element);
      this.#alive = false;
    }
    if (deep) {
      this.#element = null;
    }
  }

  isCollide(other) {
    if (Validator.isNotClassType(other, GameObject)) {
      throw FakeWorksError.autoType('other', 'GameObject');
    }
    return (
      this.position.x < other.position.x + other.size.width &&
      this.position.x + this.size.width > other.position.x &&
      this.position.y < other.position.y + other.size.height &&
      this.position.y + this.size.height > other.position.y
    );
  }

  addComponent(component) {
    if (Validator.isNotClassType(component, Component)) {
      throw FakeWorksError.autoType('component', 'Component');
    }
    component.initialize({ object: this });
    this.#components.add(component);
  }

  removeComponent(component) {
    if (Validator.isNotClassType(component, Component)) {
      throw FakeWorksError.autoType('component', 'Component');
    }
    if (this.#components.has(component)) {
      component.remove();
      this.#components.delete(component);
    }
  }

  getComponent(componentType) {
    for (const component of this.#components) {
      if (component instanceof componentType) return component;
    }
    return null;
  }
}



class MouseButtons {
  static get left() { return 0; }
  static get wheel() { return 1; }
  static get right() { return 2; }
}

class InputManager {
  /** @type {boolean} */
  #initialized;

  constructor() {
    this.#initialized = false;
    /** @type {boolean} */
    this.ignoreLetterCase = false;
  }

  normalizeKey(key) {
    return this.ignoreLetterCase ? key.toLowerCase() : key;
  }

  getKeyDown(key) {
    if (!this.#initialized) {
      throw new FakeWorksError('INIT ERROR', 'Initialization is required before using Input');
    }
    const normalizedKey = this.normalizeKey(key);
    return this.keyDownStates.has(normalizedKey);
  }

  getKey(key) {
    if (!this.#initialized) {
      throw new FakeWorksError('INIT ERROR', 'Initialization is required before using Input');
    }
    const normalizedKey = this.normalizeKey(key);
    return this.keyStates.get(normalizedKey) || false;
  }

  getKeyUp(key) {
    if (!this.#initialized) {
      throw new FakeWorksError('INIT ERROR', 'Initialization is required before using Input');
    }
    const normalizedKey = this.normalizeKey(key);
    return this.keyUpStates.has(normalizedKey);
  }

  getMouseButtonDown(button) {
    if (!this.#initialized) {
      throw new FakeWorksError('INIT ERROR', 'Initialization is required before using Input');
    }
    return this.mouseDownStates.has(button);
  }

  getMouseButton(button) {
    if (!this.#initialized) {
      throw new FakeWorksError('INIT ERROR', 'Initialization is required before using Input');
    }
    return this.mouseStates.get(button) || false;
  }

  getMouseButtonUp(button) {
    if (!this.#initialized) {
      throw new FakeWorksError('INIT ERROR', 'Initialization is required before using Input');
    }
    return this.mouseUpStates.has(button);
  }

  addKeyDown(key) {
    const normalKey = this.normalizeKey(key);
    if (!this.keyStates.get(normalKey)) {
      this.keyDownStates.add(normalKey);
      this.keyStates.set(normalKey, true);
      requestAnimationFrame(() => this.keyDownStates.delete(normalKey));
    }
  }

  addKeyUp(key) {
    const normalKey = this.normalizeKey(key);
    if (this.keyStates.get(normalKey)) {
      this.keyUpStates.add(normalKey);
      this.keyStates.set(normalKey, false);
      requestAnimationFrame(() => this.keyUpStates.delete(normalKey));
    }
  }

  initialize() {
    this.keyStates = new Map();
    this.keyDownStates = new Set();
    this.keyUpStates = new Set();
    this.mouseStates = new Map();
    this.mouseDownStates = new Set();
    this.mouseUpStates = new Set();
    
    window.addEventListener('keydown', (event) => {
      this.addKeyDown(event.key);
    });
    
    window.addEventListener('keyup', (event) => {
      this.addKeyUp(event.key);
    });

    window.addEventListener('mousedown', (event) => {
      const button = event.button;
      if (!this.mouseStates.get(button)) {
        this.mouseDownStates.add(button);
        this.mouseStates.set(button, true);
        requestAnimationFrame(() => this.mouseDownStates.delete(button));
      }
    });
    
    window.addEventListener('mouseup', (event) => {
      const button = event.button;
      if (this.mouseStates.get(button)) {
        this.mouseUpStates.add(button);
        this.mouseStates.set(button, false);
        requestAnimationFrame(() => this.mouseUpStates.delete(button));
      }
    });

    this.#initialized = true;
  }
}

const Input = new InputManager();




class ElementTheme {
  constructor({
    backgroundColor = "#fff",
    textColor = "#000",
    borderRadius = "4px",
    padding = "8px",
    boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)",
  } = {}) {
    this.backgroundColor = backgroundColor;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.padding = padding;
    this.boxShadow = boxShadow;
  }

  setTheme({ backgroundColor, textColor, borderRadius, padding, boxShadow } = {}) {
    if (backgroundColor) this.backgroundColor = backgroundColor;
    if (textColor) this.textColor = textColor;
    if (borderRadius) this.borderRadius = borderRadius;
    if (padding) this.padding = padding;
    if (boxShadow) this.boxShadow = boxShadow;
    return this;
  }
}

class ElementBuilder {
  /** @type {HTMLElement} */
  #element;
  /** @type {ElementTheme} */
  static #themeData = new ElementTheme();

  static get themeData() { return ElementBuilder.#themeData; }
  static set themeData(newThemeData) {
    if (Validator.isNotClassType(newThemeData, ElementTheme)) {
      throw FakeWorksError.autoType('newThemeData', 'ElementTheme');
    }
    ElementBuilder.#themeData = newThemeData;
  }

  constructor(tagName) {
    this.#element = document.createElement(tagName);
  }

  setClass(...classNames) {
    this.#element.classList.add(...classNames);
    return this;
  }

  setText(text) {
    this.#element.textContent = text;
    return this;
  }

  setAttributes(attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      this.#element.setAttribute(key, value);
    }
    return this;
  }

  setStyle(styles) {
    for (const [key, value] of Object.entries(styles)) {
      this.#element.style[key] = value;
    }
    return this;
  }

  
  setSize(size) {
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    const sizeStyle = {};
    sizeStyle.width = size.width+'px';
    sizeStyle.height = size.height+'px';
    return this.setStyle(sizeStyle);
  }
  
  setPosition(position) {
    if (Validator.isNotClassType(position, Vector)) {
      throw FakeWorksError.autoType('position', 'Vector');
    }
    return this.setStyle({
      'position': 'relative',
      'left': `${position.x}px`,
      'top': `${position.y}px`
    });
  }

  onHover(handler) {
    if (Validator.isNotClassType(handler, Function)) {
      throw FakeWorksError.autoType('handler', 'Function');
    }
    this.#element.addEventListener('mouseenter', (event)=>handler(event, this.#element));
    return this;
  }

  onHoverOut(handler) {
    if (Validator.isNotClassType(handler, Function)) {
      throw FakeWorksError.autoType('handler', 'Function');
    }
    this.#element.addEventListener('mouseout', (event)=>handler(event, this.#element));
    return this;
  }
  
  onPress(handler) {
    if (Validator.isNotClassType(handler, Function)) {
      throw FakeWorksError.autoType('handler', 'Function');
    }
    this.#element.addEventListener("click", (event)=>handler(event, this.#element));
    return this;
  }

  onPressStart(handler) {
    if (Validator.isNotClassType(handler, Function)) {
      throw FakeWorksError.autoType('handler', 'Function');
    }
    this.#element.addEventListener('mousedown', (event)=>handler(event, this.#element));
    this.#element.addEventListener('touchstart', (event)=>handler(event, this.#element));
    return this;
  }

  onPressEnd(handler) {
    if (Validator.isNotClassType(handler, Function)) {
      throw FakeWorksError.autoType('handler', 'Function');
    }
    this.#element.addEventListener('mouseup', (event)=>handler(event, this.#element));
    this.#element.addEventListener('touchend', (event)=>handler(event, this.#element));
    this.#element.addEventListener('touchcancel', (event)=>handler(event, this.#element));
    return this;
  }

  center() {
    this.#element.style.transform = 'translate(-50%, -50%)';
    return this;
  }

  asButton() {
    this.setStyle({
      backgroundColor: ElementBuilder.#themeData.backgroundColor,
      color: ElementBuilder.#themeData.textColor,
      borderRadius: ElementBuilder.#themeData.borderRadius,
      padding: ElementBuilder.#themeData.padding,
      boxShadow: ElementBuilder.#themeData.boxShadow,
      border: "none",
      cursor: "pointer",
      display: "inline-block",
      textAlign: "center"
    });
    return this;
  }

  asCard() {
    this.setStyle({
      backgroundColor: ElementBuilder.#themeData.backgroundColor,
      color: ElementBuilder.#themeData.textColor,
      borderRadius: ElementBuilder.#themeData.borderRadius,
      padding: ElementBuilder.#themeData.padding,
      boxShadow: ElementBuilder.#themeData.boxShadow,
      display: "block"
    });
    return this;
  }

  build() {
    return this.#element;
  }
}



class Component {
  /** @type {GameObject} */
  #object;

  initialize({object}) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'GameObject');
    }
    this.#object = object;
  }

  remove() {
    this.#object = null;
  }

  get object() { return this.#object; }
}



class Prefab {
  /** @type {GameObject} */
  #objectTemplate;
  /** @type {Set} */
  #components;
  /** @type {Set} */
  #instantiatedObjects;

  constructor({object, components = []}) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'GameObject');
    }
    if (Validator.isNotClassType(components, Array)) {
      throw FakeWorksError.autoType('components', 'Array');
    }
    this.#objectTemplate = object;
    this.#components = new Set();
    components.forEach((component) => { this.#components.add(component); });
    this.#instantiatedObjects = new Set();
  }

  get count() { return this.#instantiatedObjects.size; }
  get instances() { return this.#instantiatedObjects; }

  instantiate({setupFunction = false}) {
    let instance = this.#objectTemplate.copy();
    if (setupFunction) {
      if (Validator.isNotClassType(setupFunction, Function)) {
        throw autoType('setupFunction', 'Function');
      }
      instance = setupFunction(instance);
      instance.applyElement();
    }
    if (this.#components.size > 0) {
      this.#components.forEach((component) => { instance.addComponent(component); });
    }
    this.#instantiatedObjects.add(instance);
    return instance;
  }

  destroy({object, delay = Duration.zero}) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'GameObject');
    }
    if (this.#instantiatedObjects.has(object)) {
      waitForDuration(delay).then(() => {
        object.remove(true);
        this.#instantiatedObjects.delete(object);
      });
    }
  }

  destroyAll() {
    for (const object of this.#instantiatedObjects) {
      this.destroy({ object: object });
    }
  }
}



class Scene {
  /** @type {HTMLElement} */
  #root;
  /** @type {Set} */
  #objects;
  /** @type {Set} */
  #elements;
  /** @type {Function} */
  #onLoad;
  /** @type {Function} */
  #onUnload;
  /** @type {boolean} */
  #playing;

  constructor({root}) {
    if (Validator.isNotClassType(root, HTMLElement)) {
      throw FakeWorksError.autoType('root', HTMLElement);
    }
    this.#root = root;
    this.#objects = new Set();
    this.#elements = new Set();
    this.#playing = false;
  }

  get playing() { return this.#playing; }

  addObject({object, layer = false}) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'GameObject');
    }
    if (layer) {
      if (!Validator.isPositive(layer) || !Validator.isInteger(layer)) {
        throw FakeWorksError.value('layer', 'layer must be positive integer');
      }
    }
    if (layer) object.layer = layer;
    this.#objects.add(object);
    if (this.#root && this.#playing) this.#root.appendChild(object.element);
    return object;
  }

  addObjectAll({objects, layer = false}) {
    if (Validator.isNotClassType(objects, Array)) {
      throw FakeWorksError.autoType('objects', 'Array');
    }
    if (layer) {
      if (!Validator.isPositive(layer) || !Validator.isInteger(layer)) {
        throw FakeWorksError.value('layer', 'layer must be positive integer');
      }
    }
    objects.forEach((e) => {
      this.addObject({object: e, layer: layer});
    });
  }

  addElement({element, layer = false}) {
    if (Validator.isNotClassType(element, HTMLElement)) {
      throw FakeWorksError.autoType('element', 'HTMLElement');
    }
    if (layer) {
      if (!Validator.isPositive(layer) || !Validator.isInteger(layer)) {
        throw FakeWorksError.value('layer', 'layer must be positive integer');
      }
    }
    if (layer) element.style.zIndex = layer;
    this.#elements.add(element);
    if (this.#root && this.#playing) this.#root.appendChild(element);
    return element;
  }

  addElementAll({elements, layer = false}) {
    if (Validator.isNotClassType(elements, Array)) {
      throw FakeWorksError.autoType('elements', 'Array');
    }
    if (layer) {
      if (!Validator.isPositive(layer) || !Validator.isInteger(layer)) {
        throw FakeWorksError.value('layer', 'layer must be positive integer');
      }
    }
    elements.forEach((e) => {
      this.addElement({element: e, layer: layer});
    });
  }

  removeObject(object) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'GameObject');
    }
    if (this.#objects.has(object)) {
      object.remove();
      this.#objects.delete(object);
    }
  }

  removeElement(element) {
    if (Validator.isNotClassType(element, HTMLElement)) {
      throw FakeWorksError.autoType('element', 'HTMLElement');
    }
    if (this.#elements.has(element)) {
      this.#root.removeChild(element);
      this.#elements.delete(element);
    }
  }

  hasObject(object) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'GameObject');
    }
    return this.#objects.has(object);
  }

  set onLoad(onLoadFunction) {
    if (Validator.isNotClassType(onLoadFunction, Function)) {
      throw FakeWorksError.autoType('onLoadFunction', 'Function');
    }
    this.#onLoad = onLoadFunction;
  }

  set onUnload(onUnloadFunction) {
    if (Validator.isNotClassType(onUnloadFunction, Function)) {
      throw FakeWorksError.autoType('onunLoadFunction', 'Function');
    }
    this.#onUnload = onUnloadFunction;
  }

  get onLoad() { return this.#onLoad; }
  get onUnload() { return this.#onUnload; }

  run(args = null) {
    const objects = new Set();
    this.#objects.forEach((e) => {
      e.awake();
      if (e.element) {
        objects.add(e);
        this.#root.appendChild(e.element);
      }
    });
    this.#objects = objects;
    this.#elements.forEach((e) => {
      this.#root.appendChild(e);
    });
    this.#playing = true;
    if (this.#onLoad) args !== null ? this.#onLoad(...args) : this.#onLoad();
  }

  kill() {
    this.#objects.forEach((e) => {
      e.remove();
    });
    this.#elements.forEach((e) => {
      e.remove();
    })
    this.#playing = false;
    if (this.#onUnload) this.#onUnload();
  }
}



class TextUI extends GameObject {
  constructor({position = Vector.zero, text, layer = 0}) {
    const element = document.createElement('span');
    element.textContent = text;
    super({
      position: position,
      element: element,
      anchorPoint: new Vector({ x: 0.5, y: 0.5}), 
      layer: layer
    });
  }

  clear() {
    this.element.innerText = '';
    this.resize();
  }

  setText(text) {
    if (this.element === null) return;
    this.element.innerText = text;
    this.resize();
  }

  setFontSize(px) {
    if (this.element === null) return;
    this.element.style.fontSize = `${px}px`;
    this.resize();
  }

  addText(text) {
    if (this.element === null) return;
    this.element.innerText += text;
    this.resize();
  }

  resize() {
    const element = this.element;
    const copyElement = document.createElement('span');
    copyElement.innerText = element.innerText;
    copyElement.style.fontSize = element.style.fontSize;
    this.size = Size.fitOf(copyElement);
    this.applySize();
  }
}



class Collider extends Component {
  /** @type {Vector} */
  #offset;
  /** @type {Size} */
  #size;

  constructor({ offset, size }) {
    super();
    if (Validator.isNotClassType(offset, Vector)) {
      throw FakeWorksError.autoType('position', 'Vector');
    }
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    this.#offset = offset;
    this.#size = size;
  }

  get position() { return this.#offset; }
  set position(newPosition) {
    if (Validator.isNotClassType(newPosition, Vector)) {
      throw FakeWorksError.autoType('newPosition', 'Vector');
    }
    this.#offset = newPosition;
  }

  get size() { return this.#size; }
  set size(newSize) {
    if (Validator.isNotClassType(newSize, Size)) {
      throw FakeWorksError.autoType('newSize', 'Size');
    }
    this.#size = newSize;
  }

  isCollide(other) {
    if (Validator.isNotClassType(other, Collider)) {
      throw FakeWorksError.autoType('other', 'Collider');
    }
    return (
      this.#offset.x < other.position.x + other.size.width &&
      this.#offset.x + this.#size.width > other.position.x &&
      this.#offset.y < other.position.y + other.size.height &&
      this.#offset.y + this.#size.height > other.position.y
    );
  }

  contains(point) {
    if (Validator.isNotClassType(point, Vector)) {
      throw FakeWorksError.autoType('point', 'Vector');
    }
    return (
      point.x >= this.#offset.x &&
      point.x <= this.#offset.x + this.#size.width &&
      point.y >= this.#offset.y &&
      point.y <= this.#offset.y + this.#size.height
    );
  }

  move(newPosition) {
    if (Validator.isNotClassType(newPosition, Vector)) {
      throw FakeWorksError.autoType('newPosition', 'Vector');
    }
    this.#offset = newPosition;
    return this;
  }

  copy() {
    return new Collider({
      position: this.#offset.copy(),
      size: this.#size.copy(),
    });
  }

  toString() {
    return `Collider(position: ${this.#offset.toString()}, size: ${this.#size.toString()})`;
  }
}



/** @typedef {'DYNAMIC' | 'KINEMATIC' | 'STATIC'} BodyType */

class RigidBody extends Component {
  /** @type {number} */
  #mass;
  /** @type {Vector} */
  #gravity;
  /** @type {Vector} */
  #velocity;
  /** @type {Vector} */
  #force;
  /** @type {BodyType} */
  #body;
  /** @type {number} */
  #drag

  static get bodyType() {
    return {
      dynamic: 'DYNAMIC',
      kinematic: 'KINEMATIC',
      static: 'STATIC'
    };
  }

  constructor({ mass = 1, gravity = new Vector({ x: 0, y: 9.8 }), body = 'DYNAMIC', drag = 1 }) {
    super();
    if (!Validator.isPositive(mass)) {
      throw FakeWorksError.value('mass must be a positive number');
    }
    if (Validator.isNotClassType(gravity, Vector)) {
      throw FakeWorksError.autoType('gravity', 'Vector');
    }
    if (!Validator.isPositive(drag)) {
      throw FakeWorksError.value('drag must be a positive number');
    }

    this.#mass = mass;
    this.#gravity = gravity;
    this.#velocity = Vector.zero;
    this.#force = Vector.zero;
    this.#body = body;
    this.#drag = drag;
  }

  initialize({object}) {
    super.initialize({object: object});
    startCoroutine(this.loop.bind(this));
  }

  remove() {
    stopCoroutine(this.loop.bind(this));
    super.remove();
  }

  get mass() { return this.#mass; }
  get velocity() { return this.#velocity; }
  get body() { return this.#body; }
  get drag() { return this.#drag; }
  get speed() { return this.#velocity.magnitude(); }
  
  
  set velocity(newVelocity) {
    if (Validator.isNotClassType(newVelocity, Vector)) {
      throw FakeWorksError.autoType('newVelocity', 'Vector');
    }
    this.#velocity = newVelocity;
  }
  
  set drag(newDrag) {
    if (!Validator.isPositive(newDrag)) {
      throw FakeWorksError.value('newDrag must be a positive number');
    }
    this.#drag = newDrag;
  }
  
  addForce(force) {
    if (Validator.isNotClassType(force, Vector)) {
      throw FakeWorksError.autoType('force', 'Vector');
    }
    this.#force.add(force);
    const acceleration = this.#force.copy().scale(1 / this.#mass);
    this.#velocity.add(acceleration);
  }
  
  addImpulse(impulse) {
    if (Validator.isNotClassType(impulse, Vector)) {
      throw FakeWorksError.autoType('impulse', 'Vector');
    }
    this.#velocity.add(impulse.copy().scale(1 / this.#mass));
  }

  *loop() {
    while (true) {
      this.update();
      yield null;
    }
  }

  update() {
    this.#force = Vector.zero;
    if (this.#body === 'STATIC') return;

    if (this.#body === 'KINEMATIC') {
      const normalize = this.#velocity.copy().normalize();
      const dragForce = normalize.copy().scale(-this.#drag);
      if (normalize.x > 0) {
        this.#velocity.x = Math.max(0, this.#velocity.x + dragForce.x);
      } else {
        this.#velocity.x = Math.min(0, this.#velocity.x + dragForce.x);
      }
      if (normalize.y > 0) {
        this.#velocity.y = Math.max(0, this.#velocity.y + dragForce.y);
      } else {
        this.#velocity.y = Math.min(0, this.#velocity.y + dragForce.y);
      }
      
      

      const threshold = 0.01;
      if (this.#velocity.magnitude() < threshold) {
        this.#velocity = Vector.zero;
      }

      this.object.position.add(this.#velocity);
      this.object.applyPosition();
      return;
    }
    
    // 여기 DYNAMIC은 망했어!
    // 이제부터는 KINEMATIC이 점령한다!
  }

  resolveCollision(other) {
    if (Validator.isNotClassType(other, RigidBody)) {
      throw FakeWorksError.autoType('other', 'Rigidbody');
    }
    
    const normal = this.object.position.copy().subtract(other.object.position).normalize();
    const relativeVelocity = this.velocity.copy().subtract(other.velocity);
    
    if (relativeVelocity.dotProduct(normal) > 0) return;

    const velocityAlongNormal = relativeVelocity.dotProduct(normal);
    const impulseMagnitude = -velocityAlongNormal / (1 / this.#mass + 1 / other.mass);
    
    const impulse = normal.scale(impulseMagnitude);

    this.#velocity.add(impulse.copy().scale(1 / this.#mass));
    other.addImpulse(impulse.copy().negate());
  }
}



/** @typedef {'ANDROID' | 'IOS' | 'WEB'} Platform */

class Game {
  /** @type {HTMLElement} */
  #root;
  /** @type {Platform} */
  #platform;
  /** @type {Map} */
  #scenes;
  /** @type {number} */
  #lastTime;

  constructor({root = false, useFullScreen = false, useDefaultStyle = true, initHTMLStyle = false}) {
    if (!root && !useFullScreen) {
      throw FakeWorksError.value('root or useFullScreen is required');
    }
    if (useFullScreen) {
      root = document.body;
      root.style.width = '100vw';
      root.style.height = '100dvh';
    } else if (Validator.isNotClassType(root, HTMLElement)) {
      throw FakeWorksError.autoType('root', HTMLElement);
    }
    /** @type {Game} */
    window.game = this;
    this.#root = root;
    this.#platform = (() => {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) return 'IOS';
      if (/android|wv/.test(ua)) return 'ANDROID';
      return 'WEB';
    })();
    this.#lastTime = 0;
    this.deltaTime = 0;
    (() => {
      const update = (currentTime) => {
        this.deltaTime = (currentTime - this.#lastTime) / 1000;
        this.#lastTime = currentTime;
        requestAnimationFrame(update);
      };
      requestAnimationFrame((currentTime) => {
        this.#lastTime = currentTime;
        update(currentTime);
      });
    })();
    window.game = this;
    if (useDefaultStyle) {
      root.style.position = 'relative';
      root.style.overflow = 'hidden';
      root.style.userSelect = 'none';
      root.oncontextmenu = ()=>false;
    }
    if (initHTMLStyle) {
      const style = document.createElement('style');
      style.innerHTML = '* { margin: 0 auto; }';
      document.head.appendChild(style);
    }
    this.size = Size.fitOf(root);
    this.width = this.size.width;
    this.height = this.size.height;
    this.#scenes = new Map();
  }

  get platform() { return this.#platform; }

  setBackground({ color = null, url = null }) {
    if (color) {
      if (Validator.isNotClassType(color, Color)) {
        throw FakeWorksError.autoType('color', 'Color');
      }
      this.#root.style.backgroundColor = color.toString();
    } else if (url) {
      this.#root.style.backgroundImage = `url('${url}')`;
    } else {
      throw FakeWorksError.value('Either color or url needs a factor');
    }
  }

  contains(object) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'Object');
    }
    return !(this.width < object.position.x ||
    0 > object.position.x + object.size.width ||
    this.height < object.position.y ||
    0 > object.position.y + object.size.height);
  }

  createScene(name) {
    const scene = new Scene({root: this.#root});
    this.#scenes.set(name, scene);
    return scene;
  }

  getScene(name) {
    return this.#scenes.get(name);
  }

  loadScene({scene, args = null }) {
    if (Validator.isNotClassType(scene, Scene)) {
      throw FakeWorksError.autoType('scene', 'Scene');
    }
    if (args !== null && Validator.isNotClassType(args, Array)) {
      throw FakeWorksError.autoType('args', 'Array');
    }
    this.#scenes.forEach((e) => {
      if (e.playing) e.kill();
    });
    scene.run(args);
  }

  loadSceneNamed({name, args = null }) {
    const scene = this.#scenes.get(name);
    if (Validator.isNotClassType(scene, Scene)) {
      throw FakeWorksError.value(`scene named '${name}' is invaild or null`);
    }
    this.loadScene({scene: scene, args: args });
  }
}

