// Seller product form — wraps AdminProductForm with shop_id injection
import { useAuth } from '../../lib/AuthContext'
import AdminProductForm from '../admin/AdminProductForm'

export default function SellerProductForm() {
  const { shopId } = useAuth()
  return <AdminProductForm sellerShopId={shopId} sellerMode />
}
