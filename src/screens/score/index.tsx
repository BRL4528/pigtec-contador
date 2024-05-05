import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { setStatusBarHidden } from 'expo-status-bar'
import { format, intervalToDuration } from "date-fns";
import { ptBR } from 'date-fns/locale/pt-BR';
import * as ScreenOrientation from 'expo-screen-orientation'
import { Container, ContainerFlag, SectionFlag, SectionList, TextCount, TextFlag, SectionVideo, SectionHeader, Button, SectionHeaderButton, ButtonReturn } from './styles';
import {
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { ResizeMode } from 'expo-av'
import VideoPlayer from 'expo-video-player'
import { Header } from '../../components/Header';
import { AppNavigatorRoutesProps } from '../../routes/app.routes';
import { toastNative } from '../../components/Toast';
import { useNetInfo } from '@react-native-community/netinfo';
import axios from 'axios';
import { Loading } from '@components/Loading';

type RouteParamsProps = {
  scoreId: string;
};

type ScorePrps = {
  id: string;
  quantity: number,
  weight: number,
  duration: { hours: number, minutes: number },
  file_url: string,
  start_date: string,
  end_date: string;
  created_at: string;
  file: string,
  markings: {
    id: string,
    sequence: string,
    quantity: string,
    weight: string
  }[],
}
interface During {
  start: string;
  end: string
}

export function Score() {
  const [score, setScore] = useState<ScorePrps>({} as ScorePrps);
  const [isLoading, setIsloading] = useState(true);
  const [inFullscreen2, setInFullsreen2] = useState(false)
  const refVideo2 = useRef<any>()
  const routes = useRoute();
  const { scoreId } = routes.params as RouteParamsProps;
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const netInfo = useNetInfo()
  const [loadingVideo, setLoadingVideo] = useState(true);

  async function fetchScoreDetails() {
    try {
   
      if (!netInfo.isConnected) {
        console.log('eeeee')

        setIsloading(true);
        await axios.get(`https://node.pigtek.com.br/scores/validate`).then(async () => {
          const response = await axios.get<ScorePrps>(`https://node.pigtek.com.br/scores/show`, {
            params: {
              id: scoreId
            }
          });
          // response.data.markings.sort((a, b) => Number(a.sequence) - Number(b.sequence));
          setScore(response.data);
        })
      } 
      else {
        console.log('wwwww')
           const scoresData = await AsyncStorage.getItem('scores');
           const score: ScorePrps = scoresData ? JSON.parse(scoresData) : {};
          //  score.markings.sort((a, b) => Number(a.sequence) - Number(b.sequence));

           setScore(score);
      }
    } catch (e) {
      console.log('Error', e)
    } finally {
      setIsloading(false);
    }
  }

  
  function handleReturnHistory() {
    navigation.navigate('history');
  }

  function formatDuring({ start, end }: During) {
    const dataFormated = intervalToDuration({
      start: start,
      end: end
    })
    let hours = '00'
    let minutes = '00'
    if(dataFormated.hours !== undefined) {
      if(dataFormated.hours > 0 && dataFormated.hours < 9) {
        hours = `0${dataFormated.hours}`
      } else {
        hours = String(dataFormated.hours)
      }
    }
    if(dataFormated.minutes !== undefined) {
      if(dataFormated.minutes > 0 && dataFormated.minutes < 9) {
        minutes = `0${dataFormated.minutes}`
      } else {
        minutes = String(dataFormated.minutes)
      }
    }
    const formated = `${hours}:${minutes} hrs`
    return formated
  }

  useEffect(() => {
    fetchScoreDetails();
  }, [scoreId]);

  async function handleReturnScreen() {
    setStatusBarHidden(false, 'fade')
    setInFullsreen2(!inFullscreen2)
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT)
  }

  const dataFormated = useMemo(() => {
    if (score.start_date) {
      return format(new Date(score.start_date), 'dd/MM/yyyy', {
        locale: ptBR
      })
    }
  }, [score])

  function handleVideoError() {
    toastNative({ title: 'Upload ainda não concluido', description: 'O video ainda esta sendo carregado' })
  }

  return (
    <>
      {
        inFullscreen2 ? (

          <Button onPress={handleReturnScreen}>
            <Ionicons name="arrow-back" size={25} color='white' />
          </Button>
        ) : (
            <SectionHeaderButton>
            <ButtonReturn onPress={handleReturnHistory}>
              <Ionicons name="arrow-back" size={25} color='white' />
            </ButtonReturn>
          </SectionHeaderButton>
        )
      }

      {!inFullscreen2 && (
        <Container>
          <Header title={`Contagem do dia ${dataFormated}`} />
          <SectionHeader>
            <TextCount>Quantidade: {score.quantity}</TextCount>
            <TextCount>Peso total: {score.weight}kg</TextCount>
            <TextCount>Peso médio: {parseFloat((Number(score.weight)/Number(score.quantity)).toFixed(2))}kg</TextCount>
            <TextCount>Tempo de carregamento: {formatDuring({ start: score.start_date, end: score.end_date })}</TextCount>
          </SectionHeader>
        </Container>
      )}

      <SectionVideo>
        {score.file_url !== 'not_found' ? (
          <>
          {loadingVideo && (
            <Loading />
          )}
            <VideoPlayer
              errorCallback={() =>  handleVideoError}
              videoProps={{
                ref: refVideo2,
                shouldPlay: true,
                resizeMode: ResizeMode.CONTAIN,
                // ❗ source is required https://docs.expo.io/versions/latest/sdk/video/#props
                source: {
                  uri: `${score.file_url}`,
                },
                useNativeControls: !loadingVideo,
                onLoad: () => setLoadingVideo(false)
                
              }}

              fullscreen={{
                inFullscreen: inFullscreen2,
                enterFullscreen: async () => {
                  setStatusBarHidden(true, 'fade')
                  setInFullsreen2(!inFullscreen2)
                  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT)
                  refVideo2.current.setStatusAsync({
                    shouldPlay: true,
                  })
                },
                exitFullscreen: async () => {
                  setStatusBarHidden(false, 'fade')
                  setInFullsreen2(!inFullscreen2)
                  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT)
                },
              }}
              style={{
                videoBackgroundColor: 'transparent',
                height: inFullscreen2 ? Dimensions.get('window').width - 16 : 340,
                width: inFullscreen2 ? Dimensions.get('window').height : 340,
              }}
            />
            {/* <Video
            ref={video}
            shouldPlay
            source={{
              uri: `${score.file_url}`,
            }}
            style={{ width: 300, height: 300, }}
            useNativeControls
            isLooping
          /> */}
          </>
        ) : (
          <TextFlag>Sem video</TextFlag>
        )
        }
      </SectionVideo>
      {!inFullscreen2 && (
        <ContainerFlag>
          <SectionFlag>
            <FlatList
              keyExtractor={(item) => item.sequence}
              data={score.markings}
              ListEmptyComponent={() => (
                <TextFlag>Sem marcações para esta contagem</TextFlag>
              )}
              renderItem={(item) => (
                <>
                  <TouchableOpacity>
                    <SectionList>
                      <Ionicons name="flag" size={15} color="white" />
                      <TextFlag>Marcação: {item.item.sequence}</TextFlag>
                      <TextFlag>Quantidade: {item.item.quantity}</TextFlag>
                      <TextFlag>Peso: {Number(item.item.weight)} Kg</TextFlag>
                    </SectionList>
                  </TouchableOpacity>
                </>
              )}
            />
          </SectionFlag>
        </ContainerFlag>
      )}
    </>
  );
}
