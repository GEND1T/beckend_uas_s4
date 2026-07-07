import { prisma } from '../config/db';

export class ReportService {
  async getStoreReportSummary(storeId: number) {
    const products = await prisma.productStore.findMany({
      where: { storeId },
      include: {
        product: true
      }
    });

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, item) => sum + item.stock, 0);
    const avgPrice = totalProducts > 0 
      ? products.reduce((sum, item) => sum + item.price, 0) / totalProducts 
      : 0;

    const availableCount = products.filter(item => item.isAvailable === 1).length;

    // Get count of recommendation request appearances for this store
    const recommendationAppearances = await prisma.recommendationResult.count({
      where: {
        productStore: {
          storeId
        }
      }
    });

    return {
      totalProducts,
      totalStock,
      avgPrice,
      availableCount,
      recommendationAppearances
    };
  }
}

export const reportService = new ReportService();
