import { FlatList, Text, View } from "react-native";
import { Container, Header, SubTitle, TextOpt, SectionList, TouchableButton, ExitButton, TextSections, TextExit } from './styles'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AppNavigatorRoutesProps } from '../../routes/app.routes';
import { useAuth } from "@hooks/useAuth";
import { useProducers } from "@hooks/useProducer";
import { useEffect, useState } from "react";
import { api } from "@services/api";

interface MenuOpts {
  section: string;
  item: [
    {
      title: string,
      icon: any,
      type: string
    }
  ]
}[]

const optionsData = [
  {
    section: 'Funções',
    item: [
      {
        title: 'Carregamento com destinação',
        icon: 'git-branch',
        type: 'destination_with_count',
      },
      {
        title: 'Contagem simples',
        icon: 'git-commit',
        type: 'simple_count',
      },
    ]
  },
  {
    section: 'Ferramentas',
    item: [
      {
        title: 'Histórico de contagem',
        icon: 'archive-outline',
        type: 'history',
      },
      {
        title: 'Central de configurações',
        icon: 'cog',
        type: 'config',
      },
      {
        title: 'Desligar equipamento',
        icon: 'power',
        type: 'power',
      }
    ]
  }
]


export function OptionsCount() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const { signOut } = useAuth();
  const { removeProducers } = useProducers();
  const [jetsonOnline , setJetsonOnline] = useState(false);

  function handleRunDataForCounting(type: string) {
    if (type === 'simple_count') {
      navigation.navigate('dataForCounting', { type:  type});
      return
    }
    if(type === 'destination_with_count') {
    navigation.navigate('dataForCounting', { type:  type});
    }
    if(type === 'config') {
    navigation.navigate('config');
    }
    if(type === 'history') {
    navigation.navigate('history');
    }
    if(type === 'power') {
    api.get('/shutdown').then((response) => {
      if(response.status === 200) {
        setJetsonOnline(false)
      } 
    })
    }
  }


  function signUpApp() {
    signOut()
    removeProducers()
  }

  useEffect(() => {
    try {
      api.get('/activitie').then((response) => {
        if(response.status === 200) {
          setJetsonOnline(true)
        } 
      })
    } catch (err) {
      console.log(err)
      setJetsonOnline(false)
    }
  }, [])

  
  const renderItem = ({item}: any) => {
    return (
      
     <>
     <TextSections>{item.section}</TextSections>
     {item.item.map((opt: any) => (
      <TouchableButton
        key={opt.title}
        onPress={() => handleRunDataForCounting(opt.type)}
        style={{backgroundColor: opt.icon === 'power' ? ( jetsonOnline ? '#a72734' : '#522f32' ) : '#323238', shadowColor: 'red'}}
        disabled={opt.icon === 'power' && !jetsonOnline}
        >
        <SectionList>
          <Ionicons name={opt.icon} size={18} color="white" />
          <TextOpt> {opt.title}</TextOpt>
        </SectionList>
      </TouchableButton>
     ))}
        </>
    );
  };

  return (
    <Container>
     <Header>
      O que você deseja 
      fazer hoje?
     </Header>
     <SubTitle>
      Selecione entre as alternativas abaixo
     </SubTitle>

     <FlatList data={optionsData} renderItem={renderItem} />
     <ExitButton onPress={signUpApp}>
      <TextExit>
      Sair da aplicação
      </TextExit>
      <Ionicons name="exit-outline" size={18} color="#AA2834" />
      </ExitButton>
    </Container>
  )
}