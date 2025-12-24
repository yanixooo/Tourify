import { Request, Response, NextFunction, RequestHandler } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncFunction<Req = any> = (
  req: Req,
  res: Response,
  next: NextFunction
) => Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const catchAsync = <Req = any>(fn: AsyncFunction<Req>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req as Req, res, next).catch(next);
  };
};

export default catchAsync;
