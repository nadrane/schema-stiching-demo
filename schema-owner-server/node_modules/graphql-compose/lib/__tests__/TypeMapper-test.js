"use strict";

var _graphql = require("../graphql");

var _ = require("..");

var _graphqlVersion = require("../utils/graphqlVersion");

var _json = _interopRequireDefault(require("../type/json"));

var _date = _interopRequireDefault(require("../type/date"));

var _buffer = _interopRequireDefault(require("../type/buffer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*  strict */
beforeEach(() => {
  _.schemaComposer.clear();
});
describe('TypeMapper', () => {
  it('should have has/get/set methods', () => {
    _.TypeMapper.set('test', _graphql.GraphQLString);

    expect(_.TypeMapper.has('test')).toBe(true);
    expect(_.TypeMapper.get('test')).toBe(_graphql.GraphQLString);
    expect(_.TypeMapper.has('test')).toBe(true);
  });
  it('should add basic scalar GraphQL types', () => {
    expect(_.TypeMapper.get('String')).toBe(_graphql.GraphQLString);
    expect(_.TypeMapper.get('Float')).toBe(_graphql.GraphQLFloat);
    expect(_.TypeMapper.get('Int')).toBe(_graphql.GraphQLInt);
    expect(_.TypeMapper.get('Boolean')).toBe(_graphql.GraphQLBoolean);
    expect(_.TypeMapper.get('ID')).toBe(_graphql.GraphQLID);
  });
  it('should add basic graphql-compose types', () => {
    expect(_.TypeMapper.get('JSON')).toBe(_json.default);
    expect(_.TypeMapper.get('Json')).toBe(_json.default);
    expect(_.TypeMapper.get('Date')).toBe(_date.default);
    expect(_.TypeMapper.get('Buffer')).toBe(_buffer.default);
  });
  it('should allow to override basic graphql-compose types', () => {
    const CustomJSON = new _graphql.GraphQLScalarType({
      name: 'CustomJSON',
      serialize: () => {}
    });
    const CustomDate = new _graphql.GraphQLScalarType({
      name: 'CustomDate',
      serialize: () => {}
    });
    const CustomBuffer = new _graphql.GraphQLScalarType({
      name: 'CustomBuffer',
      serialize: () => {}
    });

    _.schemaComposer.set('JSON', CustomJSON);

    _.schemaComposer.set('Json', CustomJSON);

    _.schemaComposer.set('Date', CustomDate);

    _.schemaComposer.set('Buffer', CustomBuffer);

    expect(_.TypeMapper.get('JSON')).toBe(CustomJSON);
    expect(_.TypeMapper.get('Json')).toBe(CustomJSON);
    expect(_.TypeMapper.get('Date')).toBe(CustomDate);
    expect(_.TypeMapper.get('Buffer')).toBe(CustomBuffer);
  });
  it('should create object type from template string', () => {
    const type = _.TypeMapper.createType(_graphqlVersion.graphqlVersion < 12 ? `
          type IntRange {
            # Max value
            max: Int,
            min: Int!
            arr: [String]
          }
        ` : `
          type IntRange {
            """Max value"""
            max: Int,
            min: Int!
            arr: [String]
          }
        `);

    expect(type).toBeInstanceOf(_graphql.GraphQLObjectType);
    expect(_.TypeMapper.get('IntRange')).toBe(type);
    const IntRangeTC = new _.TypeComposer(type);
    expect(IntRangeTC.getTypeName()).toBe('IntRange');
    expect(IntRangeTC.getFieldNames()).toEqual(expect.arrayContaining(['max', 'min', 'arr']));
    expect(IntRangeTC.getFieldType('max')).toBe(_graphql.GraphQLInt);
    expect(IntRangeTC.getFieldConfig('max').description).toBe('Max value');
    expect(IntRangeTC.getFieldType('min')).toBeInstanceOf(_graphql.GraphQLNonNull);
    expect(IntRangeTC.getFieldType('arr')).toBeInstanceOf(_graphql.GraphQLList);
  });
  it('should create input object type from template string', () => {
    const type = _.TypeMapper.createType(`
      input InputIntRange {
        min: Int @default(value: 0)
        max: Int!
      }
    `);

    expect(type).toBeInstanceOf(_graphql.GraphQLInputObjectType);
    expect(_.TypeMapper.get('InputIntRange')).toBe(type);
    const IntRangeTC = new _.InputTypeComposer(type);
    expect(IntRangeTC.getTypeName()).toBe('InputIntRange');
    expect(IntRangeTC.getField('min').defaultValue).toBe(0);
    expect(IntRangeTC.getField('min').type).toBe(_graphql.GraphQLInt);
    expect(IntRangeTC.getField('max').type).toBeInstanceOf(_graphql.GraphQLNonNull);
  });
  it('should create interface type from template string', () => {
    const type = _.TypeMapper.createType(_graphqlVersion.graphqlVersion < 12 ? `
          interface IntRangeInterface {
            # Max value
            max: Int,
            min: Int!
            arr: [String]
          }
        ` : `
          interface IntRangeInterface {
            """Max value"""
            max: Int,
            min: Int!
            arr: [String]
          }
        `);

    expect(type).toBeInstanceOf(_graphql.GraphQLInterfaceType);
    expect(_.TypeMapper.get('IntRangeInterface')).toBe(type);
    const IntRangeTC = new _.InterfaceTypeComposer(type);
    expect(IntRangeTC.getTypeName()).toBe('IntRangeInterface');
    expect(IntRangeTC.getFieldNames()).toEqual(expect.arrayContaining(['max', 'min', 'arr']));
    expect(IntRangeTC.getFieldType('max')).toBe(_graphql.GraphQLInt);
    expect(IntRangeTC.getFieldConfig('max').description).toBe('Max value');
    expect(IntRangeTC.getFieldType('min')).toBeInstanceOf(_graphql.GraphQLNonNull);
    expect(IntRangeTC.getFieldType('arr')).toBeInstanceOf(_graphql.GraphQLList);
  });
  it('should return wrapped type', () => {
    expect(_.TypeMapper.getWrapped('String!')).toBeInstanceOf(_graphql.GraphQLNonNull);
    expect(_.TypeMapper.getWrapped('[String]')).toBeInstanceOf(_graphql.GraphQLList);
    expect(_.TypeMapper.getWrapped('[String]!')).toBeInstanceOf(_graphql.GraphQLNonNull);
    expect(_.TypeMapper.getWrapped('[String]!').ofType).toBeInstanceOf(_graphql.GraphQLList);
    expect(_.TypeMapper.getWrapped('String')).toBe(_graphql.GraphQLString);
  });
  describe('convertOutputFieldConfig()', () => {
    describe('converting field type', () => {
      it('should accept type with GraphQLOutputType', () => {
        const fc = _.TypeMapper.convertOutputFieldConfig({
          type: _graphql.GraphQLString
        });

        expect(fc.type).toBe(_graphql.GraphQLString);
        const objectType = new _graphql.GraphQLObjectType({
          name: 'SomeType',
          fields: {
            f: {
              type: _graphql.GraphQLString
            }
          }
        });

        const fc2 = _.TypeMapper.convertOutputFieldConfig({
          type: objectType
        });

        expect(fc2.type).toBe(objectType);
      });
      it('should accept GraphQLScalarType', () => {
        const fc = _.TypeMapper.convertOutputFieldConfig(_graphql.GraphQLString);

        expect(fc.type).toBe(_graphql.GraphQLString);
      });
      it('should accept GraphQLObjectType', () => {
        const type = new _graphql.GraphQLObjectType({
          name: 'Test',
          fields: () => ({
            a: {
              type: _graphql.GraphQLInt
            }
          })
        });

        const fc = _.TypeMapper.convertOutputFieldConfig(type);

        expect(fc.type).toBe(type);
      });
      it('should accept GraphQLNonNull', () => {
        const fc = _.TypeMapper.convertOutputFieldConfig(new _graphql.GraphQLNonNull(_graphql.GraphQLString));

        expect(fc.type).toBeInstanceOf(_graphql.GraphQLNonNull);
        expect(fc.type.ofType).toBe(_graphql.GraphQLString);
      });
      it('should accept GraphQLList', () => {
        const fc = _.TypeMapper.convertOutputFieldConfig(new _graphql.GraphQLList(_graphql.GraphQLString));

        expect(fc.type).toBeInstanceOf(_graphql.GraphQLList);
        expect(fc.type.ofType).toBe(_graphql.GraphQLString);
      });
      it('should accept type as string', () => {
        const fc = _.TypeMapper.convertOutputFieldConfig({
          type: 'String'
        });

        expect(fc.type).toBe(_graphql.GraphQLString);
      });
      it('should create field config from type as string', () => {
        const fc = _.TypeMapper.convertOutputFieldConfig('String');

        expect(fc.type).toBe(_graphql.GraphQLString);
      });
      it('should lookup type name as string in schemaComposer', () => {
        const tc = _.TypeComposer.create(`type MyType { a: Int }`);

        const fc = _.TypeMapper.convertOutputFieldConfig('MyType');

        expect(fc.type).toBe(tc.getType());

        const fc2 = _.TypeMapper.convertOutputFieldConfig({
          type: '[MyType]'
        });

        expect(fc2.type.ofType).toBe(tc.getType());
      });
      it('should create field config from GraphQL Schema Language', () => {
        const fc = _.TypeMapper.convertOutputFieldConfig(`type MyOutputType {
          a: String,
          b: Int,
        }`);

        const tc = new _.TypeComposer(fc.type);
        expect(tc.getTypeName()).toBe('MyOutputType');
        expect(tc.getFieldType('a')).toBe(_graphql.GraphQLString);
        expect(tc.getFieldType('b')).toBe(_graphql.GraphQLInt);
      });
      it('should create field with Enum type from GraphQL Schema Language', () => {
        const fc = _.TypeMapper.convertOutputFieldConfig('enum MyEnum { AND OR }');

        expect(fc.type).toBeInstanceOf(_graphql.GraphQLEnumType);
        const enumValues = fc.type.getValues();
        expect(enumValues[0].name).toBe('AND');
        expect(enumValues[0].value).toBe('AND');
        expect(enumValues[1].name).toBe('OR');
        expect(enumValues[1].value).toBe('OR');
      });
      it('should throw error if provided input type definition', () => {
        expect(() => {
          _.TypeMapper.convertOutputFieldConfig(`input MyInputType {
            a: String,
          }`);
        }).toThrowError(/should be OutputType, but got input type definition/);
      });
      it('should accept TypeComposer', () => {
        const tc = _.TypeComposer.create('type PriceRange { lon: Float, lat: Float }');

        tc.setDescription('Description');

        const fc = _.TypeMapper.convertOutputFieldConfig({
          type: tc
        });

        expect(fc.type).toBe(tc.getType());
        expect(fc.description).toBe(undefined);

        const fc2 = _.TypeMapper.convertOutputFieldConfig(tc);

        expect(fc2.type).toBe(tc.getType());
        expect(fc2.description).toBe('Description');
      });
      it('should accept EnumTypeComposer', () => {
        const etc = _.EnumTypeComposer.create('enum MyEnum { V1 V2 V3 }');

        etc.setDescription('Description');

        const fc = _.TypeMapper.convertOutputFieldConfig({
          type: etc
        });

        expect(fc.type).toBe(etc.getType());
        expect(fc.description).toBe(undefined);

        const fc2 = _.TypeMapper.convertOutputFieldConfig(etc);

        expect(fc2.type).toBe(etc.getType());
        expect(fc2.description).toBe('Description');
      });
      it('should accept InterfaceTypeComposer', () => {
        const iftc = _.InterfaceTypeComposer.create('interface MyIFace { id: Int }');

        iftc.setDescription('Description');

        const fc = _.TypeMapper.convertOutputFieldConfig({
          type: iftc
        });

        expect(fc.type).toBe(iftc.getType());
        expect(fc.description).toBe(undefined);

        const fc2 = _.TypeMapper.convertOutputFieldConfig(iftc);

        expect(fc2.type).toBe(iftc.getType());
        expect(fc2.description).toBe('Description');
      });
      it('should accept Resolver', () => {
        const resolver = new _.Resolver({
          name: 'find',
          type: 'Float',
          args: {
            a1: 'String'
          },
          resolve: () => 123
        });

        const fc = _.TypeMapper.convertOutputFieldConfig(resolver);

        expect(fc.type).toBe(_graphql.GraphQLFloat);
        expect(fc.args.a1.type).toBe(_graphql.GraphQLString);
        expect(fc.resolve()).toBe(123);
      });
      it('should accept Resolver as type', () => {
        const resolver = new _.Resolver({
          name: 'find',
          type: 'Float',
          args: {
            a1: 'String'
          },
          resolve: () => 123
        });

        const fc = _.TypeMapper.convertOutputFieldConfig({
          type: resolver
        });

        expect(fc.type).toBe(_graphql.GraphQLFloat);
        expect(fc.args).toBe(undefined);
        expect(fc.resolve).toBe(undefined);
      });
      it('should pass unchanged thunk', () => {
        const myTypeThunk = () => 'Int';

        const fc = _.TypeMapper.convertOutputFieldConfig(myTypeThunk);

        expect(fc).toBe(myTypeThunk);
      });
      it('should accept array with one element as type and wrap them with GraphQLList', () => {
        const fc = _.TypeMapper.convertOutputFieldConfig(['String']);

        expect(fc.type).toBeInstanceOf(_graphql.GraphQLList);
        expect(fc.type.ofType).toBe(_graphql.GraphQLString);

        const fc2 = _.TypeMapper.convertOutputFieldConfig({
          type: ['String']
        });

        expect(fc2.type).toBeInstanceOf(_graphql.GraphQLList);
        expect(fc2.type.ofType).toBe(_graphql.GraphQLString);

        const fc3 = _.TypeMapper.convertOutputFieldConfig({
          type: [_graphql.GraphQLString]
        });

        expect(fc3.type).toBeInstanceOf(_graphql.GraphQLList);
        expect(fc3.type.ofType).toBe(_graphql.GraphQLString);

        const tc = _.TypeComposer.create('type PriceRange { lon: Float, lat: Float }');

        const fc4 = _.TypeMapper.convertOutputFieldConfig([tc]);

        expect(fc4.type).toBeInstanceOf(_graphql.GraphQLList);
        expect(fc4.type.ofType).toBe(tc.getType());

        const fc5 = _.TypeMapper.convertOutputFieldConfig({
          type: [tc]
        });

        expect(fc5.type).toBeInstanceOf(_graphql.GraphQLList);
        expect(fc5.type.ofType).toBe(tc.getType());
        expect(() => {
          _.TypeMapper.convertOutputFieldConfig([]);
        }).toThrowError(/can accept Array exact with one output type/);

        const fc6 = _.TypeMapper.convertOutputFieldConfig([['String']]);

        expect(fc6.type).toBeInstanceOf(_graphql.GraphQLList);
        expect(fc6.type.ofType).toBeInstanceOf(_graphql.GraphQLList);
        expect(fc6.type.ofType.ofType).toBe(_graphql.GraphQLString);
      });
      it('should throw error if provided InputTypeComposer', () => {
        const itc = _.InputTypeComposer.create('input LonLatInput { lon: Float, lat: Float }');

        expect(() => {
          _.TypeMapper.convertOutputFieldConfig({
            type: itc
          });
        }).toThrowError(/InputTypeComposer/);
        expect(() => {
          _.TypeMapper.convertOutputFieldConfig(itc);
        }).toThrowError(/InputTypeComposer/);
      });
    });
    it('should convert args types', () => {
      const fc = _.TypeMapper.convertOutputFieldConfig({
        type: 'String',
        args: {
          a1: {
            type: 'String'
          },
          a2: 'Int'
        }
      });

      expect(fc.args.a1.type).toBe(_graphql.GraphQLString);
      expect(fc.args.a2.type).toBe(_graphql.GraphQLInt);
    });
    it('should process outputFieldConfigMap()', () => {
      const fcm = _.TypeMapper.convertOutputFieldConfigMap({
        f1: 'String',
        f2: 'Int'
      });

      expect(fcm.f1.type).toBe(_graphql.GraphQLString);
      expect(fcm.f2.type).toBe(_graphql.GraphQLInt);
    });
  });
  describe('convertInputFieldConfig()', () => {
    it('should accept type with GraphQLInputObjectType', () => {
      const ic = _.TypeMapper.convertInputFieldConfig({
        type: _graphql.GraphQLString
      });

      expect(ic.type).toBe(_graphql.GraphQLString);
      const objectType = new _graphql.GraphQLInputObjectType({
        name: 'SomeTypeInput',
        fields: {
          f: {
            type: _graphql.GraphQLString
          }
        }
      });

      const ic2 = _.TypeMapper.convertInputFieldConfig({
        type: objectType
      });

      expect(ic2.type).toBe(objectType);
    });
    it('should accept GraphQLScalarType', () => {
      const ic = _.TypeMapper.convertInputFieldConfig(_graphql.GraphQLString);

      expect(ic.type).toBe(_graphql.GraphQLString);
    });
    it('should accept GraphQLInputObjectType', () => {
      const type = new _graphql.GraphQLInputObjectType({
        name: 'InputType',
        fields: () => ({
          f1: {
            type: _graphql.GraphQLInt
          }
        })
      });

      const ic = _.TypeMapper.convertInputFieldConfig(type);

      expect(ic.type).toBe(type);
    });
    it('should accept GraphQLNonNull', () => {
      const ic = _.TypeMapper.convertInputFieldConfig(new _graphql.GraphQLNonNull(_graphql.GraphQLString));

      expect(ic.type).toBeInstanceOf(_graphql.GraphQLNonNull);
      expect(ic.type.ofType).toBe(_graphql.GraphQLString);
    });
    it('should accept GraphQLList', () => {
      const ic = _.TypeMapper.convertInputFieldConfig(new _graphql.GraphQLList(_graphql.GraphQLString));

      expect(ic.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(ic.type.ofType).toBe(_graphql.GraphQLString);
    });
    it('should accept type name as string', () => {
      const ic = _.TypeMapper.convertInputFieldConfig({
        type: 'String'
      });

      expect(ic.type).toBe(_graphql.GraphQLString);
    });
    it('should create field config from type name as string', () => {
      const ic = _.TypeMapper.convertInputFieldConfig('String');

      expect(ic.type).toBe(_graphql.GraphQLString);
    });
    it('should lookup type name as string in schemaComposer', () => {
      const itc = _.InputTypeComposer.create(`input MyInput { a: Int }`);

      const ic = _.TypeMapper.convertInputFieldConfig('MyInput');

      expect(ic.type).toBe(itc.getType());
    });
    it('should create field config from input type GraphQL Schema Language', () => {
      const fc = _.TypeMapper.convertInputFieldConfig(`input MyInputType {
          a: String,
          b: Int,
        }`);

      const itc = new _.InputTypeComposer(fc.type);
      expect(itc.getTypeName()).toBe('MyInputType');
      expect(itc.getFieldType('a')).toBe(_graphql.GraphQLString);
      expect(itc.getFieldType('b')).toBe(_graphql.GraphQLInt);
    });
    it('should create field with Enum type from GraphQL Schema Language', () => {
      const fc = _.TypeMapper.convertInputFieldConfig('enum MyInputEnum { AND OR }');

      expect(fc.type).toBeInstanceOf(_graphql.GraphQLEnumType);
      const enumValues = fc.type.getValues();
      expect(enumValues[0].name).toBe('AND');
      expect(enumValues[0].value).toBe('AND');
      expect(enumValues[1].name).toBe('OR');
      expect(enumValues[1].value).toBe('OR');
    });
    it('should throw error if provided output type definition', () => {
      expect(() => {
        _.TypeMapper.convertInputFieldConfig(`type MyOutputType {
          a: String,
        }`);
      }).toThrowError(/should be InputType, but got output type definition/);
    });
    it('should accept InputTypeComposer', () => {
      const itc = _.InputTypeComposer.create('input PriceRangeInput { lon: Float, lat: Float }');

      itc.setDescription('Description');

      const ic = _.TypeMapper.convertInputFieldConfig({
        type: itc
      });

      expect(ic.type).toBe(itc.getType());
      expect(ic.description).toBe(undefined);

      const ic2 = _.TypeMapper.convertInputFieldConfig(itc);

      expect(ic2.type).toBe(itc.getType());
      expect(ic2.description).toBe('Description');
    });
    it('should accept EnumTypeComposer', () => {
      const etc = _.EnumTypeComposer.create('enum MyEnum { V1 V2 }');

      etc.setDescription('Description');

      const ic = _.TypeMapper.convertInputFieldConfig({
        type: etc
      });

      expect(ic.type).toBe(etc.getType());
      expect(ic.description).toBe(undefined);

      const ic2 = _.TypeMapper.convertInputFieldConfig(etc);

      expect(ic2.type).toBe(etc.getType());
      expect(ic2.description).toBe('Description');
    });
    it('should throw error if provided TypeComposer', () => {
      const tc = _.TypeComposer.create('type LonLat { lon: Float, lat: Float }');

      expect(() => {
        _.TypeMapper.convertInputFieldConfig({
          type: tc
        });
      }).toThrowError(/\sTypeComposer/);
      expect(() => {
        _.TypeMapper.convertInputFieldConfig(tc);
      }).toThrowError(/\sTypeComposer/);
    });
    it('should pass unchanged thunk', () => {
      const myTypeThunk = () => 'Int';

      const tc = _.TypeMapper.convertInputFieldConfig(myTypeThunk);

      expect(tc).toBe(myTypeThunk);
    });
    it('should accept array with one element as type and wrap them with GraphQLList', () => {
      const fc = _.TypeMapper.convertInputFieldConfig(['String']);

      expect(fc.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc.type.ofType).toBe(_graphql.GraphQLString);

      const fc2 = _.TypeMapper.convertInputFieldConfig({
        type: ['String']
      });

      expect(fc2.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc2.type.ofType).toBe(_graphql.GraphQLString);

      const fc3 = _.TypeMapper.convertInputFieldConfig({
        type: [_graphql.GraphQLString]
      });

      expect(fc3.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc3.type.ofType).toBe(_graphql.GraphQLString);

      const itc = _.InputTypeComposer.create('input PriceRangeInput { lon: Float, lat: Float }');

      const fc4 = _.TypeMapper.convertInputFieldConfig([itc]);

      expect(fc4.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc4.type.ofType).toBe(itc.getType());

      const fc5 = _.TypeMapper.convertInputFieldConfig({
        type: [itc]
      });

      expect(fc5.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc5.type.ofType).toBe(itc.getType());

      const fc6 = _.TypeMapper.convertInputFieldConfig([['String']]);

      expect(fc6.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc6.type.ofType).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc6.type.ofType.ofType).toBe(_graphql.GraphQLString);
      expect(() => {
        _.TypeMapper.convertInputFieldConfig([]);
      }).toThrowError(/can accept Array exact with one input type/);
    });
    it('should process inputFieldConfigMap()', () => {
      const icm = _.TypeMapper.convertInputFieldConfigMap({
        i1: {
          type: 'String'
        },
        i2: 'Int'
      });

      expect(icm.i1.type).toBe(_graphql.GraphQLString);
      expect(icm.i2.type).toBe(_graphql.GraphQLInt);
    });
  });
  describe('convertArgConfig()', () => {
    it('should accept type with GraphQLInputObjectType', () => {
      const ac = _.TypeMapper.convertArgConfig({
        type: _graphql.GraphQLString
      });

      expect(ac.type).toBe(_graphql.GraphQLString);
      const objectType = new _graphql.GraphQLInputObjectType({
        name: 'SomeTypeInput',
        fields: {
          f: {
            type: _graphql.GraphQLString
          }
        }
      });

      const ac2 = _.TypeMapper.convertArgConfig({
        type: objectType
      });

      expect(ac2.type).toBe(objectType);
    });
    it('should accept GraphQLScalarType', () => {
      const ac = _.TypeMapper.convertArgConfig(_graphql.GraphQLString);

      expect(ac.type).toBe(_graphql.GraphQLString);
    });
    it('should accept GraphQLInputObjectType', () => {
      const type = new _graphql.GraphQLInputObjectType({
        name: 'InputType',
        fields: () => ({
          f: {
            type: _graphql.GraphQLInt
          }
        })
      });

      const ac = _.TypeMapper.convertArgConfig(type);

      expect(ac.type).toBe(type);
    });
    it('should accept GraphQLNonNull', () => {
      const ac = _.TypeMapper.convertArgConfig(new _graphql.GraphQLNonNull(_graphql.GraphQLString));

      expect(ac.type).toBeInstanceOf(_graphql.GraphQLNonNull);
      expect(ac.type.ofType).toBe(_graphql.GraphQLString);
    });
    it('should accept GraphQLList', () => {
      const ac = _.TypeMapper.convertArgConfig(new _graphql.GraphQLList(_graphql.GraphQLString));

      expect(ac.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(ac.type.ofType).toBe(_graphql.GraphQLString);
    });
    it('should accept type name as string', () => {
      const ac = _.TypeMapper.convertArgConfig({
        type: 'String'
      });

      expect(ac.type).toBe(_graphql.GraphQLString);
    });
    it('should create arg config from GraphQL Schema Language', () => {
      const ac = _.TypeMapper.convertArgConfig('String');

      expect(ac.type).toBe(_graphql.GraphQLString);
    });
    it('should lookup type name as string in schemaComposer', () => {
      const itc = _.InputTypeComposer.create(`input MyArg { a: Int }`);

      const ac = _.TypeMapper.convertArgConfig('MyArg');

      expect(ac.type).toBe(itc.getType());
    });
    it('should create arg config from input type GraphQL Schema Language', () => {
      const fc = _.TypeMapper.convertArgConfig(`input MyInputArg {
        a: String,
        b: Int,
      }`);

      const itc = new _.InputTypeComposer(fc.type);
      expect(itc.getTypeName()).toBe('MyInputArg');
      expect(itc.getFieldType('a')).toBe(_graphql.GraphQLString);
      expect(itc.getFieldType('b')).toBe(_graphql.GraphQLInt);
    });
    it('should create arg config with Enum type from GraphQL Schema Language', () => {
      const fc = _.TypeMapper.convertArgConfig('enum MyArgEnum { AND OR }');

      expect(fc.type).toBeInstanceOf(_graphql.GraphQLEnumType);
      const enumValues = fc.type.getValues();
      expect(enumValues[0].name).toBe('AND');
      expect(enumValues[0].value).toBe('AND');
      expect(enumValues[1].name).toBe('OR');
      expect(enumValues[1].value).toBe('OR');
    });
    it('should throw error if provided output type definition', () => {
      expect(() => {
        _.TypeMapper.convertArgConfig(`type MyOutputType {
          a: String,
        }`);
      }).toThrowError(/should be InputType, but got output type definition/);
    });
    it('should accept InputTypeComposer', () => {
      const itc = _.InputTypeComposer.create('input PriceRangeInput { lon: Float, lat: Float }');

      itc.setDescription('Description');

      const ac = _.TypeMapper.convertArgConfig({
        type: itc
      });

      expect(ac.type).toBe(itc.getType());
      expect(ac.description).toBe(undefined);

      const ac2 = _.TypeMapper.convertArgConfig(itc);

      expect(ac2.type).toBe(itc.getType());
      expect(ac2.description).toBe('Description');
    });
    it('should accept EnumTypeComposer', () => {
      const etc = _.EnumTypeComposer.create('enum MyEnum { V1 V2 }');

      etc.setDescription('Description');

      const ac = _.TypeMapper.convertArgConfig({
        type: etc
      });

      expect(ac.type).toBe(etc.getType());
      expect(ac.description).toBe(undefined);

      const ac2 = _.TypeMapper.convertArgConfig(etc);

      expect(ac2.type).toBe(etc.getType());
      expect(ac2.description).toBe('Description');
    });
    it('should pass unchanged thunk', () => {
      const myTypeThunk = () => 'Int';

      const ac = _.TypeMapper.convertArgConfig(myTypeThunk);

      expect(ac).toBe(myTypeThunk);
    });
    it('should accept array with one element as type and wrap them with GraphQLList', () => {
      const fc = _.TypeMapper.convertArgConfig(['String']);

      expect(fc.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc.type.ofType).toBe(_graphql.GraphQLString);

      const fc2 = _.TypeMapper.convertArgConfig({
        type: ['String']
      });

      expect(fc2.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc2.type.ofType).toBe(_graphql.GraphQLString);

      const fc3 = _.TypeMapper.convertArgConfig({
        type: [_graphql.GraphQLString]
      });

      expect(fc3.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc3.type.ofType).toBe(_graphql.GraphQLString);

      const itc = _.InputTypeComposer.create('input PriceRangeInput { lon: Float, lat: Float }');

      const fc4 = _.TypeMapper.convertArgConfig([itc]);

      expect(fc4.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc4.type.ofType).toBe(itc.getType());

      const fc5 = _.TypeMapper.convertArgConfig({
        type: [itc]
      });

      expect(fc5.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc5.type.ofType).toBe(itc.getType());

      const fc6 = _.TypeMapper.convertArgConfig([['String']]);

      expect(fc6.type).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc6.type.ofType).toBeInstanceOf(_graphql.GraphQLList);
      expect(fc6.type.ofType.ofType).toBe(_graphql.GraphQLString);
      expect(() => {
        _.TypeMapper.convertArgConfig([]);
      }).toThrowError(/can accept Array exact with one input type/);
    });
    it('should throw error if provided TypeComposer', () => {
      const tc = _.TypeComposer.create('type LonLat { lon: Float, lat: Float }');

      expect(() => {
        _.TypeMapper.convertArgConfig({
          type: tc
        });
      }).toThrowError(/\sTypeComposer/);
      expect(() => {
        _.TypeMapper.convertArgConfig(tc);
      }).toThrowError(/\sTypeComposer/);
    });
    it('should process ArgConfigMap', () => {
      const acm = _.TypeMapper.convertArgConfigMap({
        a1: {
          type: 'String'
        },
        a2: 'Int'
      });

      expect(acm.a1.type).toBe(_graphql.GraphQLString);
      expect(acm.a2.type).toBe(_graphql.GraphQLInt);
    });
  });
  describe('parseTypesFrom... methods', () => {
    it('parseTypesFromString()', () => {
      const gql = `
        type User {
          name: String
        }

        type Article {
          title: String
        }

        input Record {
          id: ID
          ts: Int
        }
      `;

      const ts = _.TypeMapper.parseTypesFromString(gql);

      expect(Array.from(ts.keys())).toEqual(['User', 'Article', 'Record']);
      expect(ts.get('User')).toBeInstanceOf(_graphql.GraphQLObjectType);
      expect(ts.get('Article')).toBeInstanceOf(_graphql.GraphQLObjectType);
      expect(ts.get('Record')).toBeInstanceOf(_graphql.GraphQLInputObjectType);
    });
  });
  describe('createType()', () => {
    it('should return same type for the same TypeDefinitionString', () => {
      const t1 = _.TypeMapper.createType('type SameType { a: Int }');

      const t2 = _.TypeMapper.createType('type SameType { a: Int }');

      expect(t1).toBe(t2);

      const tc = _.TypeComposer.create(t1);

      expect(tc.getTypeName()).toBe('SameType');
      expect(tc.getFieldType('a')).toBe(_graphql.GraphQLInt);
    });
  });
});