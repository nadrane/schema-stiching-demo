"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toInputObjectType = toInputObjectType;
exports.convertInputObjectField = convertInputObjectField;

var _util = _interopRequireDefault(require("util"));

var _graphql = require("../graphql");

var _TypeComposer = require("../TypeComposer");

var _generic = _interopRequireDefault(require("../type/generic"));

var _misc = require("./misc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function toInputObjectType(typeComposer, opts = {}, cache = new Map()) {
  if (typeComposer instanceof _TypeComposer.TypeComposer && typeComposer.hasInputTypeComposer()) {
    return typeComposer.getInputTypeComposer();
  }

  const schemaComposer = typeComposer.constructor.schemaComposer;
  const prefix = opts.prefix || '';
  const postfix = opts.postfix || 'Input';
  const inputTypeName = `${prefix}${typeComposer.getTypeName()}${postfix}`;
  const type = typeComposer.getType();

  if (cache.has(type)) {
    const itc = cache.get(type);
    return itc;
  }

  const inputTypeComposer = new schemaComposer.InputTypeComposer(new _graphql.GraphQLInputObjectType({
    name: inputTypeName,
    fields: {}
  }));
  cache.set(typeComposer.getType(), inputTypeComposer);
  const fieldNames = typeComposer.getFieldNames();
  const inputFields = {};
  fieldNames.forEach(fieldName => {
    const fieldOpts = _objectSpread({}, opts, {
      fieldName,
      outputTypeName: typeComposer.getTypeName()
    });

    const fc = typeComposer.getFieldConfig(fieldName);
    const inputType = convertInputObjectField(fc.type, fieldOpts, cache, schemaComposer);

    if (inputType) {
      inputFields[fieldName] = {
        type: inputType,
        description: fc.description
      };
    }
  });
  inputTypeComposer.addFields(inputFields);
  return inputTypeComposer;
}

function convertInputObjectField(field, opts, cache, schemaComposer) {
  let fieldType = field;
  const wrappers = [];

  while (fieldType instanceof _graphql.GraphQLList || fieldType instanceof _graphql.GraphQLNonNull) {
    wrappers.unshift(fieldType.constructor);
    fieldType = fieldType.ofType;
  }

  if (fieldType instanceof _graphql.GraphQLUnionType) {
    return null;
  }

  if (!(0, _graphql.isInputType)(fieldType)) {
    if (fieldType instanceof _graphql.GraphQLObjectType || fieldType instanceof _graphql.GraphQLInterfaceType) {
      const typeOpts = {
        prefix: `${opts.prefix || ''}${(0, _misc.upperFirst)(opts.outputTypeName || '')}`,
        postfix: opts.postfix || 'Input'
      };
      const tc = fieldType instanceof _graphql.GraphQLObjectType ? new schemaComposer.TypeComposer(fieldType) : new schemaComposer.InterfaceTypeComposer(fieldType);
      fieldType = toInputObjectType(tc, typeOpts, cache).getType();
    } else {
      // eslint-disable-next-line
      console.error(`graphql-compose: can not convert field '${opts.outputTypeName || ''}.${opts.fieldName || ''}' to InputType` + '\nIt should be GraphQLObjectType or GraphQLInterfaceType, but got \n' + _util.default.inspect(fieldType, {
        depth: 2,
        colors: true
      }));
      fieldType = _generic.default;
    }
  }

  const inputFieldType = wrappers.reduce((type, Wrapper) => new Wrapper(type), fieldType);
  return inputFieldType;
}