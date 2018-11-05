"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeStorage = void 0;

var _is = require("./utils/is");

var _TypeComposer = require("./TypeComposer");

var _InputTypeComposer = require("./InputTypeComposer");

var _EnumTypeComposer = require("./EnumTypeComposer");

var _InterfaceTypeComposer = require("./InterfaceTypeComposer");

/*  strict */
// TypeStorage has all methods from Map class
class TypeStorage {
  constructor() {
    this.types = new Map(); // alive proper Flow type casting in autosuggestions

    /* :: return this; */
  }

  get size() {
    return this.types.size;
  }

  clear() {
    this.types.clear();
  }

  delete(typeName) {
    return this.types.delete(typeName);
  }

  entries() {
    return this.types.entries();
  }

  forEach(callbackfn, thisArg) {
    return this.types.forEach(callbackfn, thisArg);
  }

  get(typeName) {
    const v = this.types.get(typeName);

    if (!v) {
      throw new Error(`Type with name ${JSON.stringify(typeName)} does not exists in TypeStorage`);
    }

    return v;
  }

  has(typeName) {
    return this.types.has(typeName);
  }

  keys() {
    return this.types.keys();
  }

  set(typeName, value) {
    this.types.set(typeName, value);
    return this;
  }

  values() {
    return this.types.values();
  }

  add(value) {
    if (value) {
      let typeName;

      if (value.getTypeName && value.getTypeName.call) {
        // $FlowFixMe
        typeName = value.getTypeName();
      } else if (value.name) {
        typeName = value.name;
      }

      if (typeName) {
        this.set(typeName, value);
        return typeName;
      }
    }

    return null;
  }

  hasInstance(typeName, ClassObj) {
    if (!this.has(typeName)) return false;
    const existedType = this.get(typeName);

    if (existedType && existedType instanceof ClassObj) {
      return true;
    }

    return false;
  }

  getOrSet(typeName, typeOrThunk) {
    const existedType = this.types.get(typeName);

    if (existedType) {
      return existedType;
    }

    const gqType = (0, _is.isFunction)(typeOrThunk) ? typeOrThunk() : typeOrThunk;

    if (gqType) {
      this.set(typeName, gqType);
    }

    return gqType;
  }

  getTC(typeName) {
    if (!this.hasInstance(typeName, _TypeComposer.TypeComposer)) {
      throw new Error(`Cannot find TypeComposer with name ${typeName}`);
    }

    return this.get(typeName);
  }

  getITC(typeName) {
    if (!this.hasInstance(typeName, _InputTypeComposer.InputTypeComposer)) {
      throw new Error(`Cannot find InputTypeComposer with name ${typeName}`);
    }

    return this.get(typeName);
  }

  getETC(typeName) {
    if (!this.hasInstance(typeName, _EnumTypeComposer.EnumTypeComposer)) {
      throw new Error(`Cannot find EnumTypeComposer with name ${typeName}`);
    }

    return this.get(typeName);
  }

  getIFTC(typeName) {
    if (!this.hasInstance(typeName, _InterfaceTypeComposer.InterfaceTypeComposer)) {
      throw new Error(`Cannot find InterfaceTypeComposer with name ${typeName}`);
    }

    return this.get(typeName);
  }

}

exports.TypeStorage = TypeStorage;