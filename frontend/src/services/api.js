import { mockProducts } from '../data/mockProducts';
export const api = {
  getProducts: async () => mockProducts,
  getProduct: async (id) => mockProducts.find(p => p.id === parseInt(id)),
};