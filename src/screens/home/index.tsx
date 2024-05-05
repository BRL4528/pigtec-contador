import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {
  Container,
  TextCount,
  TextFps,
  Button,
  Section,
  SectionList,
  ButtonBlue,
  ButtonRed,
  ButtonYellow,
  SectionFlag,
  ContainerFlag,
  TextFlag,
  SectionCamera,
  ButtonReturn,
  TitleNameProd,
  ButtonCamera,
} from './styles';
import { Header } from '../../components/Header';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from 'styled-components';
import { toastNative } from '../../components/Toast';
import { AppNavigatorRoutesProps } from '../../routes/app.routes';
import * as ScreenOrientation from 'expo-screen-orientation';
import { observable } from "@legendapp/state";
import { api } from '../../services/api';
import {
  persistObservable,
} from '@legendapp/state/persist';
import uuid from 'react-native-uuid';
import { useAuth } from '../../hooks/useAuth';
import { useNetInfo } from '@react-native-community/netinfo';
import axios from 'axios';

type RouteParamsProps = {
  productor_id?: string;
  productorName?: string;
  number_nf?: string;
  type: string;
  lote: string;
  name?: string;
  farmName?: string;
  farmId?: string;
}

interface Config {
  rout: string;
  cfg: string;
  names: string;
  weights: string;
  routViewVideo: string;
  mountVideo: string;
  scaleRout: string;
  isSelectedViewVideo: boolean;
  markingAutomatic: 'not' | 'yes'
  rangeForMarking: string
}
interface Flags {
  quantity: number;
  sequence: number;
  score_id: string;
  weight: number;
  id: string;
  created_at: string;
  updated_at: string;
}

