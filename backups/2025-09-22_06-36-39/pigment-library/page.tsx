"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Palette, Search, Filter, Eye, Download, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function PigmentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('all')

  const pigments = [
    // Permablend - 6 shades
    {
      id: 'pb1',
      brand: 'Permablend',
      name: 'Soft Ash Brown',
      hex: '#8B7355',
      code: 'PB-ASH-01',
      fitzpatrickTypes: ['I', 'II'],
      undertones: ['Cool', 'Neutral'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Microblading',
      description: 'Perfect for fair skin with cool undertones. Natural ash brown that won\'t turn orange.',
    },
    {
      id: 'pb2',
      brand: 'Permablend',
      name: 'Warm Brown',
      hex: '#A0522D',
      code: 'PB-WARM-03',
      fitzpatrickTypes: ['II', 'III'],
      undertones: ['Warm', 'Neutral'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Powder Brows',
      description: 'Rich warm brown ideal for medium skin tones with warm undertones.',
    },
    {
      id: 'pb3',
      brand: 'Permablend',
      name: 'Rich Brown',
      hex: '#8B4513',
      code: 'PB-RICH-05',
      fitzpatrickTypes: ['III', 'IV'],
      undertones: ['Warm', 'Neutral'],
      opacity: 'High',
      useCase: 'Eyebrows, Combination Brows',
      description: 'Deep rich brown for medium to medium-dark skin tones.',
    },
    {
      id: 'pb4',
      brand: 'Permablend',
      name: 'Deep Brown',
      hex: '#654321',
      code: 'PB-DEEP-07',
      fitzpatrickTypes: ['IV', 'V'],
      undertones: ['Warm', 'Neutral'],
      opacity: 'High',
      useCase: 'Eyebrows, Powder Brows',
      description: 'Deep brown for darker skin tones with excellent retention.',
    },
    {
      id: 'pb5',
      brand: 'Permablend',
      name: 'Chocolate Brown',
      hex: '#3E2723',
      code: 'PB-CHOC-09',
      fitzpatrickTypes: ['V', 'VI'],
      undertones: ['Warm', 'Neutral'],
      opacity: 'High',
      useCase: 'Eyebrows, Powder Brows',
      description: 'Rich chocolate brown for very dark skin tones.',
    },
    {
      id: 'pb6',
      brand: 'Permablend',
      name: 'Taupe',
      hex: '#8B8589',
      code: 'PB-TAUPE-11',
      fitzpatrickTypes: ['I', 'II', 'III'],
      undertones: ['Cool', 'Neutral'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Microblading',
      description: 'Sophisticated taupe for natural-looking brows.',
    },

    // Evenflo - 6 shades
    {
      id: 'ef1',
      brand: 'Evenflo',
      name: 'Light Ash Brown',
      hex: '#A0522D',
      code: 'EF-LASH-01',
      fitzpatrickTypes: ['I', 'II'],
      undertones: ['Cool', 'Neutral'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Microblading',
      description: 'Light ash brown for fair skin with cool undertones.',
    },
    {
      id: 'ef2',
      brand: 'Evenflo',
      name: 'Medium Brown',
      hex: '#8B4513',
      code: 'EF-MBROWN-03',
      fitzpatrickTypes: ['II', 'III'],
      undertones: ['Warm', 'Neutral'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Powder Brows',
      description: 'Medium brown for natural-looking brows.',
    },
    {
      id: 'ef3',
      brand: 'Evenflo',
      name: 'Dark Brown',
      hex: '#654321',
      code: 'EF-DBROWN-05',
      fitzpatrickTypes: ['III', 'IV'],
      undertones: ['Warm', 'Neutral'],
      opacity: 'High',
      useCase: 'Eyebrows, Combination Brows',
      description: 'Dark brown for medium to dark skin tones.',
    },
    {
      id: 'ef4',
      brand: 'Evenflo',
      name: 'Espresso',
      hex: '#3E2723',
      code: 'EF-ESP-07',
      fitzpatrickTypes: ['IV', 'V'],
      undertones: ['Warm', 'Neutral'],
      opacity: 'High',
      useCase: 'Eyebrows, Powder Brows',
      description: 'Rich espresso brown for dark skin tones.',
    },
    {
      id: 'ef5',
      brand: 'Evenflo',
      name: 'Cool Gray',
      hex: '#696969',
      code: 'EF-CGRAY-09',
      fitzpatrickTypes: ['I', 'II', 'III'],
      undertones: ['Cool'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Microblading',
      description: 'Cool gray for sophisticated brow looks.',
    },
    {
      id: 'ef6',
      brand: 'Evenflo',
      name: 'Warm Caramel',
      hex: '#D2691E',
      code: 'EF-WCAR-11',
      fitzpatrickTypes: ['II', 'III', 'IV'],
      undertones: ['Warm'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Powder Brows',
      description: 'Warm caramel for golden undertones.',
    },

    // LI Pigments - 6 shades
    {
      id: 'li1',
      brand: 'LI Pigments',
      name: 'Light Brown',
      hex: '#CD853F',
      code: 'LI-LBROWN-01',
      fitzpatrickTypes: ['I', 'II'],
      undertones: ['Warm', 'Neutral'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Microblading',
      description: 'Light brown for fair skin with warm undertones.',
    },
    {
      id: 'li2',
      brand: 'LI Pigments',
      name: 'Medium Brown',
      hex: '#8B4513',
      code: 'LI-MBROWN-03',
      fitzpatrickTypes: ['II', 'III'],
      undertones: ['Warm', 'Neutral'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Powder Brows',
      description: 'Medium brown for natural-looking brows.',
    },
    {
      id: 'li3',
      brand: 'LI Pigments',
      name: 'Dark Brown',
      hex: '#654321',
      code: 'LI-DBROWN-05',
      fitzpatrickTypes: ['III', 'IV'],
      undertones: ['Warm', 'Neutral'],
      opacity: 'High',
      useCase: 'Eyebrows, Combination Brows',
      description: 'Dark brown for medium to dark skin tones.',
    },
    {
      id: 'li4',
      brand: 'LI Pigments',
      name: 'Rich Brown',
      hex: '#3E2723',
      code: 'LI-RBROWN-07',
      fitzpatrickTypes: ['IV', 'V'],
      undertones: ['Warm', 'Neutral'],
      opacity: 'High',
      useCase: 'Eyebrows, Powder Brows',
      description: 'Rich brown for dark skin tones.',
    },
    {
      id: 'li5',
      brand: 'LI Pigments',
      name: 'Ash Brown',
      hex: '#8B7355',
      code: 'LI-ASH-09',
      fitzpatrickTypes: ['I', 'II', 'III'],
      undertones: ['Cool', 'Neutral'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Microblading',
      description: 'Ash brown for cool undertones.',
    },
    {
      id: 'li6',
      brand: 'LI Pigments',
      name: 'Golden Brown',
      hex: '#DAA520',
      code: 'LI-GBROWN-11',
      fitzpatrickTypes: ['II', 'III', 'IV'],
      undertones: ['Warm'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Powder Brows',
      description: 'Golden brown for warm undertones.',
    },

    // Quantum - 6 shades
    {
      id: 'q1',
      brand: 'Quantum',
      name: 'Light Ash',
      hex: '#B8860B',
      code: 'Q-LASH-01',
      fitzpatrickTypes: ['I', 'II'],
      undertones: ['Cool', 'Neutral'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Microblading',
      description: 'Light ash for fair skin with cool undertones.',
    },
    {
      id: 'q2',
      brand: 'Quantum',
      name: 'Medium Ash',
      hex: '#8B7355',
      code: 'Q-MASH-03',
      fitzpatrickTypes: ['II', 'III'],
      undertones: ['Cool', 'Neutral'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Powder Brows',
      description: 'Medium ash for natural-looking brows.',
    },
    {
      id: 'q3',
      brand: 'Quantum',
      name: 'Dark Ash',
      hex: '#654321',
      code: 'Q-DASH-05',
      fitzpatrickTypes: ['III', 'IV'],
      undertones: ['Cool', 'Neutral'],
      opacity: 'High',
      useCase: 'Eyebrows, Combination Brows',
      description: 'Dark ash for medium to dark skin tones.',
    },
    {
      id: 'q4',
      brand: 'Quantum',
      name: 'Warm Brown',
      hex: '#A0522D',
      code: 'Q-WBROWN-07',
      fitzpatrickTypes: ['II', 'III', 'IV'],
      undertones: ['Warm'],
      opacity: 'Medium',
      useCase: 'Eyebrows, Powder Brows',
      description: 'Warm brown for golden undertones.',
    },
    {
      id: 'q5',
      brand: 'Quantum',
      name: 'Rich Brown',
      hex: '#8B4513',
      code: 'Q-RBROWN-09',
      fitzpatrickTypes: ['III', 'IV', 'V'],
      undertones: ['Warm', 'Neutral'],
      opacity: 'High',
      useCase: 'Eyebrows, Powder Brows',
      description: 'Rich brown for dark skin tones.',
    },
    {
      id: 'q6',
      brand: 'Quantum',
      name: 'Deep Brown',
      hex: '#3E2723',
      code: 'Q-DBROWN-11',
      fitzpatrickTypes: ['V', 'VI'],
      undertones: ['Warm', 'Neutral'],
      opacity: 'High',
      useCase: 'Eyebrows, Powder Brows',
      description: 'Deep brown for very dark skin tones.',
    },
  ]

  const brands = ['all', 'Permablend', 'Evenflo', 'LI Pigments', 'Quantum']

  const filteredPigments = pigments.filter(pigment => {
    const matchesSearch = pigment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pigment.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pigment.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBrand = selectedBrand === 'all' || pigment.brand === selectedBrand
    return matchesSearch && matchesBrand
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Return Button */}
        <div className="flex items-center justify-between mb-8">
                <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
                  </Button>
                </Link>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Palette className="h-12 w-12 text-lavender" />
              <h1 className="text-4xl font-bold text-foreground">Pigment Library</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Professional pigment database with Fitzpatrick type recommendations, undertone matching, and color theory guidance
            </p>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search pigments by name, brand, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender focus:border-lavender"
            />
          </div>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender focus:border-lavender"
          >
            {brands.map(brand => (
              <option key={brand} value={brand}>
                {brand === 'all' ? 'All Brands' : brand}
              </option>
            ))}
          </select>
      </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPigments.length} of {pigments.length} pigments
            {selectedBrand !== 'all' && ` from ${selectedBrand}`}
          </p>
    </div>

        {/* Pigment Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPigments.map((pigment) => (
            <Card key={pigment.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-lavender/20 text-lavender">
                    {pigment.brand}
                  </Badge>
                  <Badge variant="outline">{pigment.opacity}</Badge>
            </div>
                <CardTitle className="text-lg">{pigment.name}</CardTitle>
                <CardDescription>{pigment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Color Preview */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-lg border-2 border-gray-200 shadow-md"
                      style={{ backgroundColor: pigment.hex }}
                    />
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Hex Code</div>
                      <div className="font-mono text-lg">{pigment.hex}</div>
                      <div className="text-sm font-medium">Product Code</div>
                      <div className="font-mono">{pigment.code}</div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-3">
              <div>
                      <div className="text-sm font-medium mb-1">Ideal for Fitzpatrick Types:</div>
                      <div className="flex gap-1">
                        {pigment.fitzpatrickTypes.map(type => (
                          <Badge key={type} variant="default" className="bg-lavender">
                            Type {type}
                          </Badge>
                        ))}
              </div>
            </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Best Undertones:</div>
                      <div className="flex gap-1">
                        {pigment.undertones.map(undertone => (
                          <Badge key={undertone} variant="outline">
                            {undertone}
                </Badge>
              ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 gap-2">
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

        {filteredPigments.length === 0 && (
          <div className="text-center py-12">
            <Palette className="h-16 w-16 mx-auto mb-4 text-lavender" />
            <h3 className="text-lg font-semibold mb-2">No pigments found</h3>
            <p className="text-gray-600">Try adjusting your search or brand filter</p>
          </div>
        )}

        {/* Contact Information */}
        <div className="mt-12 text-center p-6 bg-lavender/10 rounded-lg border border-lavender/20">
          <h3 className="text-lg font-semibold mb-2">Need Help with Pigment Selection?</h3>
          <p className="text-muted-foreground mb-4">
            Our team of PMU professionals is here to help you choose the perfect pigments for your clients.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Shade Chart
            </Button>
            <Button className="gap-2 bg-lavender hover:bg-lavender/90">
              Contact Support
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Email: <a href="mailto:admin@thepmuguide.com" className="text-lavender hover:underline">admin@thepmuguide.com</a>
              </p>
            </div>
          </div>
    </div>
  )
}
