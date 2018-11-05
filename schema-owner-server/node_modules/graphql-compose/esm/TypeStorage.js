/*  strict */
import { isFunction } from './utils/is';
import { TypeComposer } from './TypeComposer';
import { InputTypeComposer } from './InputTypeComposer';
import { EnumTypeComposer } from './EnumTypeComposer';
import { InterfaceTypeComposer } from './InterfaceTypeComposer';
// TypeStorage has all methods from Map class
export class TypeStorage {
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

    const gqType = isFunction(typeOrThunk) ? typeOrThunk() : typeOrThunk;

    if (gqType) {
      this.set(typeName, gqType);
    }

    return gqType;
  }

  getTC(typeName) {
    if (!this.hasInstance(typeName, TypeComposer)) {
      throw new Error(`Cannot find TypeComposer with name ${typeName}`);
    }

    return this.get(typeName);
  }

  getITC(typeName) {
    if (!this.hasInstance(typeName, InputTypeComposer)) {
      throw new Error(`Cannot find InputTypeComposer with name ${typeName}`);
    }

    return this.get(typeName);
  }

  getETC(typeName) {
    if (!this.hasInstance(typeName, EnumTypeComposer)) {
      throw new Error(`Cannot find EnumTypeComposer with name ${typeName}`);
    }

    return this.get(typeName);
  }

  getIFTC(typeName) {
    if (!this.hasInstance(typeName, InterfaceTypeComposer)) {
      throw new Error(`Cannot find InterfaceTypeComposer with name ${typeName}`);
    }

    return this.get(typeName);
  }

}