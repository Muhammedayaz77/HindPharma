import { API_BASE_URL } from '../API/apiConfig.js';
const CURRENT_SHOP_KEY='hindPharmaCurrentShop';
const DEFAULT_TENANTS=[{id:1,slug:'hind-pharma',business_name:'Hind Pharma',subtitle:'Surgical and Generic Medicine Distributor',address:'Shop No. 2, Tipu Sultan Road, Quadri Colony, Nanded-431604.',phone:'9028773301',email:'hindpharma07@gmail.com',dl_20b:'MH-NAN-20B-455829',dl_21b:'MH-NAN-21B-455830',fssai:'',gstin:'27BFSPA3240L1ZB',logo:'../Assets/Images/hind-pharma-default.svg',barcode:'',upi:'HINDPHARMA2022@SBI',is_active:true},{id:2,slug:'india-medical-agency',business_name:'India Medical Agency',subtitle:'Pharmaceutical Distributor',address:'',phone:'',email:'',logo:'../Assets/Images/india-medical-agency-default.svg',upi:'',is_active:true}];
function slugFromLocation(){const match=location.pathname.match(/\/shop\/([^/]+)/i);if(match)return match[1].toLowerCase();const query=new URLSearchParams(location.search).get('shop');return query?.toLowerCase()||localStorage.getItem(CURRENT_SHOP_KEY)||'hind-pharma'}
export const TenantService={
currentSlug(){return slugFromLocation()},
current(){return DEFAULT_TENANTS.find(t=>t.slug===this.currentSlug())||DEFAULT_TENANTS[0]},
async loadCurrent(){const slug=this.currentSlug();try{const r=await fetch(`${API_BASE_URL}/tenant/${encodeURIComponent(slug)}`,{cache:'no-store'});if(r.ok){const t=await r.json();localStorage.setItem(CURRENT_SHOP_KEY,t.slug);return t}}catch(_){}const fallback=this.current();if(fallback.slug!==slug)throw new Error('Shop not found.');return fallback}
};
