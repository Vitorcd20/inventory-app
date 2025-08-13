
export const translateCategory = (categoryName: string): string => {
  const translations: Record<string, string> = {
    'electronics': 'Eletrônicos',
    'electronic': 'Eletrônicos',
    'eletronics': 'Eletrônicos',
    
    'clothing': 'Roupas',
    'clothes': 'Roupas',
    'apparel': 'Vestuário',
    'fashion': 'Moda',
    
    'jewelry': 'Joias',
    'jewellery': 'Joias',
    'necklaces': 'Colares',
    'necklace': 'Colares',
    'rings': 'Anéis',
    'ring': 'Anéis',
    'earrings': 'Brincos',
    'earring': 'Brincos',
    'bracelets': 'Pulseiras',
    'bracelet': 'Pulseiras',
    'watches': 'Relógios',
    'watch': 'Relógios',
    'accessories': 'Acessórios',
    
    'books': 'Livros',
    'book': 'Livros',
    
    'beauty': 'Beleza',
    'cosmetics': 'Cosméticos',
    'health': 'Saúde',
    
    'toys': 'Brinquedos',
    'toy': 'Brinquedos',
    'games': 'Jogos',
    
    'others': 'Outros',
    'other': 'Outros',
    'miscellaneous': 'Diversos'
  }
  
  const lowerCaseName = categoryName.toLowerCase()
  return translations[lowerCaseName] || categoryName
}
