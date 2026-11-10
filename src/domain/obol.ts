import type { AppState } from './types'
import { dueItemsForRange, isPaidOccurrence } from './calendar'
import { isValidDateString } from './dates'
export type Frequency = 'monthly' | 'twice-monthly' | 'fortnightly' | 'weekly'
export interface Bill { key:string; id:string; kind:'recurring'|'oneOff'|'debt'; name:string; amount:number; date:string }
export interface IncomeSource { id:string; name:string; amount:number; date:string; frequency:Frequency }
export interface ObolState {
 start:string; nextPayday:string; frequency:Frequency; expectedIncome:number; openingBalance:number; reserveBills:boolean;
 capturedSpend:Record<string,number>; received:{id:string;amount:number;date:string;note:string}[];
 payments:{key:string;amount:number;date:string}[]; carried:Bill[]; sources:IncomeSource[]; name:string;
}
const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100
export function addDays(date:string,n:number) { const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10) }
export function nextPayday(date:string,f:Frequency):string {
 if(f==='weekly'||f==='fortnightly')return addDays(date,f==='weekly'?7:14)
 const d=new Date(date+'T12:00:00Z'),day=d.getUTCDate(),y=d.getUTCFullYear(),m=d.getUTCMonth()
 if(f==='twice-monthly')return day<15?new Date(Date.UTC(y,m,15)).toISOString().slice(0,10):day<new Date(Date.UTC(y,m+1,0)).getUTCDate()?new Date(Date.UTC(y,m+1,0)).toISOString().slice(0,10):new Date(Date.UTC(y,m+1,15)).toISOString().slice(0,10)
 return new Date(Date.UTC(y,m+1,Math.min(day,new Date(Date.UTC(y,m+2,0)).getUTCDate()))).toISOString().slice(0,10)
}
export function normalizeObol(raw:unknown):ObolState|undefined {
 if(!raw||typeof raw!=='object')return undefined
 const o=raw as ObolState
 if(!isValidDateString(o.start)||!isValidDateString(o.nextPayday)||o.nextPayday<=o.start||!['monthly','twice-monthly','fortnightly','weekly'].includes(o.frequency)||!Number.isFinite(o.openingBalance)||!Number.isFinite(o.expectedIncome)||!o.capturedSpend||!Array.isArray(o.received)||!Array.isArray(o.payments)||!Array.isArray(o.carried)||!Array.isArray(o.sources))throw new Error('Obol pay-cycle data is invalid. Original data has been preserved.')
 for(const n of Object.values(o.capturedSpend))if(!Number.isFinite(n))throw new Error('Invalid saved expense baseline')
 for(const x of [...o.received,...o.payments,...o.carried,...o.sources])if(!Number.isFinite(x.amount)||x.amount<0||!isValidDateString(x.date))throw new Error('Invalid saved pay-cycle entry')
 return {...o,name:typeof o.name==='string'?o.name:'',reserveBills:o.reserveBills!==false}
}
export function configureCycle(state:AppState, p:{nextPayday:string;frequency:Frequency;expectedIncome:number;balance:number;reserveBills:boolean},date:string):AppState {
 if(!isValidDateString(p.nextPayday)||p.nextPayday<=date||!Number.isFinite(p.balance)||!Number.isFinite(p.expectedIncome)||p.expectedIncome<0)throw new Error('Choose a future payday and valid amounts.')
 return {...state,obol:{start:date,nextPayday:p.nextPayday,frequency:p.frequency,expectedIncome:p.expectedIncome,openingBalance:p.balance,reserveBills:p.reserveBills,capturedSpend:Object.fromEntries(state.dailySpend.map(x=>[x.id,x.amount])),received:[],payments:[],carried:state.obol?allowance(state,date).bills.filter(b=>b.date<date):[],sources:state.obol?.sources??[],name:state.obol?.name??''}}
}
export function allowance(state:AppState,date:string) {
 const o=state.obol
 if(!o)return {balance:0,reserved:0,free:0,days:0,daily:0,safe:0,spentToday:0,bills:[] as Bill[],expired:false}
 const days=Math.max(1,Math.round((Date.parse(o.nextPayday)-Date.parse(date))/86400000))
 const delta=state.dailySpend.reduce((n,x)=>n+x.amount-(o.capturedSpend[x.id]??0),0)-Object.entries(o.capturedSpend).filter(([id])=>!state.dailySpend.some(x=>x.id===id)).reduce((n,[,a])=>n+a,0)
 const balance=round(o.openingBalance-delta+o.received.reduce((n,x)=>n+x.amount,0)-o.payments.reduce((n,x)=>n+x.amount,0))
 const upcoming=dueItemsForRange(state,o.start,addDays(o.nextPayday,-1)).filter(b=>!isPaidOccurrence(state,b,b.date)).map(b=>({key:`${b.kind}:${b.item.id}:${b.date}`,id:b.item.id,kind:b.kind,name:b.item.name,amount:b.item.amount,date:b.date}))
 const bills=[...o.carried,...upcoming].filter((b,i,a)=>a.findIndex(x=>x.key===b.key)===i&&!o.payments.some(p=>p.key===b.key)).sort((a,b)=>a.date.localeCompare(b.date))
 const reserved=o.reserveBills?round(bills.reduce((n,b)=>n+b.amount,0)):0
 const free=round(balance-reserved),spentToday=round(state.dailySpend.filter(x=>x.date===date).reduce((n,x)=>n+x.amount,0))
 const daily=round((free+spentToday)/days)
 return {balance,reserved,free,days,daily,safe:round(daily-spentToday),spentToday,bills,expired:date>=o.nextPayday}
}
export function payBill(state:AppState,bill:Bill,date:string):AppState {
 const o=state.obol;if(!o||o.payments.some(p=>p.key===bill.key)||(state.paidOccurrences??[]).some(p=>p.kind===bill.kind&&p.itemId===bill.id&&p.date===bill.date))return state
 return {...state,paidOccurrences:[...(state.paidOccurrences??[]),{kind:bill.kind,itemId:bill.id,date:bill.date}],obol:{...o,payments:[...o.payments,{key:bill.key,amount:o.reserveBills?bill.amount:0,date}]}}
}
export function rollover(state:AppState,received:number,date:string):AppState {
 if(!state.obol||!Number.isFinite(received)||received<0)throw new Error('Enter the income actually received.')
 const previous=allowance(state,date);let next=nextPayday(state.obol.nextPayday,state.obol.frequency)
 while(next<=date)next=nextPayday(next,state.obol.frequency)
 const configured=configureCycle(state,{nextPayday:next,frequency:state.obol.frequency,expectedIncome:state.obol.expectedIncome,balance:previous.balance+received,reserveBills:state.obol.reserveBills},date)
 return {...configured,obol:{...configured.obol!,carried:previous.bills}}
}
export function evaluateAmount(value:string):number|null {
 const clean=value.replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-').replace(/\s/g,'')
 if(!/^\d*\.?\d+(?:[+*/-]\d*\.?\d+)*$/.test(clean))return null
 const parts=clean.match(/\d*\.?\d+|[+*/-]/g)!,terms:number[]=[Number(parts[0])],signs:string[]=[]
 for(let i=1;i<parts.length;i+=2){const n=Number(parts[i+1]),op=parts[i];if(op==='*'||op==='/')terms[terms.length-1]=op==='*'?terms.at(-1)!*n:terms.at(-1)!/n;else{signs.push(op);terms.push(n)}}
 const result=terms.reduce((n,v,i)=>i===0?v:signs[i-1]==='+'?n+v:n-v,0)
 return Number.isFinite(result)&&Math.abs(result)<=1e12?round(result):null
}
