(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Hexicon"] = factory();
	else
		root["Hexicon"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ src)
});

;// CONCATENATED MODULE: ./src/randomizer.mjs
const fnv1a_offset = 0x811C9DC5;
const fnv1a_prime = 0x01000193;

const fnv1a = (numbers) => {
  let hash = fnv1a_offset;
  for (let number of numbers) {
    hash = (hash ^ number) & 0xFFFFFFFF;
    hash = (hash * fnv1a_prime) & 0xFFFFFFFF;
  }
  return hash;
}

const fromString = (string) => {
  let numbers = [...string].map(c => c.charCodeAt(0));
  return fnv1a(numbers);
};

const fromBytes = (bytes) => {
  return fnv1a(bytes);
};

const fromHex = (hex) => {
  hex = hex.replace(/[^A-Fa-f0-9]/g, '').replace(/^0+/, '');
  if (hex.length % 2 != 0) {
    hex = '0' + hex;
  }
  let numbers = hex.matchAll(/../g).map(m => parseInt(m[0], 16)).reverse();
  return fnv1a(numbers);
};

class Randomizer {

  constructor(options = {}) {
    this.seed = options.seed ? options.seed & 0xffffffff
      : options.string ? fromString(options.string)
        : options.bytes ? fromBytes(options.bytes)
          : options.hex ? fromHex(options.hex)
            : fromString(Math.random().toString());
    this.reset();
  }

  reset() {
    this.sample = this.seed;
  }

  next() {
    let r = this.sample;
    r ^= (r << 13) & 0xffffffff;
    r ^= (r >> 17) & 0xffffffff;
    r ^= (r << 5) & 0xffffffff;
    this.sample = r;
    return r;
  }

  nextBool() {
    return this.next() > 0; // danger
  }

  nextFloat() {
    return this.next() / 0x100000000;
  }

}

/* harmony default export */ const randomizer = (Randomizer);

;// CONCATENATED MODULE: ./src/svg.mjs
class Svg {

  constructor(args = {}) {
    let svg = document.createElement('svg');
    for(let [key, value] of Object.entries(args)){
      svg.setAttribute(key, value);
    }
    this.element = svg;
  }
  
  add(name, args) {
    let item = document.createElement(name);
    for(let [key, value] of Object.entries(args)){
      item.setAttribute(key, value);
    }
    this.element.append(item);
  }
  
  toString() {
    return this.element.outerHTML;
  }
  
}

/* harmony default export */ const src_svg = (Svg);

;// CONCATENATED MODULE: ./src/generator.mjs



class Generator {

  constructor(options, defaultOptions) {
    this.options = {
      ... {
        size: 512,
        threshold: 0.5,
      },
      ...defaultOptions ?? {},
      ...options ?? {},
    };

    this.randomizer = new randomizer(options.random);
  }

  createSVG() {
    let size = ~~this.options.size;
    let svg = new src_svg({
      'xmlns': 'http://www.w3.org/2000/svg',
      'version': '1.1',
      'width': size,
      'height': size,
      'preserveAspectRatio': 'xMinYMin',
      'viewBox': `0 0 ${size} ${size}`,
      'data-seed': this.randomizer.seed
    });

    let data = this.getTileData();

    if (this.options.background) {
      svg.add('rect', {
        'width': '100%',
        'height': '100%',
        'fill': this.options.background,
      });
    }

    this.paintSVG(svg, data);

    return svg;
  }

  getColor() {
    let color = this.options.color;
    switch (color) {
      case undefined:
      case 'normal':
      case 'light':
      case 'dark': {
        this.randomizer.reset();
        let h = this.randomizer.nextFloat() * 360;
        let s = 60 + this.randomizer.nextFloat() * 20;
        let l = color == 'light' ? 60 + this.randomizer.nextFloat() * 20
          : color == 'dark' ? 40 - this.randomizer.nextFloat() * 20
            : 40 + this.randomizer.nextFloat() * 20;
        return `hsl(${h},${s}%,${l}%)`;
      }
      default:
        return color;
    }
  }

