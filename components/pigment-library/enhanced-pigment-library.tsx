"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, Palette, Eye, Download, Star } from 'lucide-react'

interface Pigment {
  id: string
  brand: string
  name: string
  hex: string
  code: string
  fitzpatrickTypes: string[]
  undertones: string[]
  opacity: string
  useCase: string
  description: string
  isPopular: boolean
}

const POPULAR_BRANDS = [
  'Permablend',
  'Evenflo',
  'LI Pigments',
  'Quantum',
  'TruBlend',
  'Fusion',
  'Inkology',
  'Eternal'
]

const FITZPATRICK_TYPES = ['I', 'II', 'III', 'IV', 'V', 'VI']
const UNDERTONES = ['Cool', 'Neutral', 'Warm']

// Comprehensive pigment database
const PIGMENT_DATABASE: Pigment[] = [
  // Permablend
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
    isPopular: true
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
    isPopular: true
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
    isPopular: true
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
    isPopular: false
  },

  // Evenflo
  {
    id: 'ef1',
    brand: 'Evenflo',
    name: 'Cool Ash',
    hex: '#6B4423',
    code: 'EF-COOL-01',
    fitzpatrickTypes: ['I', 'II'],
    undertones: ['Cool'],
    opacity: 'Medium',
    useCase: 'Eyebrows, Microblading',
    description: 'Cool ash tone perfect for fair skin with cool undertones.',
    isPopular: true
  },
  {
    id: 'ef2',
    brand: 'Evenflo',
    name: 'Neutral Brown',
    hex: '#8B7355',
    code: 'EF-NEUT-02',
    fitzpatrickTypes: ['II', 'III'],
    undertones: ['Neutral'],
    opacity: 'Medium',
    useCase: 'Eyebrows, Powder Brows',
    description: 'True neutral brown that works with any undertone.',
    isPopular: true
  },
  {
    id: 'ef3',
    brand: 'Evenflo',
    name: 'Warm Caramel',
    hex: '#D2691E',
    code: 'EF-WARM-03',
    fitzpatrickTypes: ['III', 'IV'],
    undertones: ['Warm'],
    opacity: 'High',
    useCase: 'Eyebrows, Lip Color',
    description: 'Warm caramel perfect for medium skin with warm undertones.',
    isPopular: false
  },

  // LI Pigments
  {
    id: 'li1',
    brand: 'LI Pigments',
    name: 'Light Ash',
    hex: '#A0826D',
    code: 'LI-ASH-01',
    fitzpatrickTypes: ['I', 'II'],
    undertones: ['Cool', 'Neutral'],
    opacity: 'Medium',
    useCase: 'Eyebrows, Microblading',
    description: 'Light ash tone for very fair skin types.',
    isPopular: true
  },
  {
    id: 'li2',
    brand: 'LI Pigments',
    name: 'Medium Brown',
    hex: '#8B4513',
    code: 'LI-MED-02',
    fitzpatrickTypes: ['II', 'III', 'IV'],
    undertones: ['Neutral', 'Warm'],
    opacity: 'High',
    useCase: 'Eyebrows, Powder Brows',
    description: 'Versatile medium brown for multiple skin types.',
    isPopular: true
  },
  {
    id: 'li3',
    brand: 'LI Pigments',
    name: 'Dark Brown',
    hex: '#3E2723',
    code: 'LI-DARK-03',
    fitzpatrickTypes: ['V', 'VI'],
    undertones: ['Warm', 'Neutral'],
    opacity: 'High',
    useCase: 'Eyebrows, Powder Brows',
    description: 'Deep dark brown for very dark skin tones.',
    isPopular: false
  },

  // Quantum
  {
    id: 'q1',
    brand: 'Quantum',
    name: 'Quantum Ash',
    hex: '#6B4423',
    code: 'Q-ASH-01',
    fitzpatrickTypes: ['I', 'II'],
    undertones: ['Cool'],
    opacity: 'Medium',
    useCase: 'Eyebrows, Microblading',
    description: 'Quantum technology ensures consistent color retention.',
    isPopular: true
  },
  {
    id: 'q2',
    brand: 'Quantum',
    name: 'Quantum Brown',
    hex: '#8B4513',
    code: 'Q-BROWN-02',
    fitzpatrickTypes: ['II', 'III', 'IV'],
    undertones: ['Neutral', 'Warm'],
    opacity: 'High',
    useCase: 'Eyebrows, Powder Brows',
    description: 'Advanced formula for superior color stability.',
    isPopular: true
  },
  {
    id: 'q3',
    brand: 'Quantum',
    name: 'Quantum Dark',
    hex: '#654321',
    code: 'Q-DARK-03',
    fitzpatrickTypes: ['V', 'VI'],
    undertones: ['Warm'],
    opacity: 'High',
    useCase: 'Eyebrows, Powder Brows',
    description: 'Deep quantum pigment for dark skin retention.',
    isPopular: false
  }
]

