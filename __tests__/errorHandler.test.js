import { errorHandler } from '../backend/src/middleware/error.js';

describe('errorHandler 11000 duplicate key formatting', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('formats duplicate vehicleNumber error message', () => {
    const err = {
      code: 11000,
      keyValue: { vehicleNumber: 'LEA-1234' },
    };
    errorHandler(err, req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Vehicle number "LEA-1234" is already registered.',
      field: 'vehicleNumber',
    });
  });

  test('formats duplicate chassisNumber error message', () => {
    const err = {
      code: 11000,
      keyValue: { chassisNumber: 'CH-9999' },
    };
    errorHandler(err, req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Chassis number "CH-9999" is already registered.',
      field: 'chassisNumber',
    });
  });

  test('formats duplicate email error message', () => {
    const err = {
      code: 11000,
      keyValue: { email: 'user@test.com' },
    };
    errorHandler(err, req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Email "user@test.com" is already in use.',
      field: 'email',
    });
  });
});
