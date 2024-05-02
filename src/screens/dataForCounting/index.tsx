import { useEffect, useMemo, useState } from "react";

import SelectDropdown from 'react-native-select-dropdown'
import Ionicons from '@expo/vector-icons/Ionicons';
import { Container, Header, SubTitle, Section, TitleSelect, ButtonReturn, SectionHeader, SectionFooter, ButtonRunCount, TitleButton } from './styles'
import { Input } from '../../components/Input';
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "../../routes/app.routes";
import { useProducers } from '@hooks/useProducer';
import { getISOWeek } from 'date-fns';
import AsyncStorage from "@react-native-async-storage/async-storage";

type RouteParamsProps = {
  type: string
}

interface Scores {
  scores: [
    {
      id: string;
      name: string;
      lote: string;
    }
  ]
}

export function DataForCounting() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const [productorid, onChangeproductorid] = useState('');
  const [productorName, onChangeproductorName] = useState('');
  const [farmName, onchangeFarmSelected] = useState('');
  const [farmId, onchangeFarmIdSelected] = useState('');
  // const [nf, onChangeNf] = useState('');
  const [lote, onChangeLote] = useState('');
  const [nameCounting, setNameCounting] = useState('');
  const [farmsProductors, setFarmsProductors] = useState([]);

  // const [producers, setProducers] = useState<Producers[]>([]);
  const routes = useRoute();
  const { type } = routes.params as RouteParamsProps;
  const { producer } = useProducers();

  useEffect(() => {
    handleVerifyLote()

  }, [])

  async function handleVerifyLote() {
    const scores = await AsyncStorage.getItem('scores');
  
    const scoreArray: Scores = scores ? JSON.parse(scores) : {};
    const formated = scoreArray.scores.filter(scor => {
      if (scor.lote.split('/')[0] === String(getISOWeek(new Date()))) {
        return scor
      }
    })
    onChangeLote(`${getISOWeek(new Date())}/${(formated.length + 1)}`);

  }

  function handleReturnOptions() {
    navigation.navigate('options');
    onChangeLote('')
    setNameCounting('')
    setFarmsProductors([])
  }
  function handleCouting() {
    if(type === 'destination_with_count') {
      navigation.navigate('home', { productor_id:  productorid, productorName: productorName, number_nf: '0', type, lote: lote, farmName, farmId});
    }
    if(type === 'simple_count') {
      navigation.navigate('home', { productor_id: null, number_nf: '0', type, lote: lote, name: nameCounting});
    }
    onChangeLote('')
    setNameCounting('')
    setFarmsProductors([])
  }

  const butonDisabled = useMemo(() => {
    if(type === 'destination_with_count') {
      if (productorid !== '' && lote !== '' && farmName != '') {
        return false
      }
    }
    if(type === 'simple_count') {
      if (lote !== '') {
        return false
      }
    }
    return true
  }, [productorid, lote, farmName])


  return (
    <>  
        <SectionHeader>
          <ButtonReturn onPress={handleReturnOptions}>
            <Ionicons name="arrow-back" size={25} color='white' />
          </ButtonReturn>
        </SectionHeader>
      <Container>
      {type === 'destination_with_count' && (
             <>
             <Header>
             Informações de destino
            </Header>
           <SubTitle>
             Insira as informações de destino
             para iniciar a contagem
           </SubTitle>
 
           <Section>
             <Input
               titleInput="Lote"
               placeholder="Numero do lote"
               onChangeText={onChangeLote}
               text={lote}
             />
 
             <TitleSelect>
               Produtor
             </TitleSelect>
             <SelectDropdown
               data={producer}
               buttonStyle={{
                 'marginBottom': 15,
                 'backgroundColor': 'transparent',
                 'borderColor': '#7C7C8A',
                 'borderWidth': 1,
                 'borderRadius': 6,
                 'height': 50,
                 // 'margin': 12,
                 // 'borderWidth': 1,
                 'padding': 10,
                 'width': '100%',
               }}
               buttonTextStyle={{
                 'fontSize': 14,
                 'color': `${productorid !== '' ? '#fff' : '#7C7C8A'}`,
                 'textAlign': 'left',
                 'left': 8,
               }}
               dropdownStyle={{
                 'borderRadius': 6
               }}
               searchPlaceHolderColor="#333"
               selectedRowTextStyle={{
                 color: 'red',
               }}
               search
               onSelect={(selectedItem, index) => {
                 onChangeproductorid(selectedItem.id)
                 onChangeproductorName(selectedItem.name)
                 setFarmsProductors(selectedItem.farms)
               }}
 
               defaultButtonText="Selecione um produtor"
 
               buttonTextAfterSelection={(selectedItem, index) => {
                 // text represented after item is selected
                 // if data array is an array of objects then return selectedItem.property to render after item is selected 
                 return selectedItem.name
               }}
               rowTextForSelection={(item, index) => {
                 // text represented for each item in dropdown
                 // if data array is an array of objects then return item.property to represent item in dropdown
                 return item.name
               }}
               disableAutoScroll
             />
             <TitleSelect>
               Granja
             </TitleSelect>
             <SelectDropdown
               data={farmsProductors}
               buttonStyle={{
                 'marginBottom': 15,
                 'backgroundColor': 'transparent',
                 'borderColor': '#7C7C8A',
                 'borderWidth': 1,
                 'borderRadius': 6,
                 'height': 50,
                 // 'margin': 12,
                 // 'borderWidth': 1,
                 'padding': 10,
                 'width': '100%',
               }}
               buttonTextStyle={{
                 'fontSize': 14,
                 'color': `${productorid !== '' ? '#fff' : '#7C7C8A'}`,
                 'textAlign': 'left',
                 'left': 8,
               }}
               dropdownStyle={{
                 'borderRadius': 6
               }}
               searchPlaceHolderColor="#333"
               selectedRowTextStyle={{
                 color: 'red',
               }}
               search
               onSelect={(selectedItem, index) => {
                 onchangeFarmSelected(selectedItem.name)
                 onchangeFarmIdSelected(selectedItem.id)
               }}
 
               defaultButtonText="Selecione uma granja"
 
               buttonTextAfterSelection={(selectedItem, index) => {
                 return selectedItem.name
               }}
               rowTextForSelection={(item, index) => {
                 return item.name
               }}
               disableAutoScroll
             />
            </Section>
           </>
        ) }
        {type === 'simple_count' && (
            <>
              <Header>
              Informações da contagem
             </Header>
            <SubTitle>
              Insira as informações da contagem
            </SubTitle>
  
            <Section>
              <Input
                titleInput="Lote"
                placeholder="Numero do lote"
                onChangeText={onChangeLote}
                text={lote}
              />
              <Input
                titleInput="Nome da contagem"
                placeholder="Adicione um nome para esta contagem"
                onChangeText={setNameCounting}
                text={nameCounting}
              />
             
             </Section>
            </>
          
        )}
     

      </Container>
      <SectionFooter>
        <ButtonRunCount onPress={() => handleCouting()} disabled={butonDisabled}>
          <TitleButton disabled={butonDisabled}>
            Ir para contagem
          </TitleButton>
        </ButtonRunCount>
      </SectionFooter>
    </>
  )
}