  getBool() {
    let sample = this.randomizer.next();
    let bool = sample < this.threshold * 0xFFFFFFFF;
    return bool;
  }

  getBools(length) {
    let bools = [...Array(length)].map(_ => this.randomizer.nextBool());

    let minimum = Math.ceil((this.options.minimum ?? 0) * length);
    if (minimum > 0) {
      let indexes = bools
        .map((b, i) => b ? -1 : i)
        .filter(i => i >= 0);
      let complement = minimum - (bools.length - indexes.length);
      if (complement > 0) {
        indexes = indexes.sort(() => this.randomizer.nextBool() ? 1 : -1);
        for (let i = 0; i < complement; i++) {
          bools[indexes[i]] = true;
        }
      }
    }

    return bools;
  }

}

/* harmony default export */ const generator = (Generator);

;// CONCATENATED MODULE: ./src/generators/generator.square.mjs


class SquareGenerator extends generator {

  static defaultOptions = {
    level: 5,
    symmetrical: true,
  }

  constructor(options) {
    super(options, SquareGenerator.defaultOptions);
  }

  getTileData() {
    let size = ~~this.options.size;
    let level = ~~this.options.level;
    if (level <= 0) return;

    let rightLength = this.options.symmetrical ? Math.ceil(level / 2) : level;
    let fingerprint = this.getBools(level * rightLength);

    let blockSize = size / (level + 1.236);
    let originX = (size - blockSize * level) / 2;
    let originY = originX;

    let color = this.getColor();

    let data = [];
    for (let col = 0; col < level; col++) {
      let col_mirror = col < rightLength ? col : level - 1 - col;
      for (let row = 0; row < level; row++) {
        if (fingerprint[col_mirror * level + row]) {
          data.push({
            x: originX + col * blockSize,
            y: originY + row * blockSize,
            size: blockSize,
            color: color
          });
        }
      }
    }

    return data;
  }
  
  paintSVG(svg, data) {
    svg.element.setAttribute('shape-rendering', 'crispEdges');

    for (let item of data) {
      svg.add('rect', {
        x: item.x,
        y: item.y,
        width: item.size,
        height: item.size,
        fill: item.color
      });
    }
  }

}

/* harmony default export */ const generator_square = (SquareGenerator);

;// CONCATENATED MODULE: ./src/generators/generator.hexagon.mjs


class HexagonGenerator extends generator {

  static defaultOptions = {
    level: 4,
    symmetrical: true,
  }

  constructor(options) {
    super(options, HexagonGenerator.defaultOptions);
  }

