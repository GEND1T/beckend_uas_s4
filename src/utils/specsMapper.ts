
export interface ProductDataInput {
  ram?: string | null;
  storage?: string | null;
  processor?: string | null;
  battery?: string | null;
  weight?: string | null;
  screenSize?: string | number | null;
  releaseYear?: string | null;
}

/**
 * Normalizes and extracts numeric value from standard spec strings.
 */
function parseNumericValue(val: string | number | null | undefined): number {
  if (val === null || val === undefined) return 0;
  const str = String(val).toLowerCase().replace(/\s+/g, '');
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

/**
 * Standardizes storage strings to GB numeric value.
 * e.g., "512GB" -> 512, "1TB" -> 1024, "2 TB SSD" -> 2048
 */
function parseStorageToGB(s: string): number {
  const cleaned = s.toLowerCase().replace(/\s+/g, '');
  const match = cleaned.match(/([0-9.]+)\s*(gb|tb)/);
  if (match) {
    const val = parseFloat(match[1]);
    const unit = match[2];
    if (unit.startsWith('t')) return val * 1024;
    return val;
  }
  const numOnly = parseFloat(cleaned.replace(/[^0-9.]/g, ''));
  return isNaN(numOnly) ? 0 : numOnly;
}

/**
 * Standardizes release year strings.
 * e.g., "2024" -> 2024, "2024-01-01" -> 2024
 */
function parseReleaseYear(s: string): number {
  let cleaned = s.toLowerCase().trim();
  if (cleaned.includes('-')) {
    cleaned = cleaned.split('-')[0];
  }
  const num = parseFloat(cleaned.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

/**
 * Evaluates whether a numeric value falls within the comparison described by the sub-criteria description.
 */
function matchNumericCriteria(val: number, description: string, parser?: (s: string) => number): boolean {
  const desc = description.toLowerCase().trim();
  const parseFn = parser || ((s: string) => parseFloat(s.replace(/[^0-9.]/g, '')));

  // Check ranges like "45 - 59 Wh" or "1.5 - 1.99 kg"
  if (desc.includes('-')) {
    const parts = desc.split('-').map(p => parseFn(p));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return val >= parts[0] && val <= parts[1];
    }
  }

  // Check inequalities
  if (desc.startsWith('<=')) {
    const limit = parseFn(desc.replace(/<=/, ''));
    return !isNaN(limit) && val <= limit;
  }
  if (desc.startsWith('<')) {
    const limit = parseFn(desc.replace(/</, ''));
    return !isNaN(limit) && val < limit;
  }
  if (desc.startsWith('>=')) {
    const limit = parseFn(desc.replace(/>=/, ''));
    return !isNaN(limit) && val >= limit;
  }
  if (desc.startsWith('>')) {
    const limit = parseFn(desc.replace(/>/, ''));
    return !isNaN(limit) && val > limit;
  }

  // Check exact match
  const limit = parseFn(desc);
  return !isNaN(limit) && val === limit;
}

/**
 * Matches processor input string against sub-criteria based on hierarchical precedence.
 */
function matchProcessor(input: string, valueNumeric: number): boolean {
  const inp = input.toLowerCase().replace(/\s+/g, '');

  switch (valueNumeric) {
    case 5: // Core i9 / Ryzen 9 / Apple M3 Pro-Max / Ultra
      return (
        inp.includes('i9') ||
        inp.includes('ryzen9') ||
        inp.includes('m3pro') ||
        inp.includes('m3max') ||
        inp.includes('m3ultra') ||
        inp.includes('m4pro') ||
        inp.includes('m4max') ||
        inp.includes('m4ultra') ||
        inp.includes('ultra')
      );
    case 4: // Core i7 / Ryzen 7 / Apple M1-M2
      return (
        inp.includes('i7') ||
        inp.includes('ryzen7') ||
        inp.includes('m1') ||
        inp.includes('m2') ||
        inp.includes('m3')
      );
    case 3: // Core i5 / Ryzen 5
      return inp.includes('i5') || inp.includes('ryzen5');
    case 2: // Core i3 / Ryzen 3
      return inp.includes('i3') || inp.includes('ryzen3');
    case 1: // Celeron / N-Series
      return (
        inp.includes('celeron') ||
        inp.includes('pentium') ||
        inp.includes('athlon') ||
        inp.includes('n100') ||
        inp.includes('n200') ||
        /^n\d+/.test(inp)
      );
    default:
      return false;
  }
}

/**
 * Standardizes specs and maps them to appropriate sub-criteria IDs.
 * 
 * @param prismaClient Prisma transaction or standard client
 * @param productData Raw specification data
 * @returns Array of matched sub-criteria IDs
 */
export async function mapSpecsToSubCriteria(
  prismaClient: any,
  productData: ProductDataInput
): Promise<number[]> {
  // Fetch all criteria and sub-criteria from the database
  const criteriaList = await prismaClient.criteria.findMany({
    include: {
      subCriteria: true,
    },
  });

  const matchedSubCriteriaIds: number[] = [];

  for (const criteria of criteriaList) {
    const subCriteriaGroup = criteria.subCriteria;
    if (!subCriteriaGroup || subCriteriaGroup.length === 0) {
      continue;
    }

    let matchedId: number | null = null;

    switch (criteria.code) {
      case 'C2': { // RAM
        if (productData.ram) {
          const val = parseNumericValue(productData.ram);
          const match = subCriteriaGroup.find((sc: any) =>
            matchNumericCriteria(val, sc.description)
          );
          if (match) matchedId = match.id;
        }
        break;
      }
      case 'C3': { // Storage
        if (productData.storage) {
          const val = parseStorageToGB(productData.storage);
          const match = subCriteriaGroup.find((sc: any) =>
            matchNumericCriteria(val, sc.description, parseStorageToGB)
          );
          if (match) matchedId = match.id;
        }
        break;
      }
      case 'C4': { // Battery
        if (productData.battery) {
          const val = parseNumericValue(productData.battery);
          const match = subCriteriaGroup.find((sc: any) =>
            matchNumericCriteria(val, sc.description)
          );
          if (match) matchedId = match.id;
        }
        break;
      }
      case 'C5': { // Berat (Weight)
        if (productData.weight) {
          const val = parseNumericValue(productData.weight);
          const match = subCriteriaGroup.find((sc: any) =>
            matchNumericCriteria(val, sc.description)
          );
          if (match) matchedId = match.id;
        }
        break;
      }
      case 'C6': { // Processor
        if (productData.processor) {
          // Sort sub-criteria descending by valueNumeric to check hierarchical precedence (highest/most specific first)
          const sortedSubCriteria = [...subCriteriaGroup].sort(
            (a, b) => b.valueNumeric - a.valueNumeric
          );
          const match = sortedSubCriteria.find((sc: any) =>
            matchProcessor(productData.processor!, sc.valueNumeric)
          );
          if (match) matchedId = match.id;
        }
        break;
      }
      case 'C7': { // Ukuran Layar (Screen Size)
        if (productData.screenSize) {
          const val = parseNumericValue(productData.screenSize);
          const match = subCriteriaGroup.find((sc: any) =>
            matchNumericCriteria(val, sc.description)
          );
          if (match) matchedId = match.id;
        }
        break;
      }
      case 'C8': { // Tahun Rilis (Release Year)
        if (productData.releaseYear) {
          const val = parseReleaseYear(productData.releaseYear);
          const match = subCriteriaGroup.find((sc: any) =>
            matchNumericCriteria(val, sc.description)
          );
          if (match) matchedId = match.id;
        }
        break;
      }
      default:
        // Ignore other criteria groups like C1 (Harga) which don't map to master spec values
        break;
    }

    if (matchedId !== null) {
      matchedSubCriteriaIds.push(matchedId);
    } else if (criteria.code !== 'C1') {
      // If we have a specifications criteria that did not match, log a warning and fall back
      // Find the sub-criteria with the lowest valueNumeric to assign as a default fallback
      const fallback = subCriteriaGroup.reduce(
        (min: any, sc: any) => (sc.valueNumeric < min.valueNumeric ? sc : min),
        subCriteriaGroup[0]
      );
      if (fallback) {
        console.warn(
          `[SpecsMapper] Warning: Could not find matching sub-criteria for Criteria ${criteria.code} (${criteria.name}) with value: "${
            (productData as any)[getFieldNameForCriteriaCode(criteria.code)] || 'null'
          }". Falling back to default ID: ${fallback.id} ("${fallback.description}").`
        );
        matchedSubCriteriaIds.push(fallback.id);
      }
    }
  }

  return matchedSubCriteriaIds;
}

/**
 * Helper to retrieve corresponding input field name from criteria code for warning logging.
 */
function getFieldNameForCriteriaCode(code: string): string {
  switch (code) {
    case 'C2': return 'ram';
    case 'C3': return 'storage';
    case 'C4': return 'battery';
    case 'C5': return 'weight';
    case 'C6': return 'processor';
    case 'C7': return 'screenSize';
    case 'C8': return 'releaseYear';
    default: return '';
  }
}
