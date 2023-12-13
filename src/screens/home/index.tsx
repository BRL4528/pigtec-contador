import React, { useEffect, useState } from 'react';
import { Container, TextCount, TextFps, Button, Title, ButtonRed } from './styles';
import { Header } from '../../components/Header';
import { api } from '../../../services/api';

export default function Home() {
  const [count, setCount] = useState<number>(0);
  const [fps, setFps] = useState<number>(0);
  const [textButton, setTextButton] = useState('Iniciar contagem');
  const [textHeader, setTextHeader] = useState('Iniciar contagem');
  const [loading, setLoading] = useState(false);
  let socket: WebSocket | null = null;

  useEffect(() => {
    console.log('socket', socket);
  }, [socket]);

  const createWebSocket = () => {
    try {
      socket = new WebSocket('ws://172.22.70.10:3333/'); // Substitua pelo seu endereço IP e porta
      socket.onopen = () => {
        console.log('Conexão estabelecida com o servidor WebSocket');
      };

      socket.onmessage = (event) => {
        const dataArray = event.data.split(' ');
         console.log('message', dataArray) 
        if (dataArray[0] === 'data') {
          setCount(parseInt(dataArray[1], 10)); // Atualiza o estado com a contagem recebida
          setFps(parseInt(dataArray[2], 10)); // Atualiza o estado com a contagem recebida
        }

        if (dataArray[0] === 'station_started' && socket) {
          socket.send('startCounting');
          setTextHeader('Contagem em andamento');
          setLoading(true);
        }
        if (dataArray[0] === 'finalized' && socket) {
          setTextHeader('Contagem Finalizada');
          setLoading(false);
        }
        if (dataArray[0] === 'program_finalized' && socket) {
          setTextHeader('Contagem Finalizada');
          setLoading(false);
        }
      };

      socket.onclose = () => {
        console.log('Conexão WebSocket fechada');
        socket = null; // Limpa o socket quando a conexão é fechada
      };
    } catch (e) {
      console.log('error', e);
    }
  };

  useEffect(() => {
    createWebSocket(); // Cria o WebSocket quando o componente for montado

    return () => {
      if (socket) {
        socket.close(); // Fecha a conexão quando o componente é desmontado
      }
    };
  }, []);

  const handleRoudProgram = () => {
    console.log('Socket não está inicializado.');
    if (socket) {
      socket.send('roudProgram');
      setLoading(true);
    } else {
      console.log('Socket não está inicializado.');
      createWebSocket(); // Cria um novo socket se o antigo foi fechado
      
    }
  };
  const handleStopProgram = () => {
    try {
      api.post('/terminateProgram').then((response: any) => {
        console.log('resposta', response.data)
      })
    } catch (err) {

    }
  };

  return (
    <>
      <Container>
      <Header title={textHeader} />
        <TextCount>{count}</TextCount>
        <TextFps>FPS: {fps}!</TextFps>

        <Button
          onPress={handleRoudProgram}
          disabled={loading} 
        ><Title>
          Iniciar programa
          </Title></Button>
        <ButtonRed
          onPress={handleStopProgram}
        ><Title>
          Finalizar
          </Title></ButtonRed>
      </Container>
    </>
  );
}
