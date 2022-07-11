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

export default Randomizer;
