<script setup lang="ts">
import { blocks } from "@/data";
import type { BookingDoc, ConfigDoc, NewEvent } from "@/types";
import type {
  CalendarApi,
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/vue3";
import { doc, type QueryDocumentSnapshot } from "firebase/firestore";
import {
  addBooking,
  BaseCalendarOptions,
  handleDateSelect,
  NewEventSchema,
  removeBooking,
} from "~/shared";

const configDoc = useDocument<ConfigDoc>(
  doc(useFirestore(), "global/config"),
);

definePageMeta({
  title: "Booking",
  layout: "full-width",
});

const route = useRoute("booking-target");

const dialog = ref<HTMLDialogElement | null>(null);

const prompts = ref({
  create: false,
  delete: false,
});

const calendar = ref<typeof FullCalendar | null>(null);

const metaData = ref<DateSelectArg | null>(null);

const targetPose = ref({
  x: 0,
  y: 0,
});

useDocument(
  doc(useFirestore(), "bookings", useDayjs()().year().toString()).withConverter(
    {
      fromFirestore: (snap: QueryDocumentSnapshot<BookingDoc>) => {
        const api: CalendarApi = calendar.value?.getApi();

        const data = snap.data();

        api.removeAllEvents();

        api.addEventSource({
          events: data[route.params.target],
        });

        return data[route.params.target];
      },
      toFirestore: (data) => {
        return data;
      },
    },
  ),
);

const calendarOptions = ref<CalendarOptions>({
  ...BaseCalendarOptions,
  select: (selectInfo) => {
    handleDateSelect(selectInfo, targetPose, prompts, metaData, dialog);
  },
  eventClick: (clickInfo: EventClickArg) => {
    return confirm(
      `Are you sure you want to delete the event '${clickInfo.event.title}'`,
    )
      ? clickInfo.event.remove()
      : null;
  },
  eventAdd: async (e) => {
    await addBooking(e, route.params.target);
  },
  eventRemove: async (e) => {
    await removeBooking(e, route.params.target);
  },
});

const addEvent = (data: NewEvent) => {
  const valid = NewEventSchema.safeParse(data);
  if (!valid.success) return;

  const startBlock = blocks.find((b) => b.name == data.block.start);
  const endBlock = blocks.find((b) => b.name == data.block.end);

  if (!startBlock || !endBlock) return;

  const calendarApi: CalendarApi = calendar.value?.getApi();

  calendarApi.addEvent({
    title: `${data.name} - ${data.room}`,
    start: `${metaData.value?.startStr}T${startBlock.start}`,
    end: `${metaData.value?.startStr}T${endBlock.end}`,
    extendedProps: {
      room: data.room,
      block: `${data.block.start} ${
        data.block.end === data.block.start
          ? ""
          : "- " + data.block.end.split(" ")[1]
      }`,
    },
  });

  prompts.value.create = false;
  dialog.value?.close();
};
</script>

<template>
  <div class="relative w-full" v-if="configDoc">
    <dialog ref="dialog" class="modal">
      <NewBooking
        :metaData="metaData"
        @submit="addEvent"
        @cancel="dialog?.close()"
        :blocks="configDoc?.blocks"
      />
    </dialog>
    <Transition>
      <div
        :style="`top: ${targetPose.y}px; left: ${targetPose.x}px`"
        class="absolute z-50 duration-200 ease-in-out transition-all"
        v-if="prompts.create"
      >
        <NewBooking
          :metaData="metaData"
          @submit="addEvent"
          @cancel="prompts.create = false"
          :blocks="configDoc?.blocks"
        />
      </div>
    </Transition>

    <FullCalendar :options="calendarOptions" ref="calendar">
      <template #eventContent="arg">
        <div class="fc-daygrid-event-dot"></div>
        <span class="fc-event-time">{{ arg.event.extendedProps.block }}</span>
        <span class="fc-event-title">{{ arg.event.title }}</span>
      </template>
    </FullCalendar>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 150ms ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
