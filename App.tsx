import { StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components';
import theme from './src/theme';
import { Routes } from './src/routes';
import { api } from './src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { AuthContextProvider } from '@contexts/AuthContext';
import { ProducerContextProvider } from '@contexts/ProducersContext';
import { TopMessage } from '@components/TopMessage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNetInfo } from '@react-native-community/netinfo'
import { configureObservablePersistence } from '@legendapp/state/persist';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import { synchronization } from '@services/synchronization';

interface Config {
  rout: string;
}

export default function App() {
  const netInfo = useNetInfo()

  useEffect(() => {
    async function getItemFunction() {
      const data = await AsyncStorage.getItem('@DataConfig');
      if (data !== null) {
        const dataJson: Config = JSON.parse(data);
        api.defaults.baseURL = `http://${dataJson.rout}/`
      }
    }
    getItemFunction()
  }, [])

  useEffect(() => {
    synchronization({internet: !!netInfo.isConnected})
  }, [netInfo.isConnected])

  configureObservablePersistence({
    pluginLocal: ObservablePersistAsyncStorage,
    localOptions: {
      asyncStorage: {
        AsyncStorage,
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
            <TopMessage
              status={!netInfo.isConnected}
              title="Você esta offline"
              icon='cloud-offline-outline'
            />
     
        <AuthContextProvider>
          <ProducerContextProvider>
            <Routes />
          </ProducerContextProvider>
        </AuthContextProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
