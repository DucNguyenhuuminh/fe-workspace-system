import { useNotiStore } from "@/stores/notiStore";

export const triggerNotiRefresh = (delay = 1500) => {
  setTimeout(() => {
    useNotiStore.getState().fetchNotifications(1);
  }, delay);
};