  getTileData() {
    let size = ~~this.options.size;
    let level = ~~this.options.level;
    if (level <= 0) return;
    let spacing = ~~this.options.spacing;
    let isSymmetrical = !!this.options.symmetrical;
    let isRotated = !!this.options.rotated;
    let isBordered = !!this.options.bordered;
    let originX = size / 2;
    let originY = originX;
    let sqrt3 = Math.sqrt(3);
    let boxApothem = size / (level * 2) / 2;
    let boxRadius = boxApothem / sqrt3 * 2;
    let tileCount = 1 + 3 * level * (level - 1);
    let color = this.getColor();
    let fingerprint = this.getBools(tileCount);
    let data = [];

    let layers = [...Array(level)].map(() => []);
    let tiles = {};
    let i = 0;
    for (let a = -level + 1; a < level; a++) {
      for (let b = -level + 1; b < level; b++) {
        let c = -(a + b);
        let layer = (Math.abs(a) + Math.abs(b) + Math.abs(c)) / 2;
        if (layer < level) {
          layers[layer].push([a, b, c]);
          tiles[`${a},${b}`] = fingerprint[i++];
        }
      }
    }

    if (!isRotated) { // ⬣
      for (let layer = 0; layer < layers.length; layer++) {
        let isborder = isBordered && layer == layers.length - 1;
        for (let [a, b, c] of layers[layer]) {
          let a2 = (isSymmetrical && a < 0) ? -a : a;
          let b2 = (isSymmetrical && a < 0) ? c * -1 : b;
          if (isborder || tiles[`${a2},${b2}`]) {
            let x = originX + 3 / 2 * boxRadius * a;
            let y = originY + sqrt3 * boxRadius * (a / 2 + b);
            let points = this.getVertex(x, y, boxRadius - spacing, 0);
            data.push({ points, color });
          }
        }
      }
    } else { // ⬢
      for (let layer = 0; layer < layers.length; layer++) {
        let isborder = isBordered && layer == layers.length - 1;
        for (let [a, b, c] of layers[layer]) {
          let b2 = (isSymmetrical && (b < c)) ? c : b;
          if (isborder || tiles[`${a},${b2}`]) {
            let x = originX + sqrt3 * boxRadius * (a / 2 + b);
            let y = originY + 3 / 2 * boxRadius * a;
            let points = this.getVertex(x, y, boxRadius - spacing, -30);
            data.push({ points, color });
          }
        }
      }
    }
    
    return data;

    /*
        if (!isRotated) { // ⬢
          let lineHeight = boxRadius * 1.5;
          let coords = [];
          for (var row = -(level - 1); row <= (level - 1); row++) {
            let col0 = -(level - 1) + Math.floor(Math.abs(row) * .5);
            let col1 = (level - 1) - Math.ceil(Math.abs(row) * .5);
            for (var col = col0; col <= col1; col++) {
              coords.push([col, row]);
            }
          }
          let blocks = {};
          for (let [col, row] of coords) {
            if (col >= 0 || !isSymmetrical) {
              blocks[`${col},${row}`] = false;
            }
          }
    
          let keys = Object.keys(blocks);
          let fingerprint = this.getBools(keys.length);
          blocks = Object.fromEntries(keys.map((key, i) => [key, fingerprint[i]]));
    
          for (let [col, row] of coords) {
            let isYOdd = Math.abs(row) % 2 == 1;
            let blockX = originX + col * boxApothem * 2 + (isYOdd ? boxApothem : 0);
            let blockY = originY + row * lineHeight;
            let col_mirror = isSymmetrical ? Math.abs((isYOdd && col < 0) ? col + 1 : col) : col;
            if (blocks[`${col_mirror},${row}`]) {
              let points = this.getVertex(blockX, blockY, boxRadius - spacing, 30);
              data.push({
                points, color
              });
            }
          }
        } else { // ⬣
          let lineHeight = boxApothem * 2;
          let coords = [];
          for (var col = -(level - 1); col <= level - 1; col++) {
            let row0 = -(level - 1) + Math.floor(Math.abs(col) * .5);
            let row1 = (level - 1) - Math.ceil(Math.abs(col) * .5);
            for (var row = row0; row <= row1; row++) {
              coords.push([col, row]);
            }
          }
          let blocks = {};
          for (let [col, row] of coords) {
            if (col >= 0 || !isSymmetrical) {
              blocks[`${col},${row}`] = false;
            }
          }
    
          let keys = Object.keys(blocks);
          let fingerprint = this.getBools(keys.length);
          blocks = Object.fromEntries(keys.map((key, i) => [key, fingerprint[i]]));
    
          for (let [col, row] of coords) {
            let blockX = originX + col * (boxRadius * 1.5);
            let blockY = originY + row * lineHeight + ((Math.abs(col) % 2 == 1) ? boxApothem : 0);
            let col_mirror = isSymmetrical ? Math.abs(col) : col;
            if (blocks[`${col_mirror},${row}`]) {
              let points = this.getVertex(blockX, blockY, boxRadius - spacing, 0);
              data.push({
                points, color
              });
            }
          }
    
        }
    */
  }

  paintSVG(svg, data) {
    for (let item of data) {
      svg.add('polygon', {
        'points': item.points.map(x => `${x[0]},${x[1]}`).join(' '),
        'fill': item.color,
        'stroke': item.color
      });
    }
  }

