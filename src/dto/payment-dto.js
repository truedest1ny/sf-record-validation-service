export default class PaymentDto {
  firstName = '';
  lastName = '';
  amount = 0;
  opportunity = '';

  constructor(data = {}) {
    if (data.firstName !== undefined) this.firstName = String(data.firstName).trim();
    if (data.lastName !== undefined) this.lastName = String(data.lastName).trim();
    if (data.opportunity !== undefined) this.opportunity = String(data.opportunity).trim();
    if (data.amount !== undefined) this.amount = Number(data.amount) || 0;
  }
}