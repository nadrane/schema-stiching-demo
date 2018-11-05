"use strict";

var _graphql = require("../../graphql");

var _ = require("../..");

/*  strict */
describe('typeByPath', () => {
  const lonLatTC = _.TypeComposer.create('type LonLat { lon: Float, lat: Float }');

  const spotITC = _.InputTypeComposer.create('input SpotInput { lon: Float, lat: Float, distance: Float }');

  spotITC.setField('subSpot', spotITC);

  const tc = _.TypeComposer.create({
    name: 'Place',
    fields: {
      title: 'String!',
      lonLat: lonLatTC,
      image: {
        type: 'String',
        args: {
          size: 'Int'
        }
      },
      points: '[LonLat]'
    }
  });

  const rsv = new _.Resolver({
    name: 'findMany',
    args: {
      limit: 'Int',
      search: 'String',
      spot: spotITC
    },
    type: tc
  });
  tc.setResolver('findSpots', rsv);

  const ifc = _.InterfaceTypeComposer.create({
    name: 'Place',
    fields: {
      title: 'String!',
      lonLat: lonLatTC,
      image: {
        type: 'String',
        args: {
          size: 'Int'
        }
      },
      points: '[LonLat]'
    }
  });

  describe('for TypeComposer', () => {
    it('should return field type', () => {
      expect(tc.get('title')).toBe(_graphql.GraphQLString);
    });
    it('should return TypeCompose for complex type', () => {
      expect(tc.get('lonLat')).toBeInstanceOf(_.TypeComposer);
      expect(tc.get('lonLat').getTypeName()).toBe('LonLat');
    });
    it('should return sub field type', () => {
      expect(tc.get('lonLat.lon')).toBe(_graphql.GraphQLFloat);
      expect(tc.get('lonLat.lat')).toBe(_graphql.GraphQLFloat);
    });
    it('should return type of field arg', () => {
      expect(tc.get('image.@size')).toBe(_graphql.GraphQLInt);
    });
    it('should return resolver', () => {
      expect(tc.get('$findSpots')).toBeInstanceOf(_.Resolver);
    });
    it('should return resolver args', () => {
      expect(tc.get('$findSpots.@limit')).toBe(_graphql.GraphQLInt);
      expect(tc.get('$findSpots.@spot')).toBeInstanceOf(_.InputTypeComposer);
      expect(tc.get('$findSpots.@spot').getType()).toBe(spotITC.getType());
    });
    it('should return type of resolver outputType fields', () => {
      expect(tc.get('$findSpots.title')).toBe(_graphql.GraphQLString);
      expect(tc.get('$findSpots.image.@size')).toBe(_graphql.GraphQLInt);
    });
    it('should return same GraphQL type instances', () => {
      expect(tc.get('lonLat').getType()).toBeTruthy(); // via TypeComposer

      expect(tc.get('lonLat').getType()).toBe(tc.get('lonLat').getType()); // scalar type

      expect(tc.get('lonLat.lat')).toBe(tc.get('lonLat.lat'));
    });
    it('should return same GraphQL type instances via resolver', () => {
      expect(tc.get('$findSpots.lonLat').getType()).toBeTruthy();
      expect(tc.get('$findSpots.lonLat').getType()).toBe(tc.get('$findSpots.lonLat').getType()); // for wrapped type eg Array

      expect(tc.get('$findSpots.points').getType()).toBeTruthy();
      expect(tc.get('$findSpots.points').getType()).toBe(tc.get('$findSpots.points').getType());
    });
  });
  describe('for InputTypeComposer', () => {
    it('should return field type', () => {
      expect(spotITC.get('lon')).toBe(_graphql.GraphQLFloat);
      expect(spotITC.get('distance')).toBe(_graphql.GraphQLFloat);
    });
    it('should return sub field type', () => {
      expect(spotITC.get('subSpot.lon')).toBe(_graphql.GraphQLFloat);
      expect(spotITC.get('subSpot.distance')).toBe(_graphql.GraphQLFloat);
    });
  });
  describe('for Resolver', () => {
    it('should return args', () => {
      expect(rsv.get('@limit')).toBe(_graphql.GraphQLInt);
      expect(rsv.get('@spot')).toBeInstanceOf(_.InputTypeComposer);
      expect(rsv.get('@spot').getType()).toBe(spotITC.getType());
    });
    it('should return type of outputType fields', () => {
      expect(rsv.get('title')).toBe(_graphql.GraphQLString);
      expect(rsv.get('image.@size')).toBe(_graphql.GraphQLInt);
    });
    it('should return same GraphQL type instances', () => {
      expect(rsv.get('@spot').getType()).toBeTruthy(); // via InputTypeComposer

      expect(rsv.get('@spot').getType()).toBe(rsv.get('@spot').getType()); // scalar type

      expect(rsv.get('@spot.lat')).toBe(rsv.get('@spot.lat'));
    });
  });
  describe('for InterfaceTypeComposer', () => {
    it('should return field type', () => {
      expect(ifc.get('title')).toBe(_graphql.GraphQLString);
    });
    it('should return TypeCompose for complex type', () => {
      expect(ifc.get('lonLat')).toBeInstanceOf(_.TypeComposer);
      expect(ifc.get('lonLat').getTypeName()).toBe('LonLat');
    });
    it('should return sub field type', () => {
      expect(ifc.get('lonLat.lon')).toBe(_graphql.GraphQLFloat);
      expect(ifc.get('lonLat.lat')).toBe(_graphql.GraphQLFloat);
    });
    it('should return type of field arg', () => {
      expect(ifc.get('image.@size')).toBe(_graphql.GraphQLInt);
    });
    it('should return same GraphQL type instances', () => {
      expect(ifc.get('lonLat').getType()).toBeTruthy(); // via TypeComposer

      expect(ifc.get('lonLat').getType()).toBe(ifc.get('lonLat').getType()); // scalar type

      expect(ifc.get('lonLat.lat')).toBe(ifc.get('lonLat.lat'));
    });
  });
});