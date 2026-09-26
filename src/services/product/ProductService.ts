import type { Product, CartItem } from '@/types';
import { generateId } from '@/lib/utils';
import type {
  IProductRepository,
  PendingTransfer,
  TransferHistoryEntry,
} from './IProductRepository';

/** Re-export the transfer domain types so callers import them from the service. */
export type { PendingTransfer, TransferHistoryEntry };

/**
 * The product fields a validation error can be attributed to. Exposed so the
 * form layer can bind a rejected save to the offending input (issue #4).
 */
export type ProductField =
  | 'name'
  | 'category'
  | 'price'
  | 'wholesalePrice'
  | 'cost'
  | 'storeStock'
  | 'warehouseStock'
  | 'barcode';

/**
 * Thrown when a caller tries to create/update a product with invalid data.
 * Carries the offending `field` (when known) so the UI can highlight it
 * inline instead of showing a generic error.
 */
export class InvalidProductError extends Error {
  readonly field?: ProductField;

  constructor(message: string, field?: ProductField) {
    super(message);
    this.name = 'InvalidProductError';
    this.field = field;
  }
}

/**
 * ProductService — all product business logic lives here, and ONLY here.
 *
 * This class is the "high-level module" in Dependency Inversion terms: it
 * depends solely on the IProductRepository abstraction (injected through the
 * constructor), never on a concrete storage technology. It has no idea
 * whether products are actually sitting in memory, in Firestore, or behind a
 * REST API — and it doesn't need to. That knowledge is fully owned by
 * whichever IProductRepository implementation gets injected at the
 * composition root (see ProductServiceContext.tsx).
 *
 * SOLID recap for this class specifically:
 * - Single Responsibility: product business rules (stock math, transfer
 *   rules, validation) — nothing about HOW data is persisted.
 * - Open/Closed: new persistence backends extend the app by adding a new
 *   IProductRepository implementation; this class never changes for that.
 * - Liskov Substitution: any IProductRepository implementation can be
 *   substituted here without breaking a single method below.
 * - Interface Segregation: IProductRepository exposes only the handful of
 *   methods a product-storage backend actually needs — no generic "god"
 *   repository interface.
 * - Dependency Inversion: this class (high-level policy) and every concrete
 *   repository (low-level detail) both depend on IProductRepository (the
 *   abstraction) — neither depends on the other directly.
 */
export class ProductService {
  private readonly repository: IProductRepository;

  constructor(repository: IProductRepository) {
    this.repository = repository;
  }

  async getAllProducts(): Promise<Product[]> {
    return this.repository.findAll();
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.repository.findById(id);
  }

  /**
   * Records a sale. A sale only ever comes off the shop-floor quantity — a
   * customer can't buy what's still sitting in the warehouse. Total stock is
   * recomputed so it always equals storeStock + warehouseStock.
   */
  async sellProducts(items: CartItem[]): Promise<Product[]> {
    const products = await this.repository.findAll();
    const updated: Product[] = [];

    for (const product of products) {
      const sold = items.find(item => item.id === product.id);
      if (!sold) continue;

      const newStoreStock = Math.max(0, product.storeStock - sold.quantity);
      const next: Product = {
        ...product,
        storeStock: newStoreStock,
        stock: newStoreStock + product.warehouseStock,
      };
      updated.push(await this.repository.update(next));
    }

    return updated;
  }

  async addProduct(input: Omit<Product, 'id'>): Promise<Product> {
    this.assertValidProduct(input);

    const existing = await this.repository.findAll();
    const product: Product = { ...input, id: this.nextProductId(existing) };
    return this.repository.insert(product);
  }

  async updateProduct(id: string, updates: Omit<Product, 'id'>): Promise<Product> {
    this.assertValidProduct(updates);
    const product: Product = { ...updates, id };
    return this.repository.update(product);
  }

  async deleteProduct(id: string): Promise<void> {
    return this.repository.remove(id);
  }

  /**
   * Moves quantity from the warehouse into the store immediately, making it
   * sellable. Total stock doesn't change — only where it physically sits.
   * The move is clamped to what's actually in the warehouse, and only a
   * non-zero move is written to the audit trail.
   */
  async transferToStore(productId: string, quantity: number): Promise<void> {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new InvalidProductError(`Cannot transfer unknown product: ${productId}`);
    }

    const moved = Math.max(0, Math.min(quantity, product.warehouseStock));
    if (moved === 0) return;

    await this.repository.update({
      ...product,
      storeStock: product.storeStock + moved,
      warehouseStock: product.warehouseStock - moved,
    });

    await this.recordTransfer(product, moved);
  }

  /**
   * Queues a warehouse→store move instead of executing it right away. Used
   * when Settings > "النقل بين الفروع تحتاج تأكيد" is on.
   */
  async requestTransfer(productId: string, quantity: number): Promise<PendingTransfer> {
    const transfer: PendingTransfer = {
      id: generateId('tr'),
      productId,
      quantity,
      createdAt: new Date().toLocaleString('ar-EG'),
    };
    return this.repository.insertPendingTransfer(transfer);
  }

  /** Confirms a queued transfer: executes the move, logs it, then dequeues it. */
  async confirmTransfer(transferId: string): Promise<void> {
    const pending = await this.repository.findPendingTransfers();
    const transfer = pending.find(t => t.id === transferId);
    if (!transfer) return;

    const product = await this.repository.findById(transfer.productId);
    if (product) {
      const moved = Math.max(0, Math.min(transfer.quantity, product.warehouseStock));
      if (moved > 0) {
        await this.repository.update({
          ...product,
          storeStock: product.storeStock + moved,
          warehouseStock: product.warehouseStock - moved,
        });
        await this.recordTransfer(product, moved);
      }
    }

    await this.repository.removePendingTransfer(transferId);
  }

  async cancelTransfer(transferId: string): Promise<void> {
    return this.repository.removePendingTransfer(transferId);
  }

  async getPendingTransfers(): Promise<PendingTransfer[]> {
    return this.repository.findPendingTransfers();
  }

  async getTransferHistory(): Promise<TransferHistoryEntry[]> {
    return this.repository.findTransferHistory();
  }

  // --- private helpers ---------------------------------------------------

  private async recordTransfer(product: Product, quantity: number): Promise<void> {
    await this.repository.insertTransferHistory({
      id: generateId('th'),
      productId: product.id,
      productName: product.name,
      quantity,
      direction: 'warehouse-to-store',
      timestamp: new Date().toLocaleString('ar-EG'),
    });
  }

  /** Next numeric id = highest existing numeric id + 1 (ids are numeric strings). */
  private nextProductId(existing: Product[]): string {
    const maxId = existing.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
    return String(maxId + 1);
  }

  private assertValidProduct(input: Omit<Product, 'id'>): void {
    if (!input.name.trim()) {
      throw new InvalidProductError('اسم المنتج مطلوب', 'name');
    }
    if (input.price < 0) {
      throw new InvalidProductError('سعر البيع لا يمكن أن يكون سالبًا', 'price');
    }
    if (input.cost < 0) {
      throw new InvalidProductError('سعر الشراء لا يمكن أن يكون سالبًا', 'cost');
    }
  }
}
