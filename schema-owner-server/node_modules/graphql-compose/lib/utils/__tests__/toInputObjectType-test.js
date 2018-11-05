"use strict";

var _graphql = require("../../graphql");

var _ = require("../..");

var _toInputObjectType = require("../toInputObjectType");

/*  strict */
describe('toInputObjectType()', () => {
  let PersonTC;
  beforeEach(() => {
    PersonTC = _.TypeComposer.create({
      name: 'Person',
      fields: {
        name: 'String',
        age: {
          type: _graphql.GraphQLInt
        },
        address: {
          type: new _graphql.GraphQLObjectType({
            name: 'Address',
            fields: {
              city: {
                type: _graphql.GraphQLString
              },
              street: {
                type: _graphql.GraphQLString
              }
            }
          })
        }
      }
    });
  });
  it('should return InputTypeComposer', () => {
    const itc = (0, _toInputObjectType.toInputObjectType)(PersonTC);
    expect(itc).toBeInstanceOf(_.InputTypeComposer);
    expect(itc.getTypeName()).toBe('PersonInput');
  });
  it('should accept prefix in opts', () => {
    const itc = (0, _toInputObjectType.toInputObjectType)(PersonTC, {
      prefix: 'SomePrefix'
    });
    expect(itc.getTypeName()).toBe('SomePrefixPersonInput');
  });
  it('should accept postfix in opts', () => {
    const itc = (0, _toInputObjectType.toInputObjectType)(PersonTC, {
      postfix: 'PostfixInpt'
    });
    expect(itc.getTypeName()).toBe('PersonPostfixInpt');
  });
  it('should keep scalar types', () => {
    const itc = (0, _toInputObjectType.toInputObjectType)(PersonTC);
    expect(itc.getFieldType('name')).toBe(_graphql.GraphQLString);
    expect(itc.getFieldType('age')).toBe(_graphql.GraphQLInt);
  });
  it('should convert field with ObjectType to InputType', () => {
    const itc = (0, _toInputObjectType.toInputObjectType)(PersonTC);
    const addrType = itc.getFieldType('address');
    expect(addrType).toBeInstanceOf(_graphql.GraphQLInputObjectType);
    expect(addrType.name).toBe('PersonAddressInput');
  });
  it('should reuse generated input type for recursive types', () => {
    PersonTC.setField('spouce', PersonTC);
    const itc = (0, _toInputObjectType.toInputObjectType)(PersonTC);
    expect(itc.getFieldType('spouce')).toBe(itc.getType());
  });
  it('should reuse generated input type for recursive types in List', () => {
    PersonTC.setField('friends', PersonTC.getTypePlural());
    const itc = (0, _toInputObjectType.toInputObjectType)(PersonTC);
    expect(itc.getFieldType('friends')).toBeInstanceOf(_graphql.GraphQLList);
    expect(itc.getFieldType('friends').ofType).toBe(itc.getType());
  });
  it('should convert InterfaceTypeComposer to InputTypeComposer', () => {
    const iftc = _.InterfaceTypeComposer.create(`
      interface IFace {
        name: String
        age: Int
      }
    `);

    const itc = (0, _toInputObjectType.toInputObjectType)(iftc);
    expect(itc.getFieldType('name')).toBe(_graphql.GraphQLString);
    expect(itc.getFieldType('age')).toBe(_graphql.GraphQLInt);
    expect(itc.getTypeName()).toBe('IFaceInput');
  });
  it('should convert field with InterfaceType to InputType', () => {
    _.InterfaceTypeComposer.create(`
      interface IFace {
        name: String
        age: Int
      }
    `);

    const tc = _.TypeComposer.create(`
      type Example implements IFace {
        name: String
        age: Int
        neighbor: IFace
      }
    `);

    const itc = (0, _toInputObjectType.toInputObjectType)(tc);
    expect(itc.getFieldType('name')).toBe(_graphql.GraphQLString);
    expect(itc.getFieldType('age')).toBe(_graphql.GraphQLInt);
    const ifaceField = itc.getFieldTC('neighbor');
    expect(ifaceField.getType()).toBeInstanceOf(_graphql.GraphQLInputObjectType);
    expect(ifaceField.getTypeName()).toBe('ExampleIFaceInput');
    expect(ifaceField.getFieldType('name')).toBe(_graphql.GraphQLString);
    expect(ifaceField.getFieldType('age')).toBe(_graphql.GraphQLInt);
    expect(itc.getTypeName()).toBe('ExampleInput');
  });
});