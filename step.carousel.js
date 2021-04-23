import React, { useRef, useEffect, memo } from "react";
import { Animated, Dimensions, ScrollView } from "react-native";
import { StartScreen } from "./start.screen";
import { StartIndicator } from "./start.indicator";
import data from "./assets.start-screen/data";

const { width } = Dimensions.get("window");

export const StepCarousel = memo((props) => {
  let scrollView = useRef(null);
  const scrollX = new Animated.Value(0);

  // Disable warnings
  console.disableYellowBox = true;

  let position = Animated.divide(scrollX, width);
  let listenerIndex = 0;
  let w = -width;
  let s = setInterval(() => {
    w = w + width > width * (data.length - 1) ? 0 : w + width;
    scrollView.scrollTo({
      x: w,
      y: 0,
      animated: true,
    });
  }, 4000);

  useEffect(() => {
    return () => clearInterval(s);
  }, [s]);

  const listener = (e) => {
    if (listenerIndex === 0) {
      listenerIndex++;
    } else {
      if (w < e.nativeEvent.contentOffset.x) {
        clearInterval(s);
      }
      listenerIndex = 0;
    }
  };

  return (
    <>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollToOverflowEnabled={16}
        scrollEventThrottle={16}
        ref={(ref) => (scrollView = ref)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { listener },
        )}
      >
        {data.map(({ title, subtitle, image, last, ...restProps }) => (
          <StartScreen
            key={title}
            {...props}
            {...restProps}
            title={title}
            subtitle={subtitle}
            image={image}
            last={last}
          />
        ))}
      </ScrollView>
      <StartIndicator data={data} position={position} />
    </>
  );
});
