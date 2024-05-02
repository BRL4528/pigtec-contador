import { Ionicons } from '@expo/vector-icons';
import { Container, Title } from "./styles";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

interface Props {
  icon?: "cloud-offline-outline";
  title: string;
  status: boolean;
}

export function TopMessage({ title, icon, status }: Props) {
  const insets = useSafeAreaInsets();

  const paddingTop = insets.top + 5;

  return (
    <Container style={{ paddingTop }}>
      {status && (
        <>
          {
            title && (
              <Ionicons name={icon} size={15} color="white" />
            )
          }

          <Title>
            {title}
          </Title>
        </>
      )}
      <View/>
    </Container>
  )
}