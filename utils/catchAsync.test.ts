import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import catchAsync from './catchAsync.js';

describe('catchAsync', () => {
  it('should call the async function with req, res, next', async () => {
    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = vi.fn() as NextFunction;
    
    const asyncFn = vi.fn().mockResolvedValue(undefined);
    const wrappedFn = catchAsync(asyncFn);
    
    await wrappedFn(mockReq, mockRes, mockNext);
    
    expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
  });

  it('should pass errors to next function', async () => {
    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = vi.fn() as NextFunction;
    
    const error = new Error('Test error');
    const asyncFn = vi.fn().mockRejectedValue(error);
    const wrappedFn = catchAsync(asyncFn);
    
    await wrappedFn(mockReq, mockRes, mockNext);
    
    // Wait for the promise to be caught
    await new Promise(resolve => setImmediate(resolve));
    
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should return a function', () => {
    const asyncFn = vi.fn().mockResolvedValue(undefined);
    const wrappedFn = catchAsync(asyncFn);
    
    expect(typeof wrappedFn).toBe('function');
  });
});
