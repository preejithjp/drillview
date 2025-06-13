<template>
  <div class="custom-picker-container d-flex align-items-center justify-content-space-between width-100 p-relative cursor-pointer">
    <CustomDatePicker
      ref="datePicker"
      v-model:value="selectedDate"
      :editable="false"
      :clearable="false"
      :popupClass="ignoreOutsideClick ? 'ignore-outside-click' : ''"
      :format="computedFormat"
      input-class="mx-input"
      :type="type"
      :disabled-date="maxValue || minValue ? disableDates : undefined"
      :disabled-time="maxValue || minValue ? disableDates : undefined" />
    <SvgIcon name="calender-icon" class="calendar-icon secondary size20 svg-icon" @click="triggerCalendarPopup" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import CustomDatePicker from 'vue-datepicker-next';
  import 'vue-datepicker-next/index.css';

  export enum TypeTimeStamps {
    ISO = 'iso',
    UNIX = 'unix',
  }
  export enum DatePickerFormat {
    MONTH = 'month',
    DATETIME = 'datetime',
    DATE = 'date',
    TIME = 'time',
  }

  export default defineComponent({
    name: 'DatePicker',
    components: { CustomDatePicker },
    props: {
      modelValue: {
        type: [String, Number, null],
        default: '',
      },
      type: {
        type: String as PropType<DatePickerFormat>,
        default: DatePickerFormat.DATETIME,
      },
      typeTimeStamp: {
        type: String,
        default: TypeTimeStamps.UNIX,
      },
      maxValue: {
        type: [String, Number, Date],
        required: false,
      },
      minValue: {
        type: [String, Number, Date],
        required: false,
      },
      ignoreOutsideClick: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        selectedDate: null as string | number | null,
        maxDate: new Date().toISOString().slice(0, 23) as string,
      };
    },
    computed: {
      computedFormat(): string {
        switch (this.type) {
          case DatePickerFormat.MONTH:
            return 'MMM YYYY';
          case DatePickerFormat.DATE:
            return 'YYYY-MM-DD';
          case DatePickerFormat.TIME:
            return 'HH:mm:ss';
          default:
            return 'YYYY-MM-DD HH:mm:ss';
        }
      },
    },
    watch: {
      modelValue: {
        handler(newValue: string | number): void {
          this.selectedDate = (newValue ? this.convertToISOString(newValue) : null) as unknown as string;
        },
        deep: true,
        immediate: true,
      },
      selectedDate: {
        handler(timeString: string): void {
          if (timeString) {
            const formattedTimestamp = this.convertToUnixTimestamp(timeString);
            if (this.typeTimeStamp === TypeTimeStamps.ISO) {
              this.$emit('update:modelValue', new Date(formattedTimestamp).toISOString());
            } else {
              this.$emit('update:modelValue', formattedTimestamp);
            }
          } else {
            this.$emit('update:modelValue', null);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      updateValue(newValue: string) {
        this.$emit('update:modelValue', newValue);
      },
      convertToUnixTimestamp(date: string | number | Date) {
        const timezoneOffsetInMs = new Date().getTimezoneOffset() * 60 * 1000;
        return new Date(date).getTime() - timezoneOffsetInMs;
      },
      convertToISOString(date: string | number) {
        const unixTimestamp = new Date(date).getTime();
        const isoString = new Date(unixTimestamp).toISOString().slice(0, 23);
        return new Date(isoString);
      },
      triggerCalendarPopup() {
        const datePickerRef = this.$refs.datePicker as HTMLElement | undefined;
        const inputElement = datePickerRef?.querySelector('input') as HTMLInputElement | null;
        if (inputElement) {
          inputElement.focus();
        }
      },
      disableFutureDates(date: Date): boolean {
        const currentUtcDate = new Date(this.maxValue!).getTime();
        const selectedDateUtc = date ? this.convertToUnixTimestamp(date) : currentUtcDate;
        return selectedDateUtc > currentUtcDate;
      },

      disablePastDates(date: Date): boolean {
        if (this.minValue !== undefined) {
          const minDate = new Date(this.minValue).setHours(0, 0, 0, 0);
          const selectedDateUtc = this.convertToUnixTimestamp(date);
          return selectedDateUtc < minDate;
        }
        return false;
      },

      disableDates(date: Date): boolean {
        return this.disablePastDates(date) || this.disableFutureDates(date);
      },
    },
  });
</script>

<style>
  .custom-picker-container {
    border: 1px solid var(--border-tertiary);
    border-radius: 4px;
  }

  .mx-datepicker {
    width: 100%;
    padding: 0.3rem;
  }

  .mx-datepicker .mx-input {
    font-size: inherit;
    font-family: inherit;
    font-weight: inherit;
    color: var(--text-tertiary);
    background-color: var(--bg-septenary);
    border-radius: 1px;
    box-shadow: none;
    border: none;
    cursor: pointer;
    padding: 0;
    height: auto;
  }
  .mx-datepicker .mx-icon-calendar {
    display: none;
  }
  .calendar-icon {
    position: relative;
    right: 6px;
    cursor: pointer;
    color: var(--text-quinary);
  }
  .mx-calendar-content .cell.active {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }
  .mx-datepicker-main {
    border: 1px solid var(--border-tertiary);
  }
  .mx-table-date .today {
    color: var(--text-tertiary);
    border: 1px solid var(--border-secondary);
  }

  .mx-calendar-content .cell.disabled {
    color: var(--text-senary);
    background-color: var(--bg-septenary);
  }

  .mx-table-date .cell.not-current-month {
    color: var(--text-senary);
    background: none;
  }

  .mx-date-time {
    background: var(--bg-quaternary);
  }
  .mx-time {
    background: var(--bg-quaternary);
  }
</style>
