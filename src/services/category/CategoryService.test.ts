import { describe, expect, it } from 'vitest';
import { CategoryService, InvalidCategoryError } from './CategoryService';
import { MockCategoryRepository } from './MockCategoryRepository';

const service = () => new CategoryService(new MockCategoryRepository([]));

describe('CategoryService', () => {
  it('creates a category with no products and the brand colour by default', async () => {
    const category = await service().createCategory({ name: '  إلكترونيات ' });
    expect(category).toMatchObject({ name: 'إلكترونيات', productCount: 0, color: 'var(--vuno-primary)' });
    expect(category.id).toMatch(/^CAT-/);
  });

  it('keeps a colour that is given', async () => {
    expect((await service().createCategory({ name: 'ب', color: '#ff0000' })).color).toBe('#ff0000');
  });

  it('rejects a blank name', async () => {
    await expect(service().createCategory({ name: ' ' })).rejects.toThrow(InvalidCategoryError);
  });

  it('update merges, delete removes, unknown ids are rejected', async () => {
    const svc = service();
    const category = await svc.createCategory({ name: 'ب' });
    expect((await svc.updateCategory(category.id, { name: 'ج' })).name).toBe('ج');
    await svc.deleteCategory(category.id);
    expect(await svc.getCategoryById(category.id)).toBeNull();
    await expect(svc.updateCategory('nope', {})).rejects.toThrow(InvalidCategoryError);
  });
});
