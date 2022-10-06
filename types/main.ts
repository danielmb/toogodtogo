import { AxiosProxyConfig } from 'axios';
export enum EndPoints {
  item = 'item/v7/',
  authEmail = 'auth/v3/authByEmail',
  authPolling = 'auth/v3/authByRequestPollingId',
  signUpEmail = 'auth/v3/signUpByEmail',
  refreshToken = 'auth/v3/token/refresh',
  activeOrder = 'order/v6/active',
  inactiveOrder = 'order/v6/inactive',
}

export type ApiConfig = {
  baseURL?: string;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  userAgent?: string;
  language?: string;
  proxies?: AxiosProxyConfig;
  timeout?: number;
  accessTokenLifetime?: number;
  deviceType?: string;
};

export interface PollingSuccessful {
  access_token: string;
  access_token_ttl_seconds: number;
  refresh_token: string;
  startup_data: StartupData;
}

export interface StartupData {
  user: User;
  app_settings: AppSettings;
  user_settings: UserSettings;
  orders: Orders;
}

export interface AppSettings {
  on_app_open_message: string;
  open_message_type: string;
  open_message_url: string;
  countries: CountryElement[];
  purchase_rating_start: string;
  purchase_rating_end: string;
  purchase_rating_delay: number;
}

export interface CountryElement {
  country_iso_code: string;
  terms_url: string;
  terms_version: number;
  manufacturer_terms_url: string;
  manufacturer_terms_version: number;
  privacy_url: string;
  prompt_for_newsletter_opt_in: boolean;
}

export interface Orders {
  current_time: string;
  has_more: boolean;
  orders: Order[];
}

export interface Order {
  order_id: string;
  state: string;
  cancel_until: string;
  redeem_interval: Interval;
  pickup_interval: Interval;
  store_time_zone: string;
  quantity: number;
  price_including_taxes: PriceExcludingTaxes;
  price_excluding_taxes: PriceExcludingTaxes;
  total_applied_taxes: PriceExcludingTaxes;
  sales_taxes: SalesTax[];
  pickup_location: PickupLocation;
  can_be_rated: boolean;
  is_rated: boolean;
  time_of_purchase: string;
  store_id: string;
  store_name: string;
  store_branch: string;
  store_logo: ItemCoverImage;
  item_id: string;
  item_name: string;
  item_cover_image: ItemCoverImage;
  food_handling_instructions: string;
  is_buffet: boolean;
  can_user_supply_packaging: boolean;
  packaging_option: string;
  pickup_window_changed: boolean;
  is_store_we_care: boolean;
  can_show_best_before_explainer: boolean;
  show_sales_taxes: boolean;
  order_type: string;
}

export interface ItemCoverImage {
  picture_id: string;
  current_url: string;
  is_automatically_created: boolean;
}

export interface Interval {
  start: string;
  end: string;
}

export interface PickupLocation {
  address: Address;
  location: BoundNe;
}

export interface Address {
  country: AddressCountry;
  address_line: string;
  city: string;
  postal_code: string;
}

export interface AddressCountry {
  iso_code: string;
  name: string;
}

export interface BoundNe {
  longitude: number;
  latitude: number;
}

export interface PriceExcludingTaxes {
  code: string;
  minor_units: number;
  decimals: number;
}

export interface SalesTax {
  tax_description: string;
  tax_percentage: number;
  tax_amount: PriceExcludingTaxes;
}

export interface User {
  user_id: string;
  name: string;
  country_id: string;
  email: string;
  phone_country_code: string;
  phone_number: string;
  is_partner: boolean;
  newsletter_opt_in: boolean;
  push_notifications_opt_in: boolean;
}

export interface UserSettings {
  country_iso_code: string;
  phone_country_code_suggestion: string;
  is_user_email_verified: boolean;
  terms_url: string;
  terms_version: number;
  manufacturer_terms_url: string;
  manufacturer_terms_version: number;
  privacy_url: string;
  contact_form_url: string;
  blog_url: string;
  careers_url: string;
  education_url: string;
  instagram_url: string;
  store_signup_url: string;
  store_contact_url: string;
  bound_sw: BoundNe;
  bound_ne: BoundNe;
  meals_saved: MealsSaved;
  has_any_vouchers: boolean;
  can_show_best_before_explainer: boolean;
  has_expired_payment_methods: boolean;
  show_manufacturer_items: boolean;
  braze_external_id: string;
  has_active_email_change_request: boolean;
  approved_terms_and_conditions: any[];
  feature_experiments: any[];
}

export interface MealsSaved {
  country_iso_code: string;
  share_url: string;
  image_url: string;
  meals_saved_last_month: number;
  month: number;
  year: number;
}
