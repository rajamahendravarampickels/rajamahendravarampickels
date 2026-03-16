import { Product } from '../types';

export const products: Product[] = [
  { 
    id: "1", name: "Avakai", category: "veg", description: "Traditional mango pickle", image: "",
    sizes: [
      { label: "250g", price: 208 },
      { label: "500g", price: 415 },
      { label: "1kg", price: 829 }
    ]
  },
  { 
    id: "2", name: "Bellam Avakai", category: "veg", description: "Sweet mango pickle", image: "",
    sizes: [
      { label: "250g", price: 220 },
      { label: "500g", price: 435 },
      { label: "1kg", price: 865 }
    ]
  },
  { 
    id: "3", name: "Magai", category: "veg", description: "Dried mango pickle", image: "",
    sizes: [
      { label: "250g", price: 208 },
      { label: "500g", price: 415 },
      { label: "1kg", price: 829 }
    ]
  },
  { 
    id: "4", name: "Cut Mango", category: "veg", description: "Fresh cut mango pickle", image: "",
    sizes: [
      { label: "250g", price: 200 },
      { label: "500g", price: 395 },
      { label: "1kg", price: 785 }
    ]
  },
  { 
    id: "5", name: "Pesara Avakai", category: "veg", description: "Moong dal mango pickle", image: "",
    sizes: [
      { label: "250g", price: 230 },
      { label: "500g", price: 455 },
      { label: "1kg", price: 899 }
    ]
  },
  { 
    id: "6", name: "Gongura", category: "veg", description: "Sorrel leaves pickle", image: "",
    sizes: [
      { label: "250g", price: 208 },
      { label: "500g", price: 415 },
      { label: "1kg", price: 829 }
    ]
  },
  { 
    id: "7", name: "Allam", category: "veg", description: "Ginger pickle", image: "",
    sizes: [
      { label: "250g", price: 190 },
      { label: "500g", price: 375 },
      { label: "1kg", price: 745 }
    ]
  },
  { 
    id: "8", name: "Coriander", category: "veg", description: "Coriander pickle", image: "",
    sizes: [
      { label: "250g", price: 180 },
      { label: "500g", price: 355 },
      { label: "1kg", price: 705 }
    ]
  },
  { 
    id: "9", name: "Tomato", category: "veg", description: "Tomato pickle", image: "",
    sizes: [
      { label: "250g", price: 175 },
      { label: "500g", price: 345 },
      { label: "1kg", price: 685 }
    ]
  },
  { 
    id: "10", name: "Amla", category: "veg", description: "Gooseberry pickle", image: "",
    sizes: [
      { label: "250g", price: 200 },
      { label: "500g", price: 395 },
      { label: "1kg", price: 785 }
    ]
  },

  { 
    id: "11", name: "Chicken Boneless", category: "nonveg", description: "Spicy chicken pickle", image: "",
    sizes: [
      { label: "250g", price: 420 },
      { label: "500g", price: 815 },
      { label: "1kg", price: 1599 }
    ]
  },
  { 
    id: "12", name: "Mutton Boneless", category: "nonveg", description: "Spicy mutton pickle", image: "",
    sizes: [
      { label: "250g", price: 520 },
      { label: "500g", price: 999 },
      { label: "1kg", price: 1950 }
    ]
  },
  { 
    id: "13", name: "Prawn", category: "nonveg", description: "Spicy prawn pickle", image: "",
    sizes: [
      { label: "250g", price: 480 },
      { label: "500g", price: 935 },
      { label: "1kg", price: 1850 }
    ]
  },
  { 
    id: "14", name: "Gongura Chicken", category: "nonveg", description: "Gongura chicken pickle", image: "",
    sizes: [
      { label: "250g", price: 450 },
      { label: "500g", price: 875 },
      { label: "1kg", price: 1720 }
    ]
  },
  { 
    id: "15", name: "Gongura Prawn", category: "nonveg", description: "Gongura prawn pickle", image: "",
    sizes: [
      { label: "250g", price: 500 },
      { label: "500g", price: 975 },
      { label: "1kg", price: 1920 }
    ]
  },

  { 
    id: "16", name: "Kandi", category: "podi", description: "Lentil powder", image: "",
    sizes: [
      { label: "250g", price: 150 },
      { label: "500g", price: 295 },
      { label: "1kg", price: 580 }
    ]
  },
  { 
    id: "17", name: "Nuvvula", category: "podi", description: "Sesame powder", image: "",
    sizes: [
      { label: "250g", price: 140 },
      { label: "500g", price: 275 },
      { label: "1kg", price: 540 }
    ]
  },
  { 
    id: "18", name: "Karvepaki", category: "podi", description: "Curry leaf powder", image: "",
    sizes: [
      { label: "250g", price: 130 },
      { label: "500g", price: 255 },
      { label: "1kg", price: 500 }
    ]
  },
  { 
    id: "19", name: "Danyalu", category: "podi", description: "Coriander powder", image: "",
    sizes: [
      { label: "250g", price: 120 },
      { label: "500g", price: 235 },
      { label: "1kg", price: 460 }
    ]
  },
  { 
    id: "20", name: "Biryani Masala", category: "podi", description: "Biryani spice mix", image: "",
    sizes: [
      { label: "250g", price: 180 },
      { label: "500g", price: 355 },
      { label: "1kg", price: 700 }
    ]
  },
  { 
    id: "21", name: "Garam Masala", category: "podi", description: "Indian spice mix", image: "",
    sizes: [
      { label: "250g", price: 170 },
      { label: "500g", price: 335 },
      { label: "1kg", price: 660 }
    ]
  },
  { 
    id: "22", name: "Senagapodi", category: "podi", description: "Roasted gram powder", image: "",
    sizes: [
      { label: "250g", price: 150 },
      { label: "500g", price: 295 },
      { label: "1kg", price: 580 }
    ]
  },
  { 
    id: "23", name: "Tamarind Paste", category: "podi", description: "Fresh tamarind paste", image: "",
    sizes: [
      { label: "250g", price: 160 },
      { label: "500g", price: 315 },
      { label: "1kg", price: 620 }
    ]
  }
];
