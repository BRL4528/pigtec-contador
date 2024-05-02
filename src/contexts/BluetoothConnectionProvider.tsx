import React, { createContext, useContext, useState, useCallback } from 'react';
import { BleManager } from 'react-native-ble-plx';

// Definir os tipos para as funções/atributos a serem fornecidos
type BluetoothConnectionContextProps = {
  startDeviceScan: () => void;
  stopDeviceScan: () => void;
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnectFromDevice: (deviceId: string) => Promise<void>;
  discoverDeviceServices: () => Promise<void>;
  connectedDevice: any; // Tipo depende da sua implementação
};

const BluetoothConnectionContext = createContext<BluetoothConnectionContextProps | null>(null);

export const BluetoothConnectionProvider: React.FC<{
  children: React.ReactElement | React.ReactElement[];
}> = ({ children }) => {
  const manager = new BleManager();
  const [scannedDevices, setScannedDevices] = useState<any[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<any | undefined>(undefined);

  const startDeviceScan = useCallback(() => {
    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        throw new Error(error.message);
      }
      setScannedDevices(prev => [...prev, scannedDevice]);
    });
  }, []);

  const stopDeviceScan = useCallback(() => {
    manager.stopDeviceScan();
  }, []);

  const connectToDevice = useCallback(async (deviceId: string) => {
    try {
      const device = await manager.connectToDevice(deviceId);
      setConnectedDevice(device);
    } catch (error: any) {
      throw new Error(error);
    }
  }, []);

  const disconnectFromDevice = useCallback(async (deviceId: string) => {
    try {
      await manager.cancelDeviceConnection(deviceId);
      setConnectedDevice(undefined);
    } catch (error: any) {
      throw new Error(error);
    }
  }, []);

  const discoverDeviceServices = useCallback(async () => {
    if (!connectedDevice) {
      throw new Error("Device is not connected to the app");
    }
    await connectedDevice.discoverAllServicesAndCharacteristics();
  }, [connectedDevice]);

  return (
    <BluetoothConnectionContext.Provider
      value={{
        startDeviceScan,
        stopDeviceScan,
        connectToDevice,
        disconnectFromDevice,
        discoverDeviceServices,
        connectedDevice
      }}
    >
      {children}
    </BluetoothConnectionContext.Provider>
  );
};

export const useBluetoothConnection = () => {
  const context = useContext(BluetoothConnectionContext);
  if (!context) {
    throw new Error(
      "useBluetoothConnection must be used with BluetoothConnectionProvider"
    );
  }
  return context;
};
