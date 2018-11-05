"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InputTypeComposer = void 0;

var _graphql = require("./graphql");

var _misc = require("./utils/misc");

var _debug = require("./utils/debug");

var _is = require("./utils/is");

var _configAsThunk = require("./utils/configAsThunk");

var _typeByPath = require("./utils/typeByPath");

var _graphqlVersion = require("./utils/graphqlVersion");

var _configToDefine = require("./utils/configToDefine");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class InputTypeComposer {
  get schemaComposer() {
    return this.constructor.schemaComposer;
  }

  static create(opts) {
    const itc = this.createTemp(opts);
    this.schemaComposer.add(itc);
    return itc;
  }

  static createTemp(opts) {
    if (!this.schemaComposer) {
      throw new Error('Class<InputTypeComposer> must be created by a SchemaComposer.');
    }

    let ITC;

    if ((0, _is.isString)(opts)) {
      const typeName = opts;
      const NAME_RX = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

      if (NAME_RX.test(typeName)) {
        ITC = new this.schemaComposer.InputTypeComposer(new _graphql.GraphQLInputObjectType({
          name: typeName,
          fields: () => ({})
        }));
      } else {
        const type = this.schemaComposer.typeMapper.createType(typeName);

        if (!(type instanceof _graphql.GraphQLInputObjectType)) {
          throw new Error('You should provide correct GraphQLInputObjectType type definition.' + 'Eg. `input MyInputType { name: String! }`');
        }

        ITC = new this.schemaComposer.InputTypeComposer(type);
      }
    } else if (opts instanceof _graphql.GraphQLInputObjectType) {
      ITC = new this.schemaComposer.InputTypeComposer(opts);
    } else if ((0, _is.isObject)(opts)) {
      const fields = opts.fields;
      const type = new _graphql.GraphQLInputObjectType({
        name: opts.name,
        description: opts.description,
        fields: (0, _is.isFunction)(fields) ? () => (0, _configAsThunk.resolveInputConfigMapAsThunk)(this.schemaComposer, fields(), opts.name) : () => ({})
      });
      ITC = new this.schemaComposer.InputTypeComposer(type);
      if ((0, _is.isObject)(opts.fields)) ITC.addFields(opts.fields);
    } else {
      throw new Error('You should provide InputObjectConfig or string with type name to InputTypeComposer.create(opts)');
    }

    return ITC;
  }

  constructor(gqType) {
    if (!this.schemaComposer) {
      throw new Error('Class<InputTypeComposer> can only be created by a SchemaComposer.');
    }

    if (!(gqType instanceof _graphql.GraphQLInputObjectType)) {
      throw new Error('InputTypeComposer accept only GraphQLInputObjectType in constructor');
    }

    this.gqType = gqType;
  } // -----------------------------------------------
  // Field methods
  // -----------------------------------------------


  getFields() {
    if (!this.gqType._gqcFields) {
      if (_graphqlVersion.graphqlVersion >= 14) {
        this.gqType._gqcFields = (0, _configToDefine.defineInputFieldMapToConfig)(this.gqType._fields);
      } else {
        // $FlowFixMe
        const fields = this.gqType._typeConfig.fields;
        this.gqType._gqcFields = (0, _misc.resolveMaybeThunk)(fields) || {};
      }
    }

    return this.gqType._gqcFields;
  }

  getFieldNames() {
    return Object.keys(this.getFields());
  }

  hasField(fieldName) {
    const fields = this.getFields();
    return !!fields[fieldName];
  }
  /**
   * Completely replace all fields in GraphQL type
   * WARNING: this method rewrite an internal GraphQL instance variable.
   */


  setFields(fields) {
    this.gqType._gqcFields = fields;

    if (_graphqlVersion.graphqlVersion >= 14) {
      this.gqType._fields = () => {
        return (0, _configToDefine.defineInputFieldMap)(this.gqType, (0, _configAsThunk.resolveInputConfigMapAsThunk)(this.schemaComposer, fields, this.getTypeName()));
      };
    } else {
      // $FlowFixMe
      this.gqType._typeConfig.fields = () => {
        return (0, _configAsThunk.resolveInputConfigMapAsThunk)(this.schemaComposer, fields, this.getTypeName());
      };

      delete this.gqType._fields; // if schema was builded, delete defineFieldMap
    }

    return this;
  }

  setField(fieldName, fieldConfig) {
    this.addFields({
      [fieldName]: fieldConfig
    });
    return this;
  }
  /**
   * Add new fields or replace existed in a GraphQL type
   */


  addFields(newFields) {
    this.setFields(_objectSpread({}, this.getFields(), newFields));
    return this;
  }
  /**
   * Add new fields or replace existed (where field name may have dots)
   */


  addNestedFields(newFields) {
    Object.keys(newFields).forEach(fieldName => {
      const fc = newFields[fieldName];
      const names = fieldName.split('.');
      const name = names.shift();

      if (names.length === 0) {
        // single field
        this.setField(name, fc);
      } else {
        // nested field
        let childTC;

        if (!this.hasField(name)) {
          childTC = this.schemaComposer.InputTypeComposer.createTemp(`${this.getTypeName()}${(0, _misc.upperFirst)(name)}`);
          this.setField(name, childTC);
        } else {
          childTC = this.getFieldTC(name);
        }

        childTC.addNestedFields({
          [names.join('.')]: fc
        });
      }
    });
    return this;
  }
  /**
   * Get fieldConfig by name
   */


  getField(fieldName) {
    const fields = this.getFields();

    if (!fields[fieldName]) {
      throw new Error(`Cannot get field '${fieldName}' from input type '${this.getTypeName()}'. Field does not exist.`);
    }

    return fields[fieldName];
  }

  removeField(fieldNameOrArray) {
    const fieldNames = Array.isArray(fieldNameOrArray) ? fieldNameOrArray : [fieldNameOrArray];
    const fields = this.getFields();
    fieldNames.forEach(fieldName => delete fields[fieldName]);
    this.setFields(fields);
    return this;
  }

  removeOtherFields(fieldNameOrArray) {
    const keepFieldNames = Array.isArray(fieldNameOrArray) ? fieldNameOrArray : [fieldNameOrArray];
    const fields = this.getFields();
    Object.keys(fields).forEach(fieldName => {
      if (keepFieldNames.indexOf(fieldName) === -1) {
        delete fields[fieldName];
      }
    });
    this.setFields(fields);
    return this;
  }

  extendField(fieldName, parialFieldConfig) {
    let prevFieldConfig;

    try {
      prevFieldConfig = this.getFieldConfig(fieldName);
    } catch (e) {
      throw new Error(`Cannot extend field '${fieldName}' from input type '${this.getTypeName()}'. Field does not exist.`);
    }

    this.setField(fieldName, _objectSpread({}, prevFieldConfig, parialFieldConfig));
    return this;
  }

  reorderFields(names) {
    const orderedFields = {};
    const fields = this.getFields();
    names.forEach(name => {
      if (fields[name]) {
        orderedFields[name] = fields[name];
        delete fields[name];
      }
    });
    this.setFields(_objectSpread({}, orderedFields, fields));
    return this;
  }

  isFieldNonNull(fieldName) {
    return this.getFieldType(fieldName) instanceof _graphql.GraphQLNonNull;
  } // alias for isFieldNonNull


  isRequired(fieldName) {
    return this.isFieldNonNull(fieldName);
  }

  getFieldConfig(fieldName) {
    const fc = this.getField(fieldName);

    if (!fc) {
      throw new Error(`Type ${this.getTypeName()} does not have field with name '${fieldName}'`);
    }

    return (0, _configAsThunk.resolveInputConfigAsThunk)(this.schemaComposer, fc, fieldName, this.getTypeName());
  }

  getFieldType(fieldName) {
    return this.getFieldConfig(fieldName).type;
  }

  getFieldTC(fieldName) {
    const fieldType = (0, _graphql.getNamedType)(this.getFieldType(fieldName));

    if (!(fieldType instanceof _graphql.GraphQLInputObjectType)) {
      throw new Error(`Cannot get InputTypeComposer for field '${fieldName}' in type ${this.getTypeName()}. ` + `This field should be InputObjectType, but it has type '${fieldType.constructor.name}'`);
    }

    return this.schemaComposer.InputTypeComposer.createTemp(fieldType);
  }

  makeFieldNonNull(fieldNameOrArray) {
    const fieldNames = Array.isArray(fieldNameOrArray) ? fieldNameOrArray : [fieldNameOrArray];
    fieldNames.forEach(fieldName => {
      if (this.hasField(fieldName)) {
        const fieldType = this.getFieldType(fieldName);

        if (!(fieldType instanceof _graphql.GraphQLNonNull)) {
          this.extendField(fieldName, {
            type: new _graphql.GraphQLNonNull(fieldType)
          });
        }
      }
    });
    return this;
  } // alias for makeFieldNonNull


  makeRequired(fieldNameOrArray) {
    return this.makeFieldNonNull(fieldNameOrArray);
  }

  makeFieldNullable(fieldNameOrArray) {
    const fieldNames = Array.isArray(fieldNameOrArray) ? fieldNameOrArray : [fieldNameOrArray];
    fieldNames.forEach(fieldName => {
      if (this.hasField(fieldName)) {
        const fieldType = this.getFieldType(fieldName);

        if (fieldType instanceof _graphql.GraphQLNonNull) {
          this.extendField(fieldName, {
            type: fieldType.ofType
          });
        }
      }
    });
    return this;
  }

  makeOptional(fieldNameOrArray) {
    return this.makeFieldNullable(fieldNameOrArray);
  } // -----------------------------------------------
  // Type methods
  // -----------------------------------------------


  getType() {
    return this.gqType;
  }

  getTypePlural() {
    return new _graphql.GraphQLList(this.gqType);
  }

  getTypeNonNull() {
    return new _graphql.GraphQLNonNull(this.gqType);
  }
  /** @deprecated 5.0.0 */


  getTypeAsRequired() {
    (0, _debug.deprecate)('Use `InputTypeComposer.getTypeNonNull` method instead of `getTypeAsRequired`');
    return this.getTypeNonNull();
  }

  getTypeName() {
    return this.gqType.name;
  }

  setTypeName(name) {
    this.gqType.name = name;
    this.schemaComposer.add(this);
    return this;
  }

  getDescription() {
    return this.gqType.description || '';
  }

  setDescription(description) {
    this.gqType.description = description;
    return this;
  }

  clone(newTypeName) {
    if (!newTypeName) {
      throw new Error('You should provide new type name for clone() method');
    }

    const newFields = {};
    this.getFieldNames().forEach(fieldName => {
      const fc = this.getFieldConfig(fieldName);
      newFields[fieldName] = _objectSpread({}, fc);
    });
    return new this.schemaComposer.InputTypeComposer(new _graphql.GraphQLInputObjectType({
      name: newTypeName,
      fields: newFields
    }));
  } // -----------------------------------------------
  // Misc methods
  // -----------------------------------------------


  get(path) {
    return (0, _typeByPath.typeByPath)(this, path);
  }

}

exports.InputTypeComposer = InputTypeComposer;