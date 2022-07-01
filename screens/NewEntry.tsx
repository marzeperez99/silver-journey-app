import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  Colors,
  Dialog,
  Incubator,
  PanningProvider,
  SectionsWheelPicker,
  Text,
  TouchableOpacity,
  View,
} from "react-native-ui-lib";
import useActivityType from "../hooks/useActivityType";
import useLanguageProgress from "../hooks/useLanguageProgress";
import { useToast } from "../hooks/useToast";
import { HomeNavProps } from "./types";

type TimeSelectorState = {
  hours: number;
  minutes: number;
};
const NewEntryScreen = ({
  navigation,
  route: {
    params: { language },
  },
}: HomeNavProps<"AddEntry">) => {
  const { showMessage } = useToast();
  const { save } = useLanguageProgress(language);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const wheelRef = useRef<TimeSelectorState>({
    hours: 0,
    minutes: 0,
  });

  const { getTypes } = useActivityType();
  useFocusEffect(
    useCallback(() => {
      (async () => setActivityTypes(await getTypes()))();
    }, [])
  );
  const [activity, setActivity] = useState<Partial<Activity>>({});
  const update = (field: string, value: any) =>
    setActivity((prev) => ({ ...prev, [field]: value }));
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          paddingR-16
          onPress={async () => {
            if (!activity.type) {
              showMessage("Type of activity is required");
              return;
            }
            if (!activity.description) {
              showMessage("Description is required");
              return;
            }
            console.log(wheelRef.current);
            if (!wheelRef.current.hours && !wheelRef.current.minutes) {
              showMessage("Duration must be greater than 0");
              return;
            }
            await save({
              type: activity.type,
              description: activity.description,
              duration: wheelRef.current.hours * 60 + wheelRef.current.minutes,
            });
            navigation.goBack();
          }}
        >
          <Text text70M blue30>
            Save
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [activity]);

  return (
    <View flex style={{ padding: 16, backgroundColor: Colors.white }}>
      <Incubator.TextField
        animated
        text
        floatingPlaceholder
        padding-16
        editable={false}
        value={activity.type?.name}
        onPressIn={() => setVisible(true)}
        placeholder="Type"
        containerStyle={{
          borderBottomWidth: 1,
          borderBottomColor: Colors.grey50,
        }}
        style={{ fontSize: 18, color: Colors.black }}
      />
      <Dialog
        visible={visible}
        onDismiss={() => setVisible(false)}
        containerStyle={{
          backgroundColor: "white",
          padding: 16,
          borderRadius: 8,
        }}
        panDirection={PanningProvider.Directions.DOWN}
      >
        <Text text60 marginB-16>
          Select a type
        </Text>
        <FlatList
          data={activityTypes}
          keyExtractor={(item) => `${item.uuid}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.uuid}
              paddingV-16
              onPress={() => {
                setVisible(false);
                update("type", item);
              }}
            >
              <Text text70L>{item.name}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => (
            <View
              style={{ borderBottomColor: Colors.grey70, borderBottomWidth: 1 }}
            />
          )}
        />
        <TouchableOpacity
          marginT-16
          onPress={() => {
            setVisible(false);
            navigation.navigate("NewActivityType");
          }}
        >
          <Text text70M blue40 center>
            Add Type
          </Text>
        </TouchableOpacity>
      </Dialog>
      <Incubator.TextField
        animated
        text
        floatingPlaceholder
        padding-16
        placeholder="Description"
        onChangeText={(value) => update("description", value)}
        containerStyle={{
          borderBottomWidth: 1,
          borderBottomColor: Colors.grey50,
        }}
        style={{ fontSize: 18 }}
      />
      <Text marginT-32 marginB-16 text60M>
        Duration
      </Text>

      <View row center>
        <View flex-1>
          <Incubator.WheelPicker
            label="Hours"
            numberOfVisibleRows={3}
            initialValue={wheelRef.current.hours}
            onChange={(value) => (wheelRef.current.hours = Number(value))}
            items={Array.from({ length: 5 }, (_, i) => i).map((i) => ({
              label: `${i}`,
              value: i,
            }))}
          />
        </View>
        <View flex-1>
          <Incubator.WheelPicker
            label="Minutes"
            initialValue={wheelRef.current.minutes}
            onChange={(value) => (wheelRef.current.minutes = Number(value))}
            numberOfVisibleRows={3}
            items={Array.from({ length: 6 }, (_, i) => i * 10).map((i) => ({
              label: `${i}`,
              value: i,
            }))}
          />
        </View>
      </View>
    </View>
  );
};
export default NewEntryScreen;