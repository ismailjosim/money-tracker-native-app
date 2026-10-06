import React, { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

// Pulsing radar ring around the mic
export function RadarRing({ delay, active }: { delay: number; active: boolean }) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.6)

  useEffect(() => {
    if (!active) {
      scale.value = 1
      opacity.value = 0
      return
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: delay }),
        withTiming(1.9, { duration: 1800, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    )
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: delay }),
        withTiming(0, { duration: 1800, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    )
  }, [active, delay, opacity, scale])

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={style}
      className="absolute h-24 w-24 rounded-full border-2 border-[#00E599]"
    />
  )
}

// Animated soundwave bars
export function WaveBar({ index, isRecording }: { index: number; isRecording: boolean }) {
  const height = useSharedValue(8)

  useEffect(() => {
    if (!isRecording) {
      height.value = withTiming(8, { duration: 300 })
      return
    }
    const targetHeights = [14, 28, 42, 22, 36, 48, 20, 32, 44, 26, 38, 16]
    const baseHeight = targetHeights[index % targetHeights.length]
    height.value = withRepeat(
      withSequence(
        withTiming(baseHeight, {
          duration: 250 + (index % 4) * 50,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(10, {
          duration: 250 + (index % 4) * 50,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    )
  }, [isRecording, index, height])

  const style = useAnimatedStyle(() => ({
    height: height.value,
  }))

  return <Animated.View style={style} className="mx-0.5 w-1.5 rounded-full bg-[#00E599]" />
}
