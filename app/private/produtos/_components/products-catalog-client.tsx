'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit2, Search, Layers } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ProductDialog } from './product-dialog'
import { CategoryDialog } from './category-dialog'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Category = {
  id: string
  name: string
  description: string | null
  created_at?: string
}

type Product = {
  id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  stock: number
  created_at?: string
  updated_at?: string
  categories?: { name: string }
}

export function ProductsCatalogClient() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'product' | 'category'
    id: string
    name: string
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (categoriesError) throw categoriesError

      // Load products with category names
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .order('name')

      if (productsError) throw productsError

      setCategories(categoriesData || [])
      setProducts(productsData || [])
    } catch (err: Record<string, unknown>) {
      toast.error(err.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (type: 'product' | 'category', id: string) => {
    try {
      if (type === 'product') {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)

        if (error) throw error
        toast.success('Produto removido com sucesso')
      } else {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id)

        if (error) throw error
        toast.success('Categoria removida com sucesso')
      }

      setDeleteConfirm(null)
      loadData()
    } catch (err: Record<string, unknown>) {
      toast.error(err.message || 'Erro ao remover')
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' || product.category_id === selectedCategory

    return matchesSearch && matchesCategory
  })

  const getLowStockProducts = () => {
    return products.filter((p) => p.stock <= 5).length
  }

  const getTotalStockValue = () => {
    return products.reduce((sum, p) => sum + p.price * p.stock, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Produtos e Estoque</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Gerenciar catálogo de produtos e controle de estoque
          </p>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="products" className="flex-1 sm:flex-none text-xs sm:text-sm">Produtos</TabsTrigger>
          <TabsTrigger value="categories" className="flex-1 sm:flex-none text-xs sm:text-sm">Categorias</TabsTrigger>
        </TabsList>

        {/* PRODUTOS TAB */}
        <TabsContent value="products" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="p-3 sm:pb-2">
                <CardTitle className="text-[10px] sm:text-sm font-medium text-muted-foreground">
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl sm:text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3 sm:pb-2">
                <CardTitle className="text-[10px] sm:text-sm font-medium text-muted-foreground">
                  Estoque
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl sm:text-2xl font-bold">
                  {products.reduce((sum, p) => sum + p.stock, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3 sm:pb-2">
                <CardTitle className="text-[10px] sm:text-sm font-medium text-muted-foreground">
                  Baixos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">
                  {getLowStockProducts()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3 sm:pb-2">
                <CardTitle className="text-[10px] sm:text-sm font-medium text-muted-foreground">
                  Valor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl sm:text-2xl font-bold">
                  R$ {getTotalStockValue().toFixed(0)}<span className="hidden sm:inline">.{(getTotalStockValue() % 1).toFixed(2).slice(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  setEditingProduct(null)
                  setIsProductDialogOpen(true)
                }}
                className="gap-1 sm:gap-2 whitespace-nowrap h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Novo Produto</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Produtos</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {filteredProducts.length} produto(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="text-muted-foreground">Carregando produtos...</div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="text-muted-foreground">
                    {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs">
                        <TableHead className="text-xs">Nome</TableHead>
                        <TableHead className="hidden md:table-cell text-xs">Categoria</TableHead>
                        <TableHead className="text-xs">Preço</TableHead>
                        <TableHead className="text-xs">Estoque</TableHead>
                        <TableHead className="text-right text-xs">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow
                          key={product.id}
                          className={
                            product.stock <= 5 ? 'bg-orange-50 dark:bg-orange-950/20' : ''
                          }
                        >
                          <TableCell className="font-medium text-xs">
                            <div>
                              <p className="text-xs sm:text-sm">{product.name}</p>
                              {product.description && (
                                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                                  {product.description}
                                </p>
                              )}
                              <p className="text-[10px] text-muted-foreground md:hidden mt-0.5">
                                {product.categories?.name || '-'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs">
                            {product.categories?.name || '-'}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="hidden sm:inline">R$ {(product.price).toFixed(2)}</span>
                            <span className="sm:hidden">R$ {(product.price).toFixed(0)}</span>
                          </TableCell>
                          <TableCell className="text-xs">
                            <span
                              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                                product.stock <= 5
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              }`}
                            >
                              {product.stock}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8"
                                onClick={() => {
                                  setEditingProduct(product)
                                  setIsProductDialogOpen(true)
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8"
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: 'product',
                                    id: product.id,
                                    name: product.name,
                                  })
                                }
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CATEGORIAS TAB */}
        <TabsContent value="categories" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Categorias</h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                {categories.length} categoria(s)
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingCategory(null)
                setIsCategoryDialogOpen(true)
              }}
              className="gap-1 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 w-full sm:w-auto"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              Nova Categoria
            </Button>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Carregando categorias...</div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="text-muted-foreground">Nenhuma categoria cadastrada</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {categories.map((category) => {
                const categoryProductCount = products.filter(
                  (p) => p.category_id === category.id
                ).length
                return (
                  <Card key={category.id}>
                    <CardHeader className="p-4 sm:p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                            {category.name}
                          </CardTitle>
                          {category.description && (
                            <CardDescription className="mt-1 sm:mt-2 text-xs sm:text-sm">
                              {category.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="mb-3 sm:mb-4">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {categoryProductCount} produto(s)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                          onClick={() => {
                            setEditingCategory(category)
                            setIsCategoryDialogOpen(true)
                          }}
                        >
                          <Edit2 className="w-4 h-4 mr-1 sm:mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9"
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'category',
                              id: category.id,
                              name: category.name,
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ProductDialog
        open={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setEditingProduct(null)}
        onSaved={loadData}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSaved={loadData}
      />

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        type={deleteConfirm?.type}
        itemName={deleteConfirm?.name || ''}
        onConfirm={() =>
          deleteConfirm && handleDelete(deleteConfirm.type, deleteConfirm.id)
        }
      />
    </div>
  )
}
