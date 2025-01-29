<template>
  <span class="relative" @click="setVisibility">
    <span class="cursor-pointer text-blue-400" ref="parentRef">
      {{ content }}<slot></slot> <!-- 两种方式接收内容 -->
    </span>
    <div
      v-if="isVisible"
      ref="popupRef"
      class="inline-block absolute top-full p-[0.5rem] pl-[0.8rem] rounded-md shadow-md z-10 whitespace-nowrap text-base bg-[#f5e0dc] text-[#161624]"
      :style="style"
    >
      <strong>{{ word }}</strong> <br />
      <span v-for="([wordClass, definitions], index) in Object.entries(EnglisWordList[word])" :key="index">
        <strong>{{ wordClass }}{{ wordClass !== '' ? '. ' : '' }}</strong>
        <span>
          <span
            v-for="(definition, idx) in definitions"
            :key="idx"
            :class="{ 'text-rose-500': idx === highlightIndex && wordClass === highlightWordClass }"
          >
            {{ definition }};&nbsp;
          </span>
        </span>
        <br />
      </span>
    </div>
  </span>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import EnglisWordList from "./EnglishWordList.json"

export default {
  props: {
    word: {
      type: String,
      required: true,
    },
    highlight: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    }
  },
  setup(props) {
    const isVisible = ref(false);
    const style = ref({});
    const popupRef = ref(null);
    const parentRef = ref(null);

    const highlightWordClass = computed(() => props.highlight.split(' ')[0]);
    const highlightIndex = computed(() => parseInt(props.highlight.split(' ')[1]));

    const updatePosition = () => {
      if (popupRef.value && parentRef.value) {
        const rect = popupRef.value.getBoundingClientRect();
        const parentRect = parentRef.value.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        const elementWidth = rect.width;
        const elementSupposedRight = parentRect.left + elementWidth;

        let newRight = Math.min(viewportWidth - elementSupposedRight, 0);
        if (newRight === 0) style.value = { left: 0 };
        else style.value = { right: 0 };
      }
    };

    const setVisibility = () => {
      isVisible.value = true;
      updatePosition();
    };

    const handleClickOutside = (event) => {
      if (popupRef.value && !popupRef.value.contains(event.target)) {
        isVisible.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updatePosition);
    });

    onUnmounted(() => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
    });

    return {
      isVisible,
      style,
      popupRef,
      parentRef,
      highlightWordClass,
      highlightIndex,
      setVisibility,
      EnglisWordList,
    };
  },
};
</script>