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

export default Svg;
