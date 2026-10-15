import { useState } from 'react';
import { ArrangementView, Host, Text, VStack } from '@expo/ui/swift-ui';
import {
  arrangementViewStyle,
  background,
  font,
  frame,
  onHingeChange,
  padding,
} from '@expo/ui/swift-ui/modifiers';

const fill = frame({ maxWidth: Infinity, maxHeight: Infinity });

// on an iphone duo with ios 27.1: ArrangementView should show PRIMARY and SECONDARY side by side
// when the duo is open, and onHingeChange should count events as the duo folds and unfolds.
export default function HomeScreen() {
  const [events, setEvents] = useState(0);
  const [last, setLast] = useState('no event yet');

  return (
    <Host style={{ flex: 1 }}>
      <VStack
        spacing={0}
        modifiers={[
          fill,
          onHingeChange((_, newContext) => {
            setEvents((count) => count + 1);
            setLast(
              newContext.hinge
                ? `${Math.round(newContext.hinge.angle)}° ${newContext.hinge.status}`
                : 'hinge is null'
            );
          }),
        ]}>
        <Text modifiers={[font({ size: 22, weight: 'bold' }), padding({ all: 16 })]}>
          {`onHingeChange events: ${events} (last: ${last})`}
        </Text>
        <ArrangementView modifiers={[arrangementViewStyle('split'), fill]}>
          <ArrangementView.Primary>
            <Text modifiers={[font({ size: 40, weight: 'bold' }), fill, background('#ffc9c9')]}>
              PRIMARY
            </Text>
          </ArrangementView.Primary>
          <ArrangementView.Secondary>
            <Text modifiers={[font({ size: 40, weight: 'bold' }), fill, background('#a5d8ff')]}>
              SECONDARY
            </Text>
          </ArrangementView.Secondary>
        </ArrangementView>
      </VStack>
    </Host>
  );
}
