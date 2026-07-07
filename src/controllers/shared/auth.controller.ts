import { Request, Response, NextFunction } from 'express';
import { sharedAuthService } from '../../services/sharedAuth.service';

export class SharedAuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const result = await sharedAuthService.login(email, password);
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

export const sharedAuthController = new SharedAuthController();
