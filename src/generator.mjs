import Randomizer from './randomizer.mjs';
import SVG from './svg.mjs';

class Generator {

  constructor(options, defaultOptions) {
    this.options = {
      ... {
        size: 512,
        threshold: 0.5,
        colorCount: 1,
        minHue: 0,
        maxHue: 360,
        minSaturation: 60,
        maxSaturation: 80,
        minLightness: 60,
        maxLightness: 80
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

  getColors() {
    let color = this.options.color;
    let colorCount = ~~this.options.colorCount;
    switch (color) {
      case undefined:
      case 'normal':
      case 'light':
      case 'dark': {
        this.randomizer.reset();
        let s = 60 + this.randomizer.nextFloat() * 20;
        let l = color == 'light' ? 60 + this.randomizer.nextFloat() * 20
          : color == 'dark' ? 40 - this.randomizer.nextFloat() * 20
            : 40 + this.randomizer.nextFloat() * 20;
        let hueStep = 360 / (colorCount * 2);
        let hueStart = this.randomizer.nextFloat() * 360;
        return [...Array(colorCount).keys()].map(i => {
          let h = hueStart + hueStep * i * 2 + this.randomizer.nextFloat() * hueStep;
          return `hsl(${h},${s}%,${l}%)`
        });
      }
      default:
        return color;
    }
  }

  getBool() {
    let sample = this.randomizer.next();
    let bool = sample < this.options.threshold * 0xFFFFFFFF;
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

  getPatterns(length) {
    let colorCount = ~~this.options.colorCount;
    let threshold = this.options.threshold;
    let thresholdValue = threshold * 0xFFFFFFFF;
console.log(thresholdValue);
    let patterns = [...Array(length)].map(_ => this.randomizer.next());
    console.log(patterns);
    if (colorCount == 1) {
      return patterns.map(x => x < thresholdValue ? 0 : -1);
    } else {
      return patterns.map(x => x < thresholdValue ? Math.floor(x / thresholdValue * colorCount) : -1);
    }
  }

  getInts(length, max) {
    let ints = [...Array(length)].map(_ => this.randomizer.nextInt(max));
    return ints;
  }

}

export default Generator;
