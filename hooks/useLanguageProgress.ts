import { useCallback } from "react";
import uuid from "react-native-uuid";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import moment from "moment";

const useLanguageProgress = (language: string) => {
  const { getItem, setItem } = useAsyncStorage(language);
  const getProgress = useCallback(async () => {
    const items: Activity[] = JSON.parse((await getItem()) || "[]");
    items.sort((a, b) => (b.date || 0) - (a.date || 0));
    return items;
  }, [getItem]);

  const save = useCallback(async (activity: Activity) => {
    const items: Activity[] = JSON.parse((await getItem()) || "[]");
    items.push({ ...activity, uuid: `${uuid.v4()}`, date: moment().unix() });
    setItem(JSON.stringify(items));
  }, []);
  return { getProgress, save };
};

export default useLanguageProgress;