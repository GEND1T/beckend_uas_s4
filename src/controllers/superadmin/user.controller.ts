import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { userService } from '../../services/user.service';

export class UserController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.getUserById(id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { storeId, name, email, password, role } = req.body;
      if (!storeId || !name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'storeId, name, email, password, and role are required.'
        });
      }
      const newUser = await userService.createUser({
        storeId: parseInt(storeId),
        name,
        email,
        password,
        role
      });
      res.status(201).json({ success: true, message: 'User created successfully.', data: newUser });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { storeId, name, email, password, role } = req.body;
      const updated = await userService.updateUser(id, {
        storeId: storeId ? parseInt(storeId) : undefined,
        name,
        email,
        password,
        role
      });
      res.status(200).json({ success: true, message: 'User updated successfully.', data: updated });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await userService.deleteUser(id);
      res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
