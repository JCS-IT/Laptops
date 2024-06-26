<script setup lang="ts">
import type { ConfigDoc, NewEvent } from "@/types";
import type { DateSelectArg } from "@fullcalendar/core";
import { NewEventSchema } from "~/shared";

defineProps<{
  metaData: DateSelectArg | null;
  blocks: ConfigDoc["blocks"];
  noRoom?: boolean;
}>();

const emit = defineEmits<{
  (event: "submit", value: NewEvent): void;
  (event: "cancel"): void;
}>();

const blankEvent: NewEvent = {
  name: "",
  email: "",
  room: null,
  block: {
    start: "",
    end: "",
  },
};

const newEvent = ref({ ...blankEvent });

const valid = computed(() => NewEventSchema.safeParse(newEvent.value));


const clear = () => Object.assign(newEvent.value, blankEvent);

defineExpose({
  clear,
});
</script>

<template>
  <div class="card bg-base-300 border" v-bind="$attrs">
    <div class="card-body">
      <div class="form-control gap-2">
        <h2 class="text-2xl font-bold">New booking</h2>
        <span>{{ $dayjs(metaData?.start).format("dddd, MMMM DD") }}</span>
        <!-- Info -->
        <input
          class="input input-bordered invalid:border-error"
          type="text"
          placeholder="John Doe"
          pattern="[A-Za-z\s]+"
          v-model="newEvent.name"
        />
        <input
          class="input input-bordered invalid:border-error"
          placeholder="jdoe@cbe.ab.ca"
          type="email"
          pattern=".+@cbe.ab.ca"
          v-model="newEvent.email"
        />
        <input
          class="input input-bordered invalid:border-error"
          type="number"
          inputmode="numeric"
          v-model="newEvent.room"
          placeholder="Room Number"
          pattern="[0-9]{4}"
          maxlength="4"
          v-if="!noRoom"
        />

        <select
          tabindex="0"
          v-model="newEvent.block.start"
          class="select select-bordered w-full"
          ref="select"
          @change="newEvent.block.end = newEvent.block.start"
        >
          <option value="" disabled selected hidden>Start Block</option>
          <option
            v-for="option in blocks"
            :key="option.name"
            tabindex="1"
            class="text-lg"
            :value="option.name"
          >
            {{ option.name }}
          </option>
        </select>
        <select
          tabindex="0"
          v-model="newEvent.block.end"
          class="select select-bordered w-full"
          ref="select"
        >
          <option value="" disabled selected hidden>End Block</option>
          <option
            v-for="option in blocks"
            :key="option.name"
            tabindex="1"
            class="text-lg"
            :value="option.name"
          >
            {{ option.name }}
          </option>
        </select>

        <div class="grid grid-cols-2 gap-2">
          <Button
            class="btn-success w-full"
            @click="emit('submit', newEvent)"
            tooltip="Confirm"
            :disabled="!valid.success"
          >
            <Icon name="mdi:check" />
          </Button>
          <Button
            class="btn-error w-full"
            @click="
              clear();
              emit('cancel');
            "
            tooltip="cancel"
          >
            <Icon name="mdi:cancel" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
