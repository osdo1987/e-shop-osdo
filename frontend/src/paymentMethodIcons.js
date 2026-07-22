import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import SmartphoneIcon from '@mui/icons-material/Smartphone'
import PaymentIcon from '@mui/icons-material/Payment'
import WalletIcon from '@mui/icons-material/Wallet'
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'

const ICON_MAP = {
  AttachMoneyIcon, AttachMoney: AttachMoneyIcon,
  CreditCardIcon, CreditCard: CreditCardIcon,
  AccountBalanceIcon, AccountBalance: AccountBalanceIcon,
  SmartphoneIcon, Smartphone: SmartphoneIcon,
  PaymentIcon, Payment: PaymentIcon,
  WalletIcon, Wallet: WalletIcon,
  CurrencyBitcoinIcon, CurrencyBitcoin: CurrencyBitcoinIcon,
  LocalAtmIcon, LocalAtm: LocalAtmIcon,
  PointOfSaleIcon, PointOfSale: PointOfSaleIcon,
}

export function getIconByName(name) {
  return ICON_MAP[name] || PaymentIcon
}

export const PAYMENT_METHODS_CACHE = {
  data: null,
  promise: null,
}

export async function fetchPaymentMethods(force = false) {
  if (!force && PAYMENT_METHODS_CACHE.data) return PAYMENT_METHODS_CACHE.data
  if (PAYMENT_METHODS_CACHE.promise) return PAYMENT_METHODS_CACHE.promise

  PAYMENT_METHODS_CACHE.promise = (async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/payment-methods', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        PAYMENT_METHODS_CACHE.data = data
        return data
      }
      return getDefaultPaymentMethods()
    } catch {
      return getDefaultPaymentMethods()
    } finally {
      PAYMENT_METHODS_CACHE.promise = null
    }
  })()

  return PAYMENT_METHODS_CACHE.promise
}

export async function fetchPublicPaymentMethods(storeId) {
  try {
    const res = await fetch(`/api/payment-methods/public/${storeId}`)
    if (res.ok) {
      return await res.json()
    }
    return getDefaultPaymentMethods()
  } catch {
    return getDefaultPaymentMethods()
  }
}

export function getDefaultPaymentMethods() {
  return [
    { code: 'EFECTIVO', name: 'Efectivo', icon: 'AttachMoneyIcon', color: '#22c55e', is_cash: true },
    { code: 'TARJETA', name: 'Tarjeta', icon: 'CreditCardIcon', color: '#3b82f6', is_cash: false },
    { code: 'TRANSFERENCIA', name: 'Transferencia', icon: 'AccountBalanceIcon', color: '#2563eb', is_cash: false },
    { code: 'NEQUI', name: 'Nequi', icon: 'SmartphoneIcon', color: '#06b6d4', is_cash: false },
    { code: 'DAVIPLATA', name: 'Daviplata', icon: 'SmartphoneIcon', color: '#f59e0b', is_cash: false },
  ]
}
