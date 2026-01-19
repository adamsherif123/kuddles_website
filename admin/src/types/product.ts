export type StockBySize = Record<string, number>;

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  colors: string[];
  sizes: string[];
  stockBySize: StockBySize;
  imageUrls: string[];
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
};

export type NewProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
