import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { inject, observer } from "mobx-react";
import { toJS } from "mobx";
import { HeaderChoice } from "../../components/HeaderChoice/HeaderChoice";
import { Title } from "../../components/Typography/Title";
import { ChoiceCard } from "../../components/ChoiceCard/ChoiceCard";
import { Button } from "../../components/Button/Button";
import TRANSLATE from "../../locale";
import { iconsData } from "./choice-multipass.data";
import { CHOICE_INSTRUCTIONS } from "../../assets/routesList";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  image: {
    width: 35,
    height: 35,
  },
  content: {
    justifyContent: "space-between",
    flex: 1,
  },
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

const ChoiceMultipass = inject("store")(
  observer(({ navigation, store }) => {
    const [selected, setSelected] = useState([]);
    const { common, multipassForm } = store;
    const [data, setData] = useState(null);
    React.useEffect(() => {
      common.getCommonResources();
    }, [common]);
    React.useEffect(() => {
      if (common.resources) {
        const resources = toJS(common.resources);
        if (resources.types && resources.types.SERVICE) {
          setData(resources.types.SERVICE);
          const data = resources.types.SERVICE;
          const dataValues = Object.values(data);
          if (Array.isArray(dataValues) && dataValues.length) {
            setSelected([dataValues[0]]);
          }
        }
      }
    }, [common.resources]);

    // const select = useCallback(
    //   (id) => {
    //     setSelected([...selected, id]);
    //   },
    //   [selected],
    // );

    // const unSelect = useCallback(
    //   (id) => {
    //     setSelected(
    //       selected
    //         .map((item) => (item === id ? null : item))
    //         .filter((item) => !!item),
    //     );
    //   },
    //   [selected],
    // );

    // const onSelectPress = useCallback(
    //   (id) => {
    //     if (selected.includes(id)) {
    //       unSelect(id);
    //     } else {
    //       select(id);
    //     }
    //   },
    //   [selected, select, unSelect],
    // );

    const onNextClicked = () => {
      multipassForm.updateCreateMultipassData({ purposeTypes: selected });
      navigation.navigate(CHOICE_INSTRUCTIONS);
    };

    return (
      <View style={styles.container}>
        <HeaderChoice onGoBack={() => navigation.goBack()} />
        <Title style={{ marginVertical: 30 }}>
          {TRANSLATE.t("PURPOSE_CREATING_MULTIPASS")}
        </Title>
        <View style={styles.content}>
          <ScrollView>
            <View style={styles.list}>
              {iconsData &&
                iconsData.map((item) => (
                  <ChoiceCard
                    title={item.title}
                    style={{ marginBottom: 10 }}
                    key={item.id}
                    color={item.color}
                    isRecommend={item.isRecommend}
                  >
                    {item.children}
                  </ChoiceCard>
                ))}
            </View>
          </ScrollView>
          <View
            style={{
              height: 100,
              paddingVertical: 10,
              paddingHorizontal: 10,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Button
              style={{ borderRadius: 6, height: 50 }}
              onPress={onNextClicked}
              title={TRANSLATE.t("NEXT")}
            />
          </View>
        </View>
      </View>
    );
  }),
);

export default ChoiceMultipass;