export interface PropsFetchScores {
  score: {
    id: string;
    producer_id_internal: string;
    farm_id_internal: string;
    type: string;
    lote: string;
    name: string;
    status: boolean;
    producer_id_sender: string;
    farm_id_sender: string;
    producer_id_received: string | null;
    farm_id_received: string | null;
    quantity: number;
    weight: string;
    start_date: string;
    created_at: string;
    updated_at: string;
    markings: never[];
  }
}
export function Home() {
  const { FONT_SIZE } = useTheme();
  const iconSize = FONT_SIZE.XL;
  const [count, setCount] = useState<number>(0);
  const [fps, setFps] = useState<number>(0);
  const [textHeader, setTextHeader] = useState('Iniciar contagem');
  const [dataConfig, setDataConfigs] = useState<Config>();
  const [loading, setLoading] = useState(false);
  const [loadingRoud, setLoadingRoud] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [flagsData, sesetFlagsData] = useState<Flags[]>([]);
  const [coutingId, setCoutingId] = useState('');
  const { user } = useAuth();
  const netInfo = useNetInfo()
  const state = observable({
    scores: [
      {
        id: '',
        producer_id_internal: '',
        farm_id_internal: '',
        type: '',
        lote: '',
        name: '',
        status: false,
        producer_id_sender: '',
        farm_id_sender: '',
        producer_id_received: '',
        farm_id_received: '',
        quantity: 0,
        weight: '0',
        start_date: '',
        created_at: '',
        updated_at: '',
        markings: [],
      }
    ],
  });

  persistObservable(state, {
    local: 'scores',
  })

  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const routes = useRoute();
  const { productor_id, productorName, type, lote, name, farmName, farmId } = routes.params as RouteParamsProps;
  let socket: WebSocket | null = null;

  const createWebSocket = () => {
    try {
      if (dataConfig !== undefined) {
        if (dataConfig.rout === '') {
          alert('Adicione uma url valida nas configurações!');
          return;
        }
        socket = new WebSocket(`ws://${dataConfig.rout}/`);
        socket.onopen = () => {
          console.log('Conexão estabelecida com o servidor WebSocket');
        };

        socket.onmessage = (event) => {
          const dataArray = event.data.split(' ');
          if (dataArray[0] === 'data') {
            setCount(parseInt(dataArray[1], 10));
            setFps(parseInt(dataArray[2], 10));
            // setCoutingId(dataArray[3]);
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
          socket = null;
        };

      }
    } catch (e) {
      console.log('error', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getItemFunction();
      createWebSocket();
    }, [])
  );

  async function getItemFunction() {
    const data = await AsyncStorage.getItem('@DataConfig');
    if (data !== null) {
      const dataJson: Config = JSON.parse(data);
      setDataConfigs(dataJson);
    }
  }

  async function handleRoudProgram() {
    try {
      const idScores = uuid.v4();
      setLoadingRoud(true);
      setCoutingId(String(idScores))


      const scoreData = {
        score: {
          producer_id_internal: user.producer_id,
          farm_id_internal: user.id,
          type,
          lote,
          name: name ? name : `${lote}-${farmName}`,
          producer_id_sender: user.producer_id,
          farm_id_sender: user.id,
          producer_id_received: productor_id || null,
          farm_id_received: farmId || null,

          quantity: 0,
          weight: '0',
          start_date: String(new Date()),
          status: false,

          id: String(idScores),
          created_at: String(new Date()),
          updated_at: String(new Date()),
          markings: [],
        }

      }

      await api.get(`/spawn`, {
        params: {
          cfg: dataConfig?.cfg,
          names: dataConfig?.names,
          weights: dataConfig?.weights,
          saveVideo: dataConfig?.isSelectedViewVideo,
          roteViewVideo: dataConfig?.routViewVideo,
          mountVideo: dataConfig?.mountVideo,
          scaleRout: dataConfig?.scaleRout,
          idScores,
        }
      }).then(response => {
        if (response.status === 200) {
          if (!!netInfo.isConnected) {
            axios.post('https://node.pigtek.com.br/scores', scoreData.score).then((response) => {
              if (response.status === 200) {
                const score = {
                  ...scoreData.score,
                  status: true
                }
                handleSaveLocal({ score })
              } else {
                handleSaveLocal(scoreData)
              }
            })
          }
        }
      })

      createWebSocket();


    } catch (err) {
      console.log('error', err);
      Alert.alert("Conexão falhada", "Verifique a conexão com o contador.");

      setLoadingRoud(false)
    }
  }

  function handleSaveLocal({ score }: PropsFetchScores) {
    //@ts-ignore
    state.scores.set((currentExpenses) => [...currentExpenses, score]);
  };

  async function handleSave() {
    try {
      setLoadingSave(true);

      const weightTotal = flagsData.reduce((accumulator, currentValue) => {
        return Number(accumulator) + Number(currentValue.weight)
      }, 0)

      const dataScore = {
        quantity: count,
        weight: weightTotal,
        end_date: new Date(),
        updated_at: new Date(),
        markings: flagsData,
        status: true,
      };


      if (!!netInfo.isConnected) {
        await axios.put(`https://node.pigtek.com.br/scores?id=${coutingId}`, dataScore).then((response) => {
          if (response.status === 200) {
            handleUpdateLocal(coutingId, dataScore)
          } 
        });
        await axios.post(`https://node.pigtek.com.br/markings/createAll`, flagsData);
      } else {
        const dataScoreFormated = {
          ...dataScore,
          status: false
        }
        handleUpdateLocal(coutingId, dataScoreFormated)
      }

      setTextHeader('Iniciar contagem');
      sesetFlagsData([]);
      setFps(0);
      setCount(0);

      toastNative({ title: 'Contagem Salva', description: 'A contagem foi salva na base de dados local' })

    } catch (err) {
      console.log('error', err);
    } finally {
      setLoading(false);
      setLoadingRoud(false)
      setLoadingSave(false);
    }
  }


  function handleUpdateLocal(scoreIdToUpdate: string, updatedData: any) {

    // Atualiza o score específico no estado local
    state.scores.set((currentScores) => {
      return currentScores.map((score) => {
        if (score.id === scoreIdToUpdate) {
          return { ...score, ...updatedData };
        }
        return score;
      });
    });

  }

  function handleDeleteLocal(scoreIdToDelete: string) {
    // Remove o score específico do estado local
    state.scores.set((currentScores) => {
      return currentScores.filter((score) => score.id !== scoreIdToDelete);
    });
  }

  async function handleDeleteCount() {
    try {
      if (!!netInfo.isConnected) {
      if (coutingId !== '') {
        await axios.delete(`https://node.pigtek.com.br/scores?id=${coutingId}`).then(() => {
          toastNative({ title: 'Contagem excluida', description: 'A contagem foi excluida' })
        })

        handleDeleteLocal(coutingId)
        setTextHeader('Iniciar contagem');
        sesetFlagsData([]);
        setFps(0);
        setCount(0);
        setLoadingRoud(false)
        toastNative({ title: 'Contagem excluida', description: 'A contagem foi exluida' })
      }
    } else {
      handleDeleteLocal(coutingId)
      setTextHeader('Iniciar contagem');
      sesetFlagsData([]);
      setFps(0);
      setCount(0);
      setLoadingRoud(false)
      toastNative({ title: 'Contagem excluida', description: 'A contagem foi exluida' })
    }
    } catch (err) {
      console.log('err', err)
      toastNative({ title: 'Problemas ao excluir', description: 'Erros ao exluir contagem' })

    }
  }

  const handleStopProgram = () => {
    try {
      api.post(`/terminateProgram`);
    } catch (err) {
      console.log('ERROR', err);
    } finally {
      setLoading(false);
      setLoadingRoud(false)
    }
  };

  useEffect(() => {
    if (dataConfig?.markingAutomatic === 'yes') {
      if (count % Number(dataConfig.rangeForMarking) === 0) {
        handleCreateFlag()
      }
    }
  }, [count])

  async function handleCreateFlag() {
    try {
      const idMarkings = uuid.v4();
      if (count > 0) {

        await api.get('/scale').then((res) => {
          sesetFlagsData([
            ...flagsData,
            {
              quantity: count,
              sequence: flagsData.length + 1,
              weight: res.data.scale,
              score_id: coutingId,
              id: String(idMarkings),
              created_at: String(new Date()),
              updated_at: String(new Date()),
            },
          ]);
        })
      }
    } catch (err) {
      alert('Problemas ao acessar balança!');
    }
  };

  const handleDeleteFlag = (flagSequence: number) => {
    Alert.alert(
      'Exluir Marcação',
      'Realmente deseja exluir está marcação?',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: () => handleDeleteFalgPassedAlert(flagSequence),
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteFalgPassedAlert = (flagSequence: number) => {
    const filtred = flagsData.filter((item) => item.sequence !== flagSequence);
    sesetFlagsData(filtred);
  };

  function handleRunCamera() {
    navigation.navigate('camera');
  }

  async function changeScreenOrientation() {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
  }

  useFocusEffect(
    useCallback(() => {
      changeScreenOrientation();
    }, [])
  );

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        onLongPress={() => handleDeleteFlag(item.sequence)}
      >
        <SectionList>
          <Ionicons name="flag" size={15} color="white" />
          <TextFlag>Marcação: {item.sequence}</TextFlag>
          <TextFlag>Quantidade: {item.quantity}</TextFlag>
          <TextFlag>Peso: {Number(item.weight)} Kg</TextFlag>
        </SectionList>
      </TouchableOpacity>
    );
  };

  function handleReturnOptions() {
    navigation.navigate('options');
  }

  return (
    <>
      <SectionCamera>
        <ButtonReturn onPress={handleReturnOptions}>
          <Ionicons name="arrow-back" size={25} color='white' />
        </ButtonReturn>
        <ButtonCamera disabled={textHeader !== 'Contagem em andamento' ? true : false} onPress={handleRunCamera}>
          <Ionicons name="camera-sharp" size={25} color={textHeader !== 'Contagem em andamento' ? 'gray' : 'white'} />
        </ButtonCamera>
      </SectionCamera>
      <Container>
        {type === 'destination_with_count' && (
          <TitleNameProd>
            Contagem: {lote} - {productorName}
          </TitleNameProd>
        )}
        {type === 'simple_count' && (
          <TitleNameProd>
            Contagem: {lote} - {name !== '' ? name : 'Contagem simples'}
          </TitleNameProd>
        )}
        <Header title={textHeader} />
        <TextCount>{count}</TextCount>
        <TextFps>FPS: {fps}!</TextFps>
      </Container>
      <ContainerFlag>
        <SectionFlag>
          <FlatList data={flagsData} renderItem={renderItem} />
        </SectionFlag>
      </ContainerFlag>

      <Section>
        {loading && textHeader === 'Contagem em andamento' ? (
          <>
            <ButtonYellow onPress={handleCreateFlag}>
              <Ionicons name="flag" size={iconSize} color="white" />
            </ButtonYellow>

            <ButtonBlue onPress={handleStopProgram}>
              <Ionicons name="stop" size={iconSize} color="white" />
            </ButtonBlue>
          </>
        ) : (
          ''
        )}
        {textHeader === 'Iniciar contagem' ? (
          <Button color="green" onPress={handleRoudProgram} disabled={loading || loadingRoud}>
            {loadingRoud ? (
              <ActivityIndicator size="large" />
            ) : (
              <Ionicons name="play" size={iconSize} color="white" />
            )}
          </Button>
        ) : (
          ''
        )}
        {textHeader === 'Contagem Finalizada' ? (
          <>
            <ButtonRed onPress={handleDeleteCount} disabled={loading || loadingSave}>
              {loadingSave ? (
                <ActivityIndicator size="large" />
              ) : (
                <Ionicons name="trash" size={iconSize} color="white" />
              )}
            </ButtonRed>
            <ButtonBlue onPress={handleSave} disabled={loading || loadingSave}>
              {loadingSave ? (
                <ActivityIndicator size="large" />
              ) : (
                <Ionicons name="save" size={iconSize} color="white" />
              )}
            </ButtonBlue>
          </>
        ) : (
          ''
        )}
      </Section>
    </>
  );
}
