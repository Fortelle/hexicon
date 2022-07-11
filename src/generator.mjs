import Randomizer from './randomizer.mjs';
import SVG from './svg.mjs';

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

    this.randomizer = new Randomizer(options.random);
  }

  createSVG() {
    let size = ~~this.options.size;
    let svg = new SVG({
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

export default Generator;
