import { prisma } from '../config/db';
import { calculateDistanceInKm } from '../utils/geo';

export class CatalogService {
  async getCatalog(filters?: { brandId?: number; search?: string }, userLat?: number, userLng?: number) {
    const whereClause: any = {};

    if (filters?.brandId) {
      whereClause.brandId = filters.brandId;
    }

    if (filters?.search) {
      whereClause.OR = [
        { modelName: { contains: filters.search } },
        { processor: { contains: filters.search } }
      ];
    }

    // Return global products with their associated brands and store listings
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        brand: true,
        productCriteria: {
          include: {
            subCriteria: {
              include: { criteria: true }
            }
          }
        },
        productStores: {
          where: {
            isAvailable: 1,
            store: { isActive: 1 }
          },
          include: {
            store: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    // Map through products and calculate distance for their store listings
    return products.map(prod => {
      const mappedStores = prod.productStores.map(ps => {
        let distanceInKm: number | null = null;
        if (
          userLat !== undefined &&
          userLng !== undefined &&
          ps.store.latitude !== null &&
          ps.store.longitude !== null
        ) {
          distanceInKm = calculateDistanceInKm(
            Number(userLat),
            Number(userLng),
            Number(ps.store.latitude),
            Number(ps.store.longitude)
          );
        }
        return {
          ...ps,
          distanceInKm,
          store: {
            ...ps.store,
            distanceInKm
          }
        };
      });

      return {
        ...prod,
        productStores: mappedStores
      };
    });
  }

  async getProductDetails(productId: number, userLat?: number, userLng?: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: true,
        productCriteria: {
          include: {
            subCriteria: {
              include: { criteria: true }
            }
          }
        },
        productStores: {
          where: {
            isAvailable: 1,
            store: { isActive: 1 }
          },
          include: {
            store: true
          }
        }
      }
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    const mappedStores = product.productStores.map(ps => {
      let distanceInKm: number | null = null;
      if (
        userLat !== undefined &&
        userLng !== undefined &&
        ps.store.latitude !== null &&
        ps.store.longitude !== null
      ) {
        distanceInKm = calculateDistanceInKm(
          Number(userLat),
          Number(userLng),
          Number(ps.store.latitude),
          Number(ps.store.longitude)
        );
      }
      return {
        ...ps,
        distanceInKm,
        store: {
          ...ps.store,
          distanceInKm
        }
      };
    });

    return {
      ...product,
      productStores: mappedStores
    };
  }
}

export const catalogService = new CatalogService();
