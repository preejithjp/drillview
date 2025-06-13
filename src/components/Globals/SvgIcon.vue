<template>
  <svg v-bind="$attrs">
    <title v-if="$attrs.title">{{ $attrs.title }}</title>
    <use ref="newIcon" xlink:href=""></use>
    <use ref="emptyIcon" style="display: none" xlink:href="/src/assets/images/icon-sprite.svg"></use>
  </svg>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'SvgIcon',
    inheritAttrs: true,
    props: {
      name: { type: String, required: true },
    },
    watch: {
      name() {
        this.pathAssignment();
      },
    },
    mounted() {
      this.pathAssignment();
    },
    methods: {
      pathAssignment() {
        if (this.name) {
          const href = (this.$refs?.emptyIcon as SVGUseElement).getAttribute('xlink:href');
          const fullPath = `${href}#${this.name}`;
          (this.$refs?.newIcon as SVGUseElement).setAttribute('xlink:href', fullPath);
        }
      },
    },
  });
</script>
