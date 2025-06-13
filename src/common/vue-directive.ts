import { Directive, DirectiveBinding } from 'vue';
export function dateTimeFormat(el: HTMLElement, binding: DirectiveBinding) {
  //example use html <div v-dateTimeFormat="'time'">1730461781310</div>
  const formatType: string = binding.value;
  // Store original value per element if not already set
  if (!el.dataset.originalValue) {
    el.dataset.originalValue = el.textContent?.trim() || '';
  }
  let input: string | number = el.dataset.originalValue;
  if (!isNaN(Number(input))) {
    input = Number(input);
  } else if (!Date.parse(input)) {
    return;
  }
  const date = new Date(input);
  const isoString = new Date(input).toISOString();
  const [datePart, timePartWithMs] = isoString.split('T');
  const timePart = timePartWithMs.split('Z')[0];
  const [time, ms] = timePart.split('.');
  const [hours, minutes, seconds] = time.split(':');
  let formattedValue = '';
  switch (formatType) {
    case 'date':
      formattedValue = datePart;
      break;
    case 'time':
      formattedValue = `${hours}:${minutes}:${seconds}`;
      break;
    case 'datetimems':
      formattedValue = `${datePart} ${hours}:${minutes}:${seconds}.${ms ? ms.padEnd(3, '0') : '000'}`;
      break;
    case 'dd-mm-yyyy': {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      formattedValue = `${day}-${month}-${year}`;
      break;
    }
    default:
      formattedValue = `${datePart} ${hours}:${minutes}:${seconds}`;
  }
  // Only update if the formatted value is different
  if (el.textContent !== formattedValue) {
    el.textContent = formattedValue;
  }
}

/**
 * Directive to handle outside clicks on an element.
 */
export const outsideclick: Directive = {
  mounted(el, binding) {
    el.clickOutsideEvent = function (event: MouseEvent) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(true);
      } else {
        binding.value(false);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent, true);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent, true);
  },
};
export const resizable: Directive = {
  mounted(el: HTMLElement) {
    let startX = 0;
    let startWidth = 0;

    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    Object.assign(resizer.style, {
      width: '5px',
      cursor: 'col-resize',
      position: 'absolute',
      top: '0',
      right: '0',
      bottom: '0',
      zIndex: '5',
    });

    resizer.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startWidth = el.offsetWidth;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(100, Math.min(startWidth + (e.clientX - startX), 1000)); // set minimum width and maximum width
      el.style.width = `${newWidth}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }

    el.appendChild(resizer);
  },
  unmounted(el: HTMLElement) {
    const resizer = el.querySelector('.resizer');
    if (resizer) {
      resizer.remove();
    }
    document.removeEventListener('mousemove', () => {});
    document.removeEventListener('mouseup', () => {});
  },
};
