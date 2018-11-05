"use strict";

var _TypeStorage = require("../TypeStorage");

var _graphql = require("../graphql");

var _ = require("..");

/*  strict */
let typeStorage;
beforeEach(() => {
  typeStorage = new _TypeStorage.TypeStorage();
});
describe('typeStorage', () => {
  it('should be instance of Map', () => {
    expect(typeStorage).toBeInstanceOf(_TypeStorage.TypeStorage);
  });
  it('should work `get`, `set`, `has`, `clear` methods and `size` property', () => {
    expect(typeStorage.size).toEqual(0);
    typeStorage.set('MyType', _graphql.GraphQLString);
    expect(typeStorage.get('MyType')).toEqual(_graphql.GraphQLString);
    expect(typeStorage.has('MyType')).toEqual(true);
    expect(typeStorage.size).toEqual(1);
    typeStorage.clear();
    expect(typeStorage.size).toEqual(0);
  });
  describe('getOrSet() method', () => {
    it('should return existed value', () => {
      typeStorage.set('MyType', _graphql.GraphQLString);
      expect(typeStorage.getOrSet('MyType', () => 'SomeOtherType')).toEqual(_graphql.GraphQLString);
    });
    it('should set new type as function and return type, if key not exists', () => {
      expect(typeStorage.getOrSet('MyType', () => _graphql.GraphQLString)).toEqual(_graphql.GraphQLString);
      expect(typeStorage.get('MyType')).toEqual(_graphql.GraphQLString);
    });
    it('should set new type and return it, if key not exists', () => {
      expect(typeStorage.getOrSet('MyType', _graphql.GraphQLString)).toEqual(_graphql.GraphQLString);
      expect(typeStorage.get('MyType')).toEqual(_graphql.GraphQLString);
    });
    it('should not set new value if it is empty', () => {
      expect(typeStorage.getOrSet('MyType', () => null)).toEqual(null);
      expect(typeStorage.has('MyType')).toEqual(false);
    });
  });
  describe('add()', () => {
    it('should add TypeComposer', () => {
      const tc = _.TypeComposer.createTemp('User');

      const typeName = typeStorage.add(tc);
      expect(typeName).toBe('User');
      expect(typeStorage.get('User')).toBe(tc);
      expect(typeStorage.getTC('User')).toBe(tc);
    });
    it('should add InputTypeComposer', () => {
      const itc = _.InputTypeComposer.createTemp('UserInput');

      const typeName = typeStorage.add(itc);
      expect(typeName).toBe('UserInput');
      expect(typeStorage.get('UserInput')).toBe(itc);
      expect(typeStorage.getITC('UserInput')).toBe(itc);
    });
    it('should add EnumTypeComposer', () => {
      const etc = _.EnumTypeComposer.createTemp('UserEnum');

      const typeName = typeStorage.add(etc);
      expect(typeName).toBe('UserEnum');
      expect(typeStorage.get('UserEnum')).toBe(etc);
      expect(typeStorage.getETC('UserEnum')).toBe(etc);
    });
    it('should add GraphQLObjectType', () => {
      const t = new _graphql.GraphQLObjectType({
        name: 'NativeType',
        fields: () => {}
      });
      const typeName = typeStorage.add(t);
      expect(typeName).toBe('NativeType');
      expect(typeStorage.get('NativeType')).toBe(t);
    });
    it('should add InterfaceTypeComposer', () => {
      const iftc = _.InterfaceTypeComposer.createTemp('UserInterface');

      const typeName = typeStorage.add(iftc);
      expect(typeName).toBe('UserInterface');
      expect(typeStorage.get('UserInterface')).toBe(iftc);
      expect(typeStorage.getIFTC('UserInterface')).toBe(iftc);
    });
  });
});