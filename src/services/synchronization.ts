import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export interface PropsFetchScores {
  scores: [{
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
  }]
}

interface Props {
  internet: boolean
}

export async function synchronization({ internet }: Props) {
//  await AsyncStorage.removeItem('scores');
  //@ts-ignore
  console.log('chamou para salvar')
  if(internet) {
    try {
  const storage = await AsyncStorage.getItem('scores');
  if (storage) {
    const storedData: PropsFetchScores = JSON.parse(storage);
    
    // Filtrar os scores com status igual a false
    const unsyncedScores = storedData.scores.filter(score => score.status === false && score.created_at !== '');
    
    if (unsyncedScores.length > 0 && internet) {
      const formatedData = {
        scores: unsyncedScores.map(score => ({ ...score, status: true }))
      };
        // Realizar a sincronização com o servidor
        const response = await axios.post('http://167.71.20.221/scores/createAll', formatedData.scores);
        
        // Verificar se a sincronização foi bem-sucedida
        if (response.status === 200) {
          // Atualizar o status dos scores no AsyncStorage para true
          const updatedScores = storedData.scores.map(score => 
            unsyncedScores.some(unsyncedScore => unsyncedScore.id === score.id) 
              ? { ...score, status: true } 
              : score
          );

          await AsyncStorage.setItem('scores', JSON.stringify({ scores: updatedScores }));
        }
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar os scores:', error);
  }
}
}
