import SquareGenerator from './generators/generator.square.mjs'
import HexagonGenerator from './generators/generator.hexagon.mjs'
import ConcentrationGenerator from './generators/generator.concentration.mjs'

const generatorTypes = {
  'square': SquareGenerator,
  'hexagon': HexagonGenerator,
  'concentration': ConcentrationGenerator,
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

export default Hexicon;
