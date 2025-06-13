<template>
  <div>
    <span :style="`font-size: ${fontSize}px; background-color: ${generateRandomHexColor()}`" class="fontSemibold text-static-primary">
      {{ findInitials(name || '') || 'N/A' }}
    </span>
    <img
      :src="image"
      alt="Profile Image"
      :class="[{ 'd-hidden': isImageError || !image }]"
      @error="handleOnerror($event.target as HTMLImageElement)" />
    <span v-if="status && status !== Status.OFF && valueIsInEnum(status, Status)" :class="['statusElem', status]">
      <SvgIcon :name="`${status}-icon`" class="svg-icon text-static-secondary status-icon" />
    </span>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { valueIsInEnum } from '@/common/utils';

  export enum Status {
    OFF = 'off',
    ONLINE = 'online',
    AWAY = 'away',
    OFFLINE = 'offline',
  }

  export default defineComponent({
    name: 'ProfileImage',
    props: {
      image: {
        type: String,
      },
      name: {
        type: String,
        default: 'N/A',
      },
      status: {
        type: String,
        default: Status.OFF,
      },
    },
    data() {
      return {
        valueIsInEnum: valueIsInEnum,
        Status: Status,
        fontSize: 8,
        isImageError: false,
      };
    },
    watch: {
      image() {
        this.isImageError = false;
      },
    },
    mounted() {
      this.fontSize = this.calculateFontSize();
    },
    methods: {
      handleOnerror(imgElem: HTMLImageElement) {
        imgElem.onerror = null;
        this.isImageError = true;
      },
      findInitials(name: string) {
        const words = name.split(' ');
        if (words.length === 1) {
          return name.slice(0, 2).toUpperCase();
        }
        const initials = words.map((word) => word.charAt(0).toUpperCase()).join('');
        return initials.substring(0, 2);
      },
      calculateFontSize() {
        const minSize = 6;
        if (this.$el && this.$el.clientHeight > 0) {
          return Math.round(Math.max(this.$el.clientHeight / 2.5, minSize));
        }
        return minSize;
      },
      generateRandomHexColor() {
        // Hash the username string to get a determ inistic value
        const hash = this.name?.split('').reduce((acc, char) => {
          acc = (acc << 5) - acc + char.charCodeAt(0);
          return acc & acc; // Convert to 32bit integer
        }, 0);

        // Generate RGB values from the hash value
        let r = (hash >> 16) & 0xff; // Red (8 bits)
        let g = (hash >> 8) & 0xff; // Green (8 bits)
        let b = hash & 0xff; // Blue (8 bits)

        // Adjust the color to ensure it's bright and not too dark
        r = Math.floor(r + 128); // Add 128 to ensure the color isn't too dark
        g = Math.floor(g + 128); // Add 128 to ensure the color isn't too dark
        b = Math.floor(b + 128); // Add 128 to ensure the color isn't too dark

        // Ensure that the final RGB values stay within the 0-255 range
        r = Math.min(r, 255);
        g = Math.min(g, 255);
        b = Math.min(b, 255);

        // Check if the color is too close to white (i.e., all components close to 255)
        const threshold = 240; // Any component greater than 240 is considered too close to white
        if (r > threshold && g > threshold && b > threshold) {
          // Decrease one of the components to make sure it's not too light
          r = r > threshold ? r - 30 : r;
          g = g > threshold ? g - 30 : g;
          b = b > threshold ? b - 30 : b;
        }

        // Further ensure the color isn't too close to white by adjusting brightness
        if (r + g + b > 750) {
          // If the sum of all components is too high (too bright)
          // Reduce values to make the color more distinct and vibrant
          r = r > 200 ? r - 50 : r;
          g = g > 200 ? g - 50 : g;
          b = b > 200 ? b - 50 : b;
        }
        // Return the hex color
        return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
      },
    },
  });
</script>

<style scoped>
  div {
    min-width: 15px;
    min-height: 15px;
    width: 100%;
    height: 100%;
    position: relative;
    box-shadow: 0 0 0 1px var(--border-primary);
    border-radius: 50%;
    background: #c9c20e57;
  }

  span {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    position: absolute;
    border-radius: 50%;
  }

  img {
    object-fit: cover;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
  }

  .statusElem {
    position: absolute;
    width: 45%;
    height: 45%;
    border: 1px solid white;
    border-radius: 50%;
    background-color: transparent;
    bottom: -8%;
    right: -8%;
  }

  .statusElem .status-icon {
    width: 100%;
    height: 100%;
    padding: 25%;
    color: var(--icon-teritiary);
  }

  .statusElem.online {
    background-color: var(--status-online);
  }

  .statusElem.away {
    background-color: var(--status-away);
  }

  .statusElem.offline {
    background-color: var(--status-offline);
  }
</style>
