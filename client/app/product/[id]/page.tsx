import { Navbar } from "@/components/navbar"
import { CartDrawer } from "@/components/cart-drawer"
import { ProductDetail } from "../../../components/product-detail"
import { fetchProductById } from "@/lib/products.firestore"
import { notFound } from "next/navigation"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await fetchProductById(id)
  if (!product) notFound()

  return (
    <>
      <Navbar />
      <ProductDetail product={product} />
      <CartDrawer />
    </>
  )
}
