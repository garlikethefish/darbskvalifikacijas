import { reactive } from 'vue';

export const SOLAR_WEIGHTS = ['Bold', 'BoldDuotone', 'Linear', 'LineDuotone', 'Outline', 'Broken'];

export const solarConfig = reactive({
  weight: localStorage.getItem('solar-weight') || 'Bold',
  setWeight(w) {
    this.weight = w;
    localStorage.setItem('solar-weight', w);
  }
});
