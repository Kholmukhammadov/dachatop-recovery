import { Wp_posts } from '../entities/wp_posts.entity';
import { Wp_homey_map } from '../entities/wp_homey_map.entity';
import { PostOptionModel } from './post-option.model';
import { AbstarctModel } from './abstarct.model';

export class PostModel extends AbstarctModel<Wp_posts> {
  post_parent?: Wp_posts;
  post_child?: Wp_posts[] = [];
  post_options?: PostOptionModel = {};
  post_location?: Wp_homey_map;
}

export enum MetaOptionEnum {
  MAXIMUM_GUESTS = <any>'homey_total_guests_plus_additional_guests',
  THUMBNAIL_ID = <any>'_thumbnail_id',
  BEDROOMS = <any>'homey_listing_bedrooms',
  EXPECTED_GUESTS = <any>'homey_guests',
  BEDS = <any>'homey_beds',
  BATHS = <any>'homey_baths',
  ROOMS = <any>'homey_listing_rooms',
  IS_RECOMENDED = <any>'homey_featured',
  IS_MON_FRI_CLOSED = <any>'homey_mon_fri_closed',
  IS_SAT_CLOSED = <any>'homey_sat_closed',
  IS_SUN_CLOSED = <any>'homey_sun_closed',
  INSTANT_BOOKING = <any>'homey_instant_booking',
  SAMPLE_PRICE = <any>'homey_night_price',
  WEEKENDS_PRICE = <any>'homey_weekends_price',
  WEEKENDS_DAYS = <any>'homey_weekends_days',
  ADDITIONAL_GUESTS = <any>'homey_allow_additional_guests',
  CLEANING_FEE_TYPE = <any>'homey_cleaning_fee_type',
  CITY_FEE_TYPE = <any>'homey_city_fee_type',
  SHOW_MAP = <any>'homey_show_map',
  LOCATION = <any>'homey_listing_location',
  ACCOMODATION = <any>'homey_accomodation',
  SERVICES = <any>'homey_services',
  CHECK_IN_AFTER = <any>'homey_checkin_after',
  CHECK_OUT_BEFORE = <any>'homey_checkout_before',
  CAN_SMOKE = <any>'homey_smoke',
  CAN_PET = <any>'homey_pets',
  CAN_PARTY = <any>'homey_party',
  CAN_CHILDREN = <any>'homey_children',
  HOME_SLIDER = <any>'homey_homeslider',
  TOTAL_RATING = <any>'listing_total_rating',
  LAT = <any>'homey_geolocation_lat',
  LONG = <any>'homey_geolocation_long',
  LAST_UPDATE = <any>'_edit_lock',
  IMAGE_ID = <any>'homey_listing_images',
  ADDITIONAL_RULES = <any>'homey_additional_rules',
  BOOKING = <any>'reservation_unavailable',
}

export enum DefaultMetaEnum {
  // THIS SHOULD BE 1
  PREFERED0 = '_edit_last',
  //THIS SHOULD BE 'NULL' OR #post_title #separator_sa #site_title
  PREFERED1 = '_aioseo_title',
  //THIS SHOULD BE 'NULL' OR #post_excerpt
  PREFERED2 = '_aioseo_description',
  PREFERED3 = '_aioseo_keywords',
  //THIS SHOULD BE NULL
  PREFERED4 = '_aioseo_og_title',
  //THIS SHOULD BE NULL
  PREFERED5 = '_aioseo_og_description',
  PREFERED6 = '_aioseo_og_article_section',
  PREFERED7 = '_aioseo_og_article_tags',
  //THIS SHOULD BE NULL
  PREFERED8 = '_aioseo_twitter_title',
  //THIS SHOULD BE NULL
  PREFERED9 = '_aioseo_twitter_description',
  PREFERED10 = 'rs_page_bg_color',
}

export enum DefaultMetaEnumValue {
  PREFERED0 = '1',
  PREFERED1 = '#post_title #separator_sa #site_title',
  PREFERED2 = '#post_excerpt',
  PREFERED3 = '_aioseo_keywords',
  PREFERED4 = 'NULL',
  PREFERED5 = 'NULL',
  PREFERED6 = '',
  PREFERED7 = '',
  PREFERED8 = 'NULL',
  PREFERED9 = 'NULL',
  PREFERED10 = '',
}
