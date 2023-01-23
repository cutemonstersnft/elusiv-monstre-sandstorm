import Products from '../../components/Products'
import SiteHeading from '../../components/SiteHeading'

export default function ShopPage() {
  return (
    <div className="flex flex-col items-stretch max-w-4xl gap-8 m-auto">
      <Products submitTarget='/topup/checkout' enabled={true} />    </div>
  )
}