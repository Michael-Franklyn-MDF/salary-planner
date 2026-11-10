import { describe, expect, it } from 'vitest'
import { migrateState } from './migrate'
import { allowance, configureCycle, evaluateAmount, nextPayday, payBill, rollover } from './obol'
function fixture() {
 const state = migrateState(null)
 state.recurring = [{ id:'rent', name:'Rent', amount:45000, dayOfMonth:20, note:'' }]
 return configureCycle(state, { nextPayday:'2026-11-28', frequency:'monthly', expectedIncome:60000, balance:87300, reserveBills:true }, '2026-11-10')
}
describe('Obol pay cycles', () => {
 it('reserves bills and divides available money across days to payday', () => {
  const s=fixture(); expect(allowance(s,'2026-11-10')).toMatchObject({free:42300, days:18, daily:2350, safe:2350})
  s.dailySpend.push({id:'lunch',amount:1200,date:'2026-11-10',category:'cat-food',note:''})
  expect(allowance(s,'2026-11-10')).toMatchObject({balance:86100, daily:2350,safe:1150})
  expect(allowance(s,'2026-11-11').daily).toBe(2417.65)
 })
 it('paying a reserved bill reduces balance and reservation once, leaving free money unchanged', () => {
  const s=fixture(), bill=allowance(s,'2026-11-10').bills[0]
  const paid=payBill(s,bill,'2026-11-10')
  expect(allowance(paid,'2026-11-10')).toMatchObject({balance:42300,reserved:0,free:42300})
  expect(payBill(paid,bill,'2026-11-10')).toEqual(paid)
 })
 it('does not reserve bills twice when income already excludes them', () => {
  const s=fixture();s.obol!.reserveBills=false
  expect(allowance(s,'2026-11-10').reserved).toBe(0)
  const paid=payBill(s,allowance(s,'2026-11-10').bills[0],'2026-11-10')
  expect(allowance(paid,'2026-11-10').balance).toBe(87300)
 })
 it('keeps negative amounts visible when bills exceed balance', () => {
  const s=fixture();s.obol!.openingBalance=1000
  expect(allowance(s,'2026-11-10').free).toBe(-44000)
  expect(allowance(s,'2026-11-10').safe).toBeLessThan(0)
 })
 it('carries unpaid bills and balance into the next cycle without counting old expenses again', () => {
  const s=fixture(); s.dailySpend.push({id:'x',amount:100,date:'2026-11-10',category:'cat-other',note:''})
  const n=rollover(s,60000,'2026-11-28')
  expect(allowance(n,'2026-11-28')).toMatchObject({balance:147200,reserved:90000})
  expect(n.obol!.nextPayday).toBe('2026-12-28')
 })
 it('keeps existing expenses when starting a cycle, without double subtracting them',()=>{
  const s=fixture();s.dailySpend.push({id:'x',amount:1200,date:'2026-11-10',category:'cat-other',note:''})
  const n=configureCycle(s,{nextPayday:'2026-11-28',frequency:'monthly',expectedIncome:60000,balance:86100,reserveBills:true},'2026-11-10')
  expect(allowance(n,'2026-11-10').balance).toBe(86100)
  expect(allowance(n,'2026-11-10').safe).toBe(1150)
  expect(migrateState(n).obol).toEqual(n.obol)
 })
 it('handles month ends and twice-monthly dates',()=>{
  expect(nextPayday('2026-01-31','monthly')).toBe('2026-02-28')
  expect(nextPayday('2026-11-15','twice-monthly')).toBe('2026-11-30')
  expect(nextPayday('2026-11-30','twice-monthly')).toBe('2026-12-15')
 })
 it('evaluates arithmetic without executing code and rejects incomplete or invalid amounts',()=>{
  expect(evaluateAmount('500 + 700')).toBe(1200)
  expect(evaluateAmount('10 + 2 × 3')).toBe(16)
  expect(evaluateAmount('1 / 0')).toBeNull()
  expect(evaluateAmount('1 +')).toBeNull()
  expect(evaluateAmount('alert(1)')).toBeNull()
 })
})
