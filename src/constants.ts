export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Appetizers' | 'Mains' | 'Drinks' | 'Birthday Specials';
  image: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Truffle Arancini',
    description: 'Crispy risotto balls with truffle oil and mozzarella.',
    price: 12.99,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    name: 'Wagyu Beef Sliders',
    description: 'Mini wagyu burgers with caramelized onions and brioche.',
    price: 18.50,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    name: 'Pan-Seared Salmon',
    description: 'Fresh salmon with asparagus and lemon butter sauce.',
    price: 28.00,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    name: 'Wild Mushroom Risotto',
    description: 'Creamy arborio rice with seasonal wild mushrooms.',
    price: 24.00,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1633337474564-1d9e96f17849?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '5',
    name: 'Passionfruit Mocktail',
    description: 'Refreshing blend of passionfruit, lime, and mint.',
    price: 9.50,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '6',
    name: 'Signature Birthday Cake',
    description: 'Rich chocolate ganache with gold leaf finish.',
    price: 45.00,
    category: 'Birthday Specials',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800'
  }
];
