import Generator from '../generator.mjs';

class ConcentrationGenerator extends Generator {

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

export default ConcentrationGenerator;
