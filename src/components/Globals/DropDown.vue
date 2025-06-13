<template>
  <div v-outsideclick="handleOutsideClick" class="dropdown" :class="{ 'disable-Item': isDisabled }">
    <div ref="dropdownTrigger" class="dropdown-trigger" @click="toggleDropdown">
      <span :title="selectedLabel || placeholder" :class="['text-ellipsis fontSize-12', { 'placeholder-text': !selectedLabel }]">
        {{ selectedLabel || placeholder }}
      </span>
      <SvgIcon name="downArrow-icon" class="arrow svg-icon size10" :class="{ open: isOpen }" />
    </div>
    <transition name="fade">
      <ul v-if="isOpen" ref="dropdownMenu" :class="['dropdown-menu', { 'dropdown-top': dropdownTop }]">
        <li
          v-for="option in normalizedOptions"
          :key="getOptionValue(option)"
          :title="getOptionLabel(option)"
          :class="['dropdown-item text-ellipsis', { selected: isSelected(option) }]"
          @click="selectOption(option)">
          {{ getOptionLabel(option) }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export interface IDropdownOptions {
    label: string;
    value: string | number | boolean;
  }

  export enum ReturnDataFields {
    LABEL = 'label',
    VALUE = 'value',
    ARRAYITEM = 'arrayItem',
  }

  export default defineComponent({
    name: 'DropDown',
    props: {
      options: {
        type: Array as () => IDropdownOptions[] | (string | number | boolean)[],
        required: true,
      },
      placeholder: {
        type: String,
        default: 'Select an option',
      },
      modelValue: {
        type: [Object as () => IDropdownOptions, String, Number, Boolean],
        default: null,
      },
      isDisabled: {
        type: Boolean,
        default: false,
      },
      returnField: {
        type: String as () => ReturnDataFields,
        default: ReturnDataFields.ARRAYITEM,
      },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        isOpen: false,
        dropdownTop: false,
        selected: this.modelValue,
        isPrimitiveOptions: typeof this.options[0] !== 'object',
      };
    },
    computed: {
      normalizedOptions(): IDropdownOptions[] {
        if (!this.options.length) return [];
        if (typeof this.options[0] === 'object') return this.options as IDropdownOptions[];
        return (this.options as (string | number)[]).map((val) => ({ label: String(val), value: val }));
      },
      selectedLabel(): string | null {
        const found = this.normalizedOptions.find((opt) => {
          return typeof this.modelValue === 'object' ? opt.value === (this.modelValue as IDropdownOptions)?.value : opt.value === this.modelValue;
        });
        return found ? found.label : null;
      },
    },
    watch: {
      modelValue: {
        handler(newValue) {
          this.selected = newValue;
        },
        immediate: true,
      },
    },
    methods: {
      toggleDropdown() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
          this.adjustDropdownPosition();
        }
      },

      adjustDropdownPosition() {
        this.$nextTick(() => {
          const trigger = this.$refs.dropdownTrigger as HTMLElement;
          const menu = this.$refs.dropdownMenu as HTMLElement;
          const triggerRect = trigger.getBoundingClientRect();
          const menuHeight = menu.offsetHeight;
          const viewportHeight = window.innerHeight;
          const buffer = 20; // space between dropdown and bottom of viewport
          const shouldOpenUp = triggerRect.bottom + menuHeight + buffer > viewportHeight && triggerRect.top > menuHeight;
          this.dropdownTop = shouldOpenUp;
        });
      },

      selectOption(option: IDropdownOptions) {
        this.selected = option;
        this.isOpen = false;
        let returnValue: string | number | boolean | IDropdownOptions = option;
        switch (this.returnField) {
          case ReturnDataFields.LABEL:
            returnValue = option.label;
            break;
          case ReturnDataFields.VALUE:
            returnValue = option.value;
            break;
          default:
            if (this.isPrimitiveOptions) {
              returnValue = option.value;
            } else {
              returnValue = option;
            }
            break;
        }
        this.$emit('update:modelValue', returnValue);
      },

      handleOutsideClick(show: boolean) {
        if (show) {
          this.isOpen = false;
        }
      },

      isSelected(option: IDropdownOptions): boolean {
        if (typeof this.selected === 'object') {
          return (this.selected as IDropdownOptions)?.value === option.value;
        }
        return this.selected === option.value;
      },

      getOptionLabel(option: IDropdownOptions): string {
        return option.label;
      },

      getOptionValue(option: IDropdownOptions): string {
        return String(option.value);
      },
    },
  });
</script>

<style scoped>
  .dropdown {
    height: 100%;
    position: relative;
    display: inline-block;
    width: 100%;
    text-transform: capitalize;
    user-select: none;
    border: 1px solid var(--border-tertiary);
    border-radius: 4px;
    font-size: inherit;
    font-family: inherit;
    background-color: var(--bg-septenary);
    color: var(--text-tertiary);
  }

  .dropdown-trigger {
    height: 100%;
    padding: 0 0.4rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .arrow {
    height: 0.8em;
    transition: transform 0.3s ease;
    color: var(--icon-secondary);
  }

  .arrow.open {
    transform: scaleY(-1);
  }

  .dropdown-menu {
    position: absolute;
    left: 0;
    top: 100%;
    margin-top: 1px;
    background-color: var(--bg-quaternary);
    border: 1px solid var(--border-tertiary);
    list-style: none;
    padding: 0;
    width: 100%;
    max-height: 100px;
    z-index: 10;
    overflow-y: auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-transform: capitalize;
    font-family: inherit;
    font-size: 12px;
  }

  .dropdown-top {
    top: auto;
    bottom: 100%;
    margin-top: 0;
    margin-bottom: 2px;
  }

  .dropdown-item {
    padding: 8px 12px;
    cursor: pointer;
  }

  .dropdown-item:hover,
  .dropdown-item.selected {
    background-color: var(--bg-secondary);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  .fade-enter-to,
  .fade-leave-from {
    opacity: 1;
    transform: translateY(0);
  }

  .dropdown-menu li {
    padding: 6px 12px;
    cursor: pointer;
  }

  .dropdown-menu li:not(:last-child) {
    border-bottom: 1px solid var(--border-tertiary);
  }

  .placeholder-text {
    color: var(--placeholder-color);
  }
</style>
