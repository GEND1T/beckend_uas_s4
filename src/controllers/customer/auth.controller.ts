import { Request, Response, NextFunction } from 'express';
import { customerAuthService } from '../../services/customerAuth.service';

export class CustomerAuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      }

      const result = await customerAuthService.register({ name, email, password });
      res.status(201).json({
        success: true,
        message: 'Customer registered successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const result = await customerAuthService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export const customerAuthController = new CustomerAuthController();
