import { describe, it, expect } from 'vitest';
import APIFeatures from './apiFeatures.js';

describe('APIFeatures', () => {
  // Create a mock query object that mimics Mongoose query
  const createMockQuery = () => ({
    find: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  });

  describe('constructor', () => {
    it('should initialize with query and queryString', () => {
      const mockQuery = createMockQuery();
      const queryString = { page: '1' };
      
      const features = new APIFeatures(mockQuery, queryString);
      
      expect(features.query).toBe(mockQuery);
      expect(features.queryString).toBe(queryString);
    });
  });

  describe('sort', () => {
    it('should sort by provided field', () => {
      const mockQuery = createMockQuery();
      const features = new APIFeatures(mockQuery, { sort: 'price' });
      
      features.sort();
      
      expect(mockQuery.sort).toHaveBeenCalledWith('price');
    });

    it('should sort by multiple fields (comma separated)', () => {
      const mockQuery = createMockQuery();
      const features = new APIFeatures(mockQuery, { sort: 'price,ratingsAverage' });
      
      features.sort();
      
      expect(mockQuery.sort).toHaveBeenCalledWith('price ratingsAverage');
    });

    it('should default to -createdAt when no sort provided', () => {
      const mockQuery = createMockQuery();
      const features = new APIFeatures(mockQuery, {});
      
      features.sort();
      
      expect(mockQuery.sort).toHaveBeenCalledWith('-createdAt');
    });
  });

  describe('limitFields', () => {
    it('should select specified fields', () => {
      const mockQuery = createMockQuery();
      const features = new APIFeatures(mockQuery, { fields: 'name,price' });
      
      features.limitFields();
      
      expect(mockQuery.select).toHaveBeenCalledWith('name price');
    });

    it('should exclude __v by default', () => {
      const mockQuery = createMockQuery();
      const features = new APIFeatures(mockQuery, {});
      
      features.limitFields();
      
      expect(mockQuery.select).toHaveBeenCalledWith('-__v');
    });
  });

  describe('paginate', () => {
    it('should apply pagination with default values', () => {
      const mockQuery = createMockQuery();
      const features = new APIFeatures(mockQuery, {});
      
      features.paginate();
      
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(100);
    });

    it('should apply custom page and limit', () => {
      const mockQuery = createMockQuery();
      const features = new APIFeatures(mockQuery, { page: '2', limit: '10' });
      
      features.paginate();
      
      expect(mockQuery.skip).toHaveBeenCalledWith(10);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });

    it('should calculate correct skip for page 3', () => {
      const mockQuery = createMockQuery();
      const features = new APIFeatures(mockQuery, { page: '3', limit: '5' });
      
      features.paginate();
      
      expect(mockQuery.skip).toHaveBeenCalledWith(10); // (3-1) * 5 = 10
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
    });
  });

  describe('chaining', () => {
    it('should support method chaining', () => {
      const mockQuery = createMockQuery();
      const features = new APIFeatures(mockQuery, { sort: 'price', fields: 'name', page: '1' });
      
      const result = features.sort().limitFields().paginate();
      
      expect(result).toBe(features);
    });
  });
});

// Import vi for mocking
import { vi } from 'vitest';