export function EnhancedPigmentLibrary() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedFitzpatrick, setSelectedFitzpatrick] = useState('')
  const [selectedUndertone, setSelectedUndertone] = useState('')
  const [selectedPigment, setSelectedPigment] = useState<Pigment | null>(null)

  // Filter pigments based on search and filters
  const filteredPigments = PIGMENT_DATABASE.filter(pigment => {
    const matchesSearch = pigment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pigment.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pigment.code.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesBrand = !selectedBrand || pigment.brand === selectedBrand
    const matchesFitzpatrick = !selectedFitzpatrick || pigment.fitzpatrickTypes.includes(selectedFitzpatrick)
    const matchesUndertone = !selectedUndertone || pigment.undertones.includes(selectedUndertone)

    return matchesSearch && matchesBrand && matchesFitzpatrick && matchesUndertone
  })

  const handlePigmentSelect = (pigment: Pigment) => {
    setSelectedPigment(pigment)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedBrand('')
    setSelectedFitzpatrick('')
    setSelectedUndertone('')
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-lavender to-lavender-600 bg-clip-text text-transparent">
          Enhanced Pigment Library
        </h1>
        <p className="text-lg text-muted-foreground">
          Professional PMU pigments with Fitzpatrick and undertone recommendations
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Pigments</Label>
              <Input
                id="search"
                placeholder="Search by name, brand, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Brands</SelectItem>
                  {POPULAR_BRANDS.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fitzpatrick">Fitzpatrick Type</Label>
              <Select value={selectedFitzpatrick} onValueChange={setSelectedFitzpatrick}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {FITZPATRICK_TYPES.map(type => (
                    <SelectItem key={type} value={type}>Type {type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="undertone">Undertone</Label>
              <Select value={selectedUndertone} onValueChange={setSelectedUndertone}>
                <SelectTrigger>
                  <SelectValue placeholder="All Undertones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Undertones</SelectItem>
                  {UNDERTONES.map(undertone => (
                    <SelectItem key={undertone} value={undertone}>{undertone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {filteredPigments.length} pigments found
            </span>
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pigment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPigments.map((pigment) => (
          <Card 
            key={pigment.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedPigment?.id === pigment.id ? 'ring-2 ring-lavender' : ''
            }`}
            onClick={() => handlePigmentSelect(pigment)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{pigment.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="font-medium text-lavender-600">{pigment.brand}</span>
                    {pigment.isPopular && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {pigment.code}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Color Swatch */}
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-gray-200 shadow-sm"
                  style={{ backgroundColor: pigment.hex }}
                />
                <div className="space-y-1">
                  <div className="text-sm font-medium">Color Code</div>
                  <div className="text-xs font-mono text-muted-foreground">{pigment.hex}</div>
                </div>
              </div>

              {/* Fitzpatrick & Undertone */}
              <div className="space-y-2">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Fitzpatrick Types</Label>
                  <div className="flex gap-1 mt-1">
                    {pigment.fitzpatrickTypes.map(type => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        Type {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Undertones</Label>
                  <div className="flex gap-1 mt-1">
                    {pigment.undertones.map(undertone => (
                      <Badge key={undertone} variant="outline" className="text-xs">
                        {undertone}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Use Case & Opacity */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Use Case</Label>
                  <p className="text-xs">{pigment.useCase}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Opacity</Label>
                  <p className="text-xs">{pigment.opacity}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{pigment.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Pigment Details */}
      {selectedPigment && (
        <Card className="border-lavender/30 bg-lavender/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-lavender" />
              {selectedPigment.brand} - {selectedPigment.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Color Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-20 h-20 rounded-lg border-2 border-gray-200 shadow-md"
                      style={{ backgroundColor: selectedPigment.hex }}
                    />
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Hex Code</div>
                      <div className="font-mono text-lg">{selectedPigment.hex}</div>
                      <div className="text-sm font-medium">Product Code</div>
                      <div className="font-mono">{selectedPigment.code}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Recommendations</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Ideal for Fitzpatrick Types:</Label>
                    <div className="flex gap-1 mt-1">
                      {selectedPigment.fitzpatrickTypes.map(type => (
                        <Badge key={type} variant="default" className="bg-lavender">
                          Type {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Best Undertones:</Label>
                    <div className="flex gap-1 mt-1">
                      {selectedPigment.undertones.map(undertone => (
                        <Badge key={undertone} variant="outline">
                          {undertone}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Use Case:</Label>
                    <p className="text-sm mt-1">{selectedPigment.useCase}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Opacity:</Label>
                    <p className="text-sm mt-1">{selectedPigment.opacity}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Description:</Label>
              <p className="text-sm mt-1">{selectedPigment.description}</p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                View Shade Chart
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download Specs
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
