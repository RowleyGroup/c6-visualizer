import 'whatwg-fetch';
import papa from 'babyparse';

export class DataOrganizer {
  static forceFields = ['CGenFF', 'GAFF', 'OPLS'];

  static normalizers = {
    'C6_CGenFF': Number,
    'C6_GAFF': Number,
    'C6_OPLS': Number,
    'C6_POSTG': Number,
    'C6_POSTG (Ha A^6)': Number
  };

  constructor(path) {
    this.path = path;
  }

  fetch() {
    return fetch(this.path)
      .then(data => data.text())
      .then(text => {
        const {data: rawData} = papa.parse(text);
        this.rawData = rawData;
      });
  }

  normalize() {
    const header = this.rawData[0].map(string => string.trim());

    this.data = this.rawData
      .slice(1)
      .filter(row => row.length >= header.length)
      .map(row => {
        const object = {};

        header.forEach((key, index) => {
          object[key] = row[index];

          if (DataOrganizer.normalizers[key]) {
            object[key] = DataOrganizer.normalizers[key](object[key]);
          }
        });

        return object;
      });
  }

  prepareAtomTypes() {
    this.atomTypes = {};

    DataOrganizer.forceFields.forEach(forceField => {
      this.atomTypes[forceField] = {};
    });

    this.data.forEach(data => {
      DataOrganizer.forceFields.forEach(forceField => {
        const atomType = data[`${forceField} Atom Type`];

        if (typeof this.atomTypes[forceField][atomType] === 'undefined') {
          this.atomTypes[forceField][atomType] = [];
        }

        this.atomTypes[forceField][atomType].push(data);
      });
    });
  }
}

export default new DataOrganizer('/data.csv');