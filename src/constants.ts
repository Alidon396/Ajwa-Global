export interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Premium Dates' | 'Standard Dates' | 'Bulk Packaging' | 'Specialty';
  image: string;
}

export const PRODUCT_ITEMS: ProductItem[] = [
  {
    id: '1',
    name: 'Ajwa Dates (Grade A)',
    description: 'Premium quality, soft and dark Ajwa dates from Al Madinah. Rich in nutrients.',
    price: 35.00, // Price per kg
    category: 'Premium Dates',
    image: 'https://images.unsplash.com/photo-1596431940176-7876274070a8?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    name: 'Medjool Dates (Jumbo)',
    description: 'Large, sweet, and caramel-like Medjool dates. Perfect for premium retail.',
    price: 28.50,
    category: 'Premium Dates',
    image: 'https://images.unsplash.com/photo-1601314002592-b8734bca6604?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    name: 'Sukkari Dates',
    description: 'Golden, soft, and melt-in-the-mouth Sukkari dates. High demand in Middle East.',
    price: 22.00,
    category: 'Standard Dates',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    name: 'Mabroom Dates',
    description: 'Chewy, elongated dates with a less sweet, rich flavor profile.',
    price: 24.00,
    category: 'Standard Dates',
    image: 'https://images.unsplash.com/photo-1582582494705-f8ce0b0c24f0?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '5',
    name: 'Mixed Dates (10kg Carton)',
    description: 'Assorted dates packed in bulk for wholesale and distribution.',
    price: 180.00,
    category: 'Bulk Packaging',
    image: 'https://images.unsplash.com/photo-1596431940176-7876274070a8?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '6',
    name: 'Date Syrup (1L)',
    description: '100% natural, cold-pressed date syrup. Excellent natural sweetener.',
    price: 15.00,
    category: 'Specialty',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800'
  }
];
