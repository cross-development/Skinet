import { nanoid } from 'nanoid';

export type CartType = {
  id: string;
  items: CartItem[];
  deliveryMethodId?: number;
  paymentIntentId?: string;
  clientSecret?: string;
  coupon?: Coupon;
};

export type CartItem = {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  pictureUrl: string;
  brand: string;
  type: string;
};

export type Coupon = {
  couponId: string;
  name: string;
  amountOff?: number;
  percentOff?: number;
  promotionCode: string;
};

export class Cart implements CartType {
  public id: string = nanoid();
  public items: CartItem[] = [];
  public deliveryMethodId?: number;
  public paymentIntentId?: string;
  public clientSecret?: string;
  public coupon?: Coupon;
}
