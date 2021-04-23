import React, { useCallback, useEffect } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, Image, Text, ScrollView } from "react-native";
// local files
import { StepBottomButtons } from "./components/step.bottom.buttons";
import { StepImage } from "./components/step.image";
import { StepInputWrapper } from "./components/step.input.wrapper";
import { Loader } from "../../components/Loader/Loader";
import { MAIN_SCREEN } from "../../assets/routesList";

export const StepWrap = observer(
  ({
    store,
    checkMultipass,
    navigation,
    text,
    placeholder,
    isUpload,
    value,
    name,
    lastStep,
    nextStep,
  }) => {
    const [t] = useTranslation();

    useEffect(() => {
      if (checkMultipass) {
        checkMultipassEvent();
      }
    }, []);

    const onNextStep = useCallback(() => {
      navigation.navigate(nextStep);
    });

    const setItem = (name, value) => {
      if (name === "EMail") {
        value = value.toLocaleLowerCase();
      }

      store.multipassForm.setItem(name, value);
    };

    const checkMultipassEvent = () => {
      store.realm.getMultipass().then(() => {
        store.alert(
          t("WARNING"),
          t("ONLY_ONE_MULTIPASS"),
          [
            {
              text: "No",
              onPress: () => navigation.navigate(MAIN_SCREEN),
              style: "cancel",
            },
            {
              text: "Yes",
            },
          ],
          { cancelable: false },
        );
      });
    };

    if (store.state.isLoading) {
      return <Loader />;
    }

    return (
      <View style={styles.container}>
        <View style={styles.topView}>
          <Image source={require("./assets/first-step-icon.png")} />
        </View>
        <View style={styles.bottomView}>
          <ScrollView>
            <View styles={styles.popup}>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.heading}>{text}</Text>
              </View>
              {isUpload ? (
                <StepImage store={store} />
              ) : (
                <StepInputWrapper
                  name={name}
                  setItem={setItem}
                  placeholder={placeholder}
                  value={value}
                />
              )}
            </View>
          </ScrollView>

          <StepBottomButtons
            lastStep={lastStep}
            onNextStep={onNextStep}
            store={store}
          />
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    flex: 1,
    flexWrap: "wrap",
    textAlign: "center",
    marginTop: 50,
    fontWeight: "600",
    fontSize: 24,
    lineHeight: 29,
    color: "#1F1F1F",
  },
  topView: {
    flex: 1.5 / 5,
    backgroundColor: "#3156DA",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomView: {
    flex: 3.5 / 5,
    backgroundColor: "#FDFDFD",
    paddingHorizontal: 30,
  },
  popup: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});
