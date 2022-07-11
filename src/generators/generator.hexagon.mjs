import Generator from '../generator.mjs';

class HexagonGenerator extends Generator {

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

export default HexagonGenerator;
