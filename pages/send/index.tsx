import Products from '../../components/Products'

export default function ShopPage() {
  return (
    <div className="flex flex-col items-stretch max-w-4xl gap-8 m-auto">
      <Products submitTarget='/send/checkout' enabled={true} />
      </div>
  )
}