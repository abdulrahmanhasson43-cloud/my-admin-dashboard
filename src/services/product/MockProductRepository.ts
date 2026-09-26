import type { Product } from '@/types';
import { sampleProducts } from '@/services/mock';
import { ProductNotFoundError } from './IProductRepository';
import type {
  IProductRepository,
  PendingTransfer,
  TransferHistoryEntry,
} from './IProductRepository';

/**
 * MockProductRepository — an in-memory implementation of IProductRepository.
 *
 * This is a low-level module in Dependency Inversion terms: it implements the
 * IProductRepository abstraction rather than ProductService depending on it
 * directly. ProductService never imports this file.
 *
 * TODO(phase-3): replace with a real adapter (e.g. FirestoreProductRepository
 * or RestApiProductRepository) that implements the same IProductRepository
 * interface and talks to the actual backend. Swap it in one place —
 * src/context/ProductServiceContext.tsx — and nothing else in the app changes.
 */
export class MockProductRepository implements IProductRepository {
  private products: Product[];
  private pendingTransfers: PendingTransfer[];
  private transferHistory: TransferHistoryEntry[];

  constructor(seed: Product[] = sampleProducts) {
    // Deep-copy so mutations here never reach back into the shared fixture.
    this.products = seed.map(p => ({ ...p, variants: p.variants ? [...p.variants] : undefined }));
    this.pendingTransfers = [];
    this.transferHistory = [];
  }

  async findAll(): Promise<Product[]> {
    return [...this.products];
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === id) ?? null;
  }

  async insert(product: Product): Promise<Product> {
    this.products = [...this.products, product];
    return product;
  }

  async update(product: Product): Promise<Product> {
    const index = this.products.findIndex(p => p.id === product.id);
    if (index === -1) {
      throw new ProductNotFoundError(product.id);
    }
    this.products = [
      ...this.products.slice(0, index),
      product,
      ...this.products.slice(index + 1),
    ];
    return product;
  }

  async remove(id: string): Promise<void> {
    this.products = this.products.filter(p => p.id !== id);
  }

  async findPendingTransfers(): Promise<PendingTransfer[]> {
    return [...this.pendingTransfers];
  }

  async insertPendingTransfer(transfer: PendingTransfer): Promise<PendingTransfer> {
    this.pendingTransfers = [...this.pendingTransfers, transfer];
    return transfer;
  }

  async removePendingTransfer(id: string): Promise<void> {
    this.pendingTransfers = this.pendingTransfers.filter(t => t.id !== id);
  }

  async findTransferHistory(): Promise<TransferHistoryEntry[]> {
    return [...this.transferHistory];
  }

  async insertTransferHistory(entry: TransferHistoryEntry): Promise<TransferHistoryEntry> {
    // Keep the newest 30 entries, newest first — same cap as before.
    this.transferHistory = [entry, ...this.transferHistory].slice(0, 30);
    return entry;
  }
}
