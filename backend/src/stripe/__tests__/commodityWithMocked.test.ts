import { Request, Response } from 'express';
import { commodityController } from '../controllers/commodity.controller';
import { commodityDAO } from '../daos/commodity.dao';

jest.mock('../daos/commodity.dao');

const mockRes = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res as Response);
  res.json = jest.fn().mockReturnValue(res as Response);
  return res as Response;
};

describe('Commodity Controller - Unit tests for branches', () => {
  it('should return 400 if no id in findById', async () => {
    const req: Partial<Request> = { params: {} };
    const res = mockRes();

    await commodityController.findById(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ status: false, error: 'Commodity ID is required' });
  });

  it('should return 400 if no id in updateById', async () => {
    const req: Partial<Request> = { params: {}, body: {} };
    const res = mockRes();

    await commodityController.updateById(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if no id in deleteById', async () => {
    const req: Partial<Request> = { params: {} };
    const res = mockRes();

    await commodityController.deleteById(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if no id in addComment', async () => {
    const req: Partial<Request> = { params: {}, body: { user: '123', text: 'hi' } };
    const res = mockRes();

    await commodityController.addComment(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if no user/text in addComment', async () => {
    const req: Partial<Request> = { params: { id: '1' }, body: {} };
    const res = mockRes();

    await commodityController.addComment(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if no id in clearComments', async () => {
    const req: Partial<Request> = { params: {} };
    const res = mockRes();

    await commodityController.clearComments(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should handle DAO error in findAll', async () => {
    (commodityDAO.findAllCommodities as jest.Mock).mockRejectedValue(new Error('DB fail'));

    const req: Partial<Request> = { query: {} };
    const res = mockRes();

    await commodityController.findAll(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
