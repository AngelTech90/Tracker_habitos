// calendar.js
export class CalendarManager {
  constructor(){
    this.habitId = null;
    this.month = null;
    this.year = null;
    this.checkedDays = [];
  }

  init(habitId, month, year, onChangeCb){
    this.habitId = habitId;
    this.month = month;
    this.year = year;
    this.onChange = onChangeCb || function(){};
    const key = this._key();
    this.checkedDays = JSON.parse(localStorage.getItem(key) || '[]');
  }

  _key() {
    return `habit_${this.habitId}_${this.year}_${this.month}`;
  }

  getDaysInMonth(){
    return new Date(this.year, this.month + 1, 0).getDate();
  }

  isChecked(day){
    return this.checkedDays.includes(day);
  }

  toggleDay(day){
    const idx = this.checkedDays.indexOf(day);
    if (idx === -1) this.checkedDays.push(day);
    else this.checkedDays.splice(idx,1);
    this.checkedDays.sort((a,b)=>a-b);
    this.onChange(this.getProgress());
  }

  clearAll(){
    this.checkedDays = [];
    this.onChange(this.getProgress());
  }

  save(){
    localStorage.setItem(this._key(), JSON.stringify(this.checkedDays));
  }

  getProgress(){
    const total = this.getDaysInMonth();
    const checked = this.checkedDays.length;
    const percent = Math.round((checked / total) * 100);
    return { checkedCount: checked, totalDays: total, percent };
  }

  renderDaysGrid(container){
    container.innerHTML = '';
    const days = this.getDaysInMonth();
    for (let d=1; d<=days; d++){
      const el = document.createElement('div');
      el.className = 'day-item' + (this.isChecked(d) ? ' checked' : '');
      el.textContent = d;
      el.dataset.day = d;
      el.addEventListener('click', () => {
        this.toggleDay(d);
        el.classList.toggle('checked');
      });
      container.appendChild(el);
    }
    this.onChange(this.getProgress());
  }
}
