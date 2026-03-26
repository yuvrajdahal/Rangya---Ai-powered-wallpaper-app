import { CategoryRepository } from "./category.repo";

export class CategoryService {
  private repo = new CategoryRepository();

  async getAllCategories() {
    return this.repo.findAll();
  }

  async getCategoryById(id: string) {
    return this.repo.findById(id);
  }

  async findOrCreateCategory(name: string) {
    const existing = await this.repo.findByName(name);
    if (existing) return existing;
    return this.repo.create(name);
  }
}