  getVertex(x, y, radius, rotation) {
    return [...Array(6)]
      .map((_, i) => [
        x + radius * Math.cos((rotation + i * 60) * Math.PI / 180),
        y + radius * Math.sin((rotation + i * 60) * Math.PI / 180)
      ]);
  }

  draw(svg) {
    if (!this.options.rotated) {
      return this.drawA(svg);
    } else {
      return this.drawB(svg);
    }
  }

}

/* harmony default export */ const generator_hexagon = (HexagonGenerator);

;// CONCATENATED MODULE: ./src/generators/generator.concentration.mjs


class ConcentrationGenerator extends generator {

  static defaultOptions = {
    level: 6,
    sides: 8,
    rotated: false,
    symmetrical: true,
    bordered: false,
  }

  constructor(options) {
    super(options, ConcentrationGenerator.defaultOptions);
  }

  getTileData() {
    let size = ~~this.options.size;
    let level = ~~this.options.level;
    let sides = ~~this.options.sides;
    let isSymmetrical = !!this.options.symmetrical;
    let isRotated = !!this.options.rotated;
    let isBordered = !!this.options.bordered;
    if (sides < 3) return;

    let originX = size / 2;
    let originY = originX;
    let lineHeight = size / (level * 2 + 1.236);
    let blockWidth = lineHeight * .8;
    let angle = 360 / sides;
    let rotation = isRotated ? angle * .5 : 0;
    let color = this.getColor();

    let getVertex = (length) =>
      new Array(sides).fill()
        .map((_, i) => [
          originX + length * Math.cos((-rotation - 90 + i * angle) * Math.PI / 180),
          originY + length * Math.sin((-rotation - 90 + i * angle) * Math.PI / 180)
        ]);

    let mid = (sides >> 1) + (sides % 2) + ((isRotated && sides % 2 == 0) ? 1 : 0);
    let validCount = 1 + (level - 1) * (isSymmetrical ? mid : sides);

    let fingerprint = this.getBools(validCount);

    let data = [];
    for (let l = 1; l <= level; l++) {
      if (l == 1 && (fingerprint[0] || isBordered)) {
        let points = getVertex(blockWidth);
        data.push({
          points,
          color,
        });
      } else {
        let innerVertex = getVertex((l - 1) * lineHeight);
        let outerVertex = getVertex((l - 1) * lineHeight + blockWidth);

        for (let j = 0; j < sides; j++) {
          let j2 = isSymmetrical
            ? 1 + (l - 2) * mid + (j < mid ? j
              : (sides % 2 == 0)
                ? 2 * mid - j - (isRotated ? 2 : 1)
                : 2 * mid - j - (isRotated ? 1 : 2)
            )
            : 1 + (l - 2) * sides + j;
          if ((isBordered && l == level) || fingerprint[j2]) {
            let points = [
              innerVertex[j],
              innerVertex[j == sides - 1 ? 0 : j + 1],
              outerVertex[j == sides - 1 ? 0 : j + 1],
              outerVertex[j],
            ];
            data.push({
              points,
              color,
            });
          }
        }
      }
    }
    
    return data;
  }

  paintSVG(svg, data) {
    for (let item of data) {
      svg.add('polygon', {
        points: item.points.map(x => `${x[0]},${x[1]}`).join(' '),
        'fill': item.color,
        'stroke': item.color,
      });
    }
  }

}

/* harmony default export */ const generator_concentration = (ConcentrationGenerator);

;// CONCATENATED MODULE: ./src/index.mjs




const generatorTypes = {
  'square': generator_square,
  'hexagon': generator_hexagon,
  'concentration': generator_concentration,
};

class Hexicon {

  static types = generatorTypes

  constructor(options) {
    let type = generatorTypes[options.type];
    this.generator = new type(options);
  }

  toSVG(xml = false) {
    let svg = this.generator.createSVG();
    let markup = svg.toString();
    if (xml) {
      markup = '<?xml version="1.0" encoding="utf-8"?>\n' + markup;
    }
    return markup;
  }

};

/* harmony default export */ const src = (Hexicon);

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});