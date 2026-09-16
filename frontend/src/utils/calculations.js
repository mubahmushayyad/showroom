import {LOW_STOCK} from './constants';
export const profit=(selling,purchase)=>Number(selling||0)-Number(purchase||0);
export const margin=(selling,purchase)=>Number(selling)>0?profit(selling,purchase)/Number(selling)*100:0;
export const marginLabel=m=>m>=15?'High':m>=8?'Medium':'Low';
export const isLowStock=c=>Number(c.stock||0)<=LOW_STOCK && c.status==='Available';
export const inventoryStats=(cars)=>({total:cars.length,available:cars.filter(c=>c.status==='Available').length,reserved:cars.filter(c=>c.status==='Reserved').length,sold:cars.filter(c=>c.status==='Sold').length,lowStock:cars.filter(isLowStock).length});
export const profitStats=(cars)=>cars.reduce((a,c)=>{a.purchase+=Number(c.purchaseRate||0);a.selling+=Number(c.sellingPrice||0);a.profit+=profit(c.sellingPrice,c.purchaseRate);return a;},{purchase:0,selling:0,profit:0});
