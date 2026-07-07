import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { criteriaService } from '../../services/criteria.service';
import { subCriteriaService } from '../../services/subCriteria.service';

export class CriteriaController {
  // --- Criteria CRUD ---
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const criteria = await criteriaService.getAllCriteria();
      res.status(200).json({ success: true, data: criteria });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const criteria = await criteriaService.getCriteriaById(id);
      res.status(200).json({ success: true, data: criteria });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { code, name, type } = req.body;
      if (!code || !name || !type) {
        return res.status(400).json({ success: false, message: 'Code, name, and type (benefit/cost) are required.' });
      }
      const newCriteria = await criteriaService.createCriteria({ code, name, type });
      res.status(201).json({ success: true, message: 'Criteria created successfully.', data: newCriteria });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { code, name, type } = req.body;
      const updated = await criteriaService.updateCriteria(id, { code, name, type });
      res.status(200).json({ success: true, message: 'Criteria updated successfully.', data: updated });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await criteriaService.deleteCriteria(id);
      res.status(200).json({ success: true, message: 'Criteria deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  // --- SubCriteria CRUD ---
  async getSubCriteriaByCriteria(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const criteriaId = parseInt(req.params.criteriaId);
      const subCriteria = await subCriteriaService.getSubCriteriaByCriteriaId(criteriaId);
      res.status(200).json({ success: true, data: subCriteria });
    } catch (error) {
      next(error);
    }
  }

  async getSubCriteriaById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const subCriteria = await subCriteriaService.getSubCriteriaById(id);
      res.status(200).json({ success: true, data: subCriteria });
    } catch (error) {
      next(error);
    }
  }

  async createSubCriteria(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { criteriaId, description, valueNumeric } = req.body;
      if (!criteriaId || !description || valueNumeric === undefined) {
        return res.status(400).json({ success: false, message: 'criteriaId, description, and valueNumeric are required.' });
      }
      const newSub = await subCriteriaService.createSubCriteria({
        criteriaId: parseInt(criteriaId),
        description,
        valueNumeric: parseInt(valueNumeric)
      });
      res.status(201).json({ success: true, message: 'SubCriteria created successfully.', data: newSub });
    } catch (error) {
      next(error);
    }
  }

  async updateSubCriteria(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { criteriaId, description, valueNumeric } = req.body;
      const updated = await subCriteriaService.updateSubCriteria(id, {
        criteriaId: criteriaId ? parseInt(criteriaId) : undefined,
        description,
        valueNumeric: valueNumeric !== undefined ? parseInt(valueNumeric) : undefined
      });
      res.status(200).json({ success: true, message: 'SubCriteria updated successfully.', data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteSubCriteria(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await subCriteriaService.deleteSubCriteria(id);
      res.status(200).json({ success: true, message: 'SubCriteria deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export const criteriaController = new CriteriaController();
