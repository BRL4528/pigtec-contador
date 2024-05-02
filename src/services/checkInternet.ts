import axios from "axios";

export const checkInternetConnectivity = async (setIsConnected: (arg0: boolean) => void) => {
  try {
    const response = await axios.head('https://www.google.com', {
      timeout: 5000, // Define um timeout de 5 segundos
    });
    
    // Verifica se a requisição foi bem-sucedida
    setIsConnected(response.status === 200);
  } catch (error) {
    // Se ocorrer algum erro, define isConnected como false
    setIsConnected(false);
  }
};