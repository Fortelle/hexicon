import Generator from '../generator.mjs';

class SquareGenerator extends Generator {

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

export default SquareGenerator